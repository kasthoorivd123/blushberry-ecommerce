const { loadLogin } = require("../admin/adminController");


const login =(req,res)=>{
   const userId = req.params.id 
   res.send(`${userId}`)
};


module.exports = {login};