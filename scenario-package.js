(() => {
  const panels = [...document.querySelectorAll('[data-config-panel]')];
  const showConfig = id => {
    panels.forEach(p => { p.hidden = p.dataset.configPanel !== id; });
    document.querySelectorAll('[data-config]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.config === id)));
    document.querySelectorAll('.sp-section-nav a:not([data-engineering-entry])').forEach(a => { a.href = '#' + id + '-' + a.getAttribute('href').split('-').pop(); });
  };
  panels.forEach(p => {
    const chooseAction = value => {
      if(p.hasAttribute('data-stage-reader')) {
        p.querySelector('[data-action-select]').value=value;
        p.querySelectorAll('[data-reader-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readerAction===value)));
        p.querySelectorAll('[data-stage-story]').forEach(n=>n.hidden=n.dataset.stageStory!==value);
        p.querySelectorAll('[data-stage-projection]').forEach(n=>n.hidden=n.dataset.stageProjection!==value);
        if(!value)p.querySelectorAll('.sp-full-toggle').forEach(n=>n.open=true);
      }
      p.querySelectorAll('.sp-full-diagram').forEach(graph => {
        graph.classList.toggle('has-action-focus', Boolean(value));
        graph.querySelectorAll('[data-actions]').forEach(item => {
          const active = Boolean(value) && JSON.parse(item.dataset.actions).includes(value);
          const support = Boolean(value) && JSON.parse(item.dataset.supportActions || '[]').includes(value);
          item.classList.toggle('is-action-match', active);
          item.classList.toggle('is-support-match', support && !active);
          item.classList.toggle('is-action-context', Boolean(value) && !active && !support);
        });
        graph.querySelectorAll('.sp-unit-node').forEach(node => {
          const rows=[...node.querySelectorAll('.sp-unit-item')];
          const matches=rows.filter(row=>row.classList.contains('is-action-match')||row.classList.contains('is-support-match')).length;
          node.classList.toggle('is-action-partial',Boolean(value)&&matches>0&&matches<rows.length);
          if(matches>0) node.classList.remove('is-action-context');
        });
        const status=graph.querySelector('[data-support-status]');
        if(status){
          const names=[...new Set([...graph.querySelectorAll('.sp-unit-item.is-support-match')].map(item=>item.querySelector('title').textContent))];
          status.hidden=names.length===0;
          status.textContent=names.length?'条件依赖：'+names.join('、')+'。':'';
        }
      });
    };
    const chooseView = value => {
      p.querySelectorAll('[data-view-panel]').forEach(v => { v.hidden = v.dataset.viewPanel !== value; });
      p.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === value)));
    };
    p.querySelector('[data-action-select]').addEventListener('change', event => chooseAction(event.target.value));
    p.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => chooseView(b.dataset.view)));
    p.querySelectorAll('[data-choose-action]').forEach(a => a.addEventListener('click', () => { p.querySelector('select').value = a.dataset.chooseAction; chooseAction(a.dataset.chooseAction); }));
    if(p.hasAttribute('data-stage-reader')) {
      p.querySelectorAll('[data-reader-action]').forEach(b=>b.addEventListener('click',()=>chooseAction(b.dataset.readerAction)));
      p.querySelector('select').value=p.querySelector('[data-reader-action]').dataset.readerAction;
      const dialog=p.querySelector('.sp-record-dialog'),content=dialog.querySelector('[data-record-content]');
      dialog.querySelector('[data-close-record]').addEventListener('click',()=>dialog.close());
      p.querySelectorAll('.sp-full-toggle').forEach(n=>n.addEventListener('toggle',()=>window.dispatchEvent(new Event('resize'))));
      p.addEventListener('click',event=>{
        const a=event.target.closest('a[href^="#"]');
        if(!a || !a.closest('.sp-reader,.sp-development-entry,.sp-record-dialog'))return;
        const target=document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
        if(!target)return;
        event.preventDefault();event.stopPropagation();
        const record=target.closest('tr')||target.closest('details')||target;
        const clone=record.cloneNode(true);
        clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
        if(clone.tagName==='DETAILS')clone.open=true;
        clone.querySelectorAll('details').forEach(n=>n.open=true);
        content.replaceChildren();
        if(clone.tagName==='TR') {const table=document.createElement('table');table.append(clone);content.append(table);} else content.append(clone);
        if(!dialog.open)dialog.showModal();
      },true);
    }
    chooseAction(p.querySelector('select').value); chooseView('functional');
  });
  document.querySelectorAll('[data-config]').forEach(b => b.addEventListener('click', () => showConfig(b.dataset.config)));
  document.querySelectorAll('[role=tablist]').forEach(list => list.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const tabs = [...list.querySelectorAll('[role=tab]')]; let index = tabs.indexOf(document.activeElement);
    index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault(); tabs[index].focus(); tabs[index].click();
  }));
  document.querySelectorAll('.sp-record-group').forEach(group=>group.addEventListener('toggle',()=>{
    if(!group.open) group.querySelectorAll('details').forEach(child=>{child.open=false;});
  }));
  function reveal() {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (!target) return;
    const p = target.closest('[data-config-panel]'); if (p) showConfig(p.dataset.configPanel);
    for (let n = target; n; n = n.parentElement) if (n.tagName === 'DETAILS') n.open = true;
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  }
  document.addEventListener('click', event => { if (event.target.closest('a[href^="#"]')) setTimeout(reveal, 0); });
  window.addEventListener('hashchange', reveal);
  if (panels.length) showConfig(panels[0].dataset.configPanel);
  reveal();
})();
