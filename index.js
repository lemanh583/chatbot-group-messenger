const mongoose = require('mongoose');
const express = require('express');
const app = express();
const router = require('./handle/api/router')
const facebook = require('./handle/facebook')

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/test');  
        return true
    } catch (error) {
        console.error("Error connecting to", error);
        return false
    }
}

app.use(express.json())
app.use(router)

const PORT = 3000
app.listen(PORT, async () => {
    try {
        let conn = await connect();
        if(!conn) throw new Error("Connection failed");
        let api = await facebook.init()
        let fb = new facebook(api)
        fb.start()
        console.log("Server running on port", PORT);
    } catch (error) {
        console.error("Error listening", error);
    }
})
