import { addMusic_onSortable } from "./musics_page.js";

function addMusicToSinger(list_songs, singer_id) {
  fetch("/add_to_singer", {
    method: "PUT",
    body: JSON.stringify([list_songs, singer_id]),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro Interno");
      }
      return response.json();
    })
    .then((data) => {
      if (data["erro"]) {
        throw new Error(data["erro"]);
      } else {
        addMusic_onSortable(
          data["id"],
          data["title"],
          data["user_id"],
          data["singer"],
          data["filename"],
          data["thumb"]
        );
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

const btn_add_to_music = document.getElementById("add_music_to_singer");
const div_database = document.getElementById("data_from_database");
const singer_id = document.querySelector(".titulo_playlist").dataset.value;

btn_add_to_music.addEventListener("click", () => {
  document.getElementById("menu").style.display = "none";

  var audios = div_database.querySelectorAll('input[type="checkbox"]:checked');
  var list_songs = [];

  for (let i = 0; i < audios.length; i++) {
    list_songs.push(audios[i].value);
  }
  list_songs.forEach((song) => {
    addMusicToSinger(song, singer_id);
  });

  audios.forEach((addedSong) => {
    addedSong.closest("div").remove();
  });
});
