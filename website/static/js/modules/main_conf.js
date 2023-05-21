export function focusEnd(element) {
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
