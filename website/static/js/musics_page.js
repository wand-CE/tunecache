import { focusEnd, doneButton, removeFocus } from "../js/modules/main_conf.js";
import {
  update_music_list,
  tocar,
  sound,
  init_player,
  controls,
  isPlaying,
} from "../js/player.js";

var menu = document.getElementById("menu");
var page_id = document.querySelector(".titulo_playlist").dataset.value;

menu.querySelectorAll("*").forEach((elemento) => {
  elemento.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

window.addEventListener("click", (ev) => {
  if (ev.target.id == "plus_circle_button") {
    menu.style.display = menu.style.display == "none" ? "flex" : "none";
  } else {
    if (ev.target.id != "menu") {
      menu.style.display = "none";
    }
  }

  if (!ev.target.className.includes("bi-three-dots-vertical")) {
    let options = document.querySelectorAll(".music_options");
    options.forEach((item) => {
      item.style.display = "none";
    });
  }
});

const add_music_from_database = document.getElementById(
  "add_music_from_database"
);
if (add_music_from_database) {
  add_music_from_database.addEventListener("click", () => {
    document.getElementById("menu").style.display = "none";
    var div_database = document.getElementById("data_from_database");
    var audios = div_database.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    var list_songs = [];
    var currentPlaylistId =
      document.querySelector(".titulo_playlist").dataset.value;

    for (let i = 0; i < audios.length; i++) {
      list_songs.push(audios[i].value);
    }
    update_playlist_songs_list(list_songs, currentPlaylistId);
    audios.forEach((addedSong) => {
      addedSong.closest("div").remove();
    });
  });
}

const container_songs = document.getElementById("sortable");

container_songs.addEventListener("click", (event) => {
  if (event.target.closest(".music_button")) {
    const elementoPai = event.target.parentElement.parentElement;
    const optionsMenu = elementoPai.querySelector(".music_options");
    const editarAudio = elementoPai.querySelector(".edit_audio");
    const idAudio = editarAudio.dataset.target;
    const excluirAudio = elementoPai.querySelector(".delete_audio");

    editarAudio.addEventListener("click", () => {
      optionsMenu.style.display = "none";
      const elementExists = document.querySelector(".check_change");

      if (elementExists) {
        return; // Encerra a função se o elemento já existe
      }

      const title = document.getElementById(`title_song${idAudio}`);

      title.style.backgroundColor = "#474444";
      const buttonParent = document.getElementsByClassName(
        `audio_lista${idAudio}`
      )[0];

      buttonParent.insertBefore(doneButton, buttonParent.children[4]);

      const oldTitleName = title.innerText;

      doneButton.addEventListener("click", () => {
        editAudio(idAudio, oldTitleName);
        doneButton.remove();
        removeFocus(document.getElementById(`title_song${idAudio}`));
      });
      focusEnd(title);
    });

    excluirAudio.addEventListener("click", () => {
      optionsMenu.style.display = "none";
      deleteAudio(idAudio);
    });

    optionsMenu.style.display =
      optionsMenu.style.display === "block" ? "none" : "block";

    // Restante do código
  }
});

if (!window.location.href.includes("/cantores/")) {
  var btn_add_music = document.getElementById("add_music");

  btn_add_music.addEventListener("click", () => {
    addData(
      document.getElementById("url").value,
      document.getElementById("titulo").value,
      document.getElementById("autor").value
    );
  });
}

var menu_to_add_musics = document.getElementById("menu_to_add_musics");

menu_to_add_musics.querySelectorAll("*").forEach((element) => {
  element.addEventListener("click", () => {
    var from_url = document.getElementById("data_from_url");
    var from_database = document.getElementById("data_from_database");

    if (element.classList.contains("from_url")) {
      from_url.style.display = "block";
      from_database.style.display = "none";
    } else if (element.classList.contains("from_database")) {
      from_database.style.display = "block";
      from_url.style.display = "none";
    }
  });
});

export function deleteAudio(audioId) {
  if (confirm("Deseja mesmo excluir essa música?")) {
    fetch("/delete-music", {
      method: "DELETE",
      body: JSON.stringify({ audioId: audioId }),
    }).then((_res) => {
      const element_li = document.getElementsByClassName(
        `audio_lista${audioId}`
      )[0];

      const src = document.getElementById(`song${audioId}`).src;

      let howl = Howler._howls;

      for (let i = 0; i < howl.length; i++) {
        if (howl[i]._src == src) {
          if (howl[i] == sound) {
            if (isPlaying) {
              tocar();
            }
          }
          howl[i].unload();
          break;
        }
      }

      element_li.remove();

      update_music_list();

      var quantidade_musicas = container_songs.children.length;
      if (quantidade_musicas < 1) {
        controls.style.display = "none";
      }
    });
  }
}

export function editAudio(audioId, old_title) {
  var musicName = document.getElementById(`title_song${audioId}`).value;

  if (musicName.trim().length == 0) {
    document.getElementById(`title_song${audioId}`).innerText = old_title;
    alert("Música Não Editada");
  } else {
    fetch("/edit-music", {
      method: "PUT",
      body: JSON.stringify({
        musicId: audioId,
        musicName: musicName,
      }),
    })
      .then((_res) => {
        return _res.json();
      })
      .then((data) => {});
  }
}

export function addMusic(url, titulo, cantor, playlist) {
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
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
      if ("added_before" in data) {
        if (data["added_before"] == "YES") {
          if (playlist == "NO") {
            alert(`Música já adicionada`);
          }
          return "";
        }
      }

      addMusic_onSortable(
        data["id"],
        data["title"],
        data["user_id"],
        data["singer"],
        data["filename"],
        data["thumb"]
      );
    })
    .catch((error) => {
      console.error(error);
    });
}

