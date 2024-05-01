const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const request = require('supertest')
const endpoints = require('../endpoints.json')
const comments = require('../db/data/test-data/comments.js')


beforeAll(() => seed(testData))
afterAll(() => db.end())

describe('/api', () => {
    test('GET 200: responds with up-to-date description of all other available endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body}) => {
            expect(body).toEqual({"endpoints": endpoints})
        })
    })
})

describe('/api/not_an_endpoint', () => {
    test('GET:404 responds with error msg if endpoint does not exist', () => {
        return request(app)
        .get('/api/not_an_endpoint')
        .expect(404)
        .then(({body}) => {
                expect(body.msg).toBe('Not found - endpoint does not exist')
            })
    })
})

describe('/api/topics', () => {
    test('GET:200 responds with an array of all topics, each with a slug and a description', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body}) => {
            expect(body.length).toBe(3)
            body.forEach((topic) => {
                expect(typeof topic.description).toBe('string')
                expect(typeof topic.slug).toBe('string')
            })
        })
    })
    
    test('GET 200: responds with topics sorted by slug, alphabetically', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body: topics}) => {
            expect(topics).toBeSortedBy("slug")
        })
    })

})

describe('/api/articles/:article_id', () => {
    test('GET 200: responds with 1 of article object with the correct properties', () => {
        return request(app)
        .get('/api/articles/3')
        .expect(200)
        .then(({body : {article}}) => {
            expect(article.length).toBe(1)
            expect(typeof article[0].author).toBe('string')
            expect(typeof article[0].title).toBe('string')
            expect(typeof article[0].article_id).toBe('number')
            expect(typeof article[0].body).toBe('string')
            expect(typeof article[0].topic).toBe('string')
            expect(typeof article[0].created_at).toBe('string')
            expect(typeof article[0].votes).toBe('number')
            expect(typeof article[0].article_img_url).toBe('string')
        })
    })

    test('GET 200: responds with given article_id with correct properties, now including comment_count', () => {
        return request(app)
        .get('/api/articles/3')
        .expect(200)
        .then(({body : {article}}) => {
            expect(article[0].comment_count).toBe("2")
            
        })
    })

    test('GET 404: responds with 404 and err msg if article does not exist', () => {
        return request(app)
        .get('/api/articles/102')
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe('Article does not exist')
        })
    })
    test('GET 400: responds with 400 and err msg if user passes invalid article id type', () => {
        return request(app)
        .get('/api/articles/invalid_id')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })

    test('PATCH 200: responds with the updated article and increments the given article_id.votes by amount given in object', () => {
        const patchVotesObject = { inc_votes: -10}
        return request(app)
        .patch('/api/articles/1')
        .send(patchVotesObject)
        .expect(200)
        .then(({body: {updatedArticle}}) => {
            expect(updatedArticle.votes).toBe(90)
        })
    })

    test('PATCH 200: updates articles that did not have a votes property with new votes', () => {
        const patchVotesObject = { inc_votes: 10}
        return request(app)
            .patch('/api/articles/3')
            .send(patchVotesObject)
            .expect(200)
            .then(({body: {updatedArticle}}) => {
                expect(updatedArticle.votes).toBe(10)
        })
    })

    test('PATCH 400: responds with an 400 and msg when provided with incorrect type in object', () => {
        const patchVotesObject = { inc_votes: "incorrect value type"}
        return request(app)
            .patch('/api/articles/3')
            .send(patchVotesObject)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
        })
    })
    test('PATCH 400: responds with an 400 and msg when provided with malformed object', () => {
        const patchVotesObject = {}
        return request(app)
            .patch('/api/articles/3')
            .send(patchVotesObject)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
        })
    })
    test('PATCH 400: responds with an 400 and msg when trying to patch at invalid id', () => {
        const patchVotesObject = {}
        return request(app)
            .patch('/api/articles/invalid_id')
            .send(patchVotesObject)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
        })
    })
    test('PATCH 400: responds with an 404 and msg when trying to patch at valid article_id but does not exist', () => {
        const patchVotesObject = {}
        return request(app)
            .patch('/api/articles/99999')
            .send(patchVotesObject)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not found')
        })
    })
})


