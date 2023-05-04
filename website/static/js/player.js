const controls = document.querySelector("#controls");

var songs = document.getElementsByClassName("songs");
var idSongs = [];

let button_playpause = document.getElementById("play-control");
let index = 0;
let currentMusicId;
let tituloAtual;

for (var i = 0; i < songs.length; i++) {
  songs[i].addEventListener("ended", onMusicEnd);
}

for (let i = 0; i < songs.length; i++) {
  idSongs.push(songs[i].id);
}
window.idSongs;

const progressbar = document.getElementById("progressbar");
const volumebar = document.getElementById("volume");

function updateDataMusic() {
  currentMusicId = document.getElementById(idSongs[index]);

  document.title = currentMusicId.title;

  const textCurrentDuration = document.getElementById("current-duration");
  const textTotalDuration = document.getElementById("total-duration");

  tituloAtual = document.getElementById("audio_" + currentMusicId.id);

  document.getElementById("musica_atual").innerHTML = tituloAtual.textContent;
  progressbar.max = currentMusicId.duration;

  textTotalDuration.innerText = secondsToMinutes(currentMusicId.duration);

  currentMusicId.addEventListener("loadedmetadata", function () {
    textTotalDuration.innerText = secondsToMinutes(currentMusicId.duration);
  });

  currentMusicId.ontimeupdate = function () {
    textCurrentDuration.innerText = secondsToMinutes(
      currentMusicId.currentTime
    );
    progressbar.valueAsNumber = currentMusicId.currentTime;
  };
}

var val;

progressbar.addEventListener("touchstart", function (event) {
  if (event.cancelable) {
    event.preventDefault();
  }
  // armazena a posição inicial do toque
  var touch = event.targetTouches[0];
  val =
    ((touch.clientX - progressbar.getBoundingClientRect().left) /
      progressbar.clientWidth) *
    parseInt(progressbar.max);
});

progressbar.addEventListener("touchend", function (event) {
  if (event.cancelable) {
    event.preventDefault();
  }
  currentMusicId.currentTime = val;
  progressbar.value = val;
});

let valvol = 0;
volumebar.addEventListener("touchstart", function (event) {
  var touch = event.targetTouches[0];
  var valvol =
    (((touch.clientX - volumebar.getBoundingClientRect().left) /
      volumebar.clientWidth) *
      parseFloat(volumebar.max)) /
    100;
  if (valvol >= 0 && valvol <= 1) {
    currentMusicId.volume = valvol;
    if (valvol < 0.01) {
      document.getElementById("vol-icon").className = "bi-volume-mute-fill";
    } else if (valvol > 0.01) {
      document.getElementById("vol-icon").className = "bi-volume-up-fill";
    }
  }
});

volumebar.addEventListener("touchmove", function (event) {
  var touch = event.targetTouches[0];
  var valvol =
    (((touch.clientX - volumebar.getBoundingClientRect().left) /
      volumebar.clientWidth) *
      parseFloat(volumebar.max)) /
    100;
  if (valvol <= 1) {
    if (valvol <= 0) {
      currentMusicId.volume = 0;
      document.getElementById("vol-icon").className = "bi-volume-mute-fill";
    } else if (valvol > 0.01) {
      currentMusicId.volume = valvol;
      document.getElementById("vol-icon").className = "bi-volume-up-fill";
    }
  }
});

function verify_songs() {
  if (idSongs.length > 0) {
    updateDataMusic();
    currentMusicId.addEventListener("loadedmetadata", function () {
      progressbar.max = currentMusicId.duration;
    });
    document.getElementById("controls").style.display = "flex";
  } else {
    document.getElementById("controls").style.display = "none";
  }
}

verify_songs();

window.verify_songs = verify_songs;

controls.addEventListener("click", function (ev) {
  if (idSongs.length > 0) {
    if (ev.target.id == "play-control") {
      if (button_playpause.className == "bi bi-play-fill") {
        button_playpause.className = "bi bi-pause-fill";
        currentMusicId.play();
      } else {
        button_playpause.className = "bi bi-play-fill";
        currentMusicId.pause();
      }
    }

    if (ev.target.id == "vol-icon") {
      currentMusicId.muted = !currentMusicId.muted;
      if (currentMusicId.muted == true) {
        document.getElementById("vol-icon").className = "bi-volume-mute-fill";
      } else {
        document.getElementById("vol-icon").className = "bi-volume-up-fill";
      }
    }

    if (ev.target.id == "volume") {
      currentMusicId.volume = ev.target.valueAsNumber / 100;
      if (currentMusicId.volume == 0) {
        document.getElementById("vol-icon").className = "bi-volume-mute-fill";
      } else {
        document.getElementById("vol-icon").className = "bi-volume-up-fill";
      }
    }
    if (ev.target.id == "progressbar") {
      currentMusicId.currentTime = ev.target.valueAsNumber;
    }

    if (ev.target.id == "next-control") {
      index++;

      if (index == idSongs.length) {
        index = 0;
      }
      currentMusicId.pause();
      currentMusicId.currentTime = 0;
      updateDataMusic();
      currentMusicId.play();
      button_playpause.className = "bi-pause-fill";
    }

    if (ev.target.id == "prev-control") {
      index--;

      if (index == -1) {
        index = idSongs.length - 1;
      }

      currentMusicId.pause();
      currentMusicId.currentTime = 0;
      updateDataMusic();
      button_playpause.className = "bi-pause-fill";
      currentMusicId.play();
    }
  }
});

function onMusicEnd() {
  index++;
  if (index == idSongs.length) {
    index = 0;
  }
  currentMusicId.pause();
  updateDataMusic();
  currentMusicId.play();
  button_playpause.className = "bi bi-pause-fill";
}

function secondsToMinutes(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
}

function shuffle_musics(list_songs) {
  for (let i = list_songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list_songs[i], list_songs[j]] = [list_songs[j], list_songs[i]];
  }
  return list_songs;
}

let listas = document.getElementsByTagName("li");
for (const lista of listas) {
  lista.addEventListener("click", (ev) => {
    if (ev.target.className != "bi bi-trash") {
      if (lista.id != "") {
        new_index = Array.from(idSongs).indexOf(`song${lista.id}`);
        if (index != new_index) {
          index = new_index;
          currentMusicId.pause();
          currentMusicId.currentTime = 0;
          updateDataMusic();
          button_playpause.className = "bi-pause-fill";
          currentMusicId.play();
        } else {
          if (currentMusicId.paused == true) {
            button_playpause.className = "bi-pause-fill";
            currentMusicId.play();
          }
        }
      }
    }
  });
}

window.onMusicEnd = onMusicEnd;
window.updateDataMusic = updateDataMusic;
