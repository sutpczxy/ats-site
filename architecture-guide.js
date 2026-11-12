(() => {
  const root = document.getElementById('architecture-guide');
  if (!root) return;
  const labels = ['业务问题','集成需求','总体架构','五视图','场景设计','应用示例'];
  const keys = ['guide-problem','guide-needs','guide-architecture','guide-views','guide-scene','guide-engineering'];
  const scenarios = [
    ['城市','结合任务判断路况|调整路线和通行时间|路口校核后执行|通过后逐段恢复','应急车辆通行时，车辆、道路管理系统和路口设施共享位置及路况，协调路线和信号安排，并根据实际通行情况继续调整。','交通应急动态通道场景',[
      ['路线依赖道路可通行状态','任务、车辆与路况分属不同系统'],['到达时窗依赖路口可执行条件','路线调整同步影响沿线通行安排'],['后续安排依赖实际通过结果','超出权限或安全边界时由人员处置']]],
    ['公路','识别交通影响|确认防护与开工条件|协同调整作业|核验恢复通行','养护作业占用车道时，需要结合车辆和道路监测信息判断交通影响，协调防护、施工和交通管控，并随路况调整作业安排。','占道养护作业协同保障场景',[
      ['作业启动依赖防护实际到位','交通组织与防护布设共同约束开工条件'],['作业调整依赖交通影响研判','排队变化会改变继续作业的条件'],['恢复通行依赖现场状态确认','撤离、撤防与开放分别明确责任']]],
    ['水运','研判会遇风险|协调避让方案|各船校核并操纵|复核实际运动与通过状态','多艘船相遇时，交换航行意图，计算碰撞风险并协调避让方案。各船持续观察实际运动，必要时调整操纵。','限定航段内多船会遇协同避让场景',[
      ['风险判断依赖相关目标状态','船舶能力、意图与观测范围不同'],['本船方案受他船动作影响','需检查多个操纵安排能否相容'],['协同不能替代本船安全责任','各船保留独立判断与应急处置']]],
    ['低空','联合确认到达|协调起降|组织交接|接续运输','空中运输与地面接运需要共享预计到达时间、站点容量和交接进度。各运营商据此协调起降和接运，发生延误时及时调整。','公共接驳站多运营商空地接运场景',[
      ['到达安排依赖站点可用状态','空中计划与地面设施时段需衔接'],['设施释放依赖货物交接进展','接运延迟会影响后续到达与占用'],['协作调整跨越运营商权限','飞行、站点和地面运输分别负责']]]
  ];
  const needs = [
    ['数据共用','状态分散，判断依据需要一致','共享任务、环境及实际执行状态，关联对象、时间与质量。',[1]],
    ['算法协作','评估、预测与优化需要共同工作','按任务组合算法能力，明确输入输出、适用条件和版本。',[0]],
    ['系统适配','新增能力需要接入既有系统与设施','将功能配置到实际装备，匹配资源、接口及运行条件。',[2]],
    ['执行反馈','下发方案之后还要确认实际结果','记录实际动作与效果，支持重新协调、恢复和异常处置。',[3]],
    ['协作授权','各单位拥有不同资源和控制权限','明确数据使用、方案调整、执行控制及责任交接范围。',[4]]
  ];
  const views = [
    ['功能集成','谁研判、谁协调、谁执行','明确任务组织、状态研判、协同决策、现场控制与能力更新的功能分工和协作关系。','architecture-functional.html'],
    ['数据集成','共同依据哪些信息','明确任务、状态、方案、执行及配置记录的关联规则，贯通运行数据与能力更新依据。','architecture-data.html'],
    ['装备与系统集成','功能由哪些系统和设备实现','将功能配置到平台、路侧设施、载运工具等承载对象，明确资源、接口、版本与部署要求。','architecture-equipment.html'],
    ['IT/OT集成','方案怎样落实到现场','核验执行权限与现场条件，实施控制并确认实际生效及恢复。','architecture-itot.html'],
    ['组织与多层级集成','谁有权调整、谁负责','明确各参与主体的责任、权限、协作与交接要求，落实跨区域、跨层级的协调关系。','architecture-organization.html']
  ];
  const titles = ['典型场景分析','各类场景的共同需求','总体集成架构','从五个方面看架构','场景设计与实施','大型活动交通自主疏散'];
  const subs = ['从具体任务开始，了解运行过程、参与各方和协作困难，再确定需要解决的问题。','场景共性的集成需求主要包括数据共用、算法协作、系统适配、执行反馈、协作授权。','根据协作需求，确定各系统的功能、交互过程和责任，再检查这些设计是否一致，形成总体架构。','集成架构通过数据、功能、装备与系统、IT/OT、组织与多层级五个视图展开设计。','明确场景边界，细化五视图设计，经一致性校核形成实施与验证依据。','场馆客流组织、公交调度、道路信号与接收点协同保障。'];
  const conclusions = ['不同交通场景都需要共享信息、配合使用算法、连接设备、反馈结果并明确权限。','形成五项集成需求，进一步开展功能与行为分析、对象与关系设计及架构设计。','集成架构以“授权与责任”为核心，构建“现场任务协同”与“能力更新”双闭环。','用五个视图核对同一项任务的功能、数据、设备、接口和责任是否一致。','形成场景设计包：功能分工、信息交换、系统承载、执行条件与责任权限。','公交调度、客流组织和道路信号共同减少候车与接驳延误，避免候车区过度聚集，兼顾周边社会交通。'];
  const chain = (items) => `<div class="ag-chain">${items.map((x,i)=>`<div><small>${String(i+1).padStart(2,'0')}</small><strong>${x}</strong></div>`).join('')}</div>`;
  let step = Math.max(0,keys.indexOf(location.hash.slice(1))), scene = 0, need = 0, view = 0, loop = 0;
  root.innerHTML = `<header class="ag-heading"><div><span>ATS / 架构设计导读</span><h1>自主式交通系统一体化集成架构</h1></div><button type="button" data-present>大屏讲解</button></header><nav class="ag-tabs" aria-label="架构推导步骤" role="tablist">${labels.map((x,i)=>`<button role="tab" id="ag-tab-${i}" aria-controls="ag-panel" data-step="${i}"><small>0${i+1}</small>${x}</button>`).join('')}</nav><section id="ag-panel" role="tabpanel" tabindex="0"></section><footer class="ag-footer"><span id="ag-progress"></span><div><button data-prev>上一步</button><button data-next>下一步 →</button></div></footer>`;
  function content() {
    if(step===0) return `<div class="ag-select">${scenarios.map((x,i)=>`<button data-scene="${i}" aria-pressed="${scene===i}">${x[0]}</button>`).join('')}</div><div class="ag-business"><span class="ag-kicker">${scenarios[scene][3]}</span>${chain(scenarios[scene][1].split('|'))}<p>${scenarios[scene][2]}</p></div><div class="ag-dependency-label">各方需要如何配合</div><div class="ag-three ag-dependencies">${scenarios[scene][4].map(x=>`<article><b>${x[0]}</b><p>${x[1]}</p></article>`).join('')}</div><div class="ag-source">文字依据：架构技术报告第${10+scene}页 · 典型场景分析</div>`;
    if(step===1) return `<div class="ag-needs ag-ppt-needs">${needs.map((n,i)=>`<button data-need="${i}" aria-pressed="${need===i}"><b>${n[0]}</b><span>${n[1]}</span></button>`).join('')}<button data-need="5" aria-pressed="${need===5}"><b>五项需求的整体关系</b><span>共同支撑交通任务协同运行</span></button></div><figure class="ag-need-figure"><div class="ag-figure-head"><div><small>集成需求示意</small><h3>${need===5?'五项需求相互支撑':needs[need][0]}</h3></div><button data-zoom-need>放大查看 ⤢</button></div><p>${need===5?'在协作授权范围内，数据共用与算法协作支持各主体自主执行，执行反馈支持后续调整，系统适配保障共同运行。':needs[need][2]}</p><button class="ag-image-button" data-zoom-need aria-label="放大${need===5?'需求整体关系':needs[need][0]}示意图"><img src="diagrams/integration-needs/need-${16+need}.png" alt="${need===5?'协作授权约束下，数据共用、算法协作、自主执行及反馈形成协同过程，系统适配提供支撑':needs[need][2]}" /></button><figcaption>架构技术报告 · 第${16+need}页图示</figcaption></figure>`;
    if(step===2) return `<div class="ag-architecture-method"><span>集成需求</span><i>→</i><span>功能与行为分析</span><i>→</i><span>对象与关系设计</span><i>→</i><span>一致性校核</span><i>→</i><b>总体架构</b></div><figure class="ag-need-figure ag-architecture-figure"><div class="ag-architecture-toolbar"><span>以授权与责任为核心，构建现场任务协同与能力更新双闭环</span><button data-zoom-architecture>放大查看 ⤢</button></div><button class="ag-image-button" data-zoom-architecture aria-label="放大总体集成架构图"><img src="diagrams/integration-needs/architecture-24.png" alt="总体集成架构：授权与责任统领现场任务协同和能力更新；任务组织与协作、本地决策与控制、现场执行通过执行反馈形成闭环；运行分析、训练与验证、受控部署形成能力更新；业务系统、控制系统、设施装备、数据总线及算法管理提供支撑。"></button><figcaption>架构技术报告 · 第24页图示</figcaption></figure>`;
    if(step===3) return `<figure class="ag-need-figure ag-views-figure"><div class="ag-architecture-toolbar"><span>总体架构 → 五个集成视图 · 架构技术报告第25页</span><button data-zoom-views>放大查看 ⤢</button></div><button class="ag-image-button" data-zoom-views aria-label="放大从五个方面看架构图"><img src="diagrams/integration-needs/views-25.png" alt="从五个方面看架构：在总体架构中标明功能集成、数据集成、装备与系统集成、IT/OT集成、组织与多层级集成五个视图的设计范围。"></button></figure><div class="ag-view-select">${views.map((v,i)=>`<button data-view="${i}" aria-pressed="${view===i}">${v[0]}</button>`).join('')}</div><div class="ag-view-brief"><div><b>${views[view][1]}</b><span>回应${needs.find(n=>n[3][0]===view)[0]}需求</span><p>${views[view][2]}</p></div><a href="${views[view][3]}">展开视图、详细设计与说明 ↗</a></div>`;
    if(step===4) return `<div class="ag-task"><small>通用场景设计方法</small><h3>以具体交通任务为对象，将架构设计细化为可实施、可验证的场景设计</h3></div>${chain(['确定任务与边界','细化五视图设计','设计一致性校核','形成场景设计包'])}<div class="ag-three"><article><b>明确场景条件</b><p>目标与完成条件、参与主体、运行范围，以及资源和安全约束。</p></article><article><b>落实设计关系</b><p>细化功能分工、数据交换、系统部署、执行交互和责任权限，核对相互对应关系。</p></article><article><b>形成实施依据</b><p>汇集接口与部署要求、授权约定、验证用例，支撑后续集成与应用验证。</p></article></div><p class="ag-feedback">集成与应用验证 → 反馈场景设计问题 → 修订场景包与架构设计</p>`;
    return `<div class="ag-example"><div class="ag-example-top"><span>ATS-SP-07 · 城市交通</span><a href="scenarios.html">浏览全部场景包 ↗</a></div><p class="ag-example-goal">把离场观众有序送达轨道站点和外围接驳点，同时保障周边道路正常通行。</p><div class="ag-example-chain">${['场馆分批放行','公交接驳运力','路口信号调整','接收点换乘衔接'].map((x,i)=>`<div><small>0${i+1}</small><b>${x}</b></div>`).join('')}</div><p class="ag-feedback">依据客流、排队、车辆到站及实际运抵状态，持续调整疏运安排。</p></div><div class="ag-example-path"><article><h3>场景设计</h3><p>功能分工、数据交换、系统装备承载、执行条件与责任权限。</p><a class="ag-link" href="sp07.html">SP-07场景包 →</a></article><article><h3>光明区工程方案</h3><p>常态疏运需求、装备配置、设备布局与维护、云边端资源调度。</p><a class="ag-example-secondary" href="sp07-engineering.html#environment">光明区工程设计 →</a></article></div>`;
  }
  function render() {
    root.dataset.step=step;
    root.querySelectorAll('[data-step]').forEach((b,i)=>{b.setAttribute('aria-selected',i===step);b.tabIndex=i===step?0:-1;});
    const panel=root.querySelector('#ag-panel'); panel.setAttribute('aria-labelledby',`ag-tab-${step}`);
    panel.innerHTML=`<div class="ag-title"><span>0${step+1} / ${labels[step]}</span><h2>${titles[step]}</h2><p>${subs[step]}</p></div><div class="ag-content">${content()}</div><div class="ag-result"><b>${step===5?'服务目标':'设计要点'}</b><span>${conclusions[step]}</span></div>`;
    root.querySelector('#ag-progress').textContent=`0${step+1} / 06 · ${step<5?''+labels[step+1]:'大型赛事散场协同保障'}`;
    root.querySelector('[data-prev]').disabled=step===0;
    root.querySelector('[data-next]').disabled=step===5;
  }
  function go(n){step=Math.max(0,Math.min(5,n));history.replaceState(null,'','#'+keys[step]);render();}
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-step'))go(+b.dataset.step);
    else if(b.hasAttribute('data-prev'))go(step-1);
    else if(b.hasAttribute('data-next'))go(step+1);
    else if(b.hasAttribute('data-zoom-need')||b.hasAttribute('data-zoom-architecture')||b.hasAttribute('data-zoom-views')){const architecture=b.hasAttribute('data-zoom-architecture');const viewDiagram=b.hasAttribute('data-zoom-views');const dialog=document.createElement('dialog');dialog.className='ag-image-dialog';dialog.setAttribute('aria-label',viewDiagram?'从五个方面看架构图放大查看':architecture?'总体集成架构图放大查看':'集成需求示意图放大查看');dialog.innerHTML=`<header><b>${viewDiagram?'从五个方面看架构':architecture?'总体集成架构':need===5?'五项需求的整体关系':needs[need][0]}</b><button autofocus>关闭 ×</button></header><img src="diagrams/integration-needs/${viewDiagram?'views-25':architecture?'architecture-24':'need-'+(16+need)}.png" alt="${viewDiagram?'从五个方面看架构':architecture?'总体集成架构':'集成需求示意图'}">`;document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();root.querySelector(viewDiagram?'[data-zoom-views]':architecture?'[data-zoom-architecture]':'[data-zoom-need]')?.focus();});dialog.showModal();}
    else if(b.hasAttribute('data-present')){document.body.classList.toggle('ag-present');b.textContent=document.body.classList.contains('ag-present')?'退出大屏':'大屏讲解';}
    else {if(b.hasAttribute('data-scene'))scene=+b.dataset.scene;if(b.hasAttribute('data-need'))need=+b.dataset.need;if(b.hasAttribute('data-view'))view=+b.dataset.view;if(b.hasAttribute('data-loop'))loop=+b.dataset.loop;render();}
  });
  root.querySelector('.ag-tabs').addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();go(e.key==='Home'?0:e.key==='End'?5:step+(e.key==='ArrowRight'?1:-1));root.querySelector(`[data-step="${step}"]`).focus();}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.ag-image-dialog[open]')){document.body.classList.remove('ag-present');root.querySelector('[data-present]').textContent='大屏讲解';}});
  window.addEventListener('hashchange',()=>{const i=keys.indexOf(location.hash.slice(1));if(i>=0){step=i;render();}else{const target=document.getElementById(location.hash.slice(1));const details=target?.closest('details');if(details){details.open=true;target.scrollIntoView();}}});
  render();
  const target=document.getElementById(location.hash.slice(1));if(target?.closest('details'))target.closest('details').open=true;
})();
