const format = require('pg-format')
const db = require('../db/connection')

const checkExists = ((table, column, value) => {
    let queryString = format('SELECT * FROM %I WHERE %I = $1;', table, column);
        return db   
        .query(queryString, [value])
        .then((dbOutput) => {
            if (dbOutput.rows.length === 0){
                return Promise.reject({status: 404, msg:'Not found'})
            }
        })
})

module.exports = checkExists