const express = require('express')
const app = express()
const endpoints = require('./endpoints.json')

const {
    getAllTopics,
    getArticleById,
    getAllArticles,
    getCommentsByArticleId,
    postComment,
    patchArticleById
 } = require('./controllers/controllers')


app.use(express.json())

app.get('/api', (req, res) => {
    res.status(200).send({endpoints})
})

app.get('/api/topics', getAllTopics)

app.get('/api/articles/:article_id', getArticleById)
app.patch('/api/articles/:article_id', patchArticleById)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.post('/api/articles/:article_id/comments', postComment)


// error handling
app.get('/api/*', (req, res, next) => {
    res.status(404).send({msg: 'Not found - endpoint does not exist'})
})

app.use((err, req, res, next) => {
    if (err.status && err.msg){
        res.status(err.status).send({ msg: err.msg })
    }
    else next(err)
})

app.use((err, request, response, next) => {
    if (err.code === '23502') {
        response.status(400).send({msg: "Bad request"})
    }
    if(err.code === '22P02') {
        response.status(400).send({msg: "Bad request"})
    }
    else next(err)
  })


app.use((err, req, res, next) => {
    res.status(500).send({msg: "Internal server error"})
})

module.exports = app