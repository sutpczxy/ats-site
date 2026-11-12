"use strict";
(() => {
 const nav=document.querySelector('[data-view-navigation]');if(!nav)return;
 const links=[...nav.querySelectorAll('a')];
 const targets=links.map(a=>document.getElementById(a.hash.slice(1)));
 let pending=false;
 function update(){
  pending=false;
  const top=Math.ceil(document.querySelector('.topbar')?.getBoundingClientRect().height||0);
  const height=Math.ceil(nav.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--view-topbar',top+'px');
  document.documentElement.style.setProperty('--view-reading-offset',(top+height+16)+'px');
  const threshold=top+height+24;let active=0;
  targets.forEach((n,i)=>{if(n&&n.getBoundingClientRect().top<=threshold)active=i;});
  links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 if(window.ResizeObserver)new ResizeObserver(schedule).observe(nav);
 update();
 // A direct cross-view link should arrive at its stage reader, below the sticky navigation.
 let key;try{key=decodeURIComponent(location.hash.slice(1));}catch{return;}
 const target=document.getElementById(key);
 if(target){
  for(let n=target;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;
  requestAnimationFrame(()=>{update();target.scrollIntoView({block:'start'});});
 }
})();
