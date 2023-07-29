const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const monk = require('monk')
const { default: ShortUniqueId } = require('short-unique-id')
const yup = require('yup')

require('dotenv').config()

const port = process.env.PORT || 1337

const mongodbUri = process.env.MONGODB_URI

const db = monk(mongodbUri)

const urls = db.get('urls')

urls.createIndex({ alias: 1 },{ unique: true })

const uid = new ShortUniqueId()

const app = express()

app.use(helmet())
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.static('./public'))

let schema = yup.object().shape({
  alias: yup.string().trim().matches(/^(\w|\-)+$/),
  url: yup.string().trim().required().url()
})

// handle new shortened urls
app.post('/url', async (req, res, next) => {
  let { url, alias } = req.body
  console.log('body', req.body)
  schema
    .isValid({ url, alias })
    .then((isValid) => {
      if (!isValid) {
        throw new Error('Request parameters are not valid')
      }
      // if no alias provided create one
      if (!alias) {
        alias = uid(6)
      }

      console.log(alias)
      // check if exists & insert
      return urls.findOne({ alias })
        .then((res) => {
          if (res) {
            throw new Error('This alias is already taken')
          }
          return urls.insert({ url: url.trim(), alias: alias.trim() })
        })
    })
    .then((entry) => {
        res.json(entry)
    })
    .catch(error => {
      return next(error)
    })
})

// handle redirect from shortened urls
app.get('/:alias', (req, res, next) => {
  const { alias } = req.params
  console.log('alias', alias)
  urls.findOne({ alias })
    .then((entry) => {
      console.log('found entry', entry)
      res.redirect(entry ? entry.url : '/')
    })
    .catch(error => {
      return next(error)
    })
})

// handle errors
app.use((error, req, res, next) => {
  res.status(error && error.status ? error.status : 500);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '' : error.stack,
  });
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
