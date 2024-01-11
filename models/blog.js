const mongoose = require('mongoose')
const logger = require('../utils/logger')
const config = require('../utils/config')

mongoose.set('strictQuery', false)

logger.info('connectiong to ', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() =>  {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB: ', error.message)
  })

const blogSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  author: String,
  url:{
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)