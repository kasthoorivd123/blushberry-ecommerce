const express = require('express')

const userRouter = express.Router()

const userController = require('../controllers/user/userController')



userRouter.get('/',userController.loadHomePage)
userRouter.get('/signup', userController.loadSignUp)


module.exports = userRouter