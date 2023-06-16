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

var isMobileDevice =
  /Mobi/i.test(navigator.userAgent) ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export { isMobileDevice };
