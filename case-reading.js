"use strict";
window.ATSCaseReading={
 select(bundle,view){
  const requested=new URLSearchParams(location.search).get('case');
  const key=requested==='transport'?'transport':'highway';
  const data=bundle.cases?.[key]||bundle;this.key=data.case_id||'transport';
  const chooser=document.getElementById('reading-case');
  if(chooser){chooser.value=this.key;chooser.addEventListener('change',()=>{const url=new URL(location.href);url.searchParams.set('case',chooser.value);const active=document.querySelector('[data-reader-stage][aria-pressed="true"],[data-data-stage][aria-pressed="true"],[data-equipment-stage][aria-pressed="true"],[data-itot-stage][aria-pressed="true"],[data-organization-stage][aria-pressed="true"]');if(active)url.searchParams.set('stage',active.dataset.readerStage||active.dataset.dataStage||active.dataset.equipmentStage||active.dataset.itotStage||active.dataset.organizationStage);location.assign(url.href);});}
  document.querySelectorAll('[data-case-transport-html]').forEach(n=>{n.innerHTML=n.getAttribute('data-case-'+this.key+'-html');});
  document.querySelectorAll('[data-case-only]').forEach(n=>{n.hidden=n.dataset.caseOnly!==this.key;});
  const attr={organization:'organizationStage',itot:'itotStage',functional:'readerStage',data:'dataStage',equipment:'equipmentStage'}[view];
  const selector={organization:'[data-organization-stage]',itot:'[data-itot-stage]',functional:'[data-reader-stage]',data:'[data-data-stage]',equipment:'[data-equipment-stage]'}[view];
  document.querySelectorAll(selector).forEach(n=>{const i=data.stages.findIndex(s=>s.key===n.dataset[attr]);if(i>=0)n.textContent=(data.stages[i].key==='improve'?'':String(i+1).padStart(2,'0')+' ')+data.stages[i].title;});
  if(view==='functional')document.querySelector('.reader-workspace-bar strong').textContent='案例对照 · '+data.case_title;
  document.querySelectorAll('.five-view-nav a').forEach(a=>this.link(a));
  return data;
 },
 link(a){if(!a)return;const url=new URL(a.getAttribute('href'),location.href);if(/architecture-(functional|data|equipment|itot|organization)\.html$/.test(url.pathname)){url.searchParams.set('case',this.key||'highway');a.setAttribute('href',url.pathname.split('/').pop()+url.search+url.hash);}},
 syncLinks(){document.querySelectorAll('#reader-data-link,#data-functional-link,#equipment-functional-link,#equipment-data-link,#itot-functional-link,#itot-data-link,#organization-functional-link,#organization-data-link').forEach(a=>this.link(a));const active=document.querySelector('[data-reader-stage][aria-pressed="true"],[data-data-stage][aria-pressed="true"],[data-equipment-stage][aria-pressed="true"],[data-itot-stage][aria-pressed="true"],[data-organization-stage][aria-pressed="true"]');document.querySelectorAll('.five-view-nav a').forEach(a=>{this.link(a);if(active&&/architecture-(functional|data|equipment|itot|organization)\.html/.test(a.getAttribute('href'))){const u=new URL(a.getAttribute('href'),location.href);u.searchParams.set('stage',active.dataset.readerStage||active.dataset.dataStage||active.dataset.equipmentStage||active.dataset.itotStage||active.dataset.organizationStage);const target=u.pathname.match(/architecture-(functional|data|equipment|itot|organization)\.html$/)?.[1];if(target)u.hash=target==='functional'?'functional-comparison':target+'-reader';a.setAttribute('href',u.pathname.split('/').pop()+u.search+u.hash);}});}
};
