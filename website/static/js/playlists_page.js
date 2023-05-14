function editPlaylist(id, new_title) {
  fetch("/edit-playlist-title", {
    method: "PUT",
    body: JSON.stringify([id, new_title]),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

function focusEnd(element) {
  element.contentEditable = true;
  element.style.cursor = "context-menu";
  element.innerText += " ";
  element.focus();

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

document.getElementById("edit_playlist_name").addEventListener("click", () => {
  var playlist_id = document.getElementById("edit_playlist_name").dataset.value;
  var title = document.getElementById(`${playlist_id}`);
  focusEnd(title);
  console.log(title.innerText);
  //editPlaylist(playlist_id);
});

document.getElementById("btn_add_playlist").addEventListener("click", () => {
  document.getElementById("new_playlist").style.display = "block";
});
