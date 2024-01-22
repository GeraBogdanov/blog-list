const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  if(!user){
	  return response.status(401).json({ error: 'token missing or invalid' })
  }
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
  response.status(201).json(await savedBlog.populate('user', { username: 1, name: 1 }))
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if(!user){
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if(!blog){
    return response.status(400).json({
      error: 'info already deleted from server'
    })
  }

  if(blog.user.toString() !== user.id) {
    return response.status(400).json({
      error: 'you dont have access to this blog'
    })
  }

  const result = await Blog.findByIdAndDelete(request.params.id)
  if(!result) {
    return response.status(400).json({
      error: 'info already deleted from server'
    })
  }

  user.blogs = user.blogs.filter(el => el.toString() !== request.params.id.toString())
  await user.save()

  response.status(204).json(user)
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
  response.status(201).json(await result.populate('user', { username: 1, name: 1 }))
})

module.exports = blogsRouter