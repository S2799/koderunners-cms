const express = require('express');
const router = express.Router();

// Require the Page model
var Page = require('../models/page');

// Get homepage
router.get('/', function(req, res) {
    Page.findOne({slug: "home"}, function (err, page) {
        if (err)
            console.log(err);
        if (!page)
            res.redirect('/');
        else {
            // console.log('Index render');
            res.render('index', {
                title: page.title,
                content: page.content,
                current_year: new Date().getFullYear()
            });
        }
    });
});

// Get a page
router.get('/:slug', function (req, res) {
    var slug = req.params.slug;
    Page.findOne({slug: slug}, function (err, page) {
        if (err)
            console.log(err);
        if (!page)
            res.redirect('/');
        else {
            // console.log('Index render');
            res.render('index', {
                title: page.title,
                content: page.content,
                current_year: new Date().getFullYear()
            });
        }
    }); 
});

module.exports = router;