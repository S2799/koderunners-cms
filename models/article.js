var mongoose = require('mongoose');

var ArticleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: { type: String },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
});

var article = module.exports = mongoose.model('Article', ArticleSchema);