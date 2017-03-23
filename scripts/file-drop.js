var $fileInput = document.getElementById('js-file-input')
var $songName = document.getElementById('js-song-name')
var $songArtist = document.getElementById('js-song-artist')
var $songCover = document.getElementById('js-song-cover')

/** Styles */
$fileInput.addEventListener('dragover', function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    evt.dataTransfer.dropEffect = 'copy'
    $fileInput.classList.add('drag-active')
})

$fileInput.addEventListener('dragleave', function(evt) {
    $fileInput.classList.remove('drag-active')
})


/** on-drop handler */
$fileInput.addEventListener('drop', function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    // Stop current song
    ongaku.stop();

    // Remove drop overlay
    $fileInput.classList.remove('drag-active')
    socket.emit('file added')

    // Update player info
    var file = evt.dataTransfer.files[0];
    $songName.innerText = file.name.replace(/\.[0-9a-z]+$/, '') // Remove extension
    $songArtist.innerText = '(Local file)'
    $songCover.src = './images/default-album.png'

    // Play song from file buffer.
    var reader = new FileReader();
       reader.onload = function(evt) {
        var audioBuffer = evt.target.result;

        // Send file.
        socket.emit('file sent', audioBuffer)
    };

    reader.readAsArrayBuffer(file);
})

socket.on('file added', function() {
    ongaku.stop()
})


socket.on('file sent', function(streamedBuffer) {
    ongaku
        .loadFromLocalBuffer(streamedBuffer)
        .then(function() {
            socket.emit('client can play')
        });
})

socket.on('canplay', function() {
    ongaku.play()
})
