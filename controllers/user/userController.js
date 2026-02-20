const { loadLogin } = require("../admin/adminController");


const login =(req,res)=>{
   const userId = req.params.id 
   res.send(`${userId}`)
};

const loadHomePage = (req,res)=>{
   try {
      res.render('user/homePage.ejs')
   } catch (error) {
      console.log(`error from  loadHomePage ${error}`)
   }
}

module.exports = {login,loadHomePage};