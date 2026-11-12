"use strict";
(() => {
  if (document.body.dataset.fiveView !== 'functional') return;
  const nav = document.querySelector('.functional-local-nav');
  if (!nav) return;
  const items = [...nav.querySelectorAll('a')];
  const sections = items.map(a => document.getElementById(a.hash.slice(1)));
  const back = document.createElement('a');
  back.className = 'functional-reading-return';
  back.hidden = true;
  back.textContent = '↑ 返回刚才的阅读位置';
  document.body.append(back);
  function offset() {
    const topbar = Math.ceil(document.querySelector('.topbar')?.getBoundingClientRect().height || 0);
    document.documentElement.style.setProperty('--functional-topbar', topbar + 'px');
    const height = topbar + Math.ceil(nav.getBoundingClientRect().height) + 20;
    document.documentElement.style.setProperty('--functional-nav-offset', height + 'px');
    return height;
  }
  function highlight() {
    const threshold = offset() + 24;
    let active = 0;
    sections.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= threshold) active = i; });
    items.forEach((item, i) => {
      if (i === active) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  }
  function reveal(target) {
    const search = document.getElementById('view-search');
    if (search?.value) {
      search.value = '';
      search.dispatchEvent(new Event('input', {bubbles: true}));
    }
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
    const panel = target.closest('[role="tabpanel"]');
    if (panel?.hidden) document.querySelector('[data-panel="'+panel.id+'"]')?.click();
    requestAnimationFrame(() => {
      target.scrollIntoView({block: 'start'});
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
      highlight();
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    let key;
    try { key = decodeURIComponent(link.hash.slice(1)); } catch { return; }
    const target = document.getElementById(key);
    if (!target) return;
    const origin = link.closest('.design-stage, .example-grid>li, .scenario-stages>li, #implementation, #functional-comparison');
    if (origin && target.closest('.view-record-group')) {
      back.href = '#' + origin.id;
      back.textContent = '↑ 返回' + (origin.querySelector('h3,h2')?.textContent.trim() || '刚才的阅读位置');
      back.hidden = false;
    } else if (link === back || link.closest('.functional-local-nav') || target.closest('.functional-story')) back.hidden = true;
    // Explicitly reveal also when the same hash is clicked after a section was closed.
    event.preventDefault();
    if (location.hash !== link.hash) location.hash = link.hash;
    reveal(target);
  });
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; highlight(); });
  }, {passive: true});
  window.addEventListener('resize', highlight);
  window.addEventListener('hashchange', () => {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    if (target) reveal(target);
    if (target?.closest('.functional-story')) back.hidden = true;
  });
  highlight();
})();
