const mongoose = require('mongoose')
const validator = require('validator')
const taskSchema = new mongoose.Schema({
    'name' : {
        type: String,
        required:true,
        trim:true
    },
    'description' : {
        type: String,
        required:true,
        trim:true
    },
    'started' : {
        type : Boolean,
        default : false
    },
    'owner' : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }
}, {timestamps : true})

const Task = mongoose.model('tasks' ,taskSchema )
module.exports = Task 