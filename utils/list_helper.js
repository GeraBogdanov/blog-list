const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}
const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const dummy = (blogs) => {
  if (blogs) return 1
}

const totalLikes = (blogs) => {
  const total = blogs.reduce((total, blog) => { return total = total + blog.likes}, 0)
  return total
}

const favoriteBlog = (blogs) => {
  const reducer = (current, next) => {
    return ( current.likes < next.likes)  ? next : current
  }

  const blog = {}
  const bestBlog = blogs.reduce(reducer, { likes:'0' })

  blog.title = bestBlog.title
  blog.author = bestBlog.author
  blog.likes = bestBlog.likes

  return blog
}

const mostBlogs = (blogs) => {
  let result = blogs.reduce((authors, blog) => {
    authors[blog.author] = authors[blog.author] || 0
    authors[blog.author] = Number(authors[blog.author]) + 1
    return authors
  },{})

  let obj = {
    author: '',
    blogs: 0
  }

  for(let i in result) {
    if (obj.blogs < result[i]) {
      obj.author = i
      obj.blogs = result[i]
    }
  }
  return obj
}

const mostLikes = (blogs) => {
  let result = blogs.reduce((authors, blog) => {
    authors[blog.author] = authors[blog.author] || 0

    authors[blog.author] = Number(authors[blog.author]) + blog.likes
    return authors
  },{})

  let obj = {
    author: '',
    likes: 0
  }

  for(let i in result) {
    if (obj.likes < result[i]) {
      obj.author = i
      obj.likes = result[i]
    }
  }
  return obj
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  blogsInDb,
  usersInDb,
  initialBlogs,
}
