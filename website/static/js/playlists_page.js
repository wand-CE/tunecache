import {
  addPlaylist,
  editPlaylist,
  deletePlaylist,
} from "./modules/conf_playlists.js";
import { focusEnd, doneButton, removeFocus } from "./modules/main_conf.js";

var menu = document.getElementById("menu");
var playlist_title = document.getElementById("new_playlist_title");

const container = document.getElementById("playlist_list");

container.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit_playlist_name")) {
    const elementoPai = event.target.parentElement.parentElement.parentElement;
    const optionsMenu = elementoPai.querySelector(".playlist_options");
    const editarPlaylist = elementoPai.querySelector(".rename_playlist");
    const excluirPlaylist = elementoPai.querySelector(".delete_playlist");
    const id_playlist = event.target.dataset.value;
    const play_title = document.querySelector(`.playlist${id_playlist}`);

    editarPlaylist.addEventListener("click", () => {
      const three_dots_element = event.target.parentElement.querySelector(
        ".edit_playlist_name"
      );
      doneButton.style.right = "25px";
      event.target.parentElement.insertBefore(doneButton, three_dots_element);
      optionsMenu.style.display = "none";
      doneButton.addEventListener("click", () => {
        const new_title = document.querySelector(`.playlist${id_playlist}`);
        editPlaylist(id_playlist, new_title.value);
        doneButton.remove();
        removeFocus(new_title);
      });
      focusEnd(play_title);
      document.querySelector(`.playlist${id_playlist}`).style.maxWidth = "70%";
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
    addPlaylist(playlist_title.value.trim());
    playlist_title.value = "";
  } else {
    alert("Nome inválido");
  }
});
