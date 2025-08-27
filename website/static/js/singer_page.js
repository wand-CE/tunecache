import {addMusic_onSortable} from "./musics_page.js";
import {
    controls,
    tocar,
    sound,
    isPlaying,
    update_music_list,
} from "./player.js";

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
            if (data["error"]) {
                throw new Error(data["error"]);
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

export function removeFromSinger(pageName, singerId, musicId) {
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

        if (confirm("Você tem certeza em remover essa música da playlist?")) {
            removeFromSinger("singer", singer_id, id_audio);
        }
    }
});
