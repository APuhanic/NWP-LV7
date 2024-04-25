const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/web')
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log(error)
    }
}

connect()