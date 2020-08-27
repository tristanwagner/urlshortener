const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const monk = require('monk')
const { default: ShortUniqueId } = require('short-unique-id')

require('dotenv').config()

const port = process.env.PORT || 1337

// Connection URL
const url = process.env.MONGODB_URI

const db = monk(url)

const urls = db.get('urls')
urls.createIndex({ alias: 1 },{ unique: true })

const uid = new ShortUniqueId()

const app = express()

app.use(helmet())
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.static('./public'))

// handle new shortened urls
app.post('/url', async (req, res, next) => {
  // TODO: add to db
  let { url, alias } = req.body
  console.log('body', req.body)
  // TODO: validate url & alias
  // if no alias provided create one
  if (!alias) {
    alias = uid(6)
  }
  // insert
  urls.findOne({ alias })
    .then((res) => {
      if (res) {
        throw new Error('This alias is already taken')
      }
      return urls.insert({ url, alias})
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
  // TODO: get url corresponding to alias from db if exists and then redirect
  const { alias } = req.params
  console.log('alias', alias)
  urls.findOne({ alias })
    .then((entry) => {
      console.log('found entry', entry)
      if (entry) {
        res.redirect(entry.url)
      } else {
        res.redirect('/')
      }
    })
    .catch(error => {
      return next(error)
    })
})

// handle errors
app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '' : error.stack,
  });
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
