const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required : true,
        trim : true
    },
    lname : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase:true,
        validate (value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }
        },
        unique :true
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 6
    },
    tokens : [{
        token : {
            type : String,
            required: true
        }
    }], 
    avatar : {
        type : Buffer 
    }
}, {timestamps : true})

userSchema.virtual('tasks' , {
    'ref' : 'Task',
    'localField' : '_id',
    'foreignField' : 'owner'
})

userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JSON_WEB_TOKEN)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token ; 
}

userSchema.statics.findUserByCredentials = async (email , password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('no user found')
    }
    const isMatch = await bcrypt.compare(password , user.password)
    if(!isMatch){
        throw new Error ('Something went wrong')
    }
    return user
}
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
});
const User = mongoose.model('User' , userSchema)
module.exports = User