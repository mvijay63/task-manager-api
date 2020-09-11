const express = require('express')
const Task = require('../db/models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/tasks' , auth ,  async (req , res) => {
    const task = new Task({
        ...req.body,
        owner : req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})
router.patch('/tasks/:id' , auth ,  async (req , res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name" , "description", "started" , "added"]
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send({error : 'Property not found'})
    }
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id : _id , owner : req.user._id})
        if(!task){
            return res.status(400).send({error : 'No Task found'})
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.status(200).send(task);

    } catch (error) {
        res.status(400).send(error);
    }
})
router.get('/tasks', auth , async (req , res) => {
    try {

        await req.user.populate('tasks').execPopulate();
        console.log(req.user)
        //const tasks = await Task.find({ owner : req.user._id})
        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})
router.get('/tasks/:id' , auth,  async (req , res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id : _id , owner : req.user._id})
        if(!task){
            return res.status(404).send({error: "task not found"})
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.delete('/tasks/:id' , auth , async(req , res) => {
    const _id = req.params.id
    console.log(_id)
    try {
        const task = await Task.findOneAndDelete({_id : _id , owner : req.user._id})
        if(!task){
            return res.status(404).send({error: "task not found"})
        }
        res.status(200).send(task)

    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router ; 