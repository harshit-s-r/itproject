const express = require("express");
const mysql = require("mysql");
const dotenv =  require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
dotenv.config({path: './sensitive.env'});

const app = express()
const port =  8011
const db = mysql.createConnection(
    {
        host: process.env.DATABASE_HOST ,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PWD,
        database: process.env.DATABASE
    }
);

const publicdirectory = path.join(__dirname, './public')

app.use(express.static(publicdirectory));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'hbs');
db.connect( (error)=>
{
    if(error)
    {
        console.log(error);
    }
    else
    {
        console.log("MySQL connected");        
    }
});
 
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(port, () =>
{
    console.log("Sever Started at Port 8011");
});
