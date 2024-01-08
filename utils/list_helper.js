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
    console.log(authors)

    authors[blog.author] = Number(authors[blog.author]) + 1
    console.log(authors)
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
  console.log(obj)
  return obj
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}