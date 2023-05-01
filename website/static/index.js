if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

function deleteAudio(audioId) {
  fetch("/delete-audio", {
    method: "POST",
    body: JSON.stringify({ audioId: audioId }),
  }).then((_res) => {
    rmAudio = document.querySelector(".audio_lista" + audioId);
    rmAudio.remove();
    var quantidade_musicas = document
      .getElementById("musics")
      .getElementsByTagName("li").length;
    if (quantidade_musicas == 1) {
      document.getElementById("controls").style.display = "none";
    }
  });
}

function addPlaylist(playlistTitle) {
  fetch("/add-playlist", {
    method: "POST",
    body: JSON.stringify({ playlistTitle: playlistTitle }),
  }).then((_res) => {
    // Seleciona o elemento onde o novo elemento será adicionado
    var playlist_list = document.getElementById("playlist_list");
    // Cria um novo elemento
    const new_playlist = document.createElement("div");
    new_playlist.classList.add("col-md-3", "mb-3");

    // Define o conteúdo HTML da div
    new_playlist.innerHTML = `
      <a href="/playlists/${playlistTitle}">
        <div class="card bg-dark text-light">
          <img src="https://via.placeholder.com/350x150" class="card-img-top h-100" />
          <h5 class="card-title ml-3">${playlistTitle}</h5>
        </div>
      </a>
    `;
    playlist_list.appendChild(new_playlist);
  });
}

function addMusic(Url, Titulo, Cantor) {
  console.log("Adicionando");
  fetch("/add-music", {
    method: "POST",
    body: JSON.stringify({ music_url: Url, titulo: Titulo, cantor: Cantor }),
  })
    .then((response) => {
      alert(response);
      if (!response.ok) {
        throw new Error("Erro na solicitação");
      } else {
        alert("Musica Adicionada");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data); // Aqui, o valor retornado pela promessa é usado para fazer algo
    })
    .catch((error) => {
      alert(error + ",  Música não adicionada");
    });
}

function adicionarAudio() {
  let audioUrl = document.getElementById("video");
  fetch("/adiciona-audio", {
    method: "POST",
    body: JSON.stringify({ audioUrl }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Erro ao enviar informações");
      }
      return response.json();
    })
    .then(function (data) {
      console.log("Informações enviadas com sucesso:", data);
    })
    .catch(function (error) {
      console.error("Erro ao enviar informações:", error);
    });
}

function atualizarConteudo() {
  fetch("/dados")
    .then((response) => response.json())
    .then((data) => {
      var listaDados = "";
      for (var i = 0; i < data.dados.length; i++) {
        listaDados += "<li>" + data.dados[i] + "</li>";
      }
      document.getElementById("lista-dados").innerHTML = listaDados;
    })
    .catch((error) => console.error(error));
}

const controls = document.querySelector("#controls");

var songs = document.getElementsByClassName("songs");
var idSongs = [];

let button_playpause = document.getElementById("play-control");
let index = 0;
let currentMusicId;
let tituloAtual;

for (let i = 0; i < songs.length; i++) {
  idSongs.push(songs[i].id);
}
/*
var audio = [];
for (let i = 0; i < songs.length; i++) {
  document
    .getElementsByClassName("audio_lista" + i)
    .addEventListener("click", currentMusicId);0
}
alert(audio);
*/
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

if (idSongs.length > 0) {
  document.getElementById("controls").style.display = "flex";
  updateDataMusic();
  currentMusicId.addEventListener("loadedmetadata", function () {
    progressbar.max = currentMusicId.duration;
  });
} else {
  document.getElementById("controls").style.display = "none";
}

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

for (var i = 0; i < songs.length; i++) {
  songs[i].addEventListener("ended", onMusicEnd);
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

function menu() {
  var menu = document.getElementById("menu");
  if (menu.style.display == "none") {
    menu.style.display = "flex";
    document.getElementById("new_playlist_title").focus();
  } else {
    menu.style.display = "none";
  }
  const menuAddMusicas = document.getElementById("menu");
  const addMusicasIcon = document.getElementById("add_musicas");
  const addMusicasIconParent = addMusicasIcon.parentNode;

  addMusicasIconParent.insertAdjacentElement("afterend", menuAddMusicas);
}
