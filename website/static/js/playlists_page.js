import {
  addPlaylist,
  editPlaylist,
  deletePlaylist,
} from "./modules/conf_playlists.js";

import { focusEnd, doneButton, removeFocus } from "./modules/main_conf.js";

var menu = document.getElementById("menu");
var playlist_title = document.getElementById("new_playlist_title");

const container = document.getElementById("playlist_list");

var id_playlist;

container.addEventListener("click", (event) => {
  if (!document.querySelector(".check_change")) {
    if (event.target.classList.contains("edit_playlist_name")) {
      const elementoPai =
        event.target.parentElement.parentElement.parentElement;
      const optionsMenu = elementoPai.querySelector(".playlist_options");
      const editarPlaylist = elementoPai.querySelector(".rename_playlist");
      const excluirPlaylist = elementoPai.querySelector(".delete_playlist");
      id_playlist = event.target.dataset.value;
      const title = document.getElementById(`playlist${id_playlist}`);

      if (!document.querySelector(".close")) {
        editarPlaylist.addEventListener("click", editarPlaylistClickHandler);
      }

      excluirPlaylist.addEventListener("click", () => {
        if (confirm("Você tem certeza em excluir essa playlist?")) {
          deletePlaylist(event.target.dataset.value);
          title.closest(".col-md-3").remove();
        }
      });

      optionsMenu.style.display =
        optionsMenu.style.display === "block" ? "none" : "block";
    }
  }
});

const editarPlaylistClickHandler = (event) => {
  event.target.parentElement.parentElement.style.display = "none";
  const three_dots_element = event.target.parentElement.querySelector(
    ".edit_playlist_name"
  );
  const title = document.getElementById(`playlist${id_playlist}`);

  doneButton.style.right = "25px";
  event.target.parentElement.parentElement.parentElement
    .querySelector(".card-title")
    .insertBefore(doneButton, three_dots_element);

  doneButton.addEventListener("click", confirmEditarPlaylistClickHandler);
  focusEnd(document.getElementById(`playlist${id_playlist}`));
  var playlist_element = document.getElementById(`playlist${id_playlist}`);
  playlist_element.style.maxWidth = "70%";
  if (playlist_element.tagName == "INPUT") {
    playlist_element.closest("a").removeAttribute("href");
  }
};

const confirmEditarPlaylistClickHandler = () => {
  var new_title = document.getElementById(`playlist${id_playlist}`);
  editPlaylist(id_playlist, new_title.value);
  document
    .querySelector(`#playlist${id_playlist}`)
    .closest(".col-md-3")
    .querySelectorAll("a")
    .forEach((item) => {
      if (!item.classList.contains("edit_playlist_name"))
        item.href = `/playlists/${new_title.value}`;
    });

  removeFocus(document.getElementById(`playlist${id_playlist}`));

  doneButton.remove();
  doneButton.replaceWith(doneButton.cloneNode(true));
};

window.addEventListener("click", (ev) => {
  if (ev.target.closest("#menu") || ev.target.closest("#btn_add_playlist")) {
    menu.style.display = "block";
    if (ev.target.closest(".add_playlist")) {
      menu.style.display = "none";
    }
  } else {
    menu.style.display = "none";
  }

  if (!ev.target.classList.contains("edit_playlist_name")) {
    document.querySelectorAll(".playlist_options").forEach((item) => {
      item.style.display = "none";
    });
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
