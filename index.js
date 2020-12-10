/* eslint-disable arrow-parens */
require('dotenv').config()
// express node
// eslint-disable-next-line import/newline-after-import
const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const { query } = require('express')
const path = require('path')
const Person = require('./models/person')

morgan.token('personi', (req) => JSON.stringify(req.body))

// middleware for unknown endpoint request
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// eslint-disable-next-line consistent-return
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(409).send({ error: error.message })
  }
  if (error.name === 'MongoError') {
    // console.log(error.response.data.error)
    return response.status(409).send({ error: error.message })
  }
  next(error)
}

// enables the app to consume static files in built front end folder
app.use(express.static('build'))
// middlewares
app.use(express.json())
// to use cross origin file transfer
app.use(cors())
// log to console the given data
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personi'))
app.use(morgan('tiny'))

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/build/index.html`))
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
    // mongoose.connection.close()
  }).catch(e => {
    res.send('persons not fetched', e.message)
  })
})
app.get('/info', (req, res) => {
  Person.find({})
    .then(result => {
      res.send(
        `<p>Phonebook has info for ${result.length} people.</p> 
        <p>${new Date()}</p>`,
      )
    }).catch(error => {
      console.error('Something went wrong', error.message)
      res.status(404).send('somthing went wrong').end()
    })
})
app.get('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findById(id).then(person => {
    res.json(person)
  }).catch(error => next(error))
})
app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findByIdAndRemove(id)
    .then(result => {
      if (result === null) {
        console.log('No data deleted')
        res.status(404).send('Nothing deleted')
      } else {
        console.log('Successfully deleted')
        res.status(204).end()
      }
    })
    .catch(error => next(error))
})
app.post('/api/persons', (req, res, next) => {
  const request = req.body
  const person = new Person({
    name: request.name,
    number: request.number,
  })
  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})
app.put('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  const { number } = req.body

  Person.findByIdAndUpdate(id, { number }, { new: true, runValidators: true, context: query })
    .then(changedPerson => {
      // Handle any possible database errors
      /* if (!changedPerson) return res.status(500).send(err);
        return res.send(changedPerson)  */
      res.json(changedPerson)
    })
    .catch(error => next(error))
})
// to catch unknown endpoints
app.use(unknownEndpoint)
app.use(errorHandler)

// const PORT = process.env.PORT or in short

const { PORT } = process.env

app.listen(PORT, (error) => {
  console.log(`Server running  on port number ${PORT}`)
  if (error) console.log('No port found')
})
