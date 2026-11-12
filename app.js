const sectionNames = {
  overview: "总览",
  features: "核心特征",
  architecture: "集成架构",
  objects: "架构对象",
  scenarios: "场景包库"
};

const navItems = [...document.querySelectorAll(".nav-item")];
const sectionButtons = [...document.querySelectorAll("button[data-section]")];
const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

function goToSection(section) {
  const target = document.getElementById(section);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  navItems.forEach(item => item.classList.toggle("is-active", item.dataset.section === section));
  breadcrumbCurrent.textContent = sectionNames[section] || section;
}

sectionButtons.forEach(button => button.addEventListener("click", () => goToSection(button.dataset.section)));

const viewData = {
  function: { tag: "FUNCTIONAL VIEW", count: "对应场景包全部主链", title: "功能集成视图", desc: "以交通服务任务为主线，描述任务成立、能力匹配、契约生成、本地执行、状态反馈和资源恢复等功能关系。", note: "上层发布目标、权限与边界，现场对象保留本地安全判断和拒绝权。", lanes: [["服务任务", "任务成立", "能力匹配", "契约生成"], ["运行对象", "感知状态", "自主决策", "执行控制"], ["证据与恢复", "状态回流", "异常降级", "资源释放"]], active: [1, 1] },
  data: { tag: "DATA VIEW", count: "任务—状态—证据可追溯", title: "数据集成视图", desc: "围绕任务编号、规则版本和时空范围组织数据对象，保证信息、契约、回执和证据能够关联、复用和审计。", note: "数据对象带有来源、时效、质量和责任语义，运行日志经过关联后形成证据链。", lanes: [["任务对象", "任务编号", "授权范围", "退出条件"], ["运行数据", "状态位置", "预测计划", "影响变化"], ["证据对象", "执行回执", "异常记录", "审计归档"]], active: [2, 2] },
  equipment: { tag: "EQUIPMENT VIEW", count: "逻辑能力落到物理对象", title: "装备与系统集成视图", desc: "描述交通中心、边缘节点、车辆、船舶、航空器、路侧设施和现场终端的能力分配与部署边界。", note: "装备型自主单元承载感、存、算、网、控、安能力，系统架构保留替换和复用空间。", lanes: [["管理对象", "交通中心", "运营中心", "监督角色"], ["装备对象", "路侧设施", "自主单元", "现场终端"], ["支撑对象", "地图定位", "通信安全", "维护保障"]], active: [1, 2] },
  itot: { tag: "IT / OT VIEW", count: "平台—边缘—现场控制", title: "IT / OT集成视图", desc: "明确中心软件、边缘计算、现场控制器和装备控制系统之间的接口与责任，支撑信息处理和物理执行协同。", note: "IT系统组织目标与信息，OT系统执行现场控制并承担实时安全约束。", lanes: [["IT层", "任务编排", "状态融合", "证据管理"], ["边缘层", "策略下发", "局部判断", "协议适配"], ["OT层", "安全联锁", "物理执行", "本地回退"]], active: [2, 1] },
  hierarchy: { tag: "MULTI-LEVEL VIEW", count: "国家—省市—通道—节点", title: "国家—省市—通道多层级集成视图", desc: "按影响范围、时间尺度和责任边界组织多层级运行，形成上层策略授权、区域协调和现场自主的分工关系。", note: "层级之间传递目标、约束、状态和证据，现场控制权不因层级上移而被替代。", lanes: [["国家级", "规则框架", "能力要求", "安全监管"], ["省市级", "区域策略", "资源协调", "运行监督"], ["通道/节点", "任务执行", "局部闭环", "现场恢复"]], active: [0, 1] }
};

const viewTabs = [...document.querySelectorAll(".view-tab")];
const viewPanel = document.getElementById("viewPanel");
const viewTitle = document.getElementById("viewTitle");
const viewDesc = document.getElementById("viewDesc");
const viewNote = document.getElementById("viewNote");
const viewTag = document.querySelector(".view-panel-tag");
const viewCount = document.querySelector(".view-panel-count");
const viewDiagram = document.getElementById("viewDiagram");

