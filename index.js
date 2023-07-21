const express = require("express")

const app = express()
const dotenv = require('dotenv')
const signUpRoute = require('./routes/signUp.route');

const mongoose = require ('mongoose')


dotenv.config({path: './.env'})

let PORT = process.env.PORT
app.use(express.json())

mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

.then(()=>console.log("Connected to database successfully"))
.catch(err=>console.log(err))

app.use("/users", signUpRoute); 
const travelRoute = require('./routes/booking.route'); 
app.use('/travels', travelRoute);

app.listen( PORT ,()=>{
    console.log(`server is listening on port ${PORT}`);
})










