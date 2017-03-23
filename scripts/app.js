var CANVAS_HEIGHT = 100
var SKIPPED_VALUES = 3
var BAR_WIDTH = 8;
var AUDIO_FILE = 'https://s3-us-west-1.amazonaws.com/experiments-static/02+8films.mp3'


var $canvas = document.getElementById('js-canvas')
var $progressContainer = document.getElementById('js-progress')
var $progressBar = document.getElementById('js-bar')
var $playIcon = document.getElementById('js-play-icon')
var $playIconContainer = document.getElementById('js-play-icon-container')

var socket = io()

// get the context from the canvas to draw on
var canvasCtx = $canvas.getContext('2d')
var audioCtx = new AudioContext();
var javascriptNode;
var sourceNode;
var analyser;

var ongaku = new Ongaku({
    onPlaybackPause: clearSpectrum,
    onPlaybackPause: function() {
        clearSpectrum();
        $playIcon.innerText = "play_arrow"
    },
    onPlaybackStart: function() {
        $playIcon.innerText = "pause"
    },
    onBufferLoaded: function() {
        $playIcon.classList.remove('animate');
    }
})

setupAnalyser(ongaku.getContext());
clearSpectrum();


function setupAnalyser(context) {
    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;

    // create a buffer source node
    ongaku.connectNode(analyser);
    analyser.connect(javascriptNode);
}



javascriptNode.onaudioprocess = function() {
    if (!ongaku.isPlaying()) return;

    // get the average for the first channel
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    // Draw the spectrum
    drawSpectrum(array);
    updateProgress();
}


function drawSpectrum(array) {
    // clear the current state
    canvasCtx.clearRect(0, 0, 1000, CANVAS_HEIGHT * 2)
    canvasCtx.fillStyle = '#ffffff'

    // Draw new spectrum
    array.forEach(function(value, index) {
        if (index % SKIPPED_VALUES !==0) return

        var x = (index / SKIPPED_VALUES) * (BAR_WIDTH + (1/5 * BAR_WIDTH))
        var y = CANVAS_HEIGHT - (Math.max(value - 100, 0) / 5)

        canvasCtx.fillRect(x, y, BAR_WIDTH, CANVAS_HEIGHT)
    })
}

function clearSpectrum() {
    canvasCtx.clearRect(0, 0, 1000, CANVAS_HEIGHT)
    canvasCtx.fillStyle = '#ffffff'

    var array = new Array(256).fill(0)

    array.forEach(function(_, index) {
        if (index % SKIPPED_VALUES !==0) return

        var x = (index / SKIPPED_VALUES) * (BAR_WIDTH + (1/5 * BAR_WIDTH))

        canvasCtx.fillRect(x, CANVAS_HEIGHT, BAR_WIDTH, CANVAS_HEIGHT)
    })
}

function updateProgress() {
    var totalDuration = ongaku.getCurrentBufferDuration();
    var currentProgress = ongaku.getPlaybackTime();

    var progressPercentage = (currentProgress / totalDuration) * 100

    $progressBar.style.width = progressPercentage + '%'
}


/***************
**  LISTENERS **
****************/

$progressContainer.addEventListener('click', function(event) {
    const percentage = (event.offsetX / 499) * 100;
    ongaku.seekPercentage(percentage);
    socket.emit('seek', percentage)
})

$playIconContainer.addEventListener('click', function() {
    if (ongaku.isPlaying()) {
        socket.emit('pause')
    } else {
        socket.emit('play')
    }
})

socket.on('play', function() {
    ongaku.play()
})

socket.on('pause', function() {
    ongaku.pause()
})

socket.on('seek', function (percentage) {
    ongaku.seekPercentage(percentage)
})
