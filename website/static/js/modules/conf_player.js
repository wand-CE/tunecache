var isMobileDevice =
  /Mobi/i.test(navigator.userAgent) ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const volumebar = document.getElementById("volume");
const button_playpause = document.getElementById("play-control");
const vol_icon = document.getElementById("vol-icon");

if (!isMobileDevice) {
  volumebar.style.display = "flex";
} else {
  vol_icon.style.marginRight = "50%";
}

const controls = document.querySelector("#controls");

const songs = document.getElementsByClassName("songs");
var srcSongs;

let index = 0;
let actual_vol = 0.5;

vol_icon.addEventListener("click", () => {
  if (vol_icon.className == "bi bi-volume-up-fill") {
    vol_icon.className = "bi bi-volume-mute-fill";
    actual_vol = Howler.volume();
    volumebar.value = 0;
    Howler.volume(0);
    Howler.mute(true);
  } else {
    vol_icon.className = "bi bi-volume-up-fill";
    Howler.volume(actual_vol);
    volumebar.value = actual_vol * 100;
    Howler.mute(false);
  }
});

export function update_music_list() {
  srcSongs = [];

  Array.from(songs).forEach((song) => {
    srcSongs.push(song.src);
  });

  if (songs.length > 0) {
    controls.style.display = "flex";
  } else {
    controls.style.display = "none";
  }
}

update_music_list();

var sound = null;

function initializeHowl(audioSrc) {
  const textTotalDuration = document.getElementById("total-duration");
  const data = document
    .getElementsByClassName("songs")
    [index].dataset.info.split("|");
  const tituloAtual = document.getElementById("musica_atual");

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

  tituloAtual.innerHTML = data[0];

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
        currentTime = setInterval(updateCurrentTime, 10); // Atualiza a cada 10ms

        if ("mediaSession" in navigator) {
          const mediaSession = navigator.mediaSession;
          mediaSession.metadata = new MediaMetadata({
            title: data[0],
            author: data[1],
            artwork: [{ src: data[2], type: "image/jpeg" }],
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
        // Chamada para atualizar a API Media Session quando a reprodução começar
      },
      onpause: function () {
        clearInterval(currentTime);
        button_playpause.className = "bi bi-play-fill";
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
  alert(Howler.volume());
  if (Howler.volume() == 0) {
    vol_icon.className = "bi bi-volume-mute-fill";
  } else {
    vol_icon.className = "bi bi-volume-up-fill";
  }
});

function tocar() {
  if (sound) {
    sound.stop();
  }
  initializeHowl(srcSongs[index]);
  sound.play();
}

function playNextAudio() {
  index = (index + 1) % srcSongs.length;
  tocar();
}

function playPrevAudio() {
  index = (index - 1 + srcSongs.length) % srcSongs.length;
  tocar();
}

export function init_player() {
  initializeHowl(srcSongs[index]);
  document.getElementById("play-control").addEventListener("click", () => {
    if (!sound.playing()) {
      sound.play();
    } else {
      sound.pause();
    }
  });

  document.getElementById("next-control").addEventListener("click", () => {
    playNextAudio();
  });

  document.getElementById("prev-control").addEventListener("click", () => {
    playPrevAudio();
  });
}

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

//if (!isMobileDevice) {
var progressRange = document.getElementById("progressbar");
// Adiciona um evento de input ao input range
progressRange.addEventListener("input", seekToPosition);
//}

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
// Atualiza o input range periodicamente
setInterval(updateProgressRange, 10); // Atualiza a cada 10ms

let li_tags_songs = document.querySelector("#sortable");

li_tags_songs.addEventListener("click", (ev) => {
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

  //essa função da pra usar como base para as de sort_musics

  //play_on_click_li(ev, element);
});