describe('/api/articles', () => {
    test('GET 200: responds with an array of objects of articles, each with the correct properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(articles.length).toBe(13)
            articles.forEach((article) => {
                expect(typeof article.author).toBe('string')
                expect(typeof article.title).toBe('string')
                expect(typeof article.article_id).toBe('number')
                expect(typeof article.topic).toBe('string')
                expect(typeof article.created_at).toBe('string')
                expect(typeof article.votes).toBe('number')
                expect(typeof article.article_img_url).toBe('string')
                expect(typeof article.body).toBe('undefined') 
            })
        })
    })

    test('GET 200: responds with articles sorted by date descending by default', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(articles).toBeSortedBy('created_at',{descending:true})
        })
    })

    test('GET 200: responds with articles filtered by topic query', () => {
        return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
        .then(({body: {articles}}) => {
            articles.forEach((article) => {
                expect(article.topic).toBe('cats')
            })
        })
    })

    test('GET 200: responds with empty array when articles filtered by topic query is valid but do not exist yet', () => {
        return request(app)
        .get('/api/articles?topic=paper')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(articles.length).toBe(0)
        })
    })

    test('GET 200: sorts by given sort_by, descending', () => {
        return request(app)
        .get('/api/articles?sort_by=title')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(articles).toBeSortedBy('title', {descending:true})
        })
    })

    test('GET 200: orders by given order', () => {
        return request(app)
        .get('/api/articles?order=asc')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(articles).toBeSortedBy('created_at')
        })
    })
    
    test('GET 400: responds with error and msg when topic value is invalid', () => {
        return request(app)
        .get('/api/articles?topic=9999')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })
    test('GET 400: responds with error and msg when sort_by value is invalid', () => {
        return request(app)
        .get('/api/articles?sort_by=invalid_sort_by')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })
    test('GET 400: responds with error and msg when order value is invalid', () => {
        return request(app)
        .get('/api/articles?order=invalid_order')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })

    test('POST 200: responds with the newly added article, with all the correct properties', () => {
        const newArticleObject = {
            title: "The Wanderer; or, A Tale of Exploration",
            topic: "mitch",
            author: "rogersop",
            body: "Call me Wanderer. Some years ago — never mind exactly how long — with little coin in my pocket and a restless spirit at my heels, I resolved to embark on a journey through the uncharted realms.",
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            }
        return request(app)
        .post('/api/articles')
        .send(newArticleObject)
        .expect(200)
        .then(({body: {newArticle}}) => {
            expect(newArticle).toEqual({...newArticleObject, created_at: expect.any(String), article_id: expect.any(Number), votes: 0})
        })
    })

})

describe('/api/articles/:article_id/comments', () => {
    test('GET 200: responds with an array of comments for given article_id with correct properties', () => {
        return request(app)
        .get('/api/articles/3/comments')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments.length).toBe(2)
            comments.forEach((comment) => {
                expect(typeof comment.comment_id).toBe('number')
                expect(typeof comment.votes).toBe('number')
                expect(typeof comment.created_at).toBe('string')
                expect(typeof comment.author).toBe('string')
                expect(typeof comment.body).toBe('string')
                expect(typeof comment.article_id).toBe('number')
            }) 
        })
    })

    test('GET 200: responds with comments sorted by date descending', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments).toBeSortedBy('created_at',{descending:true})
        })
    })

    
    test('GET 200: article_id is valid but there are no associated comments', () => {
        return request(app)
        .get('/api/articles/4/comments')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments.length).toBe(0)
        }) 
       
    })

    test('GET 404: responds with 404 and err msg if article_id does not exist', () => {
        return request(app)
        .get('/api/articles/9999/comments')
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe('Not found')
        })
    })
    test('GET 400: responds with 400 and err msg if user passes invalid article id type', () => {
        return request(app)
        .get('/api/articles/invalid_id/comments')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })
})

describe('/api/articles/:article_id/comments', () => {
    const newComment =  {
        username: "butter_bridge",
        body: "Comment body"
    }
    test('POST 201: responds with comment given by client and inserts it into comments table at given article_id', () => {
        return request(app)
        .post('/api/articles/3/comments')
        .send(newComment)
        .expect(201)
        .then(({body: {postedComment}}) => {
            expect(postedComment.article_id).toBe(3)
            expect(postedComment.author).toBe("butter_bridge")
            expect(postedComment.body).toBe("Comment body")
        })
        .then(()=> {
            return db 
            .query(`SELECT * FROM comments`)
        })
        .then((body) => {
            expect(body.rows.length).toBe(comments.length + 1)
        })
    })
    test('POST 201: responds with comment given by client and inserts it into comments table at given article_id and ignores unneccesary properties', () => {
        return request(app)
        .post('/api/articles/3/comments')
        .send({
            username: "butter_bridge",
            body: "comment body 2",
        })
        .expect(201)
        .then(({body: {postedComment}}) => {
            expect(postedComment.article_id).toBe(3)
            expect(postedComment.author).toBe("butter_bridge")
            expect(postedComment.body).toBe("comment body 2")
        })
    })
    test('POST 400: responds with a 400 and msg when provided with an incomplete object (no body)', () => {
        return request(app)
        .post('/api/articles/3/comments')
            .send({
                username: "butter_bridge"
            })
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
            })
        })
        
    test('POST 404: responds with a 404 and msg when trying to post to an valid but non-existent article', () => {
        return request(app)
        .post('/api/articles/9999/comments')
        .send(newComment)
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("Bad request")
        })
    })

    test('POST 400: responds with a 400 and msg when trying to post with invalid username', () => {
        return request(app)
        .post('/api/articles/3/comments')
        .send({
            username: "not_a_valid_username",
            body: "comment body"
        })
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })
    test('POST 400: responds with a 400 and msg when trying to post while missing username', () => {
        return request(app)
        .post('/api/articles/3/comments')
        .send({
            body: "comment body"
        })
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })
    test('POST 400: responds with a 404 and msg when post is valid but article is invalid', () => {
        return request(app)
        .post('/api/articles/invalid_article_name/comments')
        .send({
            username: "butter_bridge",
            body: "comment body"
            })
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
            })
        })
    })  
    
    
