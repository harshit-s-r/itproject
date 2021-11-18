const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { promisify } = require('util');

const db = mysql.createConnection(
    {
        host: process.env.DATABASE_HOST ,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PWD,
        database: process.env.DATABASE
    }
);

//login 
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
  
    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).render("login", {
        message: 'Please provide email and password'
      });
    }
  
    // 2) Check if user exists && password is correct
    db.query('SELECT * FROM user WHERE email = ?', [email], async(error, results) => {
        if(results==0) {
            return res.status(401).render("login", {
            message: 'Email does not exist'
             });
        }
        console.log(results);
        console.log(password);
        const isMatch = await bcrypt.compare(password, results[0].password);
        console.log(isMatch);
        if(!results || !isMatch ) {
         return res.status(401).render("login", {
           message: 'Incorrect email or password'
        });
      } else {
        const id = results[0].id;
        console.log("k");
        console.log(id);
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
        });
        
  
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        };
        res.cookie('jwt', token, cookieOptions);
        console.log(req.cookie);
        res.redirect('/index');
    
     }
    });
  };

exports.register = (req, res) => {
    
    console.log(req.body);
    const {name, email, p1, p2} = req.body;

    db.query('SELECT email FROM user WHERE email = ?', [email], async (error, results) => {
        if(error){
            console.log(error);
        }
        if(!name || !email) {
            return res.status(401).render("signup", {
            message: 'Fill all the fields'
             });
        }
        if(results.length > 0){
            return res.render('signup', {
                message : 'That email is already in use!'
            })
        }
        
        let h_password = await bcrypt.hash(p1,8);
        console.log(h_password);

        db.query('INSERT INTO user SET ?', {name: name, email: email, password: h_password}, (error,results) => {
            if(error){
                console.log(error);
            }else{
                db.query('SELECT id FROM user WHERE email = ?', [email], (error, result) => {
                    const id = result[0].id;
                    console.log(id);
                    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                      expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
                    });
          
                    const cookieOptions = {
                      expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                      ),
                      httpOnly: true
                    };
                    res.cookie('jwt', token, cookieOptions);
                    console.log(req.cookies);
                    res.redirect('/account')
                  });
            }
        });
    });
};

exports.isLoggedIn = async (req, res, next) => {
  console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt, 
        process.env.JWT_SECRET
        );

      console.log(decoded);
      
      //Check if user still exists
      db.query('SELECT * FROM user WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result)
        if(!result) {
          return next();
        }
        req.user = result[0];
        db.query('SELECT * FROM blogdata WHERE uid = ?',[decoded.id],(err, row) =>
    {
        if(!err)
        {
            console.log(row);
            res.render("account", {user: req.user, row: row});
        }
        else
        {
            console.log(error);
        }
    });

    return next();
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};

exports.isLoggedIn2 = async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt, 
          process.env.JWT_SECRET
          );
        console.log(decoded);
        //Check if user still exists
        db.query('SELECT * FROM user WHERE id = ?', [decoded.id], (error, result) =>
        {
          console.log(result)
          if(!result) {
            return next();
          }
          req.user = result[0];
              res.render("createblog");
      return next();
        });
      } catch (err) {
        return next();
      }
    } else {
      next();
    }
  };
  
//logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  //res.status(200).redirect("/index");
  res.redirect('/index')
};

exports.view = async (req, res, next) =>
{
    db.query('SELECT * FROM blogdata',(err, row) =>
    {
        if(!err)
        {
            console.log(row);
            req.user = row;
            res.render("baseprofile", {row: req.user});
        }
        else
        {
            console.log(error);
        }
    })
    return next();
}

exports.add_blog= async(req, res, next)=>{
    const {title, name, content} = req.body
    if (req.cookies.jwt) {
        try {
          const decoded = await promisify(jwt.verify)
          (
            req.cookies.jwt, 
            process.env.JWT_SECRET);
            console.log(decoded);
    db.query('INSERT INTO blogdata set ?', {uid:[decoded.id],title: title, content: content, name:name,}, (err, results)=>{
        if(err){
            console.log(err)
        }
        else{
            res.redirect('/account')
        }
    })
}
catch (err) {
    return next();
  }
}
else {
    next();
  }
};
exports.remove_blog = (req, res, next)=>{
    const {id} = req.body
    db.query('DELETE FROM blogdata where id = ?', [id], (err, results)=>{
        if(err){
            console.log(err)
        }
        else{
            res.redirect('/account')
        }
    })
}