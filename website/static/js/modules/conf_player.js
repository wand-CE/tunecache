var isMobileDevice =
  /Mobi/i.test(navigator.userAgent) ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const controls = document.querySelector("#controls");

var songs;
var idSongs;

let button_playpause = document.getElementById("play-control");
let index = 0;
let currentMusicId;
let tituloAtual;

let vol_icon = document.getElementById("vol-icon");

export function update_music_list() {
  songs = document.getElementsByClassName("songs");
  idSongs = [];

  Array.from(songs).forEach((song) => {
    idSongs.push(song.id);
  });

  for (var i = 0; i < songs.length; i++) {
    if (!songs[i].dataset.listenerAdded) {
      songs[i].addEventListener("ended", onMusicEnd);
      songs[i].dataset.listenerAdded = true;
    }
  }
}

update_music_list();

const progressbar = document.getElementById("progressbar");
const volumebar = document.getElementById("volume");

export function updateDataMusic() {
  vol_icon.className = "bi-volume-up-fill";
  currentMusicId = document.getElementById(idSongs[index]);

  const textCurrentDuration = document.getElementById("current-duration");
  const textTotalDuration = document.getElementById("total-duration");

  tituloAtual = document.getElementById("title_" + currentMusicId.id);

  document.getElementById("musica_atual").innerHTML = tituloAtual.textContent;
  progressbar.max = currentMusicId.duration;

  textTotalDuration.innerText = secondsToMinutes(currentMusicId.duration);

  if (!currentMusicId.dataset.listenerPlayPause) {
    currentMusicId.addEventListener("play", function () {
      button_playpause.className = "bi bi-pause-fill";
      const mediaSession = navigator.mediaSession;
      const data = currentMusicId.dataset.info.split("|");
      if (mediaSession) {
        mediaSession.metadata = new MediaMetadata({
          title: data[0],
          artist: data[1],
          artwork: [{ src: data[2], type: "image/jpeg" }],
        });

        mediaSession.setActionHandler("play", function () {
          currentMusicId.play();
        });

        mediaSession.setActionHandler("pause", function () {
          currentMusicId.pause();
        });

        mediaSession.setActionHandler("previoustrack", function () {
          prev_Music();
        });

        mediaSession.setActionHandler("nexttrack", function () {
          next_music();
        });

        mediaSession.setActionHandler("stop", function () {
          if (!currentMusicId.paused) {
            currentMusicId.pause();
          }
        });
      }
    });

    currentMusicId.addEventListener("pause", function () {
      button_playpause.className = "bi bi-play-fill";
    });

    currentMusicId.addEventListener("loadedmetadata", function () {
      textTotalDuration.innerText = secondsToMinutes(currentMusicId.duration);
      progressbar.max = currentMusicId.duration;
    });

    currentMusicId.dataset.listenerPlayPause = true;
  }

  currentMusicId.ontimeupdate = function () {
    textCurrentDuration.innerText = secondsToMinutes(
      currentMusicId.currentTime
    );
    progressbar.valueAsNumber = currentMusicId.currentTime;
  };
}

if (isMobileDevice) {
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

  function handleVolume(event) {
    const touch = event.targetTouches[0];
    const volumebarRect = volumebar.getBoundingClientRect();
    const clientX = touch.clientX;
    const valvol =
      ((clientX - volumebarRect.left) / volumebar.clientWidth) *
      (parseFloat(volumebar.max) / 100);

    if (valvol > 0 && valvol <= 1) {
      currentMusicId.volume = valvol;
      vol_icon.className = "bi-volume-up-fill";
    } else if (valvol <= 0) {
      currentMusicId.volume = 0;
      vol_icon.className = "bi-volume-mute-fill";
    }
  }

  volumebar.addEventListener("touchstart", function (event) {
    handleVolume(event);
  });

  volumebar.addEventListener("touchmove", function (event) {
    handleVolume(event);
  });
}

export function verify_songs() {
  if (idSongs.length > 0) {
    updateDataMusic();
    document.getElementById("controls").style.display = "flex";
  } else {
    document.getElementById("controls").style.display = "none";
  }
}

controls.addEventListener("click", function (ev) {
  if (idSongs.length > 0) {
    if (ev.target.id == "play-control") {
      if (button_playpause.className == "bi bi-play-fill") {
        currentMusicId.play();
      } else {
        currentMusicId.pause();
      }
    }

    if (ev.target.id == "vol-icon") {
      currentMusicId.muted = !currentMusicId.muted;
      if (currentMusicId.muted) {
        vol_icon.className = "bi-volume-mute-fill";
      } else {
        vol_icon.className = "bi-volume-up-fill";
      }
    }

    if (!isMobileDevice) {
      if (ev.target.id == "volume") {
        currentMusicId.volume = ev.target.valueAsNumber / 100;
        if (currentMusicId.volume > 0) {
          vol_icon.className = "bi-volume-up-fill";
        } else {
          vol_icon.className = "bi-volume-mute-fill";
        }
      }

      if (ev.target.id == "progressbar") {
        currentMusicId.currentTime = ev.target.valueAsNumber;
      }
    }

    if (ev.target.id == "next-control") {
      next_music();
    }

    if (ev.target.id == "prev-control") {
      prev_Music();
    }
  }
});

