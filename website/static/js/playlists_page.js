import {
  addPlaylist,
  editPlaylist,
  deletePlaylist,
} from "./modules/conf_playlists.js";
import { focusEnd } from "./modules/main_conf.js";

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

const container = document.getElementById("playlist_list");

container.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit_playlist_name")) {
    const elementoPai = event.target.parentElement.parentElement.parentElement;
    const optionsMenu = elementoPai.querySelector(".playlist_options");
    const editarPlaylist = elementoPai.querySelector(".rename_playlist");
    const excluirPlaylist = elementoPai.querySelector(".delete_playlist");

    editarPlaylist.addEventListener("click", () => {
      var play_title = document.getElementById(event.target.dataset.value);
      focusEnd(play_title);
      optionsMenu.style.display = "none";
    });

    excluirPlaylist.addEventListener("click", () => {
      deletePlaylist(event.target.dataset.value);
      document
        .getElementById(event.target.dataset.value)
        .closest(".col-md-3")
        .remove();
    });

    optionsMenu.style.display =
      optionsMenu.style.display === "block" ? "none" : "block";

    // Restante do código
  }
});
