"use strict";

document.querySelectorAll(".diagram-tools[data-for]").forEach(toolbar => {
  const viewport = document.getElementById(toolbar.dataset.for);
  const svg = viewport?.querySelector("svg");
  if (!svg) return;
  const original = svg.viewBox.baseVal.width;
  const originalHeight = svg.viewBox.baseVal.height;
  if (!(original > 0 && originalHeight > 0)) return;
  const output = toolbar.querySelector("output");
  // Keep the controls available when the diagram enters fullscreen.
  const frame = document.createElement('div');
  frame.className = 'diagram-viewer';
  toolbar.before(frame);
  frame.append(toolbar, viewport);
  const fitButton = toolbar.querySelector('[data-action="fit"]');
  fitButton.textContent = '全图';
  fitButton.title = fitButton.ariaLabel = '显示完整图形';
  const addButton = (action, text, title) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.action = action;
    button.textContent = text; button.title = title;
    button.setAttribute('aria-label', title); toolbar.append(button); return button;
  };
  addButton('width', '适合宽度', '按窗口宽度显示，可上下滚动');
  const fullscreen = addButton('fullscreen', '全屏', '全屏查看图形');
  fullscreen.hidden = !frame.requestFullscreen;
  const buttons = [...toolbar.querySelectorAll('button')];
  let width = original;
  let mode = viewport.dataset.initialFit === 'true' ? 'fit' : 'manual';
  function fitWidth() {
    const availableWidth = viewport.clientWidth;
    if (!availableWidth) return 0; // Hidden tabs are measured after becoming visible.
    const cssHeight = parseFloat(getComputedStyle(viewport).maxHeight);
    const availableHeight = Number.isFinite(cssHeight) ? cssHeight : window.innerHeight * .74;
    return Math.min(availableWidth, Math.max(1, availableHeight - 2) * original / originalHeight);
  }
  function render(next, nextMode = 'manual') {
    if (!viewport.clientWidth || !Number.isFinite(next) || next <= 0) return;
    const center = (viewport.scrollLeft + viewport.clientWidth / 2) / width;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / width;
    width = Math.min(original * 2, Math.max(1, next));
    mode = nextMode;
    svg.style.width = `${width}px`;
    svg.style.height = `${width * originalHeight / original}px`;
    output.value = `${Math.round(width / original * 1000) / 10}%`;
    viewport.scrollLeft = mode === 'manual' ? Math.max(0, center * width - viewport.clientWidth / 2) : 0;
    viewport.scrollTop = mode === 'manual' ? Math.max(0, centerY * width - viewport.clientHeight / 2) : 0;
    buttons.forEach(button => {
      button.disabled = button.dataset.action === 'in' ? width >= original * 2 :
        button.dataset.action === 'out' ? width <= 1 : false;
    });
  }
  buttons.forEach(button => button.addEventListener('click', async () => {
    switch (button.dataset.action) {
      case 'in': render(width * 1.2); break;
      case 'out': render(width / 1.2); break;
      case 'fit': render(fitWidth(), 'fit'); break;
      case 'width': render(viewport.clientWidth, 'width'); break;
      case 'reset': render(original); break;
      case 'fullscreen':
        try {
          if (document.fullscreenElement === frame) await document.exitFullscreen();
          else await frame.requestFullscreen();
        } catch { fullscreen.title = '当前浏览器未允许全屏，请使用全图或适合宽度'; }
        break;
    }
  }));
  function resize() {
    if (mode === 'fit') render(fitWidth(), 'fit');
    else if (mode === 'width') render(viewport.clientWidth, 'width');
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(viewport);
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', () => {
    fullscreen.textContent = document.fullscreenElement === frame ? '退出全屏' : '全屏';
    requestAnimationFrame(resize);
  });
  if (mode === 'fit') resize();
  else render(original * Number(viewport.dataset.initialScale || 1));
  toolbar.hidden = false;
  if (svg.querySelectorAll) {
    const paths = [...svg.querySelectorAll('[data-relation]')];
    const setActive = code => {
      svg.classList.toggle('has-active-relation', Boolean(code));
      paths.forEach(path => path.classList.toggle('active-relation', path.dataset.relation === code));
    };
    [...svg.querySelectorAll('[data-label]'), ...paths].forEach(label => {
      const code = label.dataset.label || label.dataset.relation;
      label.addEventListener('mouseenter', () => setActive(code));
      label.addEventListener('mouseleave', () => setActive(''));
      label.addEventListener('focusin', () => setActive(code));
      label.addEventListener('focusout', () => setActive(''));
    });
  }
});
