import { shuffle_musics } from "../js/modules/sort_musics.js";
import { isMobileDevice } from "./modules/main_conf.js";

const songs = document.getElementsByClassName("songs");

const shuffle_button = document.getElementById("shuffle_musics");
export var isPlaying = false;

shuffle_button.addEventListener("click", shuffle_musics);

const volumebar = document.getElementById("volume");
const button_playpause = document.getElementById("play-control");
const vol_icon = document.getElementById("vol-icon");

export const controls = document.querySelector("#controls");

var srcSongs;

let index = 0;
let actual_vol = 0.5;

vol_icon.addEventListener("click", () => {
  if (vol_icon.className == "bi bi-volume-up-fill") {
    vol_icon.className = "bi bi-volume-mute-fill";
    if (!isMobileDevice) {
      actual_vol = Howler.volume();
      Howler.volume(0);
      volumebar.value = 0;
    } else {
      Howler.mute(true);
    }
  } else {
    vol_icon.className = "bi bi-volume-up-fill";
    if (!isMobileDevice) {
      Howler.volume(actual_vol);
      volumebar.value = actual_vol * 100;
    } else {
      Howler.mute(false);
    }
  }
});

export function update_music_list() {
  srcSongs = [];

  Array.from(songs).forEach((song) => {
    srcSongs.push(song.src);
  });

  if (songs.length > 0) {
    controls.style.display = "flex";
    if (sound) {
      index = srcSongs.indexOf(sound._src);
      if (index < 0) {
        index = 0;
      }
    }
  } else {
    controls.style.display = "none";
  }
}

update_music_list();

export var sound = null;

const elementWave = document.createElement("div");

elementWave.style.position = "absolute";
elementWave.style.right = "40px";

elementWave.className = "playing";
elementWave.innerHTML = `<div class="rect1 "></div>
                         <div class="rect2"></div>
                         <div class="rect3"></div>
                         <div class="rect4"></div>
                         <div class="rect5"></div>`;

function initializeHowl(audioSrc) {
  const textTotalDuration = document.getElementById("total-duration");

  document.getElementsByClassName("songs");
  const elementSong = document.getElementsByClassName("songs")[index];

  const data = elementSong.dataset.info.split("|");

  const tituloAtual = document.getElementById("musica_atual");

  const elementoPai = elementSong.closest("li");

  var currentTime;
  var createdHowler;
  Howler.usingWebAudio = false;
  Howler._howls.forEach((item) => {
    if (audioSrc == item._src) {
      sound = item;
      createdHowler = true;
      return;
    }
  });

  tituloAtual.innerHTML =
    document.getElementsByClassName("title_songs")[index].innerText;

  if (!createdHowler) {
    sound = new Howl({
      src: [audioSrc],
      autoplay: false,
      preload: true,
      html5: true,
      onend: function () {
        playNextAudio();
      },
      onplay: function () {
        button_playpause.className = "bi bi-pause-fill";
        elementoPai.insertBefore(elementWave, elementSong);
        currentTime = setInterval(updateCurrentTime, 10); // Atualiza a cada 10ms

        if ("mediaSession" in navigator) {
          const singers =
            document.getElementsByClassName("singers_songs")[index].innerText;
          const mediaSession = navigator.mediaSession;
          mediaSession.metadata = new MediaMetadata({
            title: tituloAtual.innerText,
            artist: singers,
            artwork: [{ src: data[0], type: "image/jpeg" }],
          });

          mediaSession.setActionHandler("play", () => {
            sound.play();
          });

          mediaSession.setActionHandler("pause", function () {
            sound.pause();
          });

          mediaSession.setActionHandler("previoustrack", function () {
            playPrevAudio();
          });

          mediaSession.setActionHandler("nexttrack", function () {
            playNextAudio();
          });

          mediaSession.setActionHandler("stop", function () {
            sound.pause();
          });
        }
        Array.from(elementWave.children).forEach((item) => {
          item.classList.add("paused");
        });
        isPlaying = true;
      },
      onpause: function () {
        clearInterval(currentTime);
        button_playpause.className = "bi bi-play-fill";
        Array.from(elementWave.children).forEach((item) => {
          item.classList.remove("paused");
        });
        isPlaying = false;
      },
      onload: function () {
        textTotalDuration.innerText = secondsToMinutes(sound.duration());
      },
    });
  }
  textTotalDuration.innerText = secondsToMinutes(sound.duration());
  Howler.volume(volumebar.value / 100);
}

volumebar.addEventListener("input", () => {
  var volumValue = volumebar.value / 100;
  Howler.volume(volumValue);
  if (Howler.volume() == 0) {
    vol_icon.className = "bi bi-volume-mute-fill";
  } else {
    vol_icon.className = "bi bi-volume-up-fill";
  }
});

export function tocar() {
  if (sound) {
    sound.stop();
  }
  if (songs.length > 0) {
    initializeHowl(srcSongs[index]);
    sound.play();
  } else {
    button_playpause.className = "bi bi-play-fill";
  }
}

function playNextAudio() {
  index = (index + 1) % srcSongs.length;
  tocar();
}

function playPrevAudio() {
  index = (index - 1 + srcSongs.length) % srcSongs.length;
  tocar();
}
const nextBtn = document.getElementById("next-control");
const prevBtn = document.getElementById("prev-control");

export function init_player() {
  initializeHowl(srcSongs[index]);
  setInterval(updateProgressRange, 10); // Atualiza a cada 10ms
}

button_playpause.addEventListener("click", () => {
  if (sound) {
    if (!sound.playing()) {
      sound.play();
    } else {
      sound.pause();
    }
  } else {
    initializeHowl(srcSound.src);
    sound.play();
  }
});

nextBtn.addEventListener("click", () => {
  playNextAudio();
});

prevBtn.addEventListener("click", () => {
  playPrevAudio();
});

// Atualiza o valor do input range com base no progresso da reprodução da música
function updateProgressRange() {
  var progress = (sound.seek() / sound.duration()) * 100;
  document.getElementById("progressbar").value = progress;
}

// Controla a reprodução da música com base no valor do input range
function seekToPosition() {
  var progressRange = document.getElementById("progressbar");
  var seekPosition = (progressRange.value / 100) * sound.duration();
  sound.seek(seekPosition);
}

if (!isMobileDevice) {
  var progressRange = document.getElementById("progressbar");
  progressRange.addEventListener("input", seekToPosition);
  volumebar.style.display = "flex";
} else {
  vol_icon.style.marginRight = "50%";
}

function updateCurrentTime() {
  const textCurrentDuration = document.getElementById("current-duration");
  textCurrentDuration.innerText = secondsToMinutes(sound.seek());
}

function secondsToMinutes(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}

if (songs.length > 0) {
  init_player();
}

let li_tags_songs = document.querySelector("#sortable");

li_tags_songs.addEventListener("click", (ev) => {
  var denyClass = [
    "bi bi-three-dots-vertical",
    "edit_audio",
    "delete_audio",
    "bi bi-check-square-fill",
    "remove_from_playlist bg-info",
  ];
  if (!denyClass.includes(ev.target.className)) {
    if (!(ev.target.tagName == "INPUT")) {
      var element = ev.target.closest("li");

      var srcSound = element.querySelector("source");

      var newIndex = Array.from(songs).indexOf(srcSound);

      if (newIndex != index) {
        index = newIndex;
      }
      if (sound) {
        sound.stop();
      }
      initializeHowl(srcSound.src);
      sound.play();
    }
  }
});

export { songs };

$(document).ready(function () {
  $("#sortable").sortable({
    handle: ".handle",
    update: function () {
      update_music_list();
    },
  });
  $("#sortable").disableSelection();
});
