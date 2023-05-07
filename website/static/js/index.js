if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

if (!window.location.href.includes("cantores")) {
  document.getElementById("add_musicas").style.removeProperty("display");
}

var buttons = document.getElementsByClassName("delete_audio");

for (let i = 0; i < buttons.length; i++) {
  const id = buttons[i].parentElement.parentElement.parentElement.id;
  buttons[i].addEventListener("click", () => {
    deleteAudio(id);
  });
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
    window.update_music_list();
  });
}

function editAudio(audioId) {
  fetch("/edit-audio", {
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
    window.update_music_list();
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

function addMusic(url, titulo, cantor, playlist) {
  fetch("/add-music", {
    method: "POST",
    body: JSON.stringify({
      music_url: url,
      titulo: titulo,
      cantor: cantor,
      playlist: playlist,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro de Url");
      }
      return response.json();
    })
    .then((data) => {
      if ("added_before" in data) {
        if (data["added_before"] == "YES") {
          console.log("Música já adicionada");
          return "";
        }
      }
      window.update_music_list();
      // Seleciona o elemento onde o novo elemento será adicionado
      var music_list = document.getElementById("musics");
      // Cria um novo elemento
      const new_song = document.createElement("li");

      new_song.id = `${data["id"]}`;
      new_song.classList.add(
        `audio_lista${data["id"]}`,
        "d-flex",
        "flex-row",
        "list-group-item"
      );
      new_song.dataset.target = "audio_lista";

      // Define o conteúdo HTML da div
      new_song.innerHTML = `
      <span id="audio_song${data["id"]}" style="flex: 3">
      ${data["title"]}
      </span>
    <span class="autor" style="margin-left: 50px; flex: 1">
      ${data["author"]}
    </span>
    <audio
      id="song${data["id"]}"
      class="songs"
      src="../static/users/${data["user_id"]}/songs/${data["nome_na_pasta"]}"
      data-info="${data["title"]}|${data["author"]}|${data["thumb"]}"
    ></audio>
    <button
       type="button"
       class="music_button close"
       data-target="{{audio.id}}"
     >
       <span
         aria-hidden="true"
         class="bi bi-three-dots-vertical"
         style="color: white"
       ></span>
     </button>
     <div class="music_options">
       <ul>
         <li>Editar</li>
         <li class="delete_audio">Excluir</li>
       </ul>
     </div>`;

      music_list.appendChild(new_song);
      var songs = document.getElementsByClassName("songs");
      songs[songs.length - 1].addEventListener("ended", window.onMusicEnd);
      let last_id_audio = songs[songs.length - 1].id;
      window.idSongs.push(last_id_audio);
      window.verify_songs();
      document.getElementById("controls").style.display = "flex";
    })
    .catch((error) => {
      console.error(error);
    });
}

function addData(url, titulo, cantor) {
  var menu = document.getElementById("menu");
  menu.style.display = "none";
  if (url.includes("youtube.com" || "youtu.be")) {
    if (url.includes("playlist")) {
      fetch("/add-playlist", {
        method: "POST",
        body: JSON.stringify({ url: url }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if ("urls" in data) {
            const urlsString = data.urls;
            console.log(urlsString);
            for (let i = 0; i < urlsString.length; i++) {
              console.log(urlsString[i]);
              addMusic(urlsString[i], "", "", "YES");
            }
            console.log("adicionei");
          } else {
            alert("erro ao adicionar músicas");
          }
        });
    } else {
      addMusic(url, titulo, cantor, "NO");
    }
  } else {
    alert("Link Inválido");
  }
}

var menu = document.getElementById("menu");

menu.querySelectorAll("*").forEach((elemento) => {
  elemento.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

window.addEventListener("click", (ev) => {
  if (ev.target.id == "add_musicas") {
    if (menu.style.display == "none") {
      menu.style.display = "flex";
    } else {
      menu.style.display = "none";
    }
  } else {
    if (ev.target.id != "menu") {
      menu.style.display = "none";
    }
  }
  /*
  console.log(ev.target.className);
  if (ev.target.className != "bi bi-three-dots-vertical") {
    music_options = querySelectorAll("")
  }
  */
});

// Adiciona um event listener para o botão de opções
var optionsButtons = document.querySelectorAll(".music_button");
optionsButtons.forEach(function (optionsButton) {
  optionsButton.addEventListener("click", function () {
    // Mostra ou esconde o menu de opções
    var optionsMenu = this.parentNode.querySelector(".music_options");
    optionsMenu.style.display =
      optionsMenu.style.display === "block" ? "none" : "block";
  });
});
/*
function focusEnd(element) {
  element.contentEditable = true;
  element.innerText += " ";
  element.focus();

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

const button = document.getElementById("button");
button.addEventListener("click", () => {
  const elemento = document.getElementById("meuElemento");
  focusEnd(elemento);
});
*/
