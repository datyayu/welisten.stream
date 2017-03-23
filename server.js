const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const socketEvents = require('./events')

const PORT = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
var io = socketIO(server)

app.use(express.static(`${__dirname}`))

app.get('/', function(req, res) {
    res.sendFile(`${__dirname}/index.html`)
})


io.on('connection', function(socket) {
    socketEvents(socket, io)
})


server.listen(PORT, _ => {
    console.log(`Server listening on port ${PORT}`)
})
