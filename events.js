module.exports = function socketEvent (client, server) {

client.on('file added', function() {
    server.emit('file added')
    console.log('file added')
})

client.on('file sent', function(bufferData) {
    server.emit('file sent', bufferData)
    console.log('file sent')
})

client.on('canplay', function(bufferData) {
    server.emit('canplay')
    console.log('canplay')
})

client.on('play', function() {
    server.emit('play')
})

client.on('pause', function() {
    server.emit('pause')
})

client.on('seek', function(percentage) {
    server.emit('seek', percentage)
})

}
