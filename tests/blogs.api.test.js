const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('../utils/list_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[2])
  await blogObject.save()
})

test('blogs are returned as json', async () =>
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
)

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)

})

test('identifier of the blog posts is named id', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body[0].id).toBeDefined()
})

test.only('a valid blog can be added', async() => {
  const newBlog = {
    title: 'Example blog',
    author: 'Gary Crosby',
    url: 'www.example.com',
    likes: 10,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const noteAtEnd = await helper.blogsInDb()
  expect(noteAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const contents = noteAtEnd.map(b => b.title)
  expect(contents).toContain('Example blog')
})

afterAll(async () => {
  await mongoose.connection.close()
})