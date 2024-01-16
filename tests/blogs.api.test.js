const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../utils/list_helper')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await User.deleteMany({})
  let userObject = new User(helper.initialUsers[0])
  await userObject.save()
  userObject = new User(helper.initialUsers[1])
  await userObject.save()
  userObject = new User(helper.initialUsers[2])
  await userObject.save()
})

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[2])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[3])
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
describe('addititon of a new blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })
  test('a valid blog can be added', async() => {

    const user = {
      username: 'root',
      password: 'secret'
    }
    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newBlog = {
      title: 'Example blog',
      author: 'Gary Crosby',
      url: 'www.example.com',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogAtEnd = await helper.blogsInDb()
    expect(blogAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogAtEnd.map(b => b.title)
    expect(contents).toContain('Example blog')
  })

  test('verifies if likes props is blog defined set to 0', async () => {

    const user = {
      username: 'root',
      password: 'secret'
    }
    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newBlog = {
      title: 'Example blog',
      author: 'Gary Crosby',
      url: 'www.example.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogAtEnd = await helper.blogsInDb()
    const result = blogAtEnd[blogAtEnd.length - 1]
    expect(result.likes).toBe(0)
  })

  test('test code 400 bad request', async () => {
    const user = {
      username: 'root',
      password: 'secret'
    }
    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newBlog = {
    // title: 'Example blog',
      author: 'Gary Crosby',
      url: 'www.example.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('deleting of a blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })
  test('succeeds with status code 204 if id is valid', async () => {
    const usersAtStart = await helper.usersInDb()
    console.log(usersAtStart)
    const user = {
      username: 'root',
      password: 'secret'
    }
    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newBlog = {
      title: 'Example blog',
      author: 'Gary Crosby',
      url: 'www.example.com',
      likes: 10,
    }

    const createBlogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtStart = await helper.blogsInDb()

    let usersAtEnd = await helper.usersInDb()
    let currentUser = usersAtEnd.filter(user => user.username = response.body.username)
    console.log(usersAtEnd)
    console.log(currentUser[0].blogs)

    let blogsInCurrentUser = currentUser[0].blogs
    console.log(blogsInCurrentUser)
    expect(blogsInCurrentUser.toString()).toContain(createBlogResponse.body.id)
    await api
      .delete(`/api/blogs/${createBlogResponse.body.id}`)
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const result = blogsAtEnd.map(b => b.id)
    expect(result).not.toContain(createBlogResponse.body.id)

    usersAtEnd = await helper.usersInDb()
    currentUser = usersAtEnd.filter(user => user.username = response.body.username)
    console.log(usersAtEnd)

    blogsInCurrentUser = currentUser[0].blogs
    console.log(blogsInCurrentUser)
    expect
    expect(blogsInCurrentUser).toHaveLength(0)
  })

  test('failed with code 400 if id is valid and not exist', async () => {
    const validId = '5a422aa71b54a676234d17f9'

    const usersAtStart = await helper.usersInDb()
    console.log(usersAtStart)
    const user = {
      username: 'root',
      password: 'secret'
    }
    const loginResponse = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newBlog = {
      title: 'Example blog',
      author: 'Gary Crosby',
      url: 'www.example.com',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const deleteResponse = await api
      .delete(`/api/blogs/${validId}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(deleteResponse.body.error).toContain('info already deleted from server')
  })

  test('failed with status code 400 if id is invalid', async () => {
    const invalidId = '234234sdfsdf'

    const user = {
      username: 'root',
      password: 'secret'
    }

    const loginResponse = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

  })
})

describe('blog update', () => {
  test('succeeds with valid data', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate =blogsAtStart[0]

    const newValue = {
      likes: 1,
    }

    await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .send(newValue)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const result = blogsAtEnd[0]
    expect(result.likes).toBe(1)
  })

  test('failed with wrong key name', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate =blogsAtStart[0]

    const valueWithWrongKey = {
      like: 1,
    }

    await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
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

describe('login in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })
  test('login in db with valid name and password', async () => {

    const user = {
      username: 'root',
      password: 'secret'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(JSON.stringify(response.body)).toContain('token')
  })

  test('login in db with invalid name', async () => {

    const user = {
      username: 'roo',
      password: 'secret'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })

  test('login in db with invalid password', async () => {

    const user = {
      username: 'root',
      password: 'sec'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})