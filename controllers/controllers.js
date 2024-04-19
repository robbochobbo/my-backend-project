const checkExists = require('../utils/utils')
const endpoints = require('../endpoints.json')

const { 
    fetchAllTopics, 
    fetchArticleById,
    fetchAllArticles,
    fetchCommentsByArticleId,
    insertComment,
    updateArticleById,
    removeCommentById,
    fetchAllUsers,
    fetchUserByUsername,
    updateCommentById
} = require("../models/models")


const getAllApis = (req, res) => {
    res.status(200).send({endpoints})
}

const getAllTopics = (req, res, next) => {
    fetchAllTopics().then((topics) => {
        res.status(200).send(topics)
    })
    .catch((err) => next(err))
}

const getArticleById = (req, res, next) => {
    const { article_id } = req.params
    fetchArticleById(article_id).then((response) => {
        res.status(200).send({article: response})
    })
    .catch((err) => next(err))
}

const getAllArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query
    fetchAllArticles(topic, sort_by, order).then((articles) => {
        res.status(200).send({articles})
    })
    .catch((err) => next(err))
}

const getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params
    Promise.all([fetchCommentsByArticleId(article_id), checkExists("articles", "article_id", article_id)])
    .then(([comments]) => {
        res.status(200).send({comments})
    })
    .catch((err) => next(err))
}

const postComment = (req, res, next) => {
    const newComment = req.body
    const {article_id} = req.params

    Promise.all([insertComment(newComment, article_id), checkExists("articles", "article_id", article_id)])
    .then(([postedComment]) => {
        res.status(201).send({postedComment})
    })
    .catch((err) => {
        next(err)})
}

const patchArticleById = (req, res, next) => {
    const patchVotesObject = req.body
    const { article_id } = req.params
    Promise.all([updateArticleById(patchVotesObject, article_id), checkExists("articles", "article_id", article_id)])
    .then(([updatedArticle]) => {
        res.status(200).send({updatedArticle})
    })
    .catch((err) => next(err))
}

const deleteCommentById = (req, res, next) => {
    const { comment_id } = req.params
    removeCommentById(comment_id).then(() => {
        res.status(204).send()
    })
    .catch((err) => next(err))
}

const patchCommentById = (req, res, next) => {
    const patchCommentVotesObject = req.body
    const {comment_id} = req.params

    Promise.all([updateCommentById(patchCommentVotesObject, comment_id), checkExists("comments", "comment_id", comment_id)])
    .then(([comment]) => {
        res.status(200).send(comment)
    })
    .catch((err) => next(err))
}

const getAllUsers = (req, res, next) => {
    fetchAllUsers().then((users) => {
        res.status(200).send({users})
    })
    .catch((err) => next(err))
}

const getUserByUsername = (req, res, next) => {
    const {username} = req.params
    Promise.all([fetchUserByUsername(username), checkExists("users", "username", username)])
    .then(([user]) => {
        res.status(200).send(user[0])
    })
    .catch((err) => next(err))
}

module.exports = { 
    getAllApis,
    getAllTopics,
    getArticleById,
    getAllArticles,
    getCommentsByArticleId,
    postComment,
    patchArticleById,
    deleteCommentById,
    getAllUsers,
    getUserByUsername,
    patchCommentById
}