function editPlaylist(id, new_title) {
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

document.getElementById("btn_add_playlist").addEventListener("click", () => {
  var menu = document.getElementById("menu");
  if (menu.style.display == "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
});

document.querySelector(".add_playlist").addEventListener("click", () => {
  var playlist_title = document.getElementById("new_playlist_title");
  addPlaylist(playlist_title.value);
  document.getElementById("menu").style.display = "none";
  playlist_title.value = "";
});

document.querySelectorAll(".edit_playlist_name").forEach((item) => {
  item.addEventListener("click", () => {
    var optionsMenu =
      item.parentElement.parentElement.parentElement.querySelector(
        ".playlist_options"
      );
    optionsMenu.style.display =
      optionsMenu.style.display === "block" ? "none" : "block";
    /*
    if (ev.target.className == "edit_playlist") {
      console.log("caguei");
    } else if (ev.target.className == "delete_playlist") {
      console.log("preto");
    }
    var playlist_id = item.dataset.value;
    var title = document.getElementById(`${playlist_id}`);
    focusEnd(title);
    console.log(title.innerText);
    //editPlaylist(playlist_id);
    */
  });
});