export function onMusicEnd() {
  index++;
  if (index == idSongs.length) {
    index = 0;
  }
  currentMusicId.pause();
  updateDataMusic();
  currentMusicId.play();
}

function secondsToMinutes(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}

let li_tags_songs = document.querySelector("#sortable");

li_tags_songs.addEventListener("click", (ev) => {
  var element = ev.target.closest("li");
  play_on_click_li(ev, element);
});

export function play_on_click_li(ev, li_ul_tag) {
  const target = ev.target;
  const targetClassName = target.className;

  if (
    targetClassName !== "bi bi-three-dots-vertical" &&
    !target.closest(".music_options") &&
    !target.closest(".check_change") &&
    target.contentEditable !== "true"
  ) {
    if (li_ul_tag.id !== "") {
      const new_index = Array.from(idSongs).indexOf(`song${li_ul_tag.id}`);
      if (index !== new_index) {
        index = new_index;
        currentMusicId.pause();
        currentMusicId.currentTime = 0;
        updateDataMusic();
        currentMusicId.play();
      } else {
        if (currentMusicId.paused) {
          currentMusicId.play();
        }
      }
    }
  }
}

let arrow_title = document.getElementById("arrow_title");
let arrow_singer = document.getElementById("arrow_singer");

export function shuffle_musics() {
  const lista_musicas = document.querySelector("#sortable");
  const itens_lista = Array.from(lista_musicas.children);

  arrow_title.className = "bi bi-arrow-down-up";
  arrow_singer.className = "bi bi-arrow-down-up";

  itens_lista.sort(() => 0.5 - Math.random());

  for (const item of itens_lista) {
    lista_musicas.appendChild(item);
  }

  update_music_list();

  index = Array.from(idSongs).indexOf(currentMusicId.id);
}

let sort_by_title = document.getElementById("title");
let title_click = 0;

let sort_by_singer = document.getElementById("singer");
let singer_click = 0;

sort_by_title.addEventListener("click", () => {
  title_click++;
  sort_musics(title_click, "title");
});

sort_by_singer.addEventListener("click", () => {
  singer_click++;
  sort_musics(singer_click, "singer");
});

function sort_musics(click, name_of_event) {
  const lista_musicas = document.querySelector("#sortable");
  const itens_lista = Array.from(lista_musicas.children);
  const arrow_title = document.getElementById("arrow_title");
  const arrow_singer = document.getElementById("arrow_singer");
  let sortFunction;

  if (name_of_event === "title") {
    sortFunction = (a, b) =>
      a.childNodes[1].innerText.localeCompare(b.childNodes[1].innerText);
    arrow_title.className =
      click % 2 !== 0 ? "bi bi-sort-alpha-down" : "bi bi-sort-alpha-up";
    arrow_singer.className = "bi bi-arrow-down-up";
  } else if (name_of_event === "singer") {
    sortFunction = (a, b) =>
      a.childNodes[3].innerText.localeCompare(b.childNodes[3].innerText);
    arrow_singer.className =
      click % 2 !== 0 ? "bi bi-sort-alpha-down" : "bi bi-sort-alpha-up";
    arrow_title.className = "bi bi-arrow-down-up";
  }

  itens_lista.sort(
    click % 2 !== 0 ? sortFunction : (a, b) => sortFunction(b, a)
  );

  itens_lista.forEach(function (item) {
    lista_musicas.appendChild(item);
  });

  update_music_list();

  index = Array.from(idSongs).indexOf(currentMusicId.id);
}

function next_music() {
  index++;

  if (index == idSongs.length) {
    index = 0;
  }

  currentMusicId.pause();
  currentMusicId.currentTime = 0;
  updateDataMusic();
  currentMusicId.play();
}

function prev_Music() {
  index--;

  if (index < 0) {
    index = idSongs.length - 1;
  }

  currentMusicId.pause();
  currentMusicId.currentTime = 0;
  updateDataMusic();
  currentMusicId.play();
}

export { songs };
export { idSongs };

export function configureSortable() {
  $("#sortable").sortable({
    update: function () {
      update_music_list();
      index = Array.from(idSongs).indexOf(currentMusicId.id);
    },
  });
  $("#sortable").disableSelection();
}
