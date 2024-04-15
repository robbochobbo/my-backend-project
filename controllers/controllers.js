const { fetchAllTopics } = require("../models/models")

const getAllTopics = (req, res, next) => {
    console.log("in controller")
    fetchAllTopics().then((topics) => {
        res.status(200).send(topics)
    })
    .catch((err) => next(err))
}

module.exports = { getAllTopics }