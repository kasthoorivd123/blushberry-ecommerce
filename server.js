const  express = require('express')
const app = express() 
require('dotenv').config();
const morgan = require('morgan')



const path = require('path') 
const nocache = require('nocache')
const session = require('express-session')

const connectDb = require('./config/connectDb')
app.use(morgan('dev'))

const userRouter = require('./routes/userRoutes')
const adminRouter = require('./routes/adminRoutes')

connectDb()


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(express.static(path.join(__dirname,'public')))

app.use(nocache())

app.use(session({
    
    secret: 'kasthoori',
    
    resave: false,
    
    saveUninitialized: false,
    
    cookie: {
        
        secure: false, // true only in production with https
        
        httpOnly: true,
        
        maxAge: 72 * 60 * 60 * 1000
        
    }
    
}));

app.set('view engine','ejs')

app.set('views',path.join(__dirname,'views')) 

app.use('/',userRouter)
app.use('/admin',adminRouter)

// app.get('/',(req,res)=>{
//     res.send('Blushberry Home')
// })

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});
