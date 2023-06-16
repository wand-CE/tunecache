import {
  addPlaylist,
  editPlaylist,
  deletePlaylist,
} from "./modules/conf_playlists.js";
import { focusEnd } from "./modules/main_conf.js";

var menu = document.getElementById("menu");
var playlist_title = document.getElementById("new_playlist_title");

const container = document.getElementById("playlist_list");

container.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit_playlist_name")) {
    const elementoPai = event.target.parentElement.parentElement.parentElement;
    const optionsMenu = elementoPai.querySelector(".playlist_options");
    const editarPlaylist = elementoPai.querySelector(".rename_playlist");
    const excluirPlaylist = elementoPai.querySelector(".delete_playlist");
    const play_title = document.querySelector(
      `.playlist${event.target.dataset.value}`
    );

    editarPlaylist.addEventListener("click", () => {
      focusEnd(play_title);
      optionsMenu.style.display = "none";
    });

    excluirPlaylist.addEventListener("click", () => {
      deletePlaylist(event.target.dataset.value);
      play_title.closest(".col-md-3").remove();
    });

    optionsMenu.style.display =
      optionsMenu.style.display === "block" ? "none" : "block";
  }
});

window.addEventListener("click", (ev) => {
  if (ev.target.closest("#menu") || ev.target.closest("#btn_add_playlist")) {
    menu.style.display = "block";
    if (ev.target.closest(".add_playlist")) {
      menu.style.display = "none";
    }
  } else {
    menu.style.display = "none";
  }
});

document.querySelector(".add_playlist").addEventListener("click", () => {
  if (!(playlist_title.value.trim() === "")) {
    addPlaylist(playlist_title.value);
    playlist_title.value = "";
  } else {
    alert("Nome inválido");
  }
});
