// Keep links to archived diagram anchors usable after their content is collapsed.
function revealLegacyTarget() {
  let id;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (!target) return;
  let ancestor = target.parentElement;
  let revealed = false;
  while (ancestor) {
    if (ancestor.tagName === "DETAILS" && !ancestor.open) {
      ancestor.open = true;
      revealed = true;
    }
    ancestor = ancestor.parentElement;
  }
  if (revealed) target.scrollIntoView();
}
window.addEventListener("hashchange", revealLegacyTarget);
revealLegacyTarget();
