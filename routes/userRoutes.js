const express = require('express')

const userRouter = express.Router()

const userController = require('../controllers/user/userController')


userRouter.get('/login/:id', userController.login)


module.exports = userRouter