"use strict";
(() => {
 const root=document.getElementById('data-reader');if(!root)return;
 const data=window.ATSCaseReading.select(JSON.parse(document.getElementById('data-case-model').textContent),'data');
 const $=id=>document.getElementById(id), make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const n=make('button',text);n.type='button';n.addEventListener('click',fn);return n;};
 const sources={simple:$('data-overview').querySelector('svg'),detail:$('data-exchange').querySelector('svg')};
 let stage=data.stages[0],view='stage',zoom=1,serial=0;
 const graph=$('data-stage-graph'),panel=$('data-case-panel');
 const holder=document.createComment('data reader position');root.before(holder);
 const focus=make('dialog',null,'data-focus-dialog');focus.setAttribute('aria-label','数据视图一屏阅读');document.body.append(focus);
 const expand=root.querySelector('[data-data-expand]');
 function leaveFocus(){if(focus.open)focus.close();if(root.parentElement===focus)holder.after(root);expand.textContent='一屏阅读';}
 expand.addEventListener('click',()=>{if(focus.open){leaveFocus();return;}focus.append(root);focus.showModal();expand.textContent='退出一屏阅读';requestAnimationFrame(fit);});
 focus.addEventListener('close',()=>{if(!focus.open)leaveFocus();});
 const modal=make('dialog',null,'data-record-dialog');modal.setAttribute('aria-label','数据记录说明');
 const mh=make('header'),mt=make('strong','记录说明'),close=button('关闭 · 返回阅读',()=>modal.close());mh.append(mt,close);
 const history=make('nav'),back=button('← 上一条',()=>navigate(-1)),forward=button('下一条 →',()=>navigate(1)),pos=make('span');history.append(back,pos,forward);
 const content=make('div',null,'data-record-content');content.tabIndex=0;modal.append(mh,history,content);document.body.append(modal);
 let entries=[],index=-1,origin=null,scroll=null;
 function save(){if(index>=0){entries[index].top=content.scrollTop;entries[index].left=content.scrollLeft;entries[index].open=[...content.querySelectorAll('details')].map(n=>n.open);}}
 function clean(source){const copy=source.cloneNode(true);[copy,...copy.querySelectorAll('*')].forEach(n=>{n.removeAttribute('id');n.removeAttribute('hidden');n.removeAttribute('data-preserved-section');});copy.querySelectorAll('script,style').forEach(n=>n.remove());return copy;}
 function showRecord(id,trigger){if(!$(id))return;if(!modal.open){origin=trigger;scroll={left:window.scrollX,top:window.scrollY};entries=[];index=-1;}save();entries=entries.slice(0,index+1);entries.push({id});index=entries.length-1;if(!modal.open)modal.showModal();paintRecord();}
 function paintRecord(){const entry=entries[index],source=$(entry.id),row=source.closest('tr');content.replaceChildren();
  mt.textContent=data.records[entry.id]?.name||data.relations[entry.id]?.label||'设计说明';
  if(row){const table=make('table');const head=row.closest('table').querySelector('thead');if(head)table.append(clean(head));const tbody=make('tbody');tbody.append(clean(row));table.append(tbody);content.append(table);}
  else {const copy=clean(source);if(copy.tagName==='DETAILS')copy.open=true;content.append(copy);}
  if(entry.open)content.querySelectorAll('details').forEach((n,i)=>n.open=!!entry.open[i]);
  back.disabled=index===0;forward.disabled=index===entries.length-1;pos.textContent=(index+1)+' / '+entries.length;
  requestAnimationFrame(()=>{content.scrollTop=entry.top||0;content.scrollLeft=entry.left||0;content.focus({preventScroll:true});});
 }
 function navigate(delta){if(index+delta<0||index+delta>=entries.length)return;save();index+=delta;paintRecord();}
 modal.addEventListener('close',()=>{if(origin?.isConnected)origin.focus({preventScroll:true});if(scroll)window.scrollTo({...scroll,behavior:'instant'});});
 const ref=(id,label)=>{const b=button(label||data.records[id]?.brief||data.records[id]?.name||data.relations[id]?.label||id,()=>showRecord(id,b));b.dataset.recordRef=id;return b;};
 const changed=data.changes;
 function render(){
  root.querySelectorAll('[data-data-stage]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.dataStage===stage.key)));
  $('data-stage-note').textContent=stage.moment+' · '+stage.note;
  panel.replaceChildren(make('h3',stage.title),make('p',data.task,'data-case-label'));
  if(stage.key==='evaluate'){
   const title=make('p',data.case_id==='highway'?'同一事件 · 调整前后':'同一批运输任务 · 延时前后','data-case-label');panel.append(title);
   const table=make('table',null,'data-change-table'),thead=make('thead'),hr=make('tr');['记录','延时前','延时后'].forEach(x=>hr.append(make('th',x)));thead.append(hr);table.append(thead);const tb=make('tbody');changed.forEach(values=>{const tr=make('tr');values.forEach(x=>tr.append(make('td',x)));tb.append(tr);});table.append(tb);panel.append(table);
  }else stage.cards.forEach(([title,text])=>{const card=make('article',null,'data-case-card');card.append(make('h4',title),make('p',text));panel.append(card);});
  const records=make('div',null,'data-record-chips');stage.focus.forEach(id=>records.append(ref(id)));panel.append(make('h4','本阶段查阅'),records);
  const evidence=make('details',null,'data-evidence');evidence.append(make('summary','大模型、智能体和Skill依据什么'));
  const p=make('p',data.case_id==='highway'?'核查H-017时，查看异常观测、图像分析和现场反馈的来源与时间，关联模型调用、搜索Skill版本以及实际采取的动作。再核实预警、清障工单和恢复检查是否完成。':'判断能否赶上末班车时，要查当时的轨道时刻、预计到达时间、所用模型版本和返回结果。再查看智能体据此修改了哪项任务、选用了哪个版本的Skill，以及各方是否实际执行。');evidence.append(p,ref('ATS-D44','查看模型调用与结果记录'),ref('ATS-D02','查看Skill等资产版本'),ref('ATS-D10','查看任务记录'));panel.append(evidence);
  $('data-functional-link').href='architecture-functional.html?stage='+stage.key+'#functional-comparison';
  window.ATSCaseReading.syncLinks();
  const i=data.stages.indexOf(stage);root.querySelectorAll('[data-data-move]').forEach(n=>n.disabled=i+Number(n.dataset.dataMove)<0||i+Number(n.dataset.dataMove)>=data.stages.length);
  draw();
 }
 function draw(){
  graph.replaceChildren();$('data-definition').replaceChildren();zoom=1;graph.style.touchAction=view==='stage'?'auto':'none';graph.style.cursor=view==='stage'?'auto':'grab';
  root.querySelectorAll('[data-data-view]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.dataView===view)));
  root.querySelector('.data-zoom').hidden=view==='stage';
  root.querySelector('.data-graph-hint').textContent=view==='simple'?'连线汇总跨组关系；框内标注组内及仅在详图展开的关系。点击分组查阅。':'高亮记录与选中的关系同步显示。箭头指向引用记录或派生来源。';
  if(view==='stage'){
   stage.relations.forEach(id=>{const r=data.relations[id],row=make('div',null,'data-relation-row'),middle=make('div');middle.append(ref(id,r.kind==='DD'?'派生自 →':'引用 →'),make('small','关联数量：'+({'1':'1条','0..1':'最多1条','0..n':'可无或多条','1..n':'至少1条'}[r.cardinality]||r.cardinality)));row.append(ref(r.source),middle,ref(r.target));graph.append(row);});
   const note=make('p','这里只画本阶段重点关联，完整关系见简图和详图。箭头方向沿用公共数据定义。','data-small');graph.append(note);return;
  }
  const svg=sources[view].cloneNode(true),prefix='data-clone-'+(++serial)+'-';
  // Namespaced SVG IDs retain local markers while record links keep canonical anchors.
  const ids=new Map();svg.querySelectorAll('[id]').forEach(n=>{ids.set(n.id,prefix+n.id);n.id=prefix+n.id;});
  [svg,...svg.querySelectorAll('*')].forEach(n=>{for(const a of [...n.attributes]){let v=a.value;ids.forEach((next,old)=>{v=v.replaceAll('url(#'+old+')','url(#'+next+')');});if(v!==a.value)n.setAttribute(a.name,v);}});
  svg.querySelectorAll('[data-node]').forEach(n=>n.classList.add(stage.nodes.includes(n.dataset.node)?'data-active':'data-muted'));
  svg.querySelectorAll('[data-relation],[data-label]').forEach(n=>n.classList.add(stage.relations.includes(n.dataset.relation||n.dataset.label)?'data-active':'data-muted'));
  svg.querySelectorAll('[data-concept-node]').forEach(n=>{const members=(n.dataset.members||'').split(' ');n.classList.add(members.some(id=>stage.nodes.includes(id))?'data-active':'data-muted');});
  svg.querySelectorAll('[data-concept-relations]').forEach(n=>n.classList.add((n.dataset.conceptRelations||'').split(' ').some(id=>stage.relations.includes(id))?'data-active':'data-muted'));
  if(view==='simple')svg.querySelectorAll('[data-concept-node]').forEach(n=>{
   const counts=stage.projection?.groups[n.dataset.conceptNode];if(!counts)return;
   const labels=[];if(counts.inside.length)labels.push('组内 '+counts.inside.length+' 条');if(counts.detail.length)labels.push('详图另有 '+counts.detail.length+' 条');if(!labels.length)return;
   const rect=n.querySelector('rect'),badge=document.createElementNS('http://www.w3.org/2000/svg','text');badge.setAttribute('x',Number(rect.getAttribute('x'))+18);badge.setAttribute('y',Number(rect.getAttribute('y'))+148);badge.setAttribute('font-size','19');badge.setAttribute('fill','#234f65');badge.textContent=labels.join(' · ');n.append(badge);
  });
  graph.append(svg);requestAnimationFrame(fit);
 }
 function fit(){const svg=graph.querySelector('svg');if(!svg)return;const box=svg.getAttribute('viewBox').split(/[ ,]+/).map(Number),width=box[2],height=box[3];const scale=Math.min(Math.max(200,graph.clientWidth-20)/width,Math.max(200,graph.clientHeight-20)/height);svg.style.width=(width*scale*zoom)+'px';svg.style.height=(height*scale*zoom)+'px';svg.style.maxWidth='none';}
 root.querySelectorAll('[data-data-stage]').forEach(n=>n.addEventListener('click',()=>{stage=data.stages.find(s=>s.key===n.dataset.dataStage);render();}));
 root.querySelectorAll('[data-data-view]').forEach(n=>n.addEventListener('click',()=>{view=n.dataset.dataView;draw();}));
 root.querySelectorAll('[data-data-move]').forEach(n=>n.addEventListener('click',()=>{const next=data.stages[data.stages.indexOf(stage)+Number(n.dataset.dataMove)];if(next){stage=next;render();}}));
 root.querySelectorAll('[data-data-zoom]').forEach(n=>n.addEventListener('click',()=>{const factor=Number(n.dataset.dataZoom);zoom=factor?Math.max(.5,Math.min(12,zoom*factor)):1;fit();}));
 let drag=null,dragged=false;
 graph.tabIndex=0;
 graph.addEventListener('pointerdown',event=>{if(event.button!==0||view==='stage')return;dragged=false;drag={x:event.clientX,y:event.clientY,left:graph.scrollLeft,top:graph.scrollTop};});
 graph.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!dragged&&Math.abs(dx)+Math.abs(dy)<5)return;dragged=true;graph.setPointerCapture(event.pointerId);graph.scrollLeft=drag.left-dx;graph.scrollTop=drag.top-dy;});
 graph.addEventListener('pointerup',()=>{drag=null;});graph.addEventListener('pointercancel',()=>{drag=null;dragged=false;});
 graph.addEventListener('click',event=>{if(dragged){event.preventDefault();event.stopImmediatePropagation();dragged=false;}},true);
 window.addEventListener('resize',fit);
 const returnButton=button('← 返回案例对照',()=>{if(focus.open)return;root.scrollIntoView({block:'start'});returnButton.hidden=true;});returnButton.className='data-return';returnButton.hidden=true;document.body.append(returnButton);
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
  if(dragged&&graph.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();dragged=false;return;}
  const a=event.target.closest('a[href]');if(!a)return;
  let url,id;try{url=new URL(a.getAttribute('href'),location.href);const here=new URL(location.href);if(url.origin!==here.origin||url.pathname!==here.pathname||(url.search&&url.search!==here.search)||!url.hash)return;id=decodeURIComponent(url.hash.slice(1));}catch{return;}
  const target=$(id);if(!target)return;
  if(['data-reader','data-full-architecture','view-records','view-configuration'].includes(id)){
   event.preventDefault();event.stopImmediatePropagation();if(focus.open)leaveFocus();if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView({block:'start'});returnButton.hidden=id==='data-reader';return;
  }
  event.preventDefault();event.stopImmediatePropagation();showRecord(id,a);
 },true);
 const requested=new URLSearchParams(location.search).get('stage');stage=data.stages.find(s=>s.key===requested)||stage;
 render();
})();
