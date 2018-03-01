const express = require('express');
const router = express.Router();

var Category = require('../models/category');

// GET categories index
router.get('/', function(req, res) {
    Category.find(function(err, categories) {
        if(err)
            return console.log(err);
        res.render('admin/categories', {
                items: categories,
                current_year: new Date().getFullYear()
            });
        });
});

// GET add category
router.get('/add-category', function(req, res) {
    var title = "";
    res.render('admin/add_category', {
        title: title,
        current_year: new Date().getFullYear()
    });
});

// POST add category
router.post('/add-category', function(req, res) {
    req.checkBody('title', 'Title should not be empty').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_category', {
            errors: errors,
            title: title,
            current_year: new Date().getFullYear()
        });
    } else {
        Category.findOne({slug: slug}, function(err, category) {
            if(category) { // If page already exists
                req.flash('danger', 'Category title already exists');
                res.render('admin/add_category', {
                    title: title,
                    current_year: new Date().getFullYear()
                });
            } else {
                var cat = new Category({
                    title: title,
                    slug: slug
                });
                cat.save(function(err) {
                    if(err)
                        return console.log(err);
                    req.flash('success', 'category added!');
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});

// GET edit category
router.get('/edit-category/:id', function(req, res) {
    Category.findById(req.params.id, function(err, category) {
        if(err)
            return console.log(err);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id,
            current_year: new Date().getFullYear()
        });
    });
});

// POST edit category
router.post('/edit-category/:id', function(req, res) {
    req.checkBody('title', 'Title should not be empty').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;
    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id,
            current_year: new Date().getFullYear()
        });
    } else {
        Category.findOne({
            slug: slug,
            _id:{'$ne': id}
        }, function(err, category) {
            if(category) { // If page already exists
                req.flash('danger', 'category title already exists');
                res.render('admin/edit_category', {
                    title: title,
                    id: id,
                    current_year: new Date().getFullYear()
                });
            } else {
                Category.findById(id, function(err, category) {
                    if(err)
                        return console.log(err);
                    category.title = title;
                    category.slug = slug;
                    category.save(function(err) {
                        if(err)
                            return console.log(err);
                        req.flash('success', 'category edited!');
                        res.redirect('/admin/categories/');
                    });

                });
            }
        });
    }
});

// GET delete category
router.get('/delete-category/:id', function(req, res) {
    Category.findByIdAndRemove(req.params.id, function(err) {
        if(err)
            return console.log(err);
        req.flash('success', 'category deleted!');
        res.redirect('/admin/categories');
    });
});

module.exports = router;