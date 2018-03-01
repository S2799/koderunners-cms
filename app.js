const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');

// Local Import
var config = require('./config/database');

// Connect to database
mongoose.connect(config.database, function(e) {
    if(e)
        return console.log(e);
    console.log("Connected successfully to database");
});

// App initialized
var app = express();

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Public directory
app.use(express.static(path.join(__dirname, 'public')));

// Global Error variable
app.locals.errors = null;

// express-fileupload middleware
app.use(fileUpload());

// BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

// Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.');
        var root = namespace.shift();
        var formParam = root;

        while(namespace.length)
            formParam += '[' + namespace.shift() + ']';
        
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function(value, filename) {
            var extension = path.extname(filename).toLowerCase();
            switch(extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Require Config file
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
    res.locals.user = req.user || null;
    next();
 });

// Set routes
var pages = require('./routes/pages');
var users = require('./routes/users');
var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');
var adminProducts = require('./routes/admin_products');
var adminArticles = require('./routes/admin_articles');

app.use('/', pages); // Index page
app.use('/admin/pages', adminPages); // Admin index page
app.use('/admin/categories', adminCategories); // Admin Categories page
app.use('/admin/products', adminProducts); // Admin Products page
app.use('/admin/articles', adminArticles);
app.use('/users', users);


// Starting server
var port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});