function renderView(key) {
  const data = viewData[key];
  viewTabs.forEach(tab => tab.classList.toggle("is-active", tab.dataset.view === key));
  viewTag.textContent = data.tag;
  viewCount.textContent = data.count;
  viewTitle.textContent = data.title;
  viewDesc.textContent = data.desc;
  viewNote.textContent = data.note;
  viewDiagram.innerHTML = data.lanes.map((lane, row) => `<div class="diagram-lane"><span class="lane-label">${lane[0]}</span>${lane.slice(1).map((label, col) => `<i class="${data.active[0] === row && data.active[1] === col ? "active" : ""}">${label}</i>`).join("")}</div>${row < data.lanes.length - 1 ? '<div class="diagram-arrow">↓</div>' : ''}`).join("");
}

viewTabs.forEach(tab => tab.addEventListener("click", () => renderView(tab.dataset.view)));

const filterButtons = [...document.querySelectorAll(".filter-btn")];
const scenarioCards = [...document.querySelectorAll(".scenario-card")];
filterButtons.forEach(button => button.addEventListener("click", () => {
  filterButtons.forEach(item => item.classList.toggle("is-active", item === button));
  const filter = button.dataset.filter;
  scenarioCards.forEach(card => { card.style.display = filter === "all" || card.dataset.type === filter ? "flex" : "none"; });
}));

const scenarioData = {
  sp02: { code: "ATS-SP-02", title: "城市道路应急通道自主生成、运行与恢复", purpose: "围绕经认证的急救、消防、抢险任务，动态组织道路与信号资源，形成具有时空边界的优先通行通道。", chain: ["任务确认", "资源匹配", "通道契约", "路口执行", "逐段释放", "常态恢复"], boundary: "交通中心负责区域授权与滚动编排；路口控制器保留本地安全联锁；应急车辆驾驶人承担现场安全判断。" },
  sp03: { code: "ATS-SP-03", title: "低空无人机道路事件侦察与地面协同处置", purpose: "以道路事件为牵引，协调空域、航路、无人机侦察、地面处置与交通恢复，形成可验证的空地协同服务。", chain: ["事件确认", "飞行校验", "空地契约", "无人机侦察", "地面处置", "道路恢复"], boundary: "道路系统决定侦察目标与处置任务；低空系统确定飞行条件；无人机本体与远程驾驶员承担实时飞行安全。" },
  sp04: { code: "ATS-SP-04", title: "城市道路自主运行能力演进闭环", purpose: "将多次城市道路运行中的状态、履约、影响和异常证据转化为规则、模型、装备与组织能力的持续提升。", chain: ["运行数据", "评估诊断", "规则模型更新", "仿真验证", "分级发布", "运行监测"], boundary: "能力更新必须经过数据治理、仿真测试、安全评估和分级发布；新能力保留监测、回退和责任追溯条件。" }
};

const detail = document.getElementById("scenarioDetail");
function showScenario(key) {
  const data = scenarioData[key];
  if (!data) return;
  detail.innerHTML = `<div class="detail-content"><div class="detail-code">${data.code}</div><div><h4>${data.title}</h4><p>${data.purpose}</p></div><div><h4>架构边界</h4><p>${data.boundary}</p></div><div class="detail-chain">${data.chain.map((item, index) => `${index ? '<b>→</b>' : ''}<span>${item}</span>`).join("")}</div></div>`;
  detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelectorAll(".scenario-open").forEach(button => button.addEventListener("click", event => showScenario(event.currentTarget.closest(".scenario-card").dataset.scenario)));

const sections = [...document.querySelectorAll(".page-section")];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { const id = entry.target.id; navItems.forEach(item => item.classList.toggle("is-active", item.dataset.section === id)); breadcrumbCurrent.textContent = sectionNames[id] || id; } });
}, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
sections.forEach(section => observer.observe(section));
