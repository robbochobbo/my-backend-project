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

    return db
    .query(`SELECT 
            articles.author,
            articles.title,
            articles.article_id,
            articles.body,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(articles.article_id) AS comment_count
            FROM articles
            LEFT JOIN comments  
                ON comments.article_id = articles.article_id
            WHERE articles.article_id = $1
            GROUP BY articles.article_id
            ORDER BY created_at DESC;`, [article_id])
    .then((body) => {
    if(body.rows.length === 0){
        return Promise.reject({status: 404, msg:'Article does not exist'})
    }
    return body.rows;
    })  

}   

const fetchAllArticles = (topic) => {

    const queryValues = []
    let queryString = `SELECT 
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
                            ON comments.article_id = articles.article_id`

    const regex = /[a-zA-Z]/
    if (topic && regex.test(topic)) {
        queryValues.push(topic);
        queryString += ` WHERE topic = $1`;
        }
    else if (topic && (!regex.test(topic))){
       return Promise.reject({status: 400, msg:'Bad request'})
    }

    queryString += ` GROUP BY articles.article_id
                    ORDER BY created_at DESC`

    return db
    .query(queryString, queryValues)
    .then((body) => { 
        return body.rows
         })
}

const fetchCommentsByArticleId = (article_id) => {
    if(isNaN(article_id)){
        return Promise.reject({status: 400, msg:'Bad request'})
    }
    return db
    .query(`SELECT 
            comments.comment_id,
            comments.votes,
            comments.created_at,
            comments.author,
            comments.body,
            comments.article_id
            FROM comments
            WHERE comments.article_id = $1
            ORDER BY created_at DESC;`, [article_id])
    .then((body) => {
        if(body.rows.length === 0){
            return Promise.reject({status: 404, msg:'Article does not exist'})
          }
        return body.rows
    })
}

const insertComment = (newComment, article_id) => {
    const {username, body} = newComment
    return db
    .query(`INSERT INTO comments (author, body, article_id) 
            VALUES ($1, $2, $3) 
            RETURNING *;`, [username, body, article_id]
    )
    .then((body) => {
        return body.rows[0];
    })
}

const updateArticleById = (patchVotesObject, article_id) => {
    return db
    .query(`UPDATE articles
            SET votes = votes + $1
            WHERE article_id = $2
            RETURNING *`, [patchVotesObject.inc_votes, article_id])
    .then((body) => {
        return body.rows[0]
    })
}

const removeCommentById = (comment_id) => {
    return db
    .query(`DELETE FROM comments
            WHERE comment_id = $1
            RETURNING *;`, [comment_id])
    .then((body) => {
        if(body.rows[0] === undefined){
            return Promise.reject({status: 404, msg:'Not found'})
        }
        return
    })
}

const fetchAllUsers = () => {
    return db
    .query(`SELECT * FROM users
            ORDER BY username ASC;`)
    .then((body) => { 
        return body.rows
         })
}

module.exports = { 
    fetchAllTopics,
    fetchArticleById,
    fetchAllArticles,
    fetchCommentsByArticleId,
    insertComment,
    updateArticleById,
    removeCommentById,
    fetchAllUsers
}