describe('/api/comments/comment_id', () => {
    test('DELETE 204: Responds with status 200 and no content, removes comment of given comment_id', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then(() => {
            return db
            .query(`SELECT * FROM comments`)
        })
        .then((body) => {
            expect(body.rows.length).toBe(comments.length + 1)
        })
    })

    test('DELETE 404: Responds with status 404 and msg if comment does not exist', () => {
        return request(app)
        .delete('/api/comments/99999')
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe('Not found')
        })
    })

    test('DELETE 400: Responds with status 400 and msg if passed invalid ID', () => {
        return request(app)
        .delete('/api/comments/invalid_id')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })

    test('PATCH 200: Responds with comment, accepts an object of inc_votes that will increment votes by value', () => {
        const patchCommentVotesObject = { inc_votes: 10}
        return request(app)
        .patch('/api/comments/5')
        .send(patchCommentVotesObject)
        .expect(200)
        .then(({body: comment}) => {
            expect(typeof comment).toBe('object')
            expect(typeof comment.comment_id).toBe('number')
            expect(typeof comment.votes).toBe('number')
            expect(typeof comment.created_at).toBe('string')
            expect(typeof comment.author).toBe('string')
            expect(typeof comment.body).toBe('string')
            expect(typeof comment.article_id).toBe('number')
        })
    })

    test('PATCH 200: increments votes by correct value', () => {
        const patchCommentVotesObject = { inc_votes: 10}
        return request(app)
        .patch('/api/comments/5')
        .send(patchCommentVotesObject)
        .expect(200)
        .then(({body: comment}) => {
            expect(comment.votes).toBe(20)
        })
    })

    test('PATCH 400: responds with an 400 and msg when provided with incorrect type in object', () => {
        const patchCommentVotesObject = { inc_votes: "incorrect value type"}
        return request(app)
            .patch('/api/comments/3')
            .send(patchCommentVotesObject)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
        })
    })
    test('PATCH 400: responds with an 400 and msg when provided with malformed object', () => {
        const patchCommentVotesObject = {}
        return request(app)
            .patch('/api/comments/3')
            .send(patchCommentVotesObject)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
        })
    })
    test('PATCH 400: responds with an 400 and msg when trying to patch at invalid id', () => {
        const patchCommentVotesObject = { inc_votes: 10}
        return request(app)
            .patch('/api/comments/invalid_id')
            .send(patchCommentVotesObject)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Bad request')
        })
    })
    test('PATCH 400: responds with an 404 and msg when trying to patch at valid article_id but does not exist', () => {
        const patchCommentVotesObject = { inc_votes: 10}
        return request(app)
            .patch('/api/comments/99999')
            .send(patchCommentVotesObject)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe('Not found')
        })
    })
})

describe('/api/users', () => {
    test('GET 200: Responds with an array of all users with the correct properties', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body: {users}}) => {
            expect(users.length).toBe(4)
            users.forEach((user) => {
                expect(typeof user.username).toBe('string')
                expect(typeof user.name).toBe('string')
                expect(typeof user.avatar_url).toBe('string')
            })
        })
    })

    test('GET 200: responds with users sorted by username, alphabetically', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body: {users}}) => {
            expect(users).toBeSortedBy("username")
        })
    })
})

describe('/api/users/:username', () => {
    test('GET 200: Responds with a user object of provided username', () => {
        return request(app)
        .get('/api/users/rogersop')
        .expect(200)
        .then(({body}) => {
            expect(typeof body).toBe('object')
            expect(typeof body.username).toBe('string')
            expect(typeof body.avatar_url).toBe('string')
            expect(typeof body.name).toBe('string')
        })
    })

    test('GET 404: Responds with status 404 and msg if username does not exist', () => {
        return request(app)
        .get('/api/users/username_does_not_exist')
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe('Not found')
        })
    })
})

