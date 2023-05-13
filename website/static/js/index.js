if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

if (!window.location.href.includes("cantores")) {
  document.getElementById("add_musicas").style.removeProperty("display");
}

function addeventListener_delete() {
  var buttons_delete = document.getElementsByClassName("delete_audio");

  for (let i = 0; i < buttons_delete.length; i++) {
    const id = buttons_delete[i].parentElement.parentElement.parentElement.id;
    buttons_delete[i].addEventListener("click", () => {
      deleteAudio(id);
    });
  }
}
addeventListener_delete();

function deleteAudio(audioId) {
  fetch("/delete-music", {
    method: "DELETE",
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

function editAudio(audioId, old_singer, old_title) {
  singerName = document.getElementById(`author_song${audioId}`).innerText;
  musicName = document.getElementById(`title_song${audioId}`).innerText;

  if (singerName.trim().length == 0 || musicName.trim().length == 0) {
    document.getElementById(`title_song${audioId}`).innerText = old_title;
    document.getElementById(`author_song${audioId}`).innerText = old_singer;
    alert("Música Não Editada");
  } else {
    fetch("/edit-music", {
      method: "PUT",
      body: JSON.stringify({
        musicId: audioId,
        singerName: singerName,
        musicName: musicName,
      }),
    })
      .then((_res) => {
        return _res.json();
      })
      .then((data) => {});
  }
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
      <span id="title_song${data["id"]}" style="flex: 3">
      ${data["title"]}
      </span>
      <span
      id="author_song${data["id"]}"
      style="margin-left: 50px; flex: 1"
    >
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
       data-target="${data["id"]}"
     >
       <span
         aria-hidden="true"
         class="bi bi-three-dots-vertical"
         style="color: white"
       ></span>
     </button>
     <div class="music_options">
         <ul>
           <li class="edit_audio">Editar</li>
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
      window.update_music_list();
      document
        .querySelector(`[data-target="${data["id"]}"]`)
        .addEventListener("click", add_optionsButtons);

      addeventListener_delete();

      new_song.addEventListener("click", (ev) => {
        play_on_click_li(ev, new_song);
      });
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
            for (let i = 0; i < urlsString.length; i++) {
              addMusic(urlsString[i], "", "", "YES");
            }
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

  if (ev.target.className != "bi bi-three-dots-vertical") {
    music_options = document.getElementsByClassName("music_options");
    for (music in music_options) {
      if (music == "length") {
        break;
      }
      music_options[music].style.display = "none";
    }
  }
});

function add_optionsButtons() {
  var optionsMenu = this.parentNode.querySelector(".music_options");
  optionsMenu.style.display =
    optionsMenu.style.display === "block" ? "none" : "block";
}

var optionsButtons = document.querySelectorAll(".music_button");
optionsButtons.forEach(function (optionsButton) {
  optionsButton.addEventListener("click", add_optionsButtons);
});

function focusEnd(element) {
  element.contentEditable = true;
  element.style.cursor = "context-menu";
  element.innerText += " ";
  element.focus();

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function addeventListener_edit() {
  var buttons_edit = document.getElementsByClassName("edit_audio");

  for (let i = 0; i < buttons_edit.length; i++) {
    buttons_edit[i].addEventListener("click", (ev) => {
      const elementExists = document.querySelector(".check_change");

      if (!elementExists) {
        const title = document.getElementById(
          `title_song${ev.target.dataset.target}`
        );
        const singer = document.getElementById(
          `author_song${ev.target.dataset.target}`
        );
        title.style.backgroundColor = "#474444";
        singer.style.backgroundColor = "#474444";

        let id = ev.target.dataset.target;

        // seleciona o elemento pai do botão
        const buttonParent = document.getElementById(`${id}`);

        // cria o novo elemento
        const newElement = document.createElement("button");

        newElement.className = "close check_change text-success";
        newElement.style.marginLeft = "5px";
        newElement.innerHTML = `<span aria-hidden="true" class="bi bi-check-square-fill"></span>`;

        buttonParent.insertBefore(newElement, buttonParent.childNodes[7]);

        const old_singer_name = singer.innerText;
        const old_title_name = title.innerText;

        newElement.addEventListener("click", () => {
          editAudio(id, old_singer_name, old_title_name);
          newElement.remove();
          singer.removeAttribute("contentEditable");
          singer.style.backgroundColor = "";

          title.removeAttribute("contentEditable");
          title.style.backgroundColor = "";
        });

        focusEnd(singer);
        focusEnd(title);
      }
    });
  }
}
addeventListener_edit();

/*
<button type="button" class="music_button close">
<span
  aria-hidden="true"
  class="bi bi-check-square-fill"
  style="color: white"
></span>
</button>
*/

/* = document.querySelector(
  'input[name="database_url"]:checked'
).value;
*/
var select_elements = document.querySelector(".playlists").children;

for (let i = 0; i < select_elements.length; i++) {
  select_elements[i].addEventListener("click", (ev) => {
    if (ev.target.id == "from_url") {
      document.getElementsByClassName("data_from_url")[0].style.display =
        "block";
      document.getElementsByClassName("data_from_database")[0].style.display =
        "none";
    } else if (ev.target.id == "from_database") {
      document.getElementsByClassName("data_from_database")[0].style.display =
        "block";
      document.getElementsByClassName("data_from_url")[0].style.display =
        "none";
    }
  });
}

function update_playlist_songs_list(list_songs, currentPlaylist) {
  fetch("/update_list_songs_playlist", {
    method: "PUT",
    body: JSON.stringify([list_songs, currentPlaylist]),
  })
    .then((response) => {
      console.log("caguei");
      return response.json();
    })
    .then((data) => {
      console.log(data[0]);
    });
}

document
  .getElementById("add_music_from_database")
  .addEventListener("click", () => {
    var div_database = document.querySelector(".data_from_database");
    var audios = div_database.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    var list_songs = [];
    var currentPlaylist = document.querySelector(".titulo_playlist");

    for (let i = 0; i < audios.length; i++) {
      list_songs.push(audios[i].value);
    }
    update_playlist_songs_list(list_songs, currentPlaylist.dataset.value);
  });
