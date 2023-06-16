import { update_music_list } from "../modules/conf_player.js";

export function configureSortable() {
  $("#sortable").sortable({
    update: function () {
      update_music_list();
      index = Array.from(idSongs).indexOf(currentMusicId.id);
    },
  });
  $("#sortable").disableSelection();
}

let arrow_title = document.getElementById("arrow_title");
let arrow_singer = document.getElementById("arrow_singer");

export function shuffle_musics() {
  const lista_musicas = document.querySelector("#sortable");
  const itens_lista = Array.from(lista_musicas.children);

  arrow_title.className = "bi bi-arrow-down-up";
  arrow_singer.className = "bi bi-arrow-down-up";

  itens_lista.sort(() => 0.5 - Math.random());

  for (const item of itens_lista) {
    lista_musicas.appendChild(item);
  }

  update_music_list();

  index = Array.from(idSongs).indexOf(currentMusicId.id);
}

let sort_by_title = document.getElementById("title");
let title_click = 0;

let sort_by_singer = document.getElementById("singer");
let singer_click = 0;

sort_by_title.addEventListener("click", () => {
  title_click++;
  sort_musics(title_click, "title");
});

sort_by_singer.addEventListener("click", () => {
  singer_click++;
  sort_musics(singer_click, "singer");
});

function sort_musics(click, name_of_event) {
  const lista_musicas = document.querySelector("#sortable");
  const itens_lista = Array.from(lista_musicas.children);
  const arrow_title = document.getElementById("arrow_title");
  const arrow_singer = document.getElementById("arrow_singer");
  let sortFunction;

  if (name_of_event === "title") {
    sortFunction = (a, b) =>
      a.childNodes[1].innerText.localeCompare(b.childNodes[1].innerText);
    arrow_title.className =
      click % 2 !== 0 ? "bi bi-sort-alpha-down" : "bi bi-sort-alpha-up";
    arrow_singer.className = "bi bi-arrow-down-up";
  } else if (name_of_event === "singer") {
    sortFunction = (a, b) =>
      a.childNodes[3].innerText.localeCompare(b.childNodes[3].innerText);
    arrow_singer.className =
      click % 2 !== 0 ? "bi bi-sort-alpha-down" : "bi bi-sort-alpha-up";
    arrow_title.className = "bi bi-arrow-down-up";
  }

  itens_lista.sort(
    click % 2 !== 0 ? sortFunction : (a, b) => sortFunction(b, a)
  );

  itens_lista.forEach(function (item) {
    lista_musicas.appendChild(item);
  });

  update_music_list();

  index = Array.from(idSongs).indexOf(currentMusicId.id);
}

export function play_on_click_li(ev, li_ul_tag) {
  const target = ev.target;
  const targetClassName = target.className;

  if (
    targetClassName !== "bi bi-three-dots-vertical" &&
    !target.closest(".music_options") &&
    !target.closest(".check_change") &&
    target.contentEditable !== "true"
  ) {
    if (li_ul_tag.id !== "") {
      const new_index = Array.from(idSongs).indexOf(`song${li_ul_tag.id}`);
      if (index !== new_index) {
        index = new_index;
        currentMusicId.pause();
        currentMusicId.currentTime = 0;
        updateDataMusic(); /*
        currentMusicId.play();
      } else {
        if (currentMusicId.paused) {
          currentMusicId.play();
        }*/
      }
    }
  }
}
