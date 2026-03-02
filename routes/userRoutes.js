const express = require('express')

const userRouter = express.Router()

const userController = require('../controllers/user/userAuthController')
const {isLoggedIn,isLoggedOut} = require('../middleware/authMiddleware')


userRouter.get('/',isLoggedIn,userController.loadHomePage)

userRouter.get('/signup', isLoggedOut,userController.loadSignUp)
userRouter.get('/login',isLoggedOut,userController.loadLogin) 

userRouter.post('/login',userController.login)
userRouter.post('/signup',userController.signup) 

userRouter.get('/otp',userController.loadOtpPage)
userRouter.post('/verifyOtp',userController.verifyOtp)
userRouter.post('/resendOtp',userController.resendOtp)

userRouter.get('/logout',isLoggedIn,userController.logout)

module.exports = userRouter