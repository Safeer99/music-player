//track/audio controls
const playPauseBtn = document.querySelector('.play-pause');
const repeatBtn = document.querySelector('.repeat-btn');
const volume = document.querySelector('.cur-volume');
const curTime = document.querySelector('.cur-time');
const totalDuration = document.querySelector('.track-length');
const trackTime = document.querySelector('.track-time');

const sidebar = document.querySelector('.sidebar');
const uploadedFile = document.querySelector('.audio-file');
const uploadBtn = document.querySelector('.upload');
const playlist = document.querySelector('.playlist');

const visualizerContainer = document.querySelector(".visualizer-container");
const audio = document.createElement('audio');


let allSongs = [];
let box = [];
let frequencyData = [];
let audioSource = undefined;
let analyzer = undefined;
const totalFrequency = 800
let songIndex = 0;
let repeat = false;

function init() {

    // create an audio context
    const ctx = new AudioContext();
    // create an audio source
    audioSource = ctx.createMediaElementSource(audio);
    // create an audio analyzer
    analyzer = ctx.createAnalyser();
    // connect the source, to the analyzer, and then back the context's destination
    audioSource.connect(analyzer);
    audioSource.connect(ctx.destination);

    frequencyData = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(frequencyData);

    for (let i = 0; i < totalFrequency; i += totalFrequency / 50) {

        const bar = document.createElement('div');
        bar.setAttribute("id", "bar" + i);
        bar.setAttribute("class", "visualizer-container-bar");
        visualizerContainer.append(bar);

    }
    setInterval(() => {
        updateTrackTime();
    }, 1000);
    renderFrame();
}
// updating the frequency data array with latest frequency
function renderFrame() {
    analyzer.getByteFrequencyData(frequencyData);

    for (let i = 0; i < totalFrequency; i += totalFrequency / 50) {
        const fd = frequencyData[i];

        const bar = document.getElementById('bar' + i);
        if (!bar) continue;

        const barHeight = Math.max(4, fd || 0);
        bar.style.height = barHeight + 'px';
    }
    requestAnimationFrame(renderFrame);
}

function updateTrackTime() {
    let seekPosition = 0;
    if (!isNaN(audio.duration)) {
        seekPosition = audio.currentTime * (100 / audio.duration);
        trackTime.value = seekPosition;

        let minutes = Math.floor(audio.currentTime / 60);
        let seconds = Math.floor(audio.currentTime - minutes * 60);
        let durationMinutes = Math.floor(audio.duration / 60);
        let durationSeconds = Math.floor(audio.duration - durationMinutes * 60);

        if (seconds < 10) { seconds = "0" + seconds }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds }
        if (minutes < 10) { minutes = "0" + minutes }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes }

        curTime.textContent = minutes + ":" + seconds;
        totalDuration.textContent = durationMinutes + ":" + durationSeconds;
    }
}

function playSong() {
    if (allSongs.length > 0) {
        audio.setAttribute("src", allSongs[songIndex].data);
        audio.currentTime = 0;
        audio.play();
        if (playPauseBtn.classList.contains('fa-circle-play')) {
            playPauseBtn.classList.remove('fa-circle-play');
            playPauseBtn.classList.add('fa-circle-pause');
        }
        document.querySelector('.track-title').textContent = allSongs[songIndex].name;
    }
}

function updateVolume() {
    audio.volume = (volume.value) / 100;
}

function seekTo() {
    audio.currentTime = audio.duration * (trackTime.value / 100);
}

function nextTrack() {
    if (songIndex + 1 < allSongs.length) {
        songIndex += 1;
        playSong();
    } else {
        playSong()
    }
}

function prevTrack() {
    if (songIndex - 1 >= 0) {
        songIndex += 1;
        playSong();
    } else {
        playSong()
    }
}

function shuffleTrack() {
    songIndex = Math.floor(Math.random() * allSongs.length);
    playSong();
}

function repeatTrack() {
    repeat = !repeat;
    if (repeat) {
        repeatBtn.classList.add('active');
    } else {
        repeatBtn.classList.remove('active');
    }
}

playPauseBtn.addEventListener('click', () => {
    if (playPauseBtn.classList.contains('fa-circle-pause')) {
        audio.pause();
        playPauseBtn.classList.remove('fa-circle-pause');
        playPauseBtn.classList.add('fa-circle-play');
    } else {
        playSong();
    }
})

audio.addEventListener('ended', () => {
    if (songIndex + 1 < allSongs.length) {
        songIndex += 1;
        playSong();
    } else if (repeat) {
        songIndex = 0;
        playSong();
    } else {
        audio.currentTime = 0;
        audio.pause();
        playPauseBtn.classList.remove('fa-circle-pause');
        playPauseBtn.classList.add('fa-circle-play');
    }
})

init();

// displaying all songs in side bar
function displaySongs() {
    playlist.innerHTML = '';
    box = [];

    allSongs.forEach((song, index) => {
        let element = document.createElement('div');
        let icon = document.createElement('i');
        let span = document.createElement('span');
        icon.setAttribute('class', 'fa-solid fa-circle-play');
        element.setAttribute('class', 'box');
        element.setAttribute('id', "song" + index);
        span.textContent = song.name;
        element.append(icon);
        element.append(span);
        playlist.append(element);

        box.push(element);
    })
    box.forEach(element => {
        element.addEventListener('click', () => {
            songIndex = element.id.slice(-1);
            playSong();
        })
    })
}

// uploading the songs
function uploadFile() {
    const file = uploadedFile.files[0]
    const reader = new FileReader();
    if (!file) return;
    reader.addEventListener("load", () => {
        allSongs.push({ name: file.name, data: reader.result });
        displaySongs();
        uploadedFile.value = null;
    })
    reader.readAsDataURL(file);
}

uploadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    uploadFile();
});

// open/close the sidebar
function openCloseSidebar() {
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    } else {
        sidebar.classList.add('open');
    }
}