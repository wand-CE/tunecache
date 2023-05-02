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

function updateDataMusic() {
  currentMusicId = document.getElementById(idSongs[index]);

  document.title = currentMusicId.title;
  const progressbar = document.getElementById("progressbar");
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

window.onMusicEnd = onMusicEnd;
window.updateDataMusic = updateDataMusic;
