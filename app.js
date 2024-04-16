const express = require('express')
const app = express()
const endpoints = require('./endpoints.json')

const {
    getAllTopics,
    getArticleById } = require('./controllers/controllers')

app.get('/api', (req, res) => {
    res.status(200).send({endpoints})
})

app.get('/api/topics', getAllTopics)

app.get('/api/articles/:article_id', getArticleById)



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

app.use((err, req, res, next) => {
    res.status(500).send({msg: "Internal server error"})
})

module.exports = app