const express = require('express')
const path = require('path')

require('dotenv').config()

const app = express()

app.set('views', path.join(__dirname, "views"))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req,res)=>{
    res.send('Hello world')
})

app.listen(process.env.PORT), ()=> {
    console.log("app is running")
}
