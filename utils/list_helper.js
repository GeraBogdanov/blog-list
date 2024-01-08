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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}