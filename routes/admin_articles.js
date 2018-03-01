const express = require('express');
const router = express.Router();

var Article = require('../models/article');
var Category = require('../models/category');

// GET article index
router.get('/', function(req, res) {
    var count;
    Article.count(function(err, c) {
        count = c;
    });
    Article.find({}).exec(function(err, articles) {
        var arr = [];
        articles.forEach(function(i) {
            arr.push(i.content);
        });
        console.log(arr);
        res.render('admin/articles', {
            items: articles,
            count: count,
            current_year: new Date().getFullYear()
        });
    });
});

// GET add article
router.get('/add-article', function(req, res) {
    var title = "", slug = "", image = "", content = "";
    Category.find(function(err, category) {
        res.render('admin/add_article', {
            title: title,
            slug: slug,
            image: image,
            content: content,
            categories: category,
            current_year: new Date().getFullYear()
        });
    });
});

// POST add article
router.post('/add-article', function(req, res) {
    req.checkBody('title', 'Title should not be empty').notEmpty();
    req.checkBody('image', 'Image Url should not be empty').notEmpty();
    req.checkBody('content', 'Content should not be empty').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var image = req.body.image;
    var category = req.body.category;
    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_article', {
            errors: errors,
            title: title,
            slug: slug,
            image: image,
            category: category,
            content: content,
            current_year: new Date().getFullYear()
        });
    } else {
        Article.findOne({slug: slug}, function(err, page) {
            var article = new Article({
                title: title,
                slug: slug,
                content: content,
                image: image,
                category: category,
            });
            if(page) { // If article already exists
                req.flash('danger', 'Article already exists');
                res.render('admin/add_article', {
                    title: title,
                    slug: slug,
                    content: content,
                    image: image,
                    category: category,
                    current_year: new Date().getFullYear()
                });
            } else {
                var article = new Article({
                    title: title,
                    slug: slug,
                    content: content,
                    image: image,
                    category: category
                });
                article.save(function(err) {
                    if(err)
                        return console.log(err);
                    req.flash('success', 'article added!');
                    res.redirect('/admin/articles');
                });
            }
        });
    }
});

// GET edit page
router.get('/edit-article/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if(err)
            return console.log(err);
        res.render('admin/edit_article', {
            title: article.title,
            slug: article.slug,
            content: article.content,
            image: article.image,
            categories: article.category,
            id: article._id,
            current_year: new Date().getFullYear()
        });
    });
});

// POST edit article
router.post('/edit-article/:id', function(req, res) {
    req.checkBody('title', 'Title should not be empty').notEmpty();
    req.checkBody('content', 'Content should not be empty').notEmpty();
    req.checkBody('image', 'Image should not be empty').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var image = req.body.image;
    var id = req.params.id;
    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/edit_article', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            image: image,
            id: id,
            current_year: new Date().getFullYear()
        });
    } else {
        Article.findOne({
            slug: slug,
            _id:{'$ne': id}
        }, function(err, page) {
            var article = new Article({
                title: title,
                slug: slug,
                content: content,
                image: image
            });
            if(page) { // If page already exists
                req.flash('danger', 'page slug already exists');
                res.render('admin/edit_article', {
                    title: title,
                    slug: slug,
                    content: content,
                    image: image,
                    id: id,
                    current_year: new Date().getFullYear()
                });
            } else {
                Article.findById(id, function(err, page) {
                    if(err)
                        return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    page.image = image;

                    page.save(function(err) {
                        if(err)
                            return console.log(err);
                        req.flash('success', 'page edited!');
                        res.redirect('/admin/articles/');
                    });
                });
            }
        });
    }
});

// GET delete page index
router.get('/delete-article/:id', function(req, res) {
    Article.findByIdAndRemove(req.params.id, function(err) {
        if(err)
            return console.log(err);
        req.flash('success', 'article deleted!');
        res.redirect('/admin/articles');
        
    });
});

// GET preview
router.get('/article-preview/:slug', function(req, res) {
    Article.find({slug: req.params.slug}).exec(function(err, article) {
        if(err)
            return console.log(err);
        res.render('article', {
            article: article[0],
            current_year: new Date().getFullYear()
        });
    });
});

module.exports = router;