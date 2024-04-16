const { 
    fetchAllTopics, 
    fetchArticleById 
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
    fetchArticleById(article_id).then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => next(err))
}


module.exports = { 
    getAllTopics,
    getArticleById
}