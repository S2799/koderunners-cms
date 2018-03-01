const express = require('express');
const router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');

var User = require('../models/user');
var Article = require('../models/article');

// GET register
router.get('/register', function (req, res) {
    res.render('register', {
        title: 'Register',
        current_year: new Date().getFullYear()
    });
});



// POST register
router.post('/register', function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register',
            current_year: new Date().getFullYear()
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err)
                console.log(err);
            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 1
                });
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);
                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }
});

// GET login
router.get('/login', function (req, res) {
    if(res.locals.user)
         res.redirect('/');
    res.render('login', {
        title: 'Login',
        current_year: new Date().getFullYear()
    });
});

// POST login
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// GET Logout
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out!');
    res.redirect('/');

});

router.get('/articles', function(req, res) {
    Article.find({}).exec(function(err, articles) {
        res.render('user/articles', {
            items: articles,
            current_year: new Date().getFullYear()
        });
    });
});

router.get('/:username', function(req, res) {
    User.findOne({username: req.params.username}).exec(function(err, user) {
        if(err)
            console.log(err);
        console.log(user);
        res.render('user/dashboard', {
            username: user.username,
            current_year: new Date().getFullYear()
        });
    });
});




module.exports = router;