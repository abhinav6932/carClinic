require('dotenv').config()
const express=require("express")
const app=express()
const path=require('path')
const connectDB=require('./config/db')
const bodyParser=require('body-parser')
const session=require('express-session')
const jwt=require('jsonwebtoken')
const MongoStore=require('connect-mongo').default
const Service=require('./models/service')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET || 'localdev-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}))
app.use((req, res, next) => {
    res.locals.req = req;
    next();
});
const userRouter=require('./routes/userRouter')




// Connect to MongoDB
connectDB()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use("/auth", require("./routes/userRouter"))
app.use("/admin", require("./routes/adminRouter"))










app.get("/", async (req,res)=>{
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.render("index", { services });
    } catch (error) {
        console.error('home route error', error);
        res.render("index", { services: [] });
    }
})

app.get("/home", async (req,res)=>{
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.render("index", { services });
    } catch (error) {
        console.error('home route error', error);
        res.render("index", { services: [] });
    }
})
app.get("/services", async (req,res)=>{
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        console.log('services route loaded, count=', services.length);
        res.render("services", { services });
    } catch (error) {
        console.error('services route error', error);
        res.render("services", { services: [] });
    }
})



app.get("/contact", (req,res)=>{
    res.render("contact")
})
app.get("/about", (req,res)=>{
    res.render("about")
})



app.listen(3000,()=>{
    console.log("server is running on http://localhost:3000")
})