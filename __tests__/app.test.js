const app = require('../app')
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const testData = require('../db/data/test-data/index')
const request = require('supertest')

beforeAll(() => seed(testData))
afterAll(() => db.end())

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
    test('GET:404 responds with error msg if endpoint does not exist', () => {
        return request(app)
        .get('/api/not_an_endpoint')
        .expect(404)
        .then(({body}) => {
                expect(body.msg).toBe('Not found - endpoint does not exist')
            })
    })
})

// test('GET 204: if the request is valid but there is no data, responds with 204 & msg', () => {
//     return request(app)
//     .get('/api/topics')
//     .expect(204)
//     .then(({body}) => {
//         expect(body.msg).toBe('No data here yet')
//     })
// })