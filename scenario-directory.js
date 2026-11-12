(() => {
  function openSection() {
    const id = window.location.hash.slice(1);
    if (!['environment', 'handoff'].includes(id)) return;
    const section = document.getElementById(id);
    if (section instanceof HTMLDetailsElement) {
      section.open = true;
      section.scrollIntoView({ block: 'start' });
    }
  }
  window.addEventListener('hashchange', openSection);
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a');
    if (anchor && anchor.hash === window.location.hash) openSection();
  });
  openSection();
})();
