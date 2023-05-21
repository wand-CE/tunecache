if (!window.location.href.includes("cantores/")) {
  document.getElementById("add_musicas").style.removeProperty("display");
}

const controls = document.querySelector("#controls");

var songs;
var idSongs;

let button_playpause = document.getElementById("play-control");
let index = 0;
let currentMusicId;
let tituloAtual;

export function update_music_list() {
  songs = document.getElementsByClassName("songs");
  idSongs = [];

  Array.from(songs).forEach((song) => {
    idSongs.push(song.id);
  });

  for (var i = 0; i < songs.length; i++) {
    songs[i].addEventListener("ended", onMusicEnd);
  }
}

update_music_list();

const progressbar = document.getElementById("progressbar");
const volumebar = document.getElementById("volume");

function updateDataMusic() {
  currentMusicId = document.getElementById(idSongs[index]);

  const textCurrentDuration = document.getElementById("current-duration");
  const textTotalDuration = document.getElementById("total-duration");

  tituloAtual = document.getElementById("title_" + currentMusicId.id);

  document.getElementById("musica_atual").innerHTML = tituloAtual.textContent;
  progressbar.max = currentMusicId.duration;

  textTotalDuration.innerText = secondsToMinutes(currentMusicId.duration);

  currentMusicId.addEventListener("play", function () {
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
        button_playpause.className = "bi bi-pause-fill";
      });

      mediaSession.setActionHandler("pause", function () {
        currentMusicId.pause();
        button_playpause.className = "bi bi-play-fill";
      });

      mediaSession.setActionHandler("previoustrack", function () {
        index -= 1;
        if (index < 0) {
          index = idSongs.length - 1;
        }
        currentMusicId.pause();
        currentMusicId.currentTime = 0;
        updateDataMusic();
        currentMusicId.play();
      });

      mediaSession.setActionHandler("nexttrack", function () {
        index += 1;
        if (index == idSongs.length) {
          index = 0;
        }
        currentMusicId.pause();
        currentMusicId.currentTime = 0;
        updateDataMusic();
        currentMusicId.play();
      });

      mediaSession.setActionHandler("stop", function () {
        if (!currentMusicId.paused) {
          currentMusicId.pause();
        }
        button_playpause.className = "bi bi-play-fill";
      });
    }
  });

  currentMusicId.addEventListener("loadedmetadata", function () {
    textTotalDuration.innerText = secondsToMinutes(currentMusicId.duration);
    progressbar.max = currentMusicId.duration;
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

export function verify_songs() {
  if (idSongs.length > 0) {
    updateDataMusic();
    document.getElementById("controls").style.display = "flex";
  } else {
    document.getElementById("controls").style.display = "none";
  }
}

verify_songs();

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
      if (currentMusicId.muted) {
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

export function onMusicEnd() {
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

let items = document.querySelector("#sortable");
let listas = Array.from(items.children);
for (const lista of listas) {
  lista.addEventListener("click", (ev) => {
    play_on_click_li(ev, lista);
  });
}

function play_on_click_li(ev, lista) {
  if (
    ev.target.className != "bi bi-three-dots-vertical" &&
    !ev.target.closest(".music_options") &&
    !ev.target.closest(".check_change") &&
    ev.target.contentEditable !== "true"
  ) {
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
}

let arrow_title = document.getElementById("arrow_title");
let arrow_singer = document.getElementById("arrow_singer");

function shuffle_musics() {
  let lista_musicas = document.querySelector("#sortable");

  arrow_title.className = "bi bi-arrow-down-up";
  arrow_singer.className = "bi bi-arrow-down-up";

  itens_lista = Array.from(lista_musicas.children);

  itens_lista.sort(function () {
    return 0.5 - Math.random();
  });

  itens_lista.forEach(function (item) {
    lista_musicas.appendChild(item);
  });

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
  let lista_musicas = document.querySelector("#sortable");
  let itens_lista = Array.from(lista_musicas.children);
  if (name_of_event == "title") {
    let arrow_title = document.getElementById("arrow_title");
    if (click % 2 != 0) {
      itens_lista.sort((a, b) => {
        return a.childNodes[1].innerText.localeCompare(
          b.childNodes[1].innerText
        );
      });
      arrow_title.className = "bi bi-sort-alpha-down";
    } else {
      itens_lista.sort((b, a) => {
        return a.childNodes[1].innerText.localeCompare(
          b.childNodes[1].innerText
        );
      });
      arrow_title.className = "bi bi-sort-alpha-up";
    }
    arrow_singer.className = "bi bi-arrow-down-up";
  } else if (name_of_event == "singer") {
    if (click % 2 != 0) {
      itens_lista.sort((a, b) => {
        return a.childNodes[3].innerText.localeCompare(
          b.childNodes[3].innerText
        );
      });
      arrow_singer.className = "bi bi-sort-alpha-down";
    } else {
      itens_lista.sort((b, a) => {
        return a.childNodes[3].innerText.localeCompare(
          b.childNodes[3].innerText
        );
      });
      arrow_singer.className = "bi bi-sort-alpha-up";
    }
    arrow_title.className = "bi bi-arrow-down-up";
  }

  itens_lista.forEach(function (item) {
    lista_musicas.appendChild(item);
  });

  update_music_list();

  index = Array.from(idSongs).indexOf(currentMusicId.id);
}

let shuffle_button = document.getElementById("shuffle_musics");

shuffle_button.addEventListener("click", shuffle_musics);

window.update_music_list = update_music_list;
window.onMusicEnd = onMusicEnd;
window.updateDataMusic = updateDataMusic;
window.play_on_click_li = play_on_click_li;

function configureSortable() {
  $("#sortable").sortable({
    update: function () {
      update_music_list();
      index = Array.from(idSongs).indexOf(currentMusicId.id);
    },
  });
  $("#sortable").disableSelection();
}

$(document).ready(function () {
  configureSortable();
});

export { songs };
export { idSongs };
