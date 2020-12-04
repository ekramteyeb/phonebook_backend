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

//middlewares
app.use(express.json())
//to use cross origin file transfer 
app.use(cors())
//enables the app to consume static files in built front end folder
app.use(express.static('build'))
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
app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    Person.findById(id).then(person => {
        res.json(person)
        console.log(id)
    }).catch(e => {
        res.status(400).send({ error: "resourse not found" }).end()
    })
})
app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    Person.findByIdAndDelete(id, (err,success) =>{
        if(err) return res.status(204).send(err)
        return res.status(204).send(success)
    })
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
app.put('/api/persons/:id', (req, res) => {    
    const id = req.params.id 
    Person.findByIdAndUpdate(id, req.body,{new:true},(err,p)=>{
        // Handle any possible database errors
        if (err) return res.status(500).send(err);
        return res.send(p);
    })
})
//to catch unknown endpoints 
app.use(unknownEndpoint)
const PORT = process.env.PORT
app.listen(PORT, (error) => {
    console.log(`Server running  on port number ${PORT}`)
})