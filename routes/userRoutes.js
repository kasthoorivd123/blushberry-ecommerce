const express = require('express')

const userRouter = express.Router()

const userController = require('../controllers/user/userController')
const {isLoggedIn,isLoggedOut} = require('../middleware/authMiddleware')


userRouter.get('/',isLoggedIn,userController.loadHomePage)

userRouter.get('/signup', isLoggedIn,userController.loadSignUp)
userRouter.get('/login',isLoggedOut,userController.loadLogin) 

userRouter.post('/login',userController.login)
userRouter.post('/signup',userController.signup) 

userRouter.get('/logout',isLoggedIn,userController.logout)
// userRouter.post('/verifyOtp',userController.verifyOtp)

module.exports = userRouter