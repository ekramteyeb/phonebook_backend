const express = require('express')
const app = express()
const morgan = require('morgan')
var uuid = require('node-uuid')
const PORT = 3001

morgan.token('body', function getBody(req) {
    return JSON.stringify(req.body)
})
/* const requestLogger = (request, response,next) => {
    console.log('Method', request.method)
    console.log('Path', request.path)
    console.log('Body', request.body)
    console.log('========')
    next()
} */


const unknownEndpoint = (request ,response) => {
    response.status(404).send({error :'unknown endpoint'})
}
//middleware
//app.use(assignId)
//app.use(morgan(':id :method :url :response-time'))
app.use(express.json())
//app.use(requestLogger)
//Post /api/persons 200 61 - 4.896 ms {"name":"Liisa Marttinen", "number":"09090909"}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body '))


function assignBody(req, res, next) {
    req.bodyyy = JSON.stringify(req.body)
    next()
}

//the minimal output :method :url :status :res[content-length] - :response-time ms
//Result = GET /api/persons/44 404 34 - 3.760 ms
//short 
//:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms

let persons = [
    {
        name: "Arto Hellas",
        number: "040-12345",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "046-02345",
        id: 2
    },
    {
        name: "Dan Abromove",
        number: "040-10909",
        id: 3
    },
    {
        name: "Hussen",
        number: "040-10909",
        id: 4
    }
]
app.get('/', (req, res) => {
    res.send('<h1>Phonebook from backend</h1>')
})
app.get('/api/persons', (req, res) => {
    res.json(persons)
})
app.get('/info', (req, res) => {
    res.send(
        `<p>Phonebook has info for ${persons.length} people</p> 
        <p>${new Date()}</p>`
    )
})
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        res.json(person)
    }else{
      return  res.status(404).send({error:"not found the resource"})

    }
    
})
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})
app.post('/api/persons', (req, res) => {
    const request = req.body
    if (Object.keys(request).length === 0 ||  request.name === '' || request.number === '' || request === "undefined" || request === null || request === NaN){
       return res.status(400).send({error:"name and number should be given"}).end()
    }else{
        const personExist = persons.find(person => person.name.toLowerCase() === request.name.toLowerCase())
        if(personExist){
          return   res.status(409).send({error:"name must be unique"}).end()
        }else{
            const id = Math.random() * Math.pow(10, 7)
            const person = { ...req.body, id: id }
            res.json(person)
            
        }
        
    }
    
})
app.put('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    const newNumber = req.body.number
    const changedPerson = { ...person, number: newNumber }

    persons = persons.map(person => person.id !== id ? person : changedPerson)

    res.json(changedPerson)

})
app.use(unknownEndpoint)


app.listen(PORT, (error) => {
    console.log(`Server running  on port number ${PORT}`)
})