export function addData(url, titulo, cantor) {
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
      if (window.location.href.includes("playlists")) {
        var address_url = window.location.href.split("playlists/");
        addMusic(url, titulo, cantor, address_url[1]);
      } else {
        addMusic(url, titulo, cantor, "NO");
      }
    }
  } else {
    alert("Link Inválido");
  }
}

export function update_playlist_songs_list(list_songs, currentPlaylistId) {
  fetch("/update_list_songs_playlist", {
    method: "PUT",
    body: JSON.stringify([list_songs, currentPlaylistId]),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        addMusic_onSortable(
          data[i][0],
          data[i][1],
          data[i][2],
          data[i][3],
          data[i][4],
          data[i][5]
        );
      }
    });
}

export function addMusic_onSortable(
  id,
  title,
  user_id,
  singer,
  filename,
  thumb
) {
  const new_song = document.createElement("li");

  new_song.classList.add(
    `audio_lista${id}`,
    "d-flex",
    "flex-row",
    "list-group-item"
  );
  new_song.dataset.target = "audio_lista";

  // Define o conteúdo HTML da div
  new_song.innerHTML = `
              <span class="bi bi-list handle"></span>
              <span class="ml-4 mr-3">
                <img
                  src="${thumb}"
                  alt="${title}"
                  height="40px"
                  width="40px"
                />
              </span>
              <span class="title_singer">
                  <span
                    id="title_song${id}"
                    class="title_songs"
                  >
                  ${title}
                  </span>
                  <br />
                  <span class="singers_songs">
                  ${singer}
                  </span>
              </span>
              <source
                id="song${id}"
                class="songs"
                src="../static/users/${user_id}/songs/${filename}"
                data-info="${thumb}"
              />
              <button type="button" class="music_button close" >
                <span
                  aria-hidden="true"
                  class="bi bi-three-dots-vertical"
                  style="color: white"
                ></span>
              </button>

              <div class="music_options">
                <ul>
                  <li class="edit_audio" data-target="${id}">Editar</li>                  
                  <li class="delete_audio">Excluir</li>
                </ul>
              </div>`;
  container_songs.appendChild(new_song);
  if (window.location.pathname != "/") {
    var option = new_song.querySelector(".music_options");
    var rename_playlist = document.createElement("li");
    rename_playlist.className = "remove_from_playlist bg-info";
    rename_playlist.dataset.audio_id = `${id}`;
    rename_playlist.dataset.playlist_id = `${page_id}`;
    rename_playlist.innerText = "Remover de Playlist/Cantor";

    option
      .querySelector("ul")
      .insertBefore(rename_playlist, option.querySelector(".delete_audio"));
  }
  update_music_list();
  init_player();
  controls.style.display = "flex";
}
