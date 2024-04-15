const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const request = require('supertest')

beforeAll(() => seed(testData))
afterAll(() => db.end())

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



