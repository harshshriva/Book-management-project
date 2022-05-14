const express = require('express')
const route =  require('./routes/route')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app =express()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://harshshri:harsh001@cluster0.zdm3o.mongodb.net/project3" ,
 { useNewUrlParser: true})
 
.then(() => {
    console.log("MongoDb connected")
}).catch((err) => {
    console.log(err.message)
});

app.use('/' , route);

app.listen( process.env.Port || 3000 ,function(){
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

