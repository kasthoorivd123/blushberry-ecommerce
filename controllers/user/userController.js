const { loadLogin } = require("../admin/adminController");


const loadSignUp =(req,res)=>{
   try {
      res.render('user/userSignup.ejs')
   } catch (error) {
      console.log(`error from signUpPage ${error}`)
   }
};

const loadHomePage = (req,res)=>{
   try {
      res.render('user/homePage.ejs')
   } catch (error) {
      console.log(`error from  loadHomePage ${error}`)
   }
}

module.exports = {loadHomePage,loadSignUp};