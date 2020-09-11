const jwt = require('jsonwebtoken')
const User = require('../db/models/user')
const auth = async (req , res , next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim()
        console.log(token)
        const decoded =  jwt.verify(token , process.env.JSON_WEB_TOKEN)
        console.log(decoded._id)
        const user = await User.findOne({_id:decoded._id , 'tokens.token' : token})
        console.log(user)
        if(!user){
            throw new Error()
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send({error : 'Failed to authenticate'})    
    }
}
module.exports = auth