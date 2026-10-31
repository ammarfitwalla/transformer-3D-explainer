/* ==========================================================================
   js/app.js — Main Application Controller
   Wires 3D camera presets, 1->21 Guided Data Flow Tour, Closeable Info Card,
   Live Data Transformation Strip, and Modular Code Viewer
   ========================================================================== */

window.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('canvas-container');
  const labelsLayerEl = document.getElementById('labels-layer');

  // Info Card DOM elements
  const infoCardEl = document.getElementById('info-card');
  const closeInfoBtn = document.getElementById('close-info-btn');
  const reopenInfoBtn = document.getElementById('reopen-info-btn');
  const cardBadgeEl = document.getElementById('info-badge');
  const cardTitleEl = document.getElementById('info-title');
  const cardBodyEl = document.getElementById('info-body');
  const cardWhyEl = document.getElementById('info-why');
  const stepCounterEl = document.getElementById('step-counter');

  // Live Data Transformation Strip inside the Info Box
  const dataFlowBadgeEl = document.getElementById('data-flow-badge');
  const dataBeforeEl = document.getElementById('data-before');
  const dataActionEl = document.getElementById('data-action');
  const dataAfterEl = document.getElementById('data-after');

  // Navigation & Camera Buttons
  const prevCompBtn = document.getElementById('prev-comp-btn');
  const nextCompBtn = document.getElementById('next-comp-btn');
  const tourPlayBtn = document.getElementById('tour-play-btn');
  const presetFrontBtn = document.getElementById('cam-front-btn');
  const presetAngleBtn = document.getElementById('cam-angle-btn');
  const presetSideBtn = document.getElementById('cam-side-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const toggleLabelsBtn = document.getElementById('toggle-labels-btn');
  const autoRotateBtn = document.getElementById('auto-rotate-btn');

  // Modular Code Modal
  const openModulesBtn = document.getElementById('open-modules-btn');
  const closeModulesBtn = document.getElementById('close-modules-btn');
  const modulesModal = document.getElementById('modules-modal');
  const moduleTabButtons = document.querySelectorAll('[data-module-file]');
  const moduleCodeViewer = document.getElementById('module-code-viewer');

  let tourTimer = null;
  let labelMode = 'all';

  function openInfoBox() {
    if (infoCardEl) infoCardEl.classList.remove('is-closed');
    if (reopenInfoBtn) reopenInfoBtn.classList.add('hidden');
  }

  function closeInfoBox() {
    if (infoCardEl) infoCardEl.classList.add('is-closed');
    if (reopenInfoBtn) reopenInfoBtn.classList.remove('hidden');
  }

  function renderExplanationCard(comp, shouldOpenCard = true) {
    if (shouldOpenCard) {
      openInfoBox();
    }
    const total = window.TransformerArchData.tourOrder.length;
    if (cardBadgeEl) cardBadgeEl.textContent = `${comp.category.toUpperCase()} · STEP ${comp.stepNum} OF ${total}`;
    if (cardTitleEl) cardTitleEl.textContent = comp.label;
    if (cardBodyEl) {
      cardBodyEl.innerHTML = comp.summary.map(line => `<p>${line}</p>`).join('');
    }
    if (cardWhyEl) {
      cardWhyEl.textContent = comp.whyImportant;
    }
    if (stepCounterEl) {
      stepCounterEl.textContent = `${comp.stepNum} / ${total}`;
    }

    // Populate the Simple Data Transformation Strip ("What Happens to Data Here")
    if (comp.dataFlow) {
      if (dataFlowBadgeEl) dataFlowBadgeEl.textContent = comp.dataFlow.badge;
      if (dataBeforeEl) dataBeforeEl.textContent = comp.dataFlow.before;
      if (dataActionEl) dataActionEl.textContent = comp.dataFlow.action;
      if (dataAfterEl) dataAfterEl.textContent = comp.dataFlow.after;
    }
  }

  // Initialize 3D Scene
  let isInitialLoad = true;
  const scene3d = new window.TransformerScene3D(containerEl, labelsLayerEl, (comp) => {
    renderExplanationCard(comp, !isInitialLoad);
    isInitialLoad = false;
  });

  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', () => {
      closeInfoBox();
    });
  }

  if (reopenInfoBtn) {
    reopenInfoBtn.addEventListener('click', () => {
      openInfoBox();
    });
  }

  function stepTour(delta) {
    const order = window.TransformerArchData.tourOrder;
    const currentIdx = order.indexOf(scene3d.selectedId);
    const nextIdx = (currentIdx + delta + order.length) % order.length;
    scene3d.selectComponent(order[nextIdx], true);
  }

  function stopAutoTour() {
    if (tourTimer) {
      clearInterval(tourTimer);
      tourTimer = null;
    }
    if (tourPlayBtn) {
      tourPlayBtn.textContent = '▶ Follow the Data';
      tourPlayBtn.classList.remove('bg-[#0F172A]', 'text-white');
    }
  }

  function toggleAutoTour() {
    if (tourTimer) {
      stopAutoTour();
      return;
    }
    if (tourPlayBtn) {
      tourPlayBtn.textContent = '⏸ Pause Tour';
    }
    stepTour(1);
    tourTimer = setInterval(() => {
      stepTour(1);
    }, 3400);
  }

  if (prevCompBtn) {
    prevCompBtn.addEventListener('click', () => {
      stopAutoTour();
      stepTour(-1);
    });
  }

  if (nextCompBtn) {
    nextCompBtn.addEventListener('click', () => {
      stopAutoTour();
      stepTour(1);
    });
  }

  if (tourPlayBtn) {
    tourPlayBtn.addEventListener('click', () => {
      toggleAutoTour();
    });
  }

  if (presetFrontBtn) {
    presetFrontBtn.addEventListener('click', () => scene3d.setCameraPreset('front'));
  }
  if (presetAngleBtn) {
    presetAngleBtn.addEventListener('click', () => scene3d.setCameraPreset('angle3d'));
  }
  if (presetSideBtn) {
    presetSideBtn.addEventListener('click', () => scene3d.setCameraPreset('side'));
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => scene3d.zoomDelta(-3.2));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => scene3d.zoomDelta(3.2));
  }

  if (toggleLabelsBtn) {
    toggleLabelsBtn.addEventListener('click', () => {
      labelMode = labelMode === 'all' ? 'minimal' : 'all';
      scene3d.setLabelMode(labelMode);
      toggleLabelsBtn.textContent = labelMode === 'all' ? '🏷️ All Tags' : '🏷️ Minimal Tags';
    });
  }

  if (autoRotateBtn) {
    autoRotateBtn.addEventListener('click', () => {
      scene3d.autoRotate = !scene3d.autoRotate;
      autoRotateBtn.textContent = scene3d.autoRotate ? '⏸ Stop Orbit' : '🔄 Auto-Orbit';
    });
  }

  // Modular Code Modal Viewer
  function decodeUtf8B64(b64) {
    try {
      return decodeURIComponent(Array.prototype.map.call(window.atob(b64), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      return '// Unable to decode source';
    }
  }

  function showModuleSource(fileKey) {
    if (!moduleCodeViewer) return;
    if (window.ModularSourcesB64 && window.ModularSourcesB64[fileKey]) {
      moduleCodeViewer.textContent = decodeUtf8B64(window.ModularSourcesB64[fileKey]);
    } else {
      moduleCodeViewer.textContent = '// Open the modular file in your local editor: ' + fileKey;
    }
    moduleTabButtons.forEach(btn => {
      const active = btn.getAttribute('data-module-file') === fileKey;
      btn.className = active
        ? 'px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#0F172A] text-white'
        : 'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300';
    });
  }

  if (openModulesBtn && modulesModal) {
    openModulesBtn.addEventListener('click', () => {
      modulesModal.classList.remove('hidden');
      modulesModal.classList.add('flex');
      showModuleSource('js/scene3d.js');
    });
  }

  if (closeModulesBtn && modulesModal) {
    closeModulesBtn.addEventListener('click', () => {
      modulesModal.classList.add('hidden');
      modulesModal.classList.remove('flex');
    });
  }

  moduleTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showModuleSource(btn.getAttribute('data-module-file'));
    });
  });

  // Start with Step 1 (Inputs) selected and info box open
  scene3d.selectComponent('inputs', false);
  openInfoBox();
});
