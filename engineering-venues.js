(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let source, map, currentView, active = null;
  const make = (tag,attrs={})=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;};
  const color = v => v.category==='体育场馆'?'#80599e':v.category==='科普文化'?'#b05d79':'#668d4b';
  const path = rings => rings.map(r=>r.map((p,i)=>(i?'L':'M')+p.join(',')).join('')+'Z').join(' ');
  function updateView(detail){
    if(!source)return;
    currentView=detail;
    const {view,unit}=detail,placed=[];
    for(const v of source.venues){
      const g=document.getElementById('venue-'+v.id.replace('/','-'));
      g.setAttribute('transform',`translate(${v.x},${v.y}) scale(${unit})`);
      const label=g.querySelector('text'),x=(v.x-view.x)/unit,y=(v.y-view.y)/unit;
      const width=Math.min(v.name.length*11+30,260);
      const visible=(v.id===active||view.w<10000||source.venues.indexOf(v)<6)&&x>=0&&y>=0&&x<map.svg.clientWidth&&y<map.svg.clientHeight&&!placed.some(p=>Math.abs(p.y-y)<25&&x<p.x+p.w&&x+width>p.x);
      label.style.display=visible?'':'none';
      if(visible)placed.push({x,y,w:width});
      g.querySelector('circle').setAttribute('r',v.id===active?9:7);
      const shape=document.getElementById('venue-shape-'+v.id.replace('/','-'));
      if(shape){shape.setAttribute('fill-opacity',v.id===active?'.24':'.12');shape.setAttribute('stroke-width',v.id===active?2.5:1.2);}
    }
  }
  function select(v, focus=false){
    active=v.id;map.clearDeviceSelection();
    if(focus){const points=v.rings.flat();let box;if(points.length){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),w=Math.max(1400,Math.max(...xs)-Math.min(...xs)+400),h=Math.max(1400,Math.max(...ys)-Math.min(...ys)+400);box={x:v.x-w/2,y:v.y-h/2,w,h};}else box={x:v.x-800,y:v.y-800,w:1600,h:1600};map.fit(box);}
    if(currentView)updateView(currentView);
    $('env-selection').innerHTML=`<h4>${esc(v.name)}</h4><p class="env-venue-kind">${esc(v.category)} · ${esc(v.geometry_kind)}</p>${v.parent_name?`<p>所在场馆：${esc(v.parent_name)}</p>`:''}<p class="env-coordinates">${v.coordinates.map(n=>n.toFixed(6)).join(', ')}<br>WGS84 · 轮廓中心 / OSM位置点</p><p>${v.tags.landuse==='construction'?'OSM标注：建设用地。':''}${v.buildings.length?`另含 ${v.buildings.length} 个 OSM 建筑轮廓。`:''}</p><a class="env-osm-source" href="${v.url}" target="_blank" rel="noopener">查看 OSM 原对象 ↗</a><p>数据快照：${esc(source.timestamp.slice(0,10))}。场地轮廓与建筑轮廓分别标识，场馆不计入设备数量。</p><button type="button" id="env-venue-focus">放大到场馆</button>`;
    $('env-venue-focus').addEventListener('click',()=>select(v,true));
  }
  function list(){
    if(!source)return;
    const q=$('env-venue-search').value.trim().toLowerCase();
    $('env-venue-list').replaceChildren();
    const matches=source.venues.filter(v=>(v.name+v.category+(v.tags.short_name||'')+(v.name==='深圳科学技术馆'?' 科学馆 科技馆':'')).toLowerCase().includes(q));
    for(const v of matches){const button=document.createElement('button');button.type='button';button.dataset.venueId=v.id;button.innerHTML=`<i style="background:${color(v)}"></i><span>${esc(v.name)}<small>${esc(v.category)} · ${esc(v.geometry_kind)}</small></span>`;button.addEventListener('click',()=>select(v,true));$('env-venue-list').append(button);}
    if(!matches.length){const p=document.createElement('p');p.textContent='未找到匹配场馆';$('env-venue-list').append(p);}
  }
  async function init(){
    if(source)return;
    map=window.atsEnvironmentMap;if(!map)return;
    try{
      const response=await fetch('data/engineering/guangming-venues.json');if(!response.ok)throw Error(response.status);source=await response.json();
      for(const v of source.venues){
        if(v.rings.length){const shape=make('path',{id:'venue-shape-'+v.id.replace('/','-'),d:path(v.rings),fill:color(v),'fill-opacity':'.12',stroke:color(v),'stroke-width':1.2,'fill-rule':'evenodd','vector-effect':'non-scaling-stroke',class:'env-venue-outline'});shape.addEventListener('click',()=>select(v));$('env-venue-shapes').append(shape);}
        for(const b of v.buildings){$('env-venue-shapes').append(make('path',{d:path(b.rings),fill:color(v),'fill-opacity':'.32',stroke:color(v),'stroke-width':1,'vector-effect':'non-scaling-stroke','fill-rule':'evenodd'}));}
        const g=make('g',{id:'venue-'+v.id.replace('/','-'),class:'env-venue-marker',role:'button',tabindex:0,'aria-label':v.name});g.append(make('circle',{r:7,fill:color(v),stroke:'white','stroke-width':2}));g.append(make('path',{d:'M-3,2 L-3,-1 L0,-4 L3,-1 L3,2 Z',fill:'white'}));const label=make('text',{x:12,y:4,fill:color(v),'font-size':11,'font-weight':600,'paint-order':'stroke',stroke:'#ffffffed','stroke-width':4});label.textContent=v.name;g.append(label);
        g.addEventListener('pointerdown',e=>e.stopPropagation());g.addEventListener('click',e=>{e.stopPropagation();select(v);});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(v);}});$('env-venue-markers').append(g);
      }
      $('env-venues-count').textContent=source.venues.length;
      $('env-show-venues').addEventListener('change',e=>{for(const id of ['env-venue-shapes','env-venue-markers'])$(id).style.display=e.target.checked?'':'none';});
      $('env-venue-search').addEventListener('input',list);list();
      const viewBox=map.svg.viewBox.baseVal;updateView({view:{x:viewBox.x,y:viewBox.y,w:viewBox.width,h:viewBox.height},unit:viewBox.width/Math.max(map.svg.clientWidth,1)});
      window.getEngineeringVenues=()=>({source:'OpenStreetMap',timestamp:source.timestamp,attribution:source.attribution,license_url:source.license_url,scope:source.scope,features:source.venues.map(v=>({type:'Feature',geometry:v.rings.length?{type:'Polygon',coordinates:v.rings.map(r=>r.map(map.lonLat))}:{type:'Point',coordinates:v.coordinates},properties:{id:v.id,name:v.name,category:v.category,geometry_kind:v.geometry_kind,url:v.url,center_in_design_scope:map.within(v)},buildings:v.buildings.map(b=>({id:b.id,rings:b.rings.map(r=>r.map(map.lonLat))}))}))});
      window.dispatchEvent(new Event('ats:venues-ready'));
    }catch(error){window.dispatchEvent(new Event('ats:venues-error'));$('env-venues-count').textContent='—';$('env-venue-list').textContent='场馆图层加载失败，请刷新重试。';}
  }
  window.addEventListener('ats:environment-ready',init);
  window.addEventListener('ats:map-view',e=>updateView(e.detail));
  if(window.atsEnvironmentMap)init();
})();
