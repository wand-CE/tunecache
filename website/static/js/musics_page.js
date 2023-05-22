import {
  update_playlist_songs_list,
  deleteAudio,
  editAudio,
  addData,
} from "../js/modules/conf_musics.js";

import { focusEnd } from "../js/modules/main_conf.js";

if (!window.location.href.includes("cantores/")) {
  document.getElementById("plus_circle_button").style.removeProperty("display");
}

var menu = document.getElementById("menu");

menu.querySelectorAll("*").forEach((elemento) => {
  elemento.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

window.addEventListener("click", (ev) => {
  if (ev.target.id == "plus_circle_button") {
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
});

if (document.getElementById("add_music_from_database")) {
  document
    .getElementById("add_music_from_database")
    .addEventListener("click", () => {
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
    });
}

const container = document.getElementById("sortable");

container.addEventListener("click", (event) => {
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
      const singer = document.getElementById(`author_song${idAudio}`);

      title.style.backgroundColor = "#474444";
      singer.style.backgroundColor = "#474444";

      const buttonParent = document.getElementById(idAudio);
      const newElement = document.createElement("button");
      newElement.className = "close check_change text-success";
      newElement.style.marginLeft = "5px";
      newElement.innerHTML = `<span aria-hidden="true" class="bi bi-check-square-fill"></span>`;

      buttonParent.insertBefore(newElement, buttonParent.childNodes[7]);

      const oldSingerName = singer.innerText;
      const oldTitleName = title.innerText;

      newElement.addEventListener("click", () => {
        editAudio(idAudio, oldSingerName, oldTitleName);
        newElement.remove();
        singer.removeAttribute("contentEditable");
        singer.style.backgroundColor = "";

        title.removeAttribute("contentEditable");
        title.style.backgroundColor = "";
      });

      focusEnd(singer);
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

var btn_add_music = document.getElementById("add_music");

btn_add_music.addEventListener("click", () => {
  addData(
    document.getElementById("url").value,
    document.getElementById("titulo").value,
    document.getElementById("autor").value
  );
});

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
