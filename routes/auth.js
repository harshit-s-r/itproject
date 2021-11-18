const express = require("express");
const authcontroller = require('../controllers/auth');
const router = express.Router();

router.post("/signup", authcontroller.register);
router.post('/login', authcontroller.login);
router.get('/logout', authcontroller.logout);
router.post('/remove_blog', authcontroller.remove_blog);
router.post('/add_blog', authcontroller.add_blog);
router.post('/edit_blog', authcontroller.edit_blog);
module.exports = router;
