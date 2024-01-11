const supertest = require('supertest')
const mongoose = require('mongoose')
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

test('a valid blog can be added', async() => {
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

test('verifies if likes props is note defined set to 0', async () => {
  const newBlog = {
    title: 'Example blog',
    author: 'Gary Crosby',
    url: 'www.example.com',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogAtEnd = await helper.blogsInDb()
  const result = blogAtEnd[blogAtEnd.length - 1]
  expect(result.likes).toBe(0)
})

test('test code 400 bad request', async () => {
  const newBlog = {
    // title: 'Example blog',
    author: 'Gary Crosby',
    url: 'www.example.com',
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test.only('test delete', async () => {
  const notesAtStart = await helper.blogsInDb()
  const noteToDelete = notesAtStart[0]


  await api
    .delete(`/api/blogs/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.blogsInDb()

  expect(notesAtEnd).toHaveLength(helper.initialBlogs.length - 1)

  const result = notesAtEnd.map(b => b.id)
  expect(result).not.toContain(noteToDelete.id)
})

afterAll(async () => {
  await mongoose.connection.close()
})