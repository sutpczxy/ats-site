"use strict";
(() => {
  const tabs = [...document.querySelectorAll('.five-view-tabs [role="tab"]')];
  const panels = tabs.map(t => document.getElementById(t.dataset.panel));
  const search = document.getElementById('view-search');
  const groups = [...document.querySelectorAll('.view-record-group')];
  const output = document.getElementById('view-result');
  function activate(id) {
    tabs.forEach((t, i) => {
      const selected = t.dataset.panel === id;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t.dataset.panel));
    t.addEventListener('keydown', event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
        event.key === 'ArrowRight' ? (i+1)%tabs.length : event.key === 'ArrowLeft' ? (i+tabs.length-1)%tabs.length : -1;
      if (next >= 0) { event.preventDefault(); activate(tabs[next].dataset.panel); tabs[next].focus(); }
    });
  });
  function filter() {
    const q = search.value.trim().toLocaleLowerCase();
    let matches = 0;
    groups.forEach(group => [...group.children].forEach(item => {
      if (item.tagName === 'H2' || item.classList.contains('view-anchor-aliases')) return;
      const match = !q || item.textContent.toLocaleLowerCase().includes(q);
      item.hidden = !match;
      if (!q) {
        if (item.tagName === 'DETAILS') item.open = false;
        item.querySelectorAll('details').forEach(d => { d.open = false; });
      }
      if (match && q) {
        matches++;
        if (item.tagName === 'DETAILS') item.open = true;
        item.querySelectorAll('details').forEach(d => { d.open = d.textContent.toLocaleLowerCase().includes(q); });
      }
    }));
    output.textContent = q ? `${matches} 组匹配内容` : '';
  }
  search?.addEventListener('input', filter);
  document.getElementById('clear-view-search')?.addEventListener('click', () => { search.value=''; filter(); search.focus(); });
  function reveal() {
    let id;
    try { id=decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target=document.getElementById(id);
    if (!target) return;
    if (search.value) { search.value=''; filter(); }
    const panel=target.closest('[role="tabpanel"]');
    if (panel) activate(panel.id);
    for (let n=target; n; n=n.parentElement) if (n.tagName === 'DETAILS') n.open=true;
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  }
  window.addEventListener('hashchange', reveal);
  document.querySelectorAll('[data-concept-relations]').forEach(n => {
    n.addEventListener('click', event => {
      const code=n.dataset.conceptRelations.split(' ')[0];
      const local=document.querySelector(`[data-interface-note="${code}"] .condition`) || document.querySelector(`[data-canonical="${code}"]`) || document.getElementById(code);
      if (local?.id) { event.preventDefault(); location.hash=local.id; reveal(); }
    });
  });
  document.querySelectorAll('.functional-map svg').forEach(svg => {
    const relations=[...svg.querySelectorAll('[data-relation]')];
    if (relations.length && svg.closest('[aria-labelledby="detail-tab"]')) {
      const category=n=>n.dataset.channel || n.dataset.relation.match(/^ATS-([A-Z]+)/)?.[1] || '概念关系';
      const label=document.createElement('label');label.className='view-relation-filter';label.textContent='关系范围 ';
      const select=document.createElement('select');select.setAttribute('aria-label','详图关系范围');
      const all=document.createElement('option');all.value='';all.textContent='全部关系';select.append(all);
      [...new Set(relations.map(category))].sort().forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);});
      label.append(select);svg.closest('.functional-map').before(label);
      select.addEventListener('change',()=>{
        const visible=new Set();
        relations.forEach(n=>{const show=!select.value||category(n)===select.value;n.style.display=show?'':'none';if(show)visible.add(n.dataset.relation);});
        svg.querySelectorAll('[data-label]').forEach(n=>n.style.display=visible.has(n.dataset.label)?'':'none');
      });
    }
    const projections=[...svg.querySelectorAll('[data-route]')];
    if (projections.length) {
      svg.querySelectorAll('[data-label]').forEach(label => {
        const href=label.closest('a')?.getAttribute('href');
        if (href?.startsWith('#')) label.dataset.route=href.slice(1);
      });
      svg.querySelectorAll('[data-route]').forEach(n => {
        const active=on => {
          svg.classList.toggle('has-active-relation',on);
          projections.forEach(p=>p.classList.toggle('active-relation',on&&p.dataset.route===n.dataset.route));
        };
        n.addEventListener('mouseenter',()=>active(true));n.addEventListener('mouseleave',()=>active(false));
        n.addEventListener('focusin',()=>active(true));n.addEventListener('focusout',()=>active(false));
      });
    }
    svg.querySelectorAll('[data-concept-relations]').forEach(n => {
      const set=active => n.querySelectorAll('path:not([stroke="transparent"])').forEach(p => p.style.strokeWidth=active?'5':'3');
      n.addEventListener('mouseenter',()=>set(true));n.addEventListener('mouseleave',()=>set(false));
      n.addEventListener('focusin',()=>set(true));n.addEventListener('focusout',()=>set(false));
    });
  });
  if (location.hash) reveal();
})();
