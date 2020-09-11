const express = require('express')
const User = require('../db/models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer  = require('multer')
const sharp = require('sharp')
const newUserNotification = require('../email/mailgun')

const upload = multer({
    'limits' : {
        'fileSize' : 1000000
    },
    fileFilter(req, file , cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined , true)
    }
})

router.post('/users' , async (req , res) => {
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        newUserNotification(user.fname , user.email)
        res.status(201).send({user , token})
    } catch(e){
        res.status(400).send(e)
    }
})

router.patch('/users' , auth , async (req , res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["fname" , "lname", "email" , "password"]
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send({error : 'Property not found'})
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.status(200).send(req.user);

    } catch (error) {
        res.status(400).send(error);
    }
})
router.post('/users/login', async(req , res) => {
    try {
        const user =  await User.findUserByCredentials(req.body.email , req.body.password)
        if(!user){
           return res.status(404).send({error: 'User not found'});
        }
        const token = await user.generateAuthToken()
        res.status(200).send({user , token})
    } catch (error) {
        res.status(400).send({error : 'something went wrong'})
    }
})

router.post('/users/upload/avatar', auth , upload.single('avatar'),   async (req , res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 150 , height:150}).png().toBuffer() 
    req.user.avatar = buffer
    await req.user.save();
    res.send()
} , (error , req , res , next) => {
    res.status(400).send(error.message)
})
router.get('/users/me', auth ,  async (req , res) => {
    res.send(req.user)
})
router.get('/users/:id/avatar', async (req , res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    } catch(e){
        res.status(404).send()
    }
})

router.delete('/users/me/avatar', auth ,  async (req , res) => {
    req.user.avatar = undefined 
    await req.user.save()
    res.send()
})

router.delete('/users' , auth ,  async(req , res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        ress.send(user)

    } catch (error) {
        res.status(500).send(error)
    }
})

//deprecated
router.get('/users/:id' , async (req , res) => {
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch(e){
        res.status(500).send(e)
    }
})

module.exports = router ; 
