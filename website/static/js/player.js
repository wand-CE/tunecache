/*
import { verify_songs } from "../js/modules/conf_player.js";
import {
  configureSortable,
  shuffle_musics,
} from "../js/modules/sort_musics.js";

$(document).ready(function () {
  configureSortable();
});


let shuffle_button = document.getElementById("shuffle_musics");

shuffle_button.addEventListener("click", shuffle_musics);

verify_songs();
*/
import { init_player } from "../js/modules/conf_player.js";

init_player();
