import {
  update_music_list,
  verify_songs,
  onMusicEnd,
  idSongs,
  songs,
  play_on_click_li,
} from "../modules/conf_player.js";

export function deleteAudio(audioId) {
  fetch("/delete-music", {
    method: "DELETE",
    body: JSON.stringify({ audioId: audioId }),
  }).then((_res) => {
    document.getElementById(audioId).remove();
    var quantidade_musicas = document
      .getElementById("musics")
      .getElementsByTagName("li").length;
    if (quantidade_musicas == 1) {
      document.getElementById("controls").style.display = "none";
    }
    update_music_list();
  });
}

export function editAudio(audioId, old_singer, old_title) {
  var singerName = document.getElementById(`author_song${audioId}`).innerText;
  var musicName = document.getElementById(`title_song${audioId}`).innerText;

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
      if (!response.ok) {
        throw new Error("Erro de Url");
      }
      return response.json();
    })
    .then((data) => {
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
        data["author"],
        data["user_id"],
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
      addMusic(url, titulo, cantor, "NO");
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
  author,
  user_id,
  filename,
  thumb
) {
  // Seleciona o elemento onde o novo elemento será adicionado
  var music_list = document.getElementById("sortable");
  // Cria um novo elemento
  const new_song = document.createElement("li");

  new_song.id = `${id}`;
  new_song.classList.add(
    `audio_lista${id}`,
    "d-flex",
    "flex-row",
    "list-group-item"
  );
  new_song.dataset.target = "audio_lista";

  // Define o conteúdo HTML da div
  new_song.innerHTML = `
        <span id="title_song${id}" style="flex: 3">
        ${title}
        </span>
        <span
        id="author_song${id}"
        style="margin-left: 50px; flex: 1"
      >
        ${author}
      </span>
      <audio
        id="song${id}"
        class="songs"
        src="../static/users/${user_id}/songs/${filename}"
        data-info="${title}|${author}|${thumb}"
      ></audio>
      <button
         type="button"
         class="music_button close"
       >
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
  music_list.appendChild(new_song);
  var songs = document.getElementsByClassName("songs");
  songs[songs.length - 1].addEventListener("ended", onMusicEnd);
  let last_id_audio = songs[songs.length - 1].id;
  idSongs.push(last_id_audio);
  verify_songs();
  document.getElementById("controls").style.display = "flex";
  update_music_list();

  new_song.addEventListener("click", (ev) => {
    play_on_click_li(ev, new_song);
  });
}
