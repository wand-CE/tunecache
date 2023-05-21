function addeventListener_edit() {
  var buttons_edit = document.getElementsByClassName("edit_audio");

  for (let i = 0; i < buttons_edit.length; i++) {
    buttons_edit[i].addEventListener("click", (ev) => {
      const elementExists = document.querySelector(".check_change");

      if (!elementExists) {
        const title = document.getElementById(
          `title_song${ev.target.dataset.target}`
        );
        const singer = document.getElementById(
          `author_song${ev.target.dataset.target}`
        );
        title.style.backgroundColor = "#474444";
        singer.style.backgroundColor = "#474444";

        let id = ev.target.dataset.target;

        // seleciona o elemento pai do botão
        const buttonParent = document.getElementById(`${id}`);

        // cria o novo elemento
        const newElement = document.createElement("button");

        newElement.className = "close check_change text-success";
        newElement.style.marginLeft = "5px";
        newElement.innerHTML = `<span aria-hidden="true" class="bi bi-check-square-fill"></span>`;

        buttonParent.insertBefore(newElement, buttonParent.childNodes[7]);

        const old_singer_name = singer.innerText;
        const old_title_name = title.innerText;

        newElement.addEventListener("click", () => {
          editAudio(id, old_singer_name, old_title_name);
          newElement.remove();
          singer.removeAttribute("contentEditable");
          singer.style.backgroundColor = "";

          title.removeAttribute("contentEditable");
          title.style.backgroundColor = "";
        });

        focusEnd(singer);
        focusEnd(title);
      }
    });
  }
}
addeventListener_edit();

var select_elements = document.querySelector(".playlists").children;

for (let i = 0; i < select_elements.length; i++) {
  select_elements[i].addEventListener("click", (ev) => {
    if (ev.target.id == "from_url") {
      document.getElementsByClassName("data_from_url")[0].style.display =
        "block";
      document.getElementsByClassName("data_from_database")[0].style.display =
        "none";
    } else if (ev.target.id == "from_database") {
      document.getElementsByClassName("data_from_database")[0].style.display =
        "block";
      document.getElementsByClassName("data_from_url")[0].style.display =
        "none";
    }
  });
}
