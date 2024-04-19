const checkExists = require('../utils/utils')
const db = require('../db/connection')
const testData = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')

afterAll(() => db.end())

describe("checkExists", () => {
    test("returns a rejected promise, err status amd msg if resource does not exist in db", () => {
        checkExists("articles", "article_id", 9999)
        .catch((response) => {
            expect(response.status).toBe(404)
            expect(response.msg).toBe('Not found')
        })
    })
    test("returns same when only passed 2 arguments", () => {
        checkExists("articles", "article_id")
        .catch((response) => {
            expect(response.status).toBe(404)
            expect(response.msg).toBe('Not found')
        })
    })
})

