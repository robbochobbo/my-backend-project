const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const request = require('supertest')
const endpoints = require('../endpoints.json')
const articles = require('../db/data/test-data/articles')

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
    
    test('GET 200: response is sorted by given query',()=>{
        return request(app)
        .get('/api/topics?sort_by=description')
        .expect(200)
        .then(({body: description})=>{
            expect(description).toBeSortedBy('description')
        })
    })

    test('GET 200: response is sorted by order provided',()=>{
        return request(app)
        .get('/api/topics?order=desc')
        .expect(200)
        .then(({body: slug})=>{
            expect(slug).toBeSortedBy('slug',{descending:true})
        })
    })

    test('GET 200: responds only with topics of given slug ', () => {
        return request(app)
        .get('/api/topics?slug=mitch')
        .expect(200)
        .then(({body: topics}) => {
            topics.forEach((topics) => {
             expect(topics.slug).toBe("mitch")
            })
        })
    })
    
    test('GET 200: if the request is valid but there is no data, responds with empty array and 200', () => {
        return request(app)
        .get('/api/topics?slug=potential_slug')
        .expect(200)
        .then(({body}) => {
            expect(body).toEqual([])
        })
    })

    test('GET 400: responds with 400 and err msg if user gives invalid sort_by query', () => {
        return request(app)
        .get('/api/topics?sort_by=invalid_column_name')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request')
        })
    })    

    test('GET 400: responds with 400 and err msg if user gives invalid order query',()=>{
        return request(app)
        .get('/api/topics?order=invalid_query')
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe('Bad request')
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

    test('PATCH 200: responds with the updated article and increments the given article_id.votes by amount given in object, ', () => {
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
})


describe('/api/articles', () => {
    test('GET 200: responds with an array of objects of articles, each with the correct properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body: {articles}}) => {
            articles.forEach((article) => {
                expect(typeof article.author).toBe('string')
                expect(typeof article.title).toBe('string')
                expect(typeof article.article_id).toBe('number')
                expect(typeof article.topic).toBe('string')
                expect(typeof article.created_at).toBe('string')
                expect(typeof article.votes).toBe('number')
                expect(typeof article.article_img_url).toBe('string')
                expect(typeof article.comment_count).toBe('string')
            })
        })
    })

    test('GET 200: responds with articles sorted by date descending', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(articles).toBeSortedBy('created_at',{descending:true})
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
    test('GET 404: responds with 404 and err msg if article_id does not exist', () => {
        return request(app)
        .get('/api/articles/9999/comments')
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe('Article does not exist')
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
    test('POST 201: responds with comment given by client and inserts it into comments table at given article_id', () => {
        const newComment =  {
            username: "butter_bridge",
            body: "Comment body"
        }
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
            expect(body.rows.length).toBe(19)
        })
    })

    test('POST:400 responds with an 400 and msg when provided with an incomplete object (no body)', () => {
        return request(app)
        .post('/api/articles/3/comments')
        .send({
            username: "butter_bridge"
        })
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Bad request');
        });
      });
})

