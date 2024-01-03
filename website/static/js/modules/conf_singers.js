export function addSinger(singerName) {
  fetch("/add-singer", {
    method: "POST",
    body: JSON.stringify({ singerName: singerName }),
  })
    .then((_res) => {
      return _res.json();
    })
    .then((data) => {
      addOnCol(data[0], data[1]);
    });
}

export function editSinger(id, new_name) {
  fetch("/edit-singer-name", {
    method: "PUT",
    body: JSON.stringify([id, new_name]),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

export function deleteSinger(id) {
  fetch("/delete-singer", {
    method: "DELETE",
    body: JSON.stringify(id),
  })
    .then((response) => response.json())
    .then((data) => alert(data[0]));
}

function addOnCol(title, id) {
  const playlist_list = document.getElementById("playlist_list");
  const new_playlist = document.createElement("div");
  new_playlist.classList.add("col-md-3", "mb-3");

  new_playlist.innerHTML = `
    <a href="/cantores/${title}" class="text-light">
      <div class="card bg-dark">
        <img src="https://via.placeholder.com/350x350" class="card-img-top" />          
        <h5 class="card-title my-2">
          <span
            id="playlist${id}"
            class="pl-1"
            style="
              display: inline-block;
              max-width: 90%;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
          ${title}
          </span>
          <a
            class="bi bi-three-dots-vertical float-right edit_playlist_name"
            style="display: inline-block; cursor: pointer"
            data-value="${id}"
          ></a>
        </h5>
      </div>
    </a>
    <div class="playlist_options">
      <ul>
        <li class="rename_playlist">Renomear</li>
        <li class="delete_playlist">Excluir</li>
      </ul>
    </div>`;

  playlist_list.appendChild(new_playlist);
}
