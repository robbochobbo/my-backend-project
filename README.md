# Northcoders News API

Link: https://robbies-articles-website.onrender.com/

Summary: Get articles from a database. Offers a number of different functionalities such as sorting by topic and listing all of the comments made on a specific article.

To clone this repo:
- Fork on GitHub: https://github.com/robbochobbo/my-backend-project
- In your terminal, type: git clone https://github.com/robbochobbo/my-backend-project.git

In the project, install the following dependencies:
- jest: npm i jest -D
- pg-format: npm i pg-format -D
- supertest: npm i supertest -D
- dotenv: npm i dotenv
- express: npm i express
- postgres: npm i pg

To seed your local database:
- npm setup-dbs
- npm run seed

To run this repo locally, you must set your environment variables:
- create .env files (e.g. .env.test or .env.development)
- make sure to git.ignore these new .env files
- set your database in these files using PGDATABASE=name_of_database

Required minimum versions:
- Node.js v21.5.0
- postgres v14.10 


