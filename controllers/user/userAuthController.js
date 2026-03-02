const User = require('../../models/user/userModel')
const Otp = require('../../models/user/otpModel')
const bcrypt = require('bcrypt')
const generateOtp = require('../../utils/generateOtp');
const sendEmail = require("../../utils/sendEmail");

const loadHomePage = (req, res) => {

   res.render("user/homePage.ejs");
}

const loadSignUp = (req, res) => {
   try {
      res.render('user/userSignup.ejs')
   } catch (error) {
      console.log(`error from signUpPage ${error}`)
   }
};



const signup = async (req, res) => {
   try {
      const { fullName, email, password, confirmPassword } = req.body
      console.log(req.body)


      if (password !== confirmPassword) {
         return res.json({
            success: false,
            message: 'password do not match'
         })
      }

      const existingUser = await User.findOne({ email })

      if (existingUser) {
         return res.json({
            success: false,
            message: 'user already exists'
         })
      }


      const otp = generateOtp()

      await Otp.deleteMany({ email });

      //save otp in db
      await Otp.create({
         email,
         otp
      })

      req.session.tempUser = {
         fullName,
         email,
         password
      }


      await sendEmail(email, otp)

      return res.json({
         success: true,
         redirectUrl: "/otp"
      });

   }
   catch (error) {
      console.log(error);
      return res.status(500).json({
         succecc: false,
         message: 'Server error'
      })
   }
};


const verifyOtp = async (req, res) => {
   try {
      const { otp } = req.body;
      const tempUser = req.session.tempUser;

      if (!tempUser) {
         return res.json({
            success: false,
            message: "Session expired. Please signup again."
         });
      }

      const otpRecord = await Otp.findOne({ email: tempUser.email });

      if (!otpRecord) {
         return res.json({
            success: false,
            message: "OTP expired ,please resend otp "
         });
      }

      if (otpRecord.otp.toString() !== otp.toString()) {
         return res.json({
            success: false,
            message: "Invalid Otp"
         });
      }

      const hashedPassword = await bcrypt.hash(tempUser.password, 10);

      console.log("Before creating user");

      const newUser = await User.create({
         fullName: tempUser.fullName,
         email: tempUser.email,
         password: hashedPassword,
         isVerified: true
      });

      console.log("User Saved Successfully:", newUser);

      await Otp.deleteOne({ email: tempUser.email });
      req.session.tempUser = null;

      return res.json({ success: true });

   } catch (error) {
      console.log(" VERIFY OTP ERROR FULL:");
      console.log(error);   // VERY IMPORTANT
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
}

const resendOtp = async (req, res) => {
   try {

      const tempUser = req.session.tempUser;

      if (!tempUser) {
         return res.status(400).json({
            success: false,
            message: "Session expired. Please signup again."
         });
      }

      const email = tempUser.email;

      await Otp.deleteMany({ email });

      // Generate new OTP
      const newOtp = generateOtp();

      // Save new OTP
      await Otp.create({
         email,
         otp: newOtp
      });

      // Send Email
      await sendEmail(email, newOtp);

      return res.json({
         success: true,
         message: "New OTP sent successfully"
      });

   } catch (error) {
      console.log("RESEND OTP ERROR:", error);
      return res.status(500).json({
         success: false,
         message: "Something went wrong"
      });
   }
};

const loadLogin = (req, res) => {
   try {
      res.render('user/loginPage.ejs')
   } catch (error) {
      console.log(`error from loginPage ${error}`)
   }
}

// Login function

const login = async (req, res) => {
   try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
         return res.json({
            success: false,
            message: "User not found"
         });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.json({
            success: false,
            message: "Incorrect password"
         });
      }

      if (!user.isVerified) {
         return res.json({
            success: false,
            message: "Please verify your email first"
         });
      }
      // Save session
      req.session.user = {
         id: user._id,
         name: user.fullName,
         email: user.email
      };

      return res.json({
         success: true
      });

   } catch (error) {
      console.log(error);
      return res.json({
         success: false,
         message: "Something went wrong"
      });
   }
};

const logout = (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         console.log(err)
      }
      res.clearCookie('connect.sid')
      res.redirect('/login')
   })
}

const loadOtpPage = (req, res) => {
   res.render('user/otpPage.ejs')
}


module.exports = {
   loadHomePage,
   loadSignUp,
   loadLogin,
   signup,
   login,
   logout,
   verifyOtp,
   resendOtp,
   loadOtpPage

};