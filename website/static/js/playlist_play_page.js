import {
  controls,
  tocar,
  sound,
  isPlaying,
  update_music_list,
} from "./player.js";

function removeFromPlaylist(pageName, singerId, musicId) {
  fetch("/remove-from-playlist-singer", {
    method: "PUT",
    body: JSON.stringify([pageName, singerId, musicId]),
  })
    .then((res) => {
      return res.json();
    })
    .then(() => {
      var parent = document.querySelector(".list-group");
      var music_removed = document.querySelector(`.audio_lista${musicId}`);

      const src = document.getElementById(`song${musicId}`).src;

      let howl = Howler._howls;

      for (let i = 0; i < howl.length; i++) {
        if (howl[i]._src == src) {
          if (howl[i] == sound) {
            if (isPlaying) {
              if (parent.querySelectorAll("li").length == 1) {
                tocar();
              }
            }
          }
          howl[i].unload();
          break;
        }
      }
      music_removed.remove();

      update_music_list();

      if (parent.querySelectorAll("li").length == 1) {
        controls.style.display = "none";
      }
      alert("Música removida da playlist");
    });
}

window.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove_from_playlist")) {
    const id_audio = event.target.dataset.audio_id;
    const singer_id = event.target.dataset.playlist_id;

    removeFromPlaylist("playlist", singer_id, id_audio);
  }
});
