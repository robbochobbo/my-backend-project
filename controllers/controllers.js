const { 
    fetchAllTopics, 
    fetchArticleById,
    fetchAllArticles 
} = require("../models/models")

const getAllTopics = (req, res, next) => {

    const {sort_by, order, slug} = req.query

    fetchAllTopics(sort_by, order, slug).then((topics) => {
        res.status(200).send(topics)
    })
    .catch((err) => next(err))
}

const getArticleById = (req, res, next) => {
    const { article_id } = req.params
    fetchArticleById(article_id).then((article) => {
        res.status(200).send({article})
    })
    .catch((err) => next(err))
}

const getAllArticles = (req, res, next) => {
    const { sort_by, order } = req.query
    fetchAllArticles(sort_by, order).then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => next(err))
}

module.exports = { 
    getAllTopics,
    getArticleById,
    getAllArticles
}