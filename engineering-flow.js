(() => {
 const done=[false,false,false,false,false];
 const names=['基础环境','需求与缺口','云边端配置','布局设计','并发调度','工程交付'];
 window.engineeringFlow={done,allowed:i=>i===0||done.slice(0,i).every(Boolean),complete(i){if(i>0&&!this.allowed(i))return;done[i]=true;window.dispatchEvent(new Event('ats:flow-change'));},invalidate(i){for(let j=i;j<done.length;j++)done[j]=false;window.dispatchEvent(new Event('ats:flow-change'));},names};
})();
