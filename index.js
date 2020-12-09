require('dotenv').config();
//express node
const express = require('express')
const app = express()
const Person = require('./models/person')
const cors = require('cors')
const morgan = require('morgan');  
const { response, query } = require('express');


morgan.token('personi', function getBody(req) {
    return JSON.stringify(req.body)
})

//middleware for unknown endpoint request
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
} 

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    
    return response.status(400).send({ error: 'malformatted id' })
  }else if(error.name === 'ValidationError'){
      // console.log('Error message from backend',error.message)
      return response.status(409).send({error:error.message})
  }else if(error.name === 'MongoError'){
      //console.log(error.message)
      return response.status(409).send({error:error.message})
  }
  next(error)
}

//enables the app to consume static files in built front end folder
app.use(express.static('build'))
//middlewares
app.use(express.json())
//to use cross origin file transfer 
app.use(cors())
//log to console the given data 
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :personi'))
app.use(morgan('tiny'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'))
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
        //mongoose.connection.close()
    }).catch(e => {
        res.send('persons not fetched')
    })
})
app.get('/info', (req, res) => {
    Person.find({})
    .then(result => {
        res.send(
        `<p>Phonebook has info for ${result.length} people.</p> 
        <p>${new Date()}</p>`
        )
    }).catch(error => {
        console.error('Something went wrong')
        res.status(404).send('somthing went wrong').end()
    })
})
app.get('/api/persons/:id', (req, res,next) => {
    const id = req.params.id
    Person.findById(id).then(person => {
        res.json(person)
    }).catch(error => next(error))
})
app.delete('/api/persons/:id', (req, res,next) => {
    const id = req.params.id
    Person.findByIdAndRemove(id)
    .then(result => {
        if(result === null){
            console.log('No data deleted')
            res.status(404).send('Nothing deleted')
        }else{
            console.log('Successfully deleted')
            res.status(204).end()
        }
    })
    .catch(error => next(error))
})
app.post('/api/persons', (req, res, next) => {
    const request = req.body
    const person = new Person ({ 
    name:request.name,
    number:request.number,
    })
    person.save()
    .then( savedPerson => {
        res.json(savedPerson)
    })
    .catch(error => next(error))
})
app.put('/api/persons/:id', (req, res,next) => {    
    const id = req.params.id 
    const {number} = req.body
    
    Person.findByIdAndUpdate(id,{number},{new:true,runValidators:true,context:query})
    .then( changedPerson  => {
        // Handle any possible database errors
         /* if (!changedPerson) return res.status(500).send(err);
        return res.send(changedPerson)  */
        res.json(changedPerson)
    })
    .catch(error => next(error))
})
//to catch unknown endpoints 
app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, (error) => {
    console.log(`Server running  on port number ${PORT}`)
})