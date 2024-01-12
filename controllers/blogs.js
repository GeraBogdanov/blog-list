const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const result =  await blog.save()
  response.status(201).json(result)
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