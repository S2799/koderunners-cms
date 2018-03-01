const express = require('express');
const router = express.Router();

var Page = require('../models/page');

// GET page index
router.get('/', function(req, res) {
    Page.find({}).exec(function(err, pages) {
        res.render('admin/pages', {
            items: pages,
            current_year: new Date().getFullYear()
        });
    });
});

// GET add page
router.get('/add-page', function(req, res) {
    var title = "", slug = "", content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content,
        current_year: new Date().getFullYear()
    });
});

// POST add page
router.post('/add-page', function(req, res) {
    req.checkBody('title', 'Title should not be empty').notEmpty();
    req.checkBody('title', 'Title should not be empty').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            current_year: new Date().getFullYear()
        });
    } else {
        Page.findOne({slug: slug}, function(err, page) {
            var article = new Page({
                title: title,
                slug: slug,
                content: content
            });
            if(page) { // If page already exists
                req.flash('danger', 'page slug already exists');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    current_year: new Date().getFullYear()
                });
            } else {
                var article = new Page({
                    title: title,
                    slug: slug,
                    content: content
                });
                article.save(function(err) {
                    if(err)
                        return console.log(err);
                    req.flash('success', 'page added!');
                    res.redirect('/admin/pages');
                });
            }
        });
    }
});

// GET edit page
router.get('/edit-page/:id', function(req, res) {
    Page.findById(req.params.id, function(err, article) {
        if(err)
            return console.log(err);
        res.render('admin/edit_page', {
            title: article.title,
            slug: article.slug,
            content: article.content,
            id: article._id,
            current_year: new Date().getFullYear()
        });
    });
});

// POST edit page
router.post('/edit-page/:id', function(req, res) {
    req.checkBody('title', 'Title should not be empty').notEmpty();
    req.checkBody('title', 'Title should not be empty').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;
    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id,
            current_year: new Date().getFullYear()
        });
    } else {
        Page.findOne({
            slug: slug,
            _id:{'$ne': id}
        }, function(err, page) {
            var article = new Page({
                title: title,
                slug: slug,
                content: content
            });
            if(page) { // If page already exists
                req.flash('danger', 'page slug already exists');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id,
                    current_year: new Date().getFullYear()
                });
            } else {
                Page.findById(id, function(err, page) {
                    if(err)
                        return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function(err) {
                        if(err)
                            return console.log(err);
                        req.flash('success', 'page edited!');
                        res.redirect('/admin/pages/edit-page/' + id);
                    });

                });
            }
        });
    }
});

// GET delete page index
router.get('/delete-page/:id', function(req, res) {
    Page.findByIdAndRemove(req.params.id, function(err) {
        if(err)
            return console.log(err);
        req.flash('success', 'page deleted!');
        res.redirect('/admin/pages');
        
    });
});

// GET preview
router.get('/preview/:id', function(req, res) {
    Page.findById(req.params.id, function(err, page) {
        if(err)
            return console.log(err);
        res.render('index', {
            title: page.title,
            content: page.content,
            current_year: new Date().getFullYear()
        });
    });
});

module.exports = router;