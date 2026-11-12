(() => {
  'use strict';
  const model = JSON.parse(document.getElementById('engineering-data').textContent);
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const anchor = id => 'sp-' + id.replace(/[^A-Za-z0-9_-]/g, '-');
  const tablist = document.querySelector('.eng-steps');
  const tabs = [...tablist.querySelectorAll('a')];
  const panels = tabs.map(tab => document.querySelector(tab.hash));
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', '工程设计环节');
  const pager = document.createElement('nav');
  pager.className = 'eng-pager';
  pager.setAttribute('aria-label', '切换工程环节');
  pager.innerHTML = '<button type="button" class="eng-secondary" id="eng-prev">上一环节</button><span id="eng-progress"></span><button type="button" id="eng-next">下一环节</button>';
  document.querySelector('.eng-footer').before(pager);
  let activeTab = 0;
  const flow=window.engineeringFlow;
  const notice=document.createElement('div');notice.id='eng-flow-notice';notice.className='eng-flow-notice';notice.setAttribute('role','status');tablist.after(notice);
  function refreshLocks(){tabs.forEach((t,i)=>{const allowed=flow.allowed(i);t.setAttribute('aria-disabled',String(!allowed));t.dataset.state=flow.done[i]?'done':allowed?'ready':'locked';t.title=allowed?(flow.done[i]?'已完成，可返回修改':'当前可执行'):'请先完成'+flow.names[i-1];});$('eng-next').disabled=!flow.allowed(activeTab+1)||activeTab===tabs.length-1;notice.textContent=flow.done[4]?'工程设计成果已就绪。':'当前阶段：'+flow.names[flow.done.findIndex(v=>!v)]+' · 确认后解锁下一阶段。';}
  window.addEventListener('ats:flow-change',()=>{refreshLocks();if(!flow.allowed(activeTab))selectTab(Math.max(0,flow.done.findIndex(v=>!v)),true);});
  function selectTab(index, navigate = false, focus = false) {
    if(!flow.allowed(index)){notice.textContent='此环节尚未解锁，请先完成'+flow.names[Math.max(0,index-1)]+'。';if(location.hash===tabs[index].hash)history.replaceState(null,'',tabs[activeTab].hash);return;}
    activeTab = index;
    document.body.classList.toggle('environment-active', panels[index].id === 'environment');document.body.classList.toggle('workbench-active',['chain','equipment','layout','scheduling'].includes(panels[index].id));window.dispatchEvent(new CustomEvent('ats:engineering-tab',{detail:panels[index].id}));
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    $('eng-prev').disabled = index === 0;
    $('eng-next').disabled = index === tabs.length - 1 || !flow.allowed(index+1);
    $('eng-progress').textContent = `${index + 1} / ${tabs.length} · ${tabs[index].textContent.slice(3)}`;
    if (navigate && location.hash !== tabs[index].hash) history.pushState(null, '', tabs[index].hash);
    if (focus) tabs[index].focus({preventScroll:true});
    if (navigate && tablist.getBoundingClientRect().top < 0) tablist.scrollIntoView({block:'start'});
  }
  tabs.forEach((tab, i) => {
    tab.id = 'eng-tab-' + panels[i].id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', event => {event.preventDefault(); selectTab(i, true);});
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {event.preventDefault(); selectTab(next, true, true);}
    });
  });
  const restoreTab = () => selectTab(Math.max(0, tabs.findIndex(tab => tab.hash === location.hash)));
  window.addEventListener('hashchange', restoreTab);
  $('eng-prev').addEventListener('click', () => selectTab(Math.max(0, activeTab - 1), true, true));
  $('eng-next').addEventListener('click', () => selectTab(Math.min(tabs.length - 1, activeTab + 1), true, true));
  selectTab(0);restoreTab();refreshLocks();
  const modes = {
    normal: {name:'常态负载', headline:'按已核定的初始承载运行', trigger:'观测与计算需求处于节点可用容量内。', actions:['边缘处理观测并输出结构化状态，中心或区域节点组织协作。','固定现场控制与安全核验，持续采集节点负载、队列、链路及服务状态。','按数据策略保留原始视频和运行证据；训练任务使用隔离资源。'], output:'任务—节点绑定、资源配额与实际配置记录。', evidence:'节点利用率、排队与处理时延、链路流量及端到端时间戳。'},
    peak: {name:'客流高峰', headline:'依据实测负载扩展允许迁移的计算任务', trigger:'输入并发或算法调用频率增长，引起队列与时延压力；客流增长不直接等于视频路数增长。', actions:['预测需求并核对剩余算力、模型内存、存储与链路余量。','在权限和时延允许时，将ENG-T02等候选任务分配至空闲边缘或中心节点。','优先保障在线任务，限制非关键归档与训练占用；容量仍不足时按批准策略降级。'], output:'新的任务分配、资源配额、状态交接与生效确认。', evidence:'同负载下的排队、响应、迁移开销、丢弃或降级记录及资源利用率。'},
    fault: {name:'边缘节点故障', headline:'先确认故障影响，再恢复可迁移服务', trigger:'边缘节点A不可用；该节点观测质量与任务状态可能未知。', actions:['标记受影响输入与运行任务，保留现场控制器本地保护；不把未知状态作为成功。','核验候选备用节点的容量、数据可达性、模型版本与授权，恢复允许转移的计算服务。','确认新实例实际生效、旧实例隔离及结果连续性；条件不满足时停止相关协同请求并转责任方。'], output:'故障影响清单、恢复配置、实际状态与接管记录。', evidence:'故障发现时间、恢复时间、丢失或重复任务、状态一致性及本地保护记录。'}
  };
  let selectedMode = 'normal';
  function showTask(index) {
    const task = model.tasks[index];
    document.querySelectorAll('[data-task]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.task) === index)));
    $('task-detail').innerHTML = `<h3>${esc(task.id)} · ${esc(task.name)}</h3><dl>${[['输入 / 输出',task.input+' → '+task.output],['处理负载',task.workload],['资源需求',task.resource],['候选承载',task.placement],['运行约束',task.constraint]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl><div class="eng-source">原场景功能依据：${task.sources.map(s=>`<a href="sp07.html#${anchor(s.id)}">${esc(s.name)} ↗</a>`).join('')}<details><summary>数据记录与验证依据</summary>${task.sources.map(s=>`<p>${esc(s.id)}<br>输入：${esc(s.inputs.join('、'))}<br>输出：${esc(s.outputs.join('、'))}</p>`).join('')}<p>${esc(task.evidence)}</p></details></div>`;
  }
  $('task-chain').innerHTML = model.tasks.map((t,i)=>`<button type="button" data-task="${i}" aria-pressed="${i===0}" aria-controls="task-detail"><span>${esc(t.id)}</span>${esc(t.name)}</button>`).join('');
  document.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>showTask(Number(b.dataset.task))));
  showTask(0);
  $('parameter-fields').innerHTML = model.parameters.map(p=>`<div class="eng-field"><label for="param-${p.id}">${esc(p.label)}</label><input id="param-${p.id}" name="${p.id}" type="number" required min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" aria-describedby="hint-${p.id}"><small id="hint-${p.id}">${esc(p.unit)} · 演示假设</small></div>`).join('');
  $('parameter-notes').innerHTML = model.parameters.map(p=>`<p><b>${esc(p.label)}</b>：${esc(p.basis)}。负责角色：${esc(p.owner)}。核定方式：${esc(p.validation)}。未核定前仅用于方案讨论。</p>`).join('');
  function calculate() {
    if (!$('parameters').checkValidity()) return null;
    const p = Object.fromEntries(model.parameters.map(p=>[p.id,Number($('param-'+p.id).value)]));
    return {parameters:p, bandwidth_mbps:p.streams*p.bitrate, storage_gb:p.streams*p.bitrate*3600*p.hours/8/1000, inference_fps:p.streams*p.fps, equivalent_serial_units:Math.ceil(p.streams*p.fps*p.serviceMs/1000/(p.utilization/100))};
  }
  function update() {
    const result = calculate();
    $('export-design').disabled = !result;
    if (!result) { $('resource-results').innerHTML='<p class="eng-error">请填写范围内的有效参数，当前不生成核算结果。</p>'; return; }
    const n = x=>Number(x.toFixed(2)).toLocaleString('zh-CN');
    $('resource-results').innerHTML = '<div class="eng-metrics">'+[['接入带宽下界',n(result.bandwidth_mbps),'Mbps'],['原始视频容量',n(result.storage_gb),'GB'],['推理吞吐需求',n(result.inference_fps),'帧/秒'],['等效顺序执行单元',result.equivalent_serial_units,'个']].map(([k,v,u])=>`<div><small>${k}</small><strong>${v}</strong><em>${u}</em></div>`).join('')+'</div>';
  }
  $('parameters').addEventListener('input',update);
  $('parameters').addEventListener('submit',e=>e.preventDefault());
  $('parameters').addEventListener('reset',()=>setTimeout(update,0));
  update();
  $('equipment-table').innerHTML='<table><thead><tr><th>候选装备与承载</th><th>能力要求</th><th>待补工程参数与证据</th></tr></thead><tbody>'+model.equipment.map(e=>`<tr><td><b>${esc(e.name)}</b><small>${esc(e.id)} · ${esc(e.form)}<br>${esc(e.tasks)}</small></td><td>${esc(e.capability)}</td><td>${esc(e.pending)}<small>成果接口：${esc(e.evidence)}</small></td></tr>`).join('')+'</tbody></table>';
  function showMode(mode) {
    selectedMode=mode;
    const m=modes[mode];
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
    $('schedule-detail').innerHTML=`<div class="eng-schedule"><h3>${esc(m.headline)}</h3><p>${esc(m.trigger)}</p><ol>${m.actions.map(a=>`<li>${esc(a)}</li>`).join('')}</ol><p><b>调度输出：</b>${esc(m.output)}</p><p><b>验证记录：</b>${esc(m.evidence)}</p></div>`;
  }
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>showMode(b.dataset.mode)));
  showMode('normal');
  $('deliverables').innerHTML=model.deliverables.map(d=>`<article><h3>${esc(d.name)}</h3><p>${esc(d.content)}</p><small>${esc(d.next)}</small></article>`).join('');
  $('export-design').addEventListener('click',()=>{if(!window.engineeringFlow.allowed(5)){$('export-status').textContent='请先完成需求确认、资源配置、布局与并发调度。';return;}
    const result=calculate(); if(!result)return;
    const output={...model,exported_at:new Date().toISOString(),parameter_status:'交通输入条件与资源配置估算',current_parameters:model.parameters.map(p=>({...p,value:result.parameters[p.id]})),resource_estimate:result,estimate_scope:'仅ENG-T01视频观测可选实现；未包含全部任务与工程开销',layout:{status:'候选逻辑拓扑，未运行优化',zones:['场馆与候车区','接驳通道与路口','轨道站与外围接收点'],pending:['实际点位与地理数据','设备容量和链路条件','优化模型与结果']},scheduling:{mode:selectedMode,...modes[selectedMode],status:'拟定策略，未接入真实调度器'},verification_status:'未开展实装与规模验证'};
    delete output.scheduling; // 运行调度记录独立于工程设计交付。
    if (window.getEngineeringEnvironment) output.engineering_instance = window.getEngineeringEnvironment();
    if(window.getEngineeringWorkbench){output.engineering_design=window.getEngineeringWorkbench();output.layout=output.engineering_design.layout;const d=output.engineering_design.derivation,c=output.engineering_design.configuration;if(d){output.resource_estimate={bandwidth_mbps:d.bandwidth_mbps,storage_gb:d.storage_gb,inference_fps:d.inference_fps,equivalent_serial_units:d.equivalent_serial_units};output.current_parameters={video_bitrate_mbps:c.bitrate,frame_service_ms:c.ms,retention_hours:c.hours,planning_utilization_percent:c.util,jobs:output.engineering_design.jobs};output.equipment=output.engineering_design.equipment;output.estimate_scope='所选常态运营需求的并发视频处理、存储与带宽配置估算';}}
    const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='SP07-engineering-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('export-status').textContent='已导出工程设计包，包含常态需求、云边配额、设备布局、维护方案。';
  });
  $('print-design').addEventListener('click',()=>window.print());
})();
