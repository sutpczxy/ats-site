(() => {
  const directory = document.querySelector('.site-directory');
  const mobile = window.matchMedia('(max-width: 900px)');
  const resizeDirectory = () => { if (directory) directory.open = !mobile.matches; };
  resizeDirectory();
  mobile.addEventListener('change', resizeDirectory);

  const search = document.querySelector('.page-search');
  const input = document.getElementById('page-search-input');
  const results = document.getElementById('page-search-results');
  if (search && input && results) {
    const pages = Array.from(document.querySelectorAll('.sidebar .nav-list a')).map(a => ({
      title: a.textContent.trim(), href: a.getAttribute('href'),
    }));
    const list = results.querySelector('ul');
    const status = results.querySelector('[role="status"]');
    search.hidden = false;
    const update = () => {
      const query = input.value.trim().toLocaleLowerCase();
      list.replaceChildren();
      results.hidden = !query;
      if (!query) { status.textContent = ''; return; }
      const matches = pages.filter(page => (page.title + ' ' + page.href).toLocaleLowerCase().includes(query));
      status.textContent = matches.length ? `${matches.length} 个页面` : '未找到匹配页面';
      for (const page of matches) {
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = page.href;
        anchor.textContent = page.title;
        item.append(anchor);
        list.append(item);
      }
    };
    input.addEventListener('input', update);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { input.value = ''; update(); }
      if (event.key === 'ArrowDown' && !results.hidden) {
        const first = list.querySelector('a');
        if (first) { event.preventDefault(); first.focus(); }
      }
    });
  }

  const outline = document.querySelector('.page-outline');
  const links = outline ? Array.from(outline.querySelectorAll('a')) : [];
  const refreshOutline = () => {
    for (const anchor of links) {
      const target = document.getElementById(anchor.hash.slice(1));
      const panel = target?.closest('[data-phase-panel]');
      const visible = target && !target.closest('[hidden]') && (!panel || panel.classList.contains('is-active'));
      anchor.parentElement.hidden = !visible;
    }
  };
  refreshOutline();
  document.querySelectorAll('.phase-tab').forEach(tab => tab.addEventListener('click', () => {
    window.requestAnimationFrame(refreshOutline);
  }));
  if ('IntersectionObserver' in window && links.length) {
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!current) return;
      links.forEach(anchor => {
        if (anchor.hash === '#' + current.target.id) anchor.setAttribute('aria-current', 'location');
        else anchor.removeAttribute('aria-current');
      });
    }, { rootMargin: '-70px 0px -65% 0px' });
    links.forEach(anchor => { const heading = document.getElementById(anchor.hash.slice(1)); if (heading) observer.observe(heading); });
  }
})();
