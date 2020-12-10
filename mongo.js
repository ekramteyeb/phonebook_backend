/* eslint-disable arrow-parens */
const mongoose = require('mongoose')
/* to configure enviromental variables, to read and access them if the app is not created
using npm create react app */

require('dotenv').config()

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}
// const CONN_PASS = process.env.CONN_PASS // or in short

const { CONN_PASS } = process.env
const givenPassword = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://daki_group:${givenPassword}@reemah.1xrf2.mongodb.net/phonebook-app?retryWrites=true&w=majority`
// `mongodb+srv://daki_group:<password>@reemah.1xrf2.mongodb.net/<dbname>?retryWrites=true&w=majority`
if (givenPassword === CONN_PASS) {
  mongoose
    .connect(url, {
      // eslint-disable-next-line comma-dangle
      useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true
    })
    // .then(a => console.log('added', name, number, 'to phonebook'), mongoose.connection.close())
    .catch(error => console.log(error.message, 'not connected'))
} else {
  console.log('Please enter a correct password')
}

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

if (name === undefined) {
  // fetch each Persons based on the given filteration
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
} else {
  // to create and store person in a database MongoDB
  const person = new Person({
    // name:name, // or in short simply name
    name,
    number,
  })

  person.save().then(result => {
    console.log('added', name, number, 'to phonebook')
    console.log(result)
    mongoose.connection.close()
  })
    .catch(e => { console.log(e.message, 'Not saved') })
}
