import {
  configureSortable,
  shuffle_musics,
  verify_songs,
} from "../js/modules/conf_player.js";

$(document).ready(function () {
  configureSortable();
});

let shuffle_button = document.getElementById("shuffle_musics");

shuffle_button.addEventListener("click", shuffle_musics);

verify_songs();
