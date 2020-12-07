require('dotenv').config();
//express node
const express = require('express')
const app = express()
const Person = require('./models/person')
const cors = require('cors')
const morgan = require('morgan')  


morgan.token('personi', function getBody(req) {
    return JSON.stringify(req.body)
})

//middleware for unknown endpoint request
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
} 

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
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
    res.send(
        `<p>Phonebook has info for ${''} people</p> 
        <p>${new Date()}</p>`
    )
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

app.post('/api/persons', (req, res) => {
    const request = req.body
    if (Object.keys(request).length === 0 || request.name === '' || request.number === '' || typeof request.name !== 'string' || request.name === null || request.number === undefined || request === NaN) {
        // Remember calling return is crucial 
       return res.status(400).json({ error: "name and number should be given" }).end()
    } else {
    
        Person.find({name:request.name}, (err, resp)=> {
            if(err) return res.status(500).send(err);
            if(resp.length > 0){
                return  res.status(409).json({ error: "name must be unique" }).end()
            }else{
                const person = new Person ({ 
                name:request.name,
                number:request.number,
                })
                person.save().then( savedPerson => {
                    res.json(savedPerson)
                })
            }
        })
    }
})
app.put('/api/persons/:id', (req, res,next) => {    
    const id = req.params.id 
    Person.findByIdAndUpdate(id, req.body,{new:true})
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