var old_element;
export function focusEnd(element) {
  var new_element = document.createElement("input");
  old_element = element;
  element.before(new_element);
  new_element.id = element.id;
  new_element.classList = element.classList;
  new_element.classList.add("bg-dark", "text-light");
  new_element.value = element.innerText;
  element.remove();

  new_element.addEventListener("touchstart", function (e) {
    e.stopPropagation();
    new_element.setSelectionRange(
      new_element.value.length,
      new_element.value.length
    );
  });

  new_element.focus();
  new_element.setSelectionRange(
    new_element.value.length,
    new_element.value.length
  );
}

export function removeFocus(element) {
  old_element.innerText = element.value;
  element.focus();
  element.before(old_element);
  element.setSelectionRange(0, 0);
  old_element.removeAttribute("style");
  element.remove();
}

export var isMobileDevice =
  /Mobi/i.test(navigator.userAgent) ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const doneButton = document.createElement("button");
doneButton.className = "close check_change";
doneButton.style.position = "absolute";
doneButton.style.right = "100px";
doneButton.innerHTML = `<span aria-hidden="true" class="bi bi-check-square-fill text-success"></span>`;
