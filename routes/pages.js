const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.render('index', {
        current_year: new Date().getFullYear()
    });
});

module.exports = router;