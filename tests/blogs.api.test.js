const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/list_helper')
const bcrypt = require('bcrypt')

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
describe('addititon of a new note', () => {
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
})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
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

  test('failed with code 400 if id is valid and not exist', async () => {
    const validId = '5a422aa71b54a676234d17f9'

    await api
      .delete(`/api/blogs/${validId}`)
      .expect(400)

    const notesAtEnd = await helper.blogsInDb()

    expect(notesAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('failed with status code 400 if id is invalid', async () => {
    const invalidId = '234234sdfsdf'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('note update', () => {
  test('succeeds with valid data', async() => {
    const notesAtStart = await helper.blogsInDb()
    const noteToUpdate =notesAtStart[0]

    const newValue = {
      likes: 1,
    }

    await api
      .patch(`/api/blogs/${noteToUpdate.id}`)
      .send(newValue)
      .expect(201)

    const notesAtEnd = await helper.blogsInDb()
    const result = notesAtEnd[0]
    expect(result.likes).toBe(1)
  })

  test('failed with wrong key name', async() => {
    const notesAtStart = await helper.blogsInDb()
    const noteToUpdate =notesAtStart[0]

    const valueWithWrongKey = {
      like: 1,
    }

    await api
      .patch(`/api/blogs/${noteToUpdate.id}`)
      .send(valueWithWrongKey)
      .expect(400)
  })
})


describe('when there is initially one user in db', () => {

  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Gary',
      name: 'Car',
      password: 'sala',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'sala',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with proper statuscode and message if username length less then 3 char', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Ga',
      password: '123',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username should have at least 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password length is shorter then 3 char', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Gary',
      password: '12',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password should have at least 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})