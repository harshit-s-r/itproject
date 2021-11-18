const express = require("express");
const router = express.Router();
const authcontroller = require('../controllers/auth');

router.get("/", (req,res) =>
{
    res.render("index");
});

router.get("/signup", (req,res) =>
{
    res.render("signup");
});

router.get("/aboutus", (req,res) =>
{
    res.render("aboutus");
});

router.get("/index", (req,res) =>
{
    res.render("index");
});

router.get("/login", authcontroller.isLoggedIn, (req,res,next) =>
{
    if(req.user == undefined)
    {
        res.render("login");
    }
    //res.render("account");
});
router.get("/account", authcontroller.isLoggedIn, (req,res,next) =>
{
    if(req.user == undefined)
    {
        res.render("login");
    }
    //res.render("account");
});

router.get("/createblog", authcontroller.isLoggedIn2, (req,res,next) =>
{
    if(req.user == undefined)
    {
        res.render("login");
    }
});
router.get("/auth/login", (req,res) =>
{
    res.render("account");
});

router.get("/baseprofile", authcontroller.view, (req,res) =>
{
    
});
module.exports = router;