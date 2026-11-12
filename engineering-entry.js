(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let region=null,loaded=false,loading=false,failed=false;
 const names={guangming:'光明区',futian:'福田中心区',pingshan:'坪山区',dapeng:'大鹏新区'};
 function selection(){
  $('env-load').disabled=loading||region!=='guangming';
  document.querySelectorAll('[data-region]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.region===region));b.disabled=loading;});
  $('env-region-status').textContent=loading?'正在读取光明区路网与资源图层…':!region?'请选择一个实施区域。':region==='guangming'?'可加载：12,393条路段、522个推定信号控制点、1,940处推定摄像头和30个OSM场馆与场地对象。':`${names[region]}：数据待导入。`;
 }
 function showLoaded(){
  loaded=true;loading=false;$('env-state').textContent='光明区资源已加载';window.engineeringContext={scenario_id:'SP07',region_id:'guangming',ready:true};window.engineeringFlow.complete(0);
  $('env-entry').hidden=true;$('env-resource-content').hidden=false;$('env-loaded-banner').hidden=false;
  selection();requestAnimationFrame(()=>{$('env-full').click();$('env-loaded-banner').scrollIntoView({block:'start',behavior:'smooth'});});
 }
 document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{region=b.dataset.region;selection();}));
 $('env-region-search').addEventListener('input',e=>{const q=e.target.value.trim();let count=0;document.querySelectorAll('[data-region]').forEach(b=>{b.hidden=!names[b.dataset.region].includes(q);if(!b.hidden)count++;});$('env-region-count').textContent=count+' 个匹配区域';$('env-region-empty').hidden=count>0;});
 $('env-load').addEventListener('click',()=>{
  if(region!=='guangming'||loading)return;
  if(failed){location.reload();return;}
  if(loaded){showLoaded();return;}
  loading=true;selection();$('env-state').textContent='正在加载现状资源';$('env-resource-content').hidden=false;
  window.dispatchEvent(new Event('ats:load-environment'));
 });
 $('env-change-region').addEventListener('click',()=>{
  $('env-resource-content').hidden=true;$('env-loaded-banner').hidden=true;$('env-entry').hidden=false;
  window.engineeringContext={scenario_id:'SP07',ready:false};window.engineeringFlow.invalidate(0);window.dispatchEvent(new Event('ats:design-reset'));region=null;selection();$('env-state').textContent='请选择实施区域';
  $('env-region-step').scrollIntoView({block:'start'});
 });
 window.addEventListener('ats:venues-ready',showLoaded);
 window.addEventListener('ats:venues-error',()=>{showLoaded();$('env-loaded-banner span').textContent='路网与基础设施已加载；场馆图层加载失败，可刷新重试。';});
 window.addEventListener('ats:environment-error',()=>{loading=false;failed=true;$('env-resource-content').hidden=true;selection();$('env-region-status').textContent='光明区资源加载失败，请刷新后重试。';$('env-load').textContent='刷新重试';});
 selection();
})();
