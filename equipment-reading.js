"use strict";
(() => {
 const root=document.getElementById('equipment-reader');if(!root)return;
 const data=window.ATSCaseReading.select(JSON.parse(document.getElementById('equipment-case-model').textContent),'equipment');
 const $=id=>document.getElementById(id), make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const n=make('button',text);n.type='button';n.addEventListener('click',fn);return n;};
 const sources={simple:$('equipment-overview').querySelector('svg'),detail:$('equipment-detail').querySelector('svg')};
 let stage=data.stages[0],view='stage',zoom=1,serial=0;
 const graph=$('equipment-stage-graph'),panel=$('equipment-case-panel');
 const holder=document.createComment('data reader position');root.before(holder);
 const focus=make('dialog',null,'equipment-focus-dialog');focus.setAttribute('aria-label','装备视图一屏阅读');document.body.append(focus);
 const expand=root.querySelector('[data-equipment-expand]');
 function leaveFocus(){if(focus.open)focus.close();if(root.parentElement===focus)holder.after(root);expand.textContent='一屏阅读';}
 expand.addEventListener('click',()=>{if(focus.open){leaveFocus();return;}focus.append(root);focus.showModal();expand.textContent='退出一屏阅读';requestAnimationFrame(fit);});
 focus.addEventListener('close',()=>{if(!focus.open)leaveFocus();});
 const modal=make('dialog',null,'equipment-record-dialog');modal.setAttribute('aria-label','装备配置说明');
 const mh=make('header'),mt=make('strong','记录说明'),close=button('关闭 · 返回阅读',()=>modal.close());mh.append(mt,close);
 const history=make('nav'),back=button('← 上一条',()=>navigate(-1)),forward=button('下一条 →',()=>navigate(1)),pos=make('span');history.append(back,pos,forward);
 const content=make('div',null,'equipment-record-content');content.tabIndex=0;modal.append(mh,history,content);document.body.append(modal);
 let entries=[],index=-1,origin=null,scroll=null;
 function save(){if(index>=0){entries[index].top=content.scrollTop;entries[index].left=content.scrollLeft;entries[index].open=[...content.querySelectorAll('details')].map(n=>n.open);}}
 function clean(source){const copy=source.cloneNode(true);[copy,...copy.querySelectorAll('*')].forEach(n=>{n.removeAttribute('id');n.removeAttribute('hidden');n.removeAttribute('data-preserved-section');});copy.querySelectorAll('script,style').forEach(n=>n.remove());return copy;}
 function showRecord(id,trigger){id=data.records[id]?.anchor||id;if(!$(id))return;if(!modal.open){origin=trigger;scroll={left:window.scrollX,top:window.scrollY};entries=[];index=-1;}save();entries=entries.slice(0,index+1);entries.push({id});index=entries.length-1;if(!modal.open)modal.showModal();paintRecord();}
 function paintRecord(){const entry=entries[index],source=$(entry.id),row=source.closest('tr');content.replaceChildren();
  mt.textContent=Object.values(data.records).find(r=>r.anchor===entry.id)?.name||data.relations[entry.id]?.label||'设计说明';
  if(row){const table=make('table');const head=row.closest('table').querySelector('thead');if(head)table.append(clean(head));const tbody=make('tbody');tbody.append(clean(row));table.append(tbody);content.append(table);}
  else {const copy=clean(source);if(copy.tagName==='DETAILS')copy.open=true;content.append(copy);}
  if(entry.open)content.querySelectorAll('details').forEach((n,i)=>n.open=!!entry.open[i]);
  back.disabled=index===0;forward.disabled=index===entries.length-1;pos.textContent=(index+1)+' / '+entries.length;
  requestAnimationFrame(()=>{content.scrollTop=entry.top||0;content.scrollLeft=entry.left||0;content.focus({preventScroll:true});});
 }
 function navigate(delta){if(index+delta<0||index+delta>=entries.length)return;save();index+=delta;paintRecord();}
 modal.addEventListener('close',()=>{if(origin?.isConnected)origin.focus({preventScroll:true});if(scroll)window.scrollTo({...scroll,behavior:'instant'});});
 const ref=(id,label)=>{const b=button(label||data.records[id]?.brief||data.records[id]?.name||data.relations[id]?.label||id,()=>showRecord(id,b));b.dataset.recordRef=id;return b;};
 function render(){
  root.querySelectorAll('[data-equipment-stage]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.equipmentStage===stage.key)));
  $('equipment-stage-note').textContent=stage.moment+' · '+stage.note;
  panel.replaceChildren(make('h3',stage.title),make('p',data.task,'equipment-case-label'));
  stage.cards.forEach(([title,text])=>{const card=make('article',null,'equipment-case-card');card.append(make('h4',title),make('p',text));panel.append(card);});
  const records=make('div',null,'equipment-record-chips');stage.focus.forEach(id=>records.append(ref(id)));panel.append(make('h4','本阶段查阅'),records);
  $('equipment-functional-link').href='architecture-functional.html?stage='+stage.key+'#functional-comparison';
  $('equipment-data-link').href='architecture-data.html?stage='+stage.key+'#data-reader';
  window.ATSCaseReading.syncLinks();
  const i=data.stages.indexOf(stage);root.querySelectorAll('[data-equipment-move]').forEach(n=>n.disabled=i+Number(n.dataset.equipmentMove)<0||i+Number(n.dataset.equipmentMove)>=data.stages.length);
  draw();
 }
 function draw(){
  graph.replaceChildren();$('equipment-definition').replaceChildren();zoom=1;graph.style.touchAction=view==='stage'?'auto':'none';graph.style.cursor=view==='stage'?'auto':'grab';
  root.querySelectorAll('[data-equipment-view]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.equipmentView===view)));
  root.querySelector('.equipment-zoom').hidden=view==='stage';
  root.querySelector('.equipment-graph-hint').textContent=view==='simple'?'简图汇总跨组关系，组内关系在详图展开。点击查看具体成员和连线。':'按本阶段的具体承载位置高亮。AL为功能分配，DP指向所需服务，其他箭头表示消息方向。';
  if(view==='stage'){
   stage.relations.forEach(id=>{const r=data.relations[id],row=make('div',null,'equipment-relation-row'),middle=make('div');middle.append(ref(id,r.label+' →'),make('small',r.canonical));row.append(ref(r.source),middle,ref(r.target));graph.append(row);});
   const note=make('p','这里只列本阶段涉及的具体配置关系。点击关系名称查看原始功能端点、承载条件和配置依据。','equipment-small');graph.append(note);return;
  }
  const svg=sources[view].cloneNode(true),prefix='equipment-clone-'+(++serial)+'-';
  // Namespaced SVG IDs retain local markers while record links keep canonical anchors.
  const ids=new Map();svg.querySelectorAll('[id]').forEach(n=>{ids.set(n.id,prefix+n.id);n.id=prefix+n.id;});
  [svg,...svg.querySelectorAll('*')].forEach(n=>{for(const a of [...n.attributes]){let v=a.value;ids.forEach((next,old)=>{v=v.replaceAll('url(#'+old+')','url(#'+next+')');});if(v!==a.value)n.setAttribute(a.name,v);}});
  svg.querySelectorAll('[data-node]').forEach(n=>n.classList.add(stage.nodes.includes(n.dataset.node)?'equipment-active':'equipment-muted'));
  svg.querySelectorAll('[data-equipment-route]').forEach(n=>n.classList.add(stage.relations.includes(n.dataset.equipmentRoute)?'equipment-active':'equipment-muted'));
  svg.querySelectorAll('[data-concept-node]').forEach(n=>{const members=(n.dataset.members||'').split(' ');n.classList.add(members.some(id=>stage.nodes.includes(id))?'equipment-active':'equipment-muted');});
  svg.querySelectorAll('[data-concept-relations]').forEach(n=>n.classList.add((n.dataset.conceptRelations||'').split(' ').some(id=>stage.relations.includes(id))?'equipment-active':'equipment-muted'));
  if(view==='simple')svg.querySelectorAll('[data-concept-node]').forEach(n=>{
   const counts=stage.projection?.groups[n.dataset.conceptNode];if(!counts)return;
   const labels=[];if(counts.inside.length)labels.push('组内 '+counts.inside.length+' 条');if(counts.detail.length)labels.push('详图另有 '+counts.detail.length+' 条');if(!labels.length)return;
   const rect=n.querySelector('rect'),badge=document.createElementNS('http://www.w3.org/2000/svg','text');badge.setAttribute('x',Number(rect.getAttribute('x'))+18);badge.setAttribute('y',Number(rect.getAttribute('y'))+148);badge.setAttribute('font-size','19');badge.setAttribute('fill','#234f65');badge.textContent=labels.join(' · ');n.append(badge);
  });
  graph.append(svg);requestAnimationFrame(fit);
 }
 function fit(){const svg=graph.querySelector('svg');if(!svg)return;const box=svg.getAttribute('viewBox').split(/[ ,]+/).map(Number),width=box[2],height=box[3];const scale=Math.min(Math.max(200,graph.clientWidth-20)/width,Math.max(200,graph.clientHeight-20)/height);svg.style.width=(width*scale*zoom)+'px';svg.style.height=(height*scale*zoom)+'px';svg.style.maxWidth='none';}
 root.querySelectorAll('[data-equipment-stage]').forEach(n=>n.addEventListener('click',()=>{stage=data.stages.find(s=>s.key===n.dataset.equipmentStage);render();}));
 root.querySelectorAll('[data-equipment-view]').forEach(n=>n.addEventListener('click',()=>{view=n.dataset.equipmentView;draw();}));
 root.querySelectorAll('[data-equipment-move]').forEach(n=>n.addEventListener('click',()=>{const next=data.stages[data.stages.indexOf(stage)+Number(n.dataset.equipmentMove)];if(next){stage=next;render();}}));
 root.querySelectorAll('[data-equipment-zoom]').forEach(n=>n.addEventListener('click',()=>{const factor=Number(n.dataset.equipmentZoom);zoom=factor?Math.max(.5,Math.min(12,zoom*factor)):1;fit();}));
 let drag=null,dragged=false;
 graph.tabIndex=0;
 graph.addEventListener('pointerdown',event=>{if(event.button!==0||view==='stage')return;dragged=false;drag={x:event.clientX,y:event.clientY,left:graph.scrollLeft,top:graph.scrollTop};});
 graph.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!dragged&&Math.abs(dx)+Math.abs(dy)<5)return;dragged=true;graph.setPointerCapture(event.pointerId);graph.scrollLeft=drag.left-dx;graph.scrollTop=drag.top-dy;});
 graph.addEventListener('pointerup',()=>{drag=null;});graph.addEventListener('pointercancel',()=>{drag=null;dragged=false;});
 graph.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopImmediatePropagation();dragged=false;}},true);
 window.addEventListener('resize',fit);
 const returnButton=button('← 返回案例对照',()=>{if(focus.open)return;root.scrollIntoView({block:'start'});returnButton.hidden=true;});returnButton.className='equipment-return';returnButton.hidden=true;document.body.append(returnButton);
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  if(dragged&&graph.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();dragged=false;return;}
  const a=event.target.closest('a[href]');if(!a)return;
  let url,id;try{url=new URL(a.getAttribute('href'),location.href);const here=new URL(location.href);if(url.origin!==here.origin||url.pathname!==here.pathname||(url.search&&url.search!==here.search)||!url.hash)return;id=decodeURIComponent(url.hash.slice(1));}catch{return;}
  const target=$(id);if(!target)return;
  if(['equipment-reader','equipment-full-architecture','view-records','view-configuration'].includes(id)){
   event.preventDefault();event.stopImmediatePropagation();if(focus.open)leaveFocus();if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({block:'start'});returnButton.hidden=id==='equipment-reader';return;
  }
  event.preventDefault();event.stopImmediatePropagation();showRecord(id,a);
 },true);
 const requested=new URLSearchParams(location.search).get('stage');stage=data.stages.find(s=>s.key===requested)||stage;
 render();
})();
