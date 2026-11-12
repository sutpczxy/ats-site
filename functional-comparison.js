"use strict";
(() => {
 const root=document.getElementById('functional-comparison');if(!root)return;
 const data=window.ATSCaseReading.select(JSON.parse(document.getElementById('comparison-data').textContent),'functional');
 const stageButtons=[...root.querySelectorAll('[data-reader-stage]')];
 const example=document.getElementById('reader-example'),graph=document.getElementById('reader-stage-graph'),definition=document.getElementById('reader-inline-definition');
 const architecture=document.getElementById('architecture-reading'),group=document.getElementById('reader-architecture-group'),pair=document.getElementById('reader-pair');
 const panels=architecture.querySelector('.reader-full-panels');
 const inspector=makeInspector();
 function makeInspector(){
  const panel=document.createElement('dialog');panel.className='reader-inspector';panel.hidden=true;panel.setAttribute('aria-label','当前阶段详细说明');
  const header=document.createElement('header'),title=document.createElement('strong');title.textContent='当前阶段说明';
  const close=document.createElement('button');close.type='button';close.textContent='关闭说明 ×';close.addEventListener('click',closeInspector);header.append(title,close);panel.append(header);
  const tabs=document.createElement('div');tabs.className='reader-inspector-tabs';
  for(const [key,label,id] of [['mapping','功能对应','reader-correspondence'],['conditions','执行条件','reader-interactions'],['relations','关系查阅','reader-relation-lookup'],['definition','选中定义','reader-inline-definition']]){
   const tab=document.createElement('button');tab.type='button';tab.textContent=label;tab.dataset.inspectorTab=key;tab.addEventListener('click',()=>openInspector(key));tabs.append(tab);
   const node=document.getElementById(id);node.dataset.inspectorPanel=key;panel.append(node);
  }
  panel.insertBefore(tabs,header.nextSibling);document.body.append(panel);panel.addEventListener('cancel',event=>{event.preventDefault();closeInspector();});
  document.getElementById('reader-help').addEventListener('click',()=>openInspector('mapping'));
  return panel;
 }
 let inspectorOrigin=null;
 function openInspector(key){
  if(inspector.hidden)inspectorOrigin=document.activeElement;
  inspector.hidden=false;if(!inspector.open)inspector.showModal();
  inspector.querySelectorAll('[data-inspector-panel]').forEach(n=>{n.hidden=n.dataset.inspectorPanel!==key;if(n.tagName==='DETAILS')n.open=true;});
  inspector.querySelectorAll('[data-inspector-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.inspectorTab===key)));
  if(key==='definition'&&!definition.childElementCount){const p=document.createElement('p');p.textContent='选择图中的功能或关系后，在此查看定义。';definition.append(p);}
 }
 function closeInspector(){if(inspector.open)inspector.close();inspector.hidden=true;if(inspectorOrigin?.isConnected)inspectorOrigin.focus({preventScroll:true});}
 // Native modal gives one-screen reading keyboard focus and an Escape exit.
 const placeholder=document.createComment('reader workspace position');root.before(placeholder);
 const dialog=document.createElement('dialog');dialog.className='reader-focus-dialog';dialog.setAttribute('aria-label','功能视图一屏阅读');document.body.append(dialog);
 const expand=document.getElementById('reader-expand');
 function leaveFocus(){if(dialog.open)dialog.close();if(root.parentElement===dialog)placeholder.after(root);expand.textContent='一屏阅读';document.body.classList.remove('reader-modal-open');}
 expand.addEventListener('click',()=>{if(dialog.open){leaveFocus();expand.focus();return;}dialog.append(root);dialog.showModal();expand.textContent='退出一屏阅读';document.body.classList.add('reader-modal-open');});
 dialog.addEventListener('close',()=>{if(!dialog.open)leaveFocus();});
 dialog.addEventListener('cancel',e=>{if(!inspector.hidden){e.preventDefault();closeInspector();}});


 let stage=data.stages[0], located=null, view='stage', serial=0;
 const sources={simple:panels.querySelector('[aria-labelledby="simple-tab"] svg'),detail:panels.querySelector('[aria-labelledby="detail-tab"] svg')};
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 function link(id,text){const a=make('a',text);a.href='#'+id;return a;}
 function button(text,fn,cls){const b=make('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;}
 function showDefinition(id){
  definition.replaceChildren();const r=data.relations[id];
  showCorrespondence(r?[r.source,r.target]:[id]);
  graph.querySelectorAll('[data-node],[data-label],[data-relation]').forEach(n=>n.classList.toggle('reader-map-selected',(n.dataset.node||n.dataset.label||n.dataset.relation)===id));
  definition.append(make('span','设计定义','reader-definition-label'),make('h4',r?r.name:data.nodes[id]||id));
  if(r){definition.append(make('p',(data.nodes[r.source]||r.source)+' → '+(data.nodes[r.target]||r.target)),make('p',r.condition));}
  else if(data.definitions[id]){const d=data.definitions[id];definition.append(make('p','输入：'+d.input),make('p','输出：'+d.output));}
  else definition.append(make('p','该对象的职责、配置和相关功能见完整定义。'));
  definition.append(link(id,'查看完整定义 →'));definition.hidden=false;document.dispatchEvent(new CustomEvent('functional-record-open',{detail:{id,label:r?r.name:data.nodes[id]||id}}));
  root.querySelectorAll('[data-reference]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reference===id)));
 }
 function reference(id,text,cls){const b=button(text||data.nodes[id]||data.relations[id]?.name||id,()=>showDefinition(id),cls);b.dataset.reference=id;b.setAttribute('aria-pressed','false');return b;}
 function clearSelection(){
  showCorrespondence();definition.replaceChildren();definition.hidden=true;
  root.querySelectorAll('[data-reference]').forEach(b=>b.setAttribute('aria-pressed','false'));
  graph.querySelectorAll('.reader-map-selected').forEach(n=>n.classList.remove('reader-map-selected'));
 }
 function showCorrespondence(keys=null){
  const target=document.getElementById('reader-correspondence');
  if(target.dataset.stage!==stage.key){
   target.dataset.stage=stage.key;target.replaceChildren();
   const header=make('div',null,'reader-correspondence-header');
   header.append(make('h4','本阶段的功能对应'),button('恢复本阶段全部对应',clearSelection,'reader-reset-selection'));target.append(header);
   const caption=make('p','左列是案例处理事项，右列是负责功能。选择功能仅突出对应项，列表保留。','reader-small-note');target.append(caption);
   stage.primary.forEach(id=>{const row=make('div',null,'reader-mapping-row');row.dataset.mapping=id;row.append(make('span',stage.actions[id]),reference(id,null,'reader-mapping-target'));target.append(row);});
   target.append(make('p',null,'reader-selection-status'));
  }
  const relevant=new Set((keys||[]).filter(id=>stage.actions[id]));
  target.querySelectorAll('[data-mapping]').forEach(row=>{const active=relevant.has(row.dataset.mapping);row.classList.toggle('reader-mapping-selected',active);row.querySelector('button').setAttribute('aria-pressed',String(active));});
  target.querySelector('.reader-reset-selection').disabled=keys===null;
  target.querySelector('.reader-selection-status').textContent=keys===null?'显示本阶段全部对应。':relevant.size?'已突出所选内容的对应职责；可恢复全部对应。':'所选内容为支撑或其他架构内容，主要功能列表保留在上方。';
 }
 function drawGeneric(){
  const svg=sources[view].cloneNode(true),prefix='reader-map-'+(++serial)+'-';
  const ids=new Map([...svg.querySelectorAll('[id]')].map(n=>[n.id,prefix+n.id]));
  svg.querySelectorAll('*').forEach(n=>{
   if(n.id)n.id=ids.get(n.id);
   n.classList.remove('reader-context-muted','reader-context-active');
   for(const a of [...n.attributes]){let value=a.value.replace(/url\(#([^)]*)\)/g,(whole,id)=>ids.has(id)?'url(#'+ids.get(id)+')':whole);if((a.name==='href'||a.name==='xlink:href')&&ids.has(value.slice(1)))value='#'+ids.get(value.slice(1));if(value!==a.value)n.setAttribute(a.name,value);}
  });
  svg.style.width='100%';svg.style.height='100%';svg.style.maxWidth='none';svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.removeAttribute('width');svg.removeAttribute('height');
  const activeNodes=new Set(stage.nodes),activeRelations=new Set(stage.relations);
  svg.querySelectorAll('[data-node],[data-relation],[data-label],[data-concept-node],[data-concept-relations]').forEach(n=>{
   let active=false;
   if(n.dataset.node)active=activeNodes.has(n.dataset.node);
   const id=n.dataset.relation||n.dataset.label;
   if(id)active=activeRelations.has(id);
   if(n.dataset.conceptNode)active=data.concepts[n.dataset.conceptNode].members.some(x=>activeNodes.has(x));
   if(n.dataset.conceptRelations)active=n.dataset.conceptRelations.split(' ').some(x=>activeRelations.has(x));
   n.classList.add(active?'reader-map-active':'reader-map-other');
  });
  if(view==='simple')svg.querySelectorAll('[data-concept-node]').forEach(n=>{
   const counts=stage.projection?.groups[n.dataset.conceptNode];if(!counts)return;
   const labels=[];if(counts.inside.length)labels.push('组内 '+counts.inside.length+' 条');if(counts.detail.length)labels.push('详图另有 '+counts.detail.length+' 条');if(!labels.length)return;
   const rect=n.querySelector('rect'),badge=document.createElementNS('http://www.w3.org/2000/svg','text');badge.setAttribute('x',Number(rect.getAttribute('x'))+18);badge.setAttribute('y',Number(rect.getAttribute('y'))+148);badge.setAttribute('font-size','19');badge.setAttribute('fill','#234f65');badge.textContent=labels.join(' · ');n.append(badge);
  });
  const canvas=make('div',null,'reader-generic-canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','通用架构图，可拖动或用方向键平移');
  const full=svg.getAttribute('viewBox').trim().split(/[ ,]+/).map(Number);let box=[...full];
  const set=b=>{box=b;svg.setAttribute('viewBox',b.join(' '));};
  const zoom=f=>{const w=Math.max(150,Math.min(full[2]*2,box[2]*f)),h=w*box[3]/box[2];set([box[0]+(box[2]-w)/2,box[1]+(box[3]-h)/2,w,h]);};
  const tools=make('div',null,'reader-map-tools');tools.append(button('全图',()=>set([...full])),button('放大',()=>zoom(.7)),button('缩小',()=>zoom(1/.7)));
  let drag=null,moved=false;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,box:[...box]};moved=false;});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.abs(dx)+Math.abs(dy)<5)return;moved=true;canvas.setPointerCapture(e.pointerId);const scale=Math.max(drag.box[2]/canvas.clientWidth,drag.box[3]/canvas.clientHeight);set([drag.box[0]-dx*scale,drag.box[1]-dy*scale,drag.box[2],drag.box[3]]);});
  canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('keydown',e=>{if(e.target!==canvas)return;const shifts={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};if(shifts[e.key]){e.preventDefault();const [x,y]=shifts[e.key];set([box[0]+x*box[2],box[1]+y*box[3],box[2],box[3]]);}});
  svg.addEventListener('click',e=>{
   if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
   e.preventDefault();if(moved){moved=false;return;}
   const n=e.target.closest('[data-node],[data-label],[data-relation],[data-concept-node],[data-concept-relations]');if(!n)return;
   const id=n.dataset.node||n.dataset.label||n.dataset.relation;
   if(id){showDefinition(id);return;}
   clearSelection();
   if(n.dataset.conceptNode){const c=data.concepts[n.dataset.conceptNode];showCorrespondence(c.members);definition.replaceChildren(make('span','简图分组','reader-definition-label'),make('h4',c.title),make('p','下方列出本阶段在该分组内使用的主要功能。分组的其他成员保留在通用架构中。'),link('concept-'+n.dataset.conceptNode,'查看分组完整定义 →'));definition.hidden=false;openInspector('definition');return;}
   const refs=n.dataset.conceptRelations.split(' ').filter(id=>relations.has(id));
   showCorrespondence(refs.flatMap(id=>[data.relations[id].source,data.relations[id].target]));definition.replaceChildren(make('h4','本阶段对应关系'));
   if(!refs.length)definition.append(make('p','该连线未纳入本阶段的关系映射。'));
   refs.forEach(id=>definition.append(reference(id,data.relations[id].name,'reader-inline-relation')));definition.hidden=false;openInspector('definition');
  });
  canvas.append(svg);graph.append(tools,canvas);set([...full]);
 }
 function drawGraph(){
  graph.replaceChildren();
  document.querySelectorAll('[data-reader-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readerView===view)));
  document.getElementById('reader-graph-note').textContent=view==='stage'?'主要功能及关键交互。点击名称，就地查看对应说明。':'蓝色边框和连线表示本阶段涉及的功能及关系，其余淡化。简图组内关系在详图展开；可放大后拖动。';
  if(view==='simple')document.getElementById('reader-graph-note').textContent='连线汇总跨组关系；框内标注组内及仅在详图展开的关系。点击分组查看成员和关系。';
  if(view!=='stage'){drawGeneric();return;}
  const pairs=new Map();
  stage.main.forEach(id=>{const r=data.relations[id],key=[r.source,r.target].sort().join('|');if(!pairs.has(key))pairs.set(key,{left:r.source,right:r.target,relations:[]});pairs.get(key).relations.push(id);});
  pairs.forEach(p=>{
   const row=make('div',null,'reader-relation-row'),middle=make('div',null,'reader-relation-arrows');
   row.append(reference(p.left,null,'reader-function-node'));
   p.relations.forEach(id=>{const r=data.relations[id];middle.append(reference(id,r.name+(r.source===p.left?' →':' ←'),'reader-relation-link'));});
   row.append(middle,reference(p.right,null,'reader-function-node'));graph.append(row);
  });
  graph.append(make('p','每行表示一组真实交互；同名功能框表示同一功能。点击名称在本区域查看说明。','reader-small-note'));
 }
 function render(){
  root.querySelector('.reader-cycle').textContent=stage.moment+' · '+stage.steps.join(' → ');
  stageButtons.forEach(b=>{const on=b.dataset.readerStage===stage.key;b.setAttribute('aria-pressed',String(on));});
  example.replaceChildren();example.append(make('span','案例侧 · '+stage.moment,'reader-panel-label'),make('h3',stage.title));
  example.append(make('p',stage.task,'reader-task-label'));
  const route=make('ol',null,'reader-case-route');stage.steps.forEach(text=>route.append(make('li',text)));example.append(route);
  [['当前情况',stage.situation],['判断和行动',stage.example],['阶段结果',stage.output.replace(/^(输出：|形成任务：|形成依据：|形成候选：|形成执行记录：|形成决定：|形成改进：)/,'')]].forEach(([title,text],i)=>{const n=make('div',null,'reader-scenario-block reader-scenario-'+i);n.append(make('h4',title),make('p',text));example.append(n);});
  const core=make('div',null,'reader-agent-work');
  stage.tech.slice(0,2).forEach(([name,text])=>{const p=make('p');p.append(make('strong',name+'：'),document.createTextNode(text));core.append(p);});example.append(core);
  const role=make('details',null,'reader-role-focus');role.append(make('summary','Skill及专业服务怎样支撑'));
  stage.tech.slice(2).forEach(([name,text])=>{const p=make('p');p.append(make('strong',name+'：'),document.createTextNode(text));role.append(p);});example.append(role);
  const concrete=make('details',null,'reader-case-records');concrete.append(make('summary',data.case_id==='highway'?'本阶段事件记录':'本阶段具体运输安排'));stage.case_records.forEach(([name,text])=>{const p=make('p');p.append(make('strong',name+'：'),document.createTextNode(text));concrete.append(p);});example.append(concrete);
  const feedback=make('div',null,'reader-feedback-actions');
  if(stage.key==='evaluate'){
   feedback.append(make('strong','查看重组所调用的功能：'));
   [['match','查找替代服务 → 能力匹配'],['execute','重新组织安排 → 方案编排']].forEach(([key,label])=>feedback.append(button(label,()=>selectStage(key))));
   feedback.append(button(data.case_id==='highway'?'处置完成后 → 复核恢复':'变更确认后 → 执行运输',()=>selectStage('control')));
  }else if(stage.key==='match') feedback.append(make('p','证据不足时继续查询；能力不足时修订子任务并重新匹配。'));
  example.append(feedback);
  drawGraph();showCorrespondence();definition.replaceChildren();definition.hidden=true;
  const details=document.getElementById('reader-detail-content');details.replaceChildren();
  const conditions={
   goal:['目的地、人数及最晚到达时间写入任务。','预测用于准备运力，现场需求用于实际调整。','调用及变更按已有授权执行，信息缺失继续查询。'],
   match:['核对车辆服务窗口及已有任务，避免重复占用。','车辆、上客位和目的地的可用时段需衔接。','未确认资源继续查询，能力不足时修订子任务。'],
   execute:['调用前明确依赖、资源、时限和完成要求。','重试或取消前核实原调用状态及实际影响。','等待达到上限时提交评价处理，未确认调用继续跟踪。'],
   control:['各方按同一方案落实车辆、上客位及接收安排。','发车不等于完成，需核实乘客运抵和剩余需求。','结束前确认临时引导恢复、资源释放及交接。'],
   evaluate:['先定位受影响任务，保留仍有效的安排。','替代目的地取得所需确认，旧请求先核实状态。','无可行接续或超出授权时交由责任方处理。'],
   improve:['候选版本通过验证并获得有效发布授权。','部署时核对版本、依赖及回退条件，确认实际生效。','持续监测效果，风险达到处置条件时隔离或回退。']
  };
  const list=make('ul',null,'reader-condition-list');(stage.conditions||conditions[stage.key]).forEach(text=>list.append(make('li',text)));details.append(list,link((data.case_id==='highway'?'highway-design-':'design-')+stage.key,'查看完整条件及阶段说明 →'));
  const lookup=document.getElementById('reader-relation-content');lookup.replaceChildren();
  const supportDetails=make('details');supportDetails.append(make('summary','支撑功能（'+stage.support.length+'项）'));
  const supports=make('div',null,'reader-support-links');stage.support.forEach(id=>supports.append(reference(id,null,'reader-support-reference')));supportDetails.append(supports);lookup.append(supportDetails);
  if(stage.listed_only.length){const additional=make('details');additional.append(make('summary','另行查阅的功能（未作为本阶段连线端点高亮）'));stage.listed_only.forEach(id=>additional.append(reference(id)));lookup.append(additional);}
  const projection=make('details');projection.append(make('summary','简图和详图怎样对应'));
  for(const [key,g] of Object.entries(stage.projection.groups)){if(g.inside.length){projection.append(make('p',data.concepts[key].title+'：以下关系发生在组内，简图框内不展开。'));g.inside.forEach(id=>projection.append(reference(id)));}}
  if(stage.projection.omitted.length){projection.append(make('p','以下关系仅在详图展开，简图未另画连线。'));stage.projection.omitted.forEach(id=>projection.append(reference(id)));}lookup.append(projection);
  const categories=[['主要交互',id=>stage.main.includes(id)],['授权和依赖',id=>!stage.main.includes(id)&&['A','DP','CN'].includes(data.relations[id].kind)],['补充交互及异常处理',id=>!stage.main.includes(id)&&!['A','DP','CN'].includes(data.relations[id].kind)]];
  categories.forEach(([title,match])=>{const ids=stage.relations.filter(match);if(!ids.length)return;const group=make('details');group.append(make('summary',title+'（'+ids.length+'条）'));ids.forEach(id=>{const r=data.relations[id];const row=make('div',null,'reader-detail-relation');row.append(reference(id,r.name),make('small',(data.nodes[r.source]||r.source)+' → '+(data.nodes[r.target]||r.target)));group.append(row);});lookup.append(group);});
  document.getElementById('reader-interactions').open=false;
  document.getElementById('reader-relation-lookup').open=false;
  document.getElementById('reader-data-link').href='architecture-data.html?stage='+stage.key+'#data-reader';
  window.ATSCaseReading.syncLinks();
  const index=data.stages.indexOf(stage);document.getElementById('reader-stage-position').textContent=(index+1)+' / '+data.stages.length+' · '+stage.title;
  root.querySelectorAll('[data-reader-move]').forEach(b=>b.disabled=index+Number(b.dataset.readerMove)<0||index+Number(b.dataset.readerMove)>=data.stages.length);
 }
 function selectStage(key){const next=data.stages.find(s=>s.key===key);if(next){inspector.hidden=true;stage=next;render();}}
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!inspector.hidden){e.preventDefault();e.stopPropagation();closeInspector();}});
 root.querySelectorAll('[data-reader-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.readerView;inspector.hidden=true;drawGraph();clearSelection();}));
 stageButtons.forEach(b=>b.addEventListener('click',()=>selectStage(b.dataset.readerStage)));
 root.querySelectorAll('[data-reader-move]').forEach(b=>b.addEventListener('click',()=>{const next=data.stages[data.stages.indexOf(stage)+Number(b.dataset.readerMove)];if(next)selectStage(next.key);}));
 // Generic architecture browsing is independent from the scenario stage.
 Object.entries(data.concepts).forEach(([id,c])=>{const o=make('option',c.title);o.value=id;group.append(o);});
 const status=make('p',null,'reader-small-note');architecture.querySelector('.reader-architecture-controls').after(status);
 function paintArchitecture(){
  let nodes=null,relations=null;
  if(located){nodes=new Set(located.nodes);relations=new Set(located.relations);status.textContent='定位阶段：'+located.title+'。与案例对照显示同一组功能及关系；选择功能分组后恢复通用架构查阅。';}
  else if(group.value!=='all'){
   nodes=new Set(data.concepts[group.value].members);relations=new Set(Object.keys(data.relations).filter(id=>{const r=data.relations[id];return nodes.has(r.source)||nodes.has(r.target);}));
   relations.forEach(id=>{const r=data.relations[id];nodes.add(r.source);nodes.add(r.target);});
   status.textContent='当前分组：'+data.concepts[group.value].title+'。深色为分组功能及直接交互；浅色保留完整上下文。';
  }else status.textContent='完整通用架构。点击节点或关系查看设计记录；功能分组选择不受示例阶段限制。';
  panels.querySelectorAll('[data-node],[data-relation],[data-label],[data-concept-node],[data-concept-relations]').forEach(n=>{
   let on=!nodes;
   if(nodes){if(n.dataset.node)on=nodes.has(n.dataset.node);if(n.dataset.relation||n.dataset.label)on=relations.has(n.dataset.relation||n.dataset.label);if(n.dataset.conceptNode)on=data.concepts[n.dataset.conceptNode].members.some(id=>nodes.has(id));if(n.dataset.conceptRelations)on=n.dataset.conceptRelations.split(' ').some(id=>relations.has(id));}
   n.classList.toggle('reader-context-muted',!on);n.classList.toggle('reader-context-active',!!nodes&&on);
  });
 }
 group.addEventListener('change',()=>{located=null;paintArchitecture();});
 document.getElementById('reader-clear-location').addEventListener('click',()=>{located=null;group.value='all';paintArchitecture();});
 pair.addEventListener('click',()=>{
  const on=!panels.classList.contains('reader-paired');panels.classList.toggle('reader-paired',on);pair.setAttribute('aria-pressed',String(on));
  pair.textContent=on?'恢复单图浏览':'简图与详图并排';
  if(on)panels.querySelectorAll('[role="tabpanel"]').forEach(n=>n.hidden=false);
  else architecture.querySelector('#simple-tab').click();
  window.dispatchEvent(new Event('resize'));
 });
 architecture.querySelectorAll('.five-view-tabs button').forEach(b=>b.addEventListener('click',()=>{panels.classList.remove('reader-paired');pair.setAttribute('aria-pressed','false');pair.textContent='简图与详图并排';}));
 const returnButton=document.createElement('button');returnButton.type='button';returnButton.className='reader-return-context';returnButton.textContent='← 返回案例对照';returnButton.hidden=true;document.body.append(returnButton);
 let readingContext=null;
 returnButton.addEventListener('click',()=>{
  if(!readingContext)return;
  const saved=readingContext;returnButton.hidden=true;
  history.replaceState(history.state,'',saved.url);
  if(saved.focused){dialog.append(root);dialog.showModal();expand.textContent='退出一屏阅读';document.body.classList.add('reader-modal-open');}
  window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});
  requestAnimationFrame(()=>{document.getElementById('reader-help').focus({preventScroll:true});window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});});
 });
 const architectureLink=document.querySelector('.functional-local-nav a[href="#architecture-reading"]');
 architectureLink.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  readingContext={focused:dialog.open,x:window.scrollX,y:window.scrollY,url:location.href};
  if(dialog.open)leaveFocus();
  returnButton.hidden=false;

  located=stage;group.value='all';architecture.open=true;paintArchitecture();location.hash='#architecture-reading';requestAnimationFrame(()=>architecture.scrollIntoView({block:'start'}));
 });
 const requested=new URLSearchParams(location.search).get('stage');stage=data.stages.find(s=>s.key===requested)||stage;
 paintArchitecture();render();
})();
