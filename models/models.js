const db = require('../db/connection')

const fetchAllTopics = () => {
    console.log("in model")

    let queryString = 'SELECT * FROM topics'

    return db.query(queryString)
    .then((body) => {
        if (body.rows.length === 0){
            return Promise.reject({status: 204, msg:'No data here yet'})
        }
        return body.rows
    })
}

module.exports = { fetchAllTopics }