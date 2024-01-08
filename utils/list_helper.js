const dummy = (blogs) => {
  if (blogs) return 1
}

const totalLikes = (blogs) => {
  const total = blogs.reduce((total, blog) => { return total = total + blog.likes}, 0)
  return total
}

module.exports = {
  dummy,
  totalLikes
}