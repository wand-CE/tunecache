import { update_music_list } from "../player.js";

let arrow_title = document.getElementById("arrow_title");

export function shuffle_musics() {
  const lista_musicas = document.querySelector("#sortable");
  const itens_lista = Array.from(lista_musicas.children);

  arrow_title.className = "bi bi-arrow-down-up";

  itens_lista.sort(() => 0.5 - Math.random());

  for (const item of itens_lista) {
    lista_musicas.appendChild(item);
  }

  update_music_list();
}

let sort_by_title = document.getElementById("title");
let title_click = 0;

sort_by_title.addEventListener("click", () => {
  title_click++;
  sort_musics(title_click, "title");
});

function sort_musics(click, name_of_event) {
  const lista_musicas = document.querySelector("#sortable");
  const itens_lista = Array.from(lista_musicas.children);
  const arrow_title = document.getElementById("arrow_title");
  let sortFunction;

  if (name_of_event === "title") {
    sortFunction = (a, b) =>
      a.childNodes[5].innerText.localeCompare(b.childNodes[5].innerText);
    arrow_title.className =
      click % 2 !== 0 ? "bi bi-sort-alpha-down" : "bi bi-sort-alpha-up";
  }

  itens_lista.sort(
    click % 2 !== 0 ? sortFunction : (a, b) => sortFunction(b, a)
  );

  itens_lista.forEach(function (item) {
    lista_musicas.appendChild(item);
  });

  update_music_list();
}
