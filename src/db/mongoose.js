const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect(process.env.DBADDRESS, {
    useNewUrlParser: true,
    useCreateIndex: true
})