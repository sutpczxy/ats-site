"use strict";
(() => {
 if(document.body.dataset.fiveView!=='functional')return;
 const modal=document.createElement('dialog');modal.className='reader-record-dialog';modal.setAttribute('aria-label','完整设计记录');
 const header=document.createElement('header'),title=document.createElement('strong');title.textContent='完整设计记录';
 const close=document.createElement('button');close.type='button';close.textContent='关闭 · 返回阅读';header.append(title,close);
 const controls=document.createElement('nav');controls.setAttribute('aria-label','记录阅读历史');
 const previous=document.createElement('button'),next=document.createElement('button'),position=document.createElement('span');
 previous.type=next.type='button';previous.textContent='← 返回上一条';next.textContent='下一条 →';controls.append(previous,position,next);
 const body=document.createElement('div');body.className='reader-record-body';body.tabIndex=0;
 modal.append(header,controls,body);document.body.append(modal);
 let records=[],index=-1,origin=null,pagePosition=null;
 function copy(source){
  const clone=source.cloneNode(true);
  [clone,...clone.querySelectorAll('*')].forEach(n=>{n.removeAttribute('id');n.removeAttribute('hidden');n.removeAttribute('tabindex');n.removeAttribute('data-preserved-section');});
  clone.querySelectorAll('script,style').forEach(n=>n.remove());
  return clone;
 }
 function content(target){
  const container=document.createElement('div'),row=target.closest('tr');
  if(row){
   const table=document.createElement('table');table.className='data-table';
   const head=row.closest('table')?.querySelector('thead');if(head)table.append(copy(head));
   const tbody=document.createElement('tbody');tbody.append(copy(row));table.append(tbody);container.append(table);
  }else if(/^H[1-6]$/.test(target.tagName)){
   const level=Number(target.tagName.slice(1));container.append(copy(target));
   for(let n=target.nextElementSibling;n;n=n.nextElementSibling){if(/^H[1-6]$/.test(n.tagName)&&Number(n.tagName.slice(1))<=level)break;container.append(copy(n));}
  }else {const clone=copy(target);if(clone.tagName==='DETAILS')clone.open=true;container.append(clone);}
  return container;
 }
 function save(){if(index>=0){records[index].top=body.scrollTop;records[index].left=body.scrollLeft;records[index].expanded=[...body.querySelectorAll('details')].map(n=>n.open);}}
 function render(){
  const entry=records[index],target=document.getElementById(entry.id);if(!target)return;
  body.replaceChildren(content(target));
  if(entry.expanded)body.querySelectorAll('details').forEach((n,i)=>n.open=!!entry.expanded[i]);
  position.textContent=(index+1)+' / '+records.length;previous.disabled=index===0;next.disabled=index===records.length-1;
  title.textContent='设计记录 · '+entry.label;
  requestAnimationFrame(()=>{body.scrollTop=entry.top||0;body.scrollLeft=entry.left||0;body.focus({preventScroll:true});});
 }
 function openRecord(id,label,trigger){
  if(!document.getElementById(id))return;
  if(!modal.open){origin=trigger;pagePosition={x:window.scrollX,y:window.scrollY};records=[];index=-1;}
  save();records=records.slice(0,index+1);records.push({id,label});index=records.length-1;
  if(!modal.open)modal.showModal();render();
 }
 previous.addEventListener('click',()=>{if(index<=0)return;save();index--;render();});
 next.addEventListener('click',()=>{if(index>=records.length-1)return;save();index++;render();});
 close.addEventListener('click',()=>modal.close());
 modal.addEventListener('close',()=>{
  if(origin?.isConnected)origin.focus({preventScroll:true});
  if(pagePosition)window.scrollTo({left:pagePosition.x,top:pagePosition.y,behavior:'instant'});
 });
 document.addEventListener('functional-record-open',event=>{const {id,label}=event.detail;openRecord(id,label,document.activeElement);});
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const anchor=event.target.closest('a[href]');if(!anchor)return;
  const workspace=anchor.closest('#functional-comparison'),inArchitecture=anchor.closest('#architecture-reading'),inRecord=modal.contains(anchor);
  if(!workspace&&!inArchitecture&&!inRecord)return;
  // Diagram selections already open local definitions. Never leave their one-screen dialog.
  if(workspace&&anchor.closest('svg'))return;
  let url,id;try{url=new URL(anchor.getAttribute('href'),location.href);const here=new URL(location.href);if(url.origin!==here.origin||url.pathname!==here.pathname||(url.search&&url.search!==here.search)||!url.hash)return;id=decodeURIComponent(url.hash.slice(1));}catch{return;}
  if(!document.getElementById(id))return;
  event.preventDefault();event.stopImmediatePropagation();
  openRecord(id,anchor.textContent.trim()||anchor.getAttribute('aria-label')||id,anchor);
 },true);
})();
