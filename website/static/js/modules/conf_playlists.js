export function addPlaylist(playlistTitle) {
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
        <a href="/playlists/${playlistTitle}" class="text-light">
          <div class="card bg-dark">
            <img src="https://via.placeholder.com/350x350" class="card-img-top" />
            <h5 class="card-title my-2">
            <span id="{{playlist.id}}" class="px-1"> ${playlistTitle} </span>
            <a
              class="bi bi-three-dots-vertical text-light float-right edit_playlist_name"
              data-value="{{playlist.id}}"
              style="cursor: pointer"
            >
            </a>
            </h5>
          </div>
        </a>
        <div class="playlist_options">
        <ul>
          <li class="edit_playlist">Editar</li>
          <li class="delete_playlist">Excluir</li>
        </ul>
      </div>
      `;
    playlist_list.appendChild(new_playlist);
  });
}

export function editPlaylist(id, new_title) {
  fetch("/edit-playlist-title", {
    method: "PUT",
    body: JSON.stringify([id, new_title]),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

export function deletePlaylist(id) {
  fetch("/delete-playlist", {
    method: "DELETE",
    body: JSON.stringify(id),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      alert(data[0]);
    });
}
