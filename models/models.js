const db = require('../db/connection')

const fetchAllTopics = (sort_by='slug', order='ASC', slug) => {

    const queryValues = []
    
    let queryString = `SELECT * FROM topics`

    if (slug){
        queryValues.push(slug)
        queryString += ` WHERE slug = $1`
    }

    const validSortBys = ['slug','description']
    if(!validSortBys.includes(sort_by)){
        return Promise.reject({status: 400, msg:'Bad request'})
    } else{
        queryString += ` ORDER BY ${sort_by}`
    }

    const validOrders = ['ASC', 'DESC']
    if(!validOrders.includes(order.toUpperCase())){
        return Promise.reject({status: 400, msg:'Bad request'})
    } else{
        queryString += ` ${order.toUpperCase()};`
    }

    return db.query(queryString, queryValues)
    .then((body) => {
        return body.rows
    })
}

module.exports = { fetchAllTopics }