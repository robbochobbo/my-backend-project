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

    return db
    .query(queryString, queryValues)
    .then((body) => {
        return body.rows
    })
}

const fetchArticleById = (article_id) => {

    if(isNaN(article_id)){
        return Promise.reject({status: 400, msg:'Bad request'})
    }

    return db
    .query(`SELECT *
            FROM articles
            WHERE articles.article_id = $1;`, [article_id])
    .then((body) => {
      if(body.rows.length === 0){
        return Promise.reject({status: 404, msg:'Article does not exist'})
      }
      return body.rows;
    });
}

const fetchAllArticles = (sort_by='created_at',  order='DESC') => {

    return db
    .query(`SELECT 
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(articles.article_id) AS comment_count
            FROM articles
            LEFT JOIN comments  
                ON comments.article_id = articles.article_id
            GROUP BY articles.article_id
            ORDER BY created_at DESC`)
    .then((body) => { 
        return body.rows
         })
}

module.exports = { 
    fetchAllTopics,
    fetchArticleById,
    fetchAllArticles
}