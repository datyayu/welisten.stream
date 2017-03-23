var canplayCount = 0

module.exports = function socketEvent (client, server) {
    console.log(`client ${client.id} added. Current client list: ${server.engine.clientsCount}`)

    client.on('disconnect', function() {
        console.log(`client ${client.id} disconnect. Current client list: ${server.engine.clientsCount}`)
    })

    client.on('file added', function() {
        server.emit('file added')
    })

    client.on('file sent', function(bufferData) {
        server.emit('file sent', bufferData)
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

    client.on('client can play', function(bufferData) {
        const totalClients = server.engine.clientsCount
        canplayCount++;

        if (canplayCount === totalClients) {
            canplayCount = 0
            server.emit('canplay')
            return
        }
    })
}
