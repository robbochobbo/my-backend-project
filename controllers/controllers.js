const { 
    fetchAllTopics, 
    fetchArticleById,
    fetchAllArticles,
    fetchCommentsByArticleId,
    insertComment
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
    fetchAllArticles().then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => next(err))
}

const getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params
    fetchCommentsByArticleId(article_id).then((comments) => {
        res.status(200).send({comments})
    })
    .catch((err) => next(err))
}

const postComment = (req, res, next) => {
    const {article_id} = req.params
    const newComment = req.body
    insertComment(newComment, article_id).then((postedComment) => {
        res.status(201).send({postedComment})
    })
    .catch((err) => next(err))
}

module.exports = { 
    getAllTopics,
    getArticleById,
    getAllArticles,
    getCommentsByArticleId,
    postComment
}