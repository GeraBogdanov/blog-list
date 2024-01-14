const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  console.log(getTokenFrom(request))
  console.log
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

  if(!decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  const savedBlog =  await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const result = await Blog.findByIdAndDelete(request.params.id)
  if(!result) {
    return response.status(400).json({
      error: 'info already deleted from server'
    })
  }
  response.status(204).end()
})

blogsRouter.patch('/:id', async (request, response) => {
  const body = request.body

  if(!Object.prototype.hasOwnProperty.call(body, 'likes')){
    return response.status(400).json({
      error:'malformatted data',
    })
  }

  const blog = {
    likes:body.likes
  }
  const result = await Blog.findByIdAndUpdate(
    request.params.id,
    blog,
    { new: true, runValidators: true }
  )
  response.status(201).json(result)
})

module.exports = blogsRouter