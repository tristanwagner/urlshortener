const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')

require('dotenv').config()

const port = process.env.PORT || 1337

const app = express()

app.use(helmet())
app.use(express.json())
app.use(express.static('./public'))
app.use(morgan('tiny'))

// handle new shortened urls
app.post('/url', (req, res, next) => {
  // TODO: add to db
  const { url, alias } = req.body
  console.log('body', req.body)
  try {
    res.json({ url, alias })
  } catch (error) {
    next(error)
  }
})

// handle redirect from shortened urls
app.get('/:alias', (req, res, next) => {
  // TODO: get url corresponding to alias from db if exists and then redirect
  const { alias } = req.params
  console.log('alias', alias)
  try {
    res.redirect('/')
  } catch (error) {
    next(error)
  }
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
