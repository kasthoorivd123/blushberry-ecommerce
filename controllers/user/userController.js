const User = require('../../models/user/userModel')
const bcrypt = require('bcrypt')


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
            success:false,
            message : 'password do not match'
         })
      }

      const existingUser = await User.findOne({ email })

      if (existingUser) {
         return res.json({
            success:false,
            message:'user already exists'
         })
      }

      const hashedPassword = await bcrypt.hashSync(password, 10);



      const newUser = new User({
         fullName,
         email,
         password: hashedPassword
      })

      await newUser.save()

      return res.json({
         success: true,
         message: "Account created successfully"
      });
   }
   catch (error) {
      console.log(error)
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

const logout = (req,res) =>{
   req.session.destroy((err)=>{
      if(err) {
         console.log(err)
      }
      res.clearCookie('connect.sid')
      res.redirect('/login')
   })
}




module.exports = {
   loadHomePage,
   loadSignUp,
   loadLogin,
   signup,
   login,
   logout

};