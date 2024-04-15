const { fetchAllTopics } = require("../models/models")

const getAllTopics = (req, res, next) => {

    const {sort_by, order, slug} = req.query

    fetchAllTopics(sort_by, order, slug).then((topics) => {
        res.status(200).send(topics)
    })
    .catch((err) => {next(err)})
}

module.exports = { getAllTopics }