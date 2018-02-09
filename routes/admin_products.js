const express = require('express');
const router = express.Router();
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var resizeImg = require('resize-img');

// Product model
var Product = require('../models/product');

// Category model
var Category = require('../models/category');

// GET products index
router.get('/', function(req, res) {
    var count;
    Product.count(function(err, c) {
        count = c;
    });
    Product.find(function(err, products) {
        res.render('admin/products', {
            products: products,
            count: count,
            current_year: new Date().getFullYear()
        });
    });
});

// GET add product
router.get('/add-page', function(req, res) {
    var title = "", desc = "", price = "";
    Category.find(function(err, category) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            price: price,
            categories: category,
            current_year: new Date().getFullYear()
        });
    });
});

// POST add product
router.post('/add-product', function (req, res) {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var errors = req.validationErrors();
    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function (err) {
                    if (err)
                        return console.log(err);
                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });
                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });
                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;
                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }
});

// GET edit page
router.get('/edit-page/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
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
        Article.findOne({
            slug: slug,
            _id:{'$ne': id}
        }, function(err, page) {
            var article = new Article({
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
                Article.findById(id, function(err, page) {
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
    Article.findByIdAndRemove(req.params.id, function(err) {
        if(err)
            return console.log(err);
        req.flash('success', 'page deleted!');
        res.redirect('/admin/pages');
    });
});

module.exports = router;