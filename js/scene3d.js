/* ==========================================================================
   js/scene3d.js — Three.js Floating 3D Transformer Architecture Scene
   Includes Active 3D Data Packet Carrier + Live Floating 3D Data Callout
   ========================================================================== */

window.TransformerScene3D = class TransformerScene3D {
  constructor(containerEl, labelsLayerEl, onSelectComponent) {
    this.container = containerEl;
    this.labelsLayer = labelsLayerEl;
    this.onSelect = onSelectComponent || function () {};

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Spherical camera orbit rig around target
    this.target = new THREE.Vector3(0, 0.4, 0);
    this.desiredTarget = new THREE.Vector3(0, 0.4, 0);
    this.spherical = {
      radius: 26.5,
      desiredRadius: 26.5,
      theta: 0.22,
      desiredTheta: 0.22,
      phi: 1.42,
      desiredPhi: 1.42
    };

    this.meshesById = {};
    this.clickableMeshes = [];
    this.tagElementsById = {};
    this.flowPulses = [];
    this.selectedId = 'inputs';
    this.labelMode = 'all';
    this.autoRotate = false;

    // Active 3D Data Packet Carrier (3 token spheres + glowing ring that travel from block to block)
    this.dataCarrierGroup = null;
    this.carrierFromPos = new THREE.Vector3(-5.2, -7.8, 1.3);
    this.carrierToPos = new THREE.Vector3(-5.2, -7.8, 1.3);
    this.carrierProgress = 1.0;
    this.liveDataCalloutEl = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clock = new THREE.Clock();

    this.setupLights();
    this.buildArchitecture();
    this.buildConnectionsAndPulses();
    this.buildActiveDataCarrier();
    this.createHTMLTags();
    this.bindInteraction();
    this.onResize();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.82);
    this.scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight1.position.set(14, 22, 18);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe0f2fe, 0.38);
    dirLight2.position.set(-16, -10, -14);
    this.scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(28, 28, 0x94a3b8, 0xcbd5e1);
    gridHelper.position.y = -9.2;
    gridHelper.material.opacity = 0.28;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  // Creates the 3D Data Carrier (3 glowing token orbs representing ["The", "coffee", "is"] inside a golden halo ring)
  buildActiveDataCarrier() {
    this.dataCarrierGroup = new THREE.Group();

    // Glowing golden halo ring around the data packet
    const ringGeo = new THREE.TorusGeometry(0.85, 0.06, 12, 36);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.dataCarrierGroup.add(ringMesh);

    // 3 Token Spheres ("The", "coffee", "is")
    const tokenColors = [0x9333EA, 0xF59E0B, 0x10B981];
    this.tokenOrbs = [];
    for (let i = 0; i < 3; i++) {
      const orbGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: tokenColors[i],
        emissive: tokenColors[i],
        emissiveIntensity: 0.45,
        roughness: 0.2
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set((i - 1) * 0.48, 0, 0.15);
      this.dataCarrierGroup.add(orb);
      this.tokenOrbs.push(orb);
    }

    this.dataCarrierGroup.position.copy(this.carrierToPos);
    this.scene.add(this.dataCarrierGroup);
  }

  createDiagramBlock(comp) {
    const [w, h, d] = comp.size;
    const group = new THREE.Group();
    group.position.set(...comp.pos);
    group.userData = { componentId: comp.id };

    if (comp.shape === 'enclosure_encoder' || comp.shape === 'enclosure_decoder') {
      const geo = new THREE.BoxGeometry(w, h, d);
      const isEnc = comp.shape === 'enclosure_encoder';
      const mat = new THREE.MeshPhysicalMaterial({
        color: isEnc ? 0x99F6E4 : 0xFBCFE8,
        transparent: true,
        opacity: 0.18,
        roughness: 0.2,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { componentId: comp.id, isShell: true };
      group.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: isEnc ? 0x0891B2 : 0xBE123C,
        transparent: true,
        opacity: 0.75
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      group.add(wireframe);

      this.meshesById[comp.id] = { group, mainMesh: mesh, baseColor: comp.colorHex, isShell: true };
      this.scene.add(group);
      return;
    }

    if (comp.shape === 'pos_junction') {
      const sumGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 32);
      sumGeo.rotateX(Math.PI / 2);
      const sumMat = new THREE.MeshStandardMaterial({
        color: 0xFEF08A,
        roughness: 0.3,
        metalness: 0.1
      });
      const sumMesh = new THREE.Mesh(sumGeo, sumMat);
      sumMesh.userData = { componentId: comp.id };
      group.add(sumMesh);

      const sumEdges = new THREE.EdgesGeometry(sumGeo);
      group.add(new THREE.LineSegments(sumEdges, new THREE.LineBasicMaterial({ color: 0xB48A1E })));

      const barMat = new THREE.MeshBasicMaterial({ color: 0xB48A1E });
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.42), barMat);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.42), barMat);
      group.add(hBar, vBar);

      const diamondGeo = new THREE.OctahedronGeometry(0.68, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: 0xFEF08A,
        roughness: 0.25,
        metalness: 0.1
      });
      const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
      diamondMesh.position.set(comp.sideOffset, 0, 0);
      diamondMesh.userData = { componentId: comp.id };
      group.add(diamondMesh);

      const dEdges = new THREE.EdgesGeometry(diamondGeo);
      const dWire = new THREE.LineSegments(dEdges, new THREE.LineBasicMaterial({ color: 0xB48A1E }));
      dWire.position.copy(diamondMesh.position);
      group.add(dWire);

      const linkLen = Math.abs(comp.sideOffset) - 0.55;
      const linkGeo = new THREE.CylinderGeometry(0.07, 0.07, linkLen, 12);
      linkGeo.rotateZ(Math.PI / 2);
      const linkMesh = new THREE.Mesh(linkGeo, new THREE.MeshBasicMaterial({ color: 0x334155 }));
      linkMesh.position.set(comp.sideOffset / 2, 0, 0);
      group.add(linkMesh);

      this.clickableMeshes.push(sumMesh, diamondMesh);
      this.meshesById[comp.id] = { group, mainMesh: sumMesh, extraMesh: diamondMesh, baseColor: comp.colorHex };
      this.scene.add(group);
      return;
    }

    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color: comp.colorHex,
      roughness: 0.28,
      metalness: 0.08
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { componentId: comp.id };
    group.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const borderMat = new THREE.LineBasicMaterial({
      color: comp.borderHex || 0x1E293B
    });
    const wireframe = new THREE.LineSegments(edges, borderMat);
    group.add(wireframe);

    this.clickableMeshes.push(mesh);
    this.meshesById[comp.id] = { group, mainMesh: mesh, baseColor: comp.colorHex };
    this.scene.add(group);
  }

  buildArchitecture() {
    this.archGroup = new THREE.Group();
    const comps = window.TransformerArchData.components;
    Object.keys(comps).forEach(key => {
      this.createDiagramBlock(comps[key]);
    });
  }

  addPipePath(points, colorHex, numPulses = 2, speed = 0.35) {
    const vPoints = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const curve = new THREE.CatmullRomCurve3(vPoints, false, 'catmullrom', 0.18);
    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.075, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: colorHex || 0x1E293B,
      roughness: 0.4
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(tubeMesh);

    for (let i = 0; i < numPulses; i++) {
      const pGeo = new THREE.SphereGeometry(0.16, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      this.scene.add(pMesh);
      this.flowPulses.push({
        mesh: pMesh,
        curve: curve,
        offset: i / numPulses,
        speed: speed
      });
    }
  }

  buildConnectionsAndPulses() {
    const X_ENC = -5.2;
    const X_DEC = 5.2;

    // 1. ENCODER MAIN VERTICAL SPINE
    this.addPipePath([[X_ENC, -7.5, 0], [X_ENC, -6.55, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_ENC, -5.65, 0], [X_ENC, -4.95, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_ENC, -3.85, 0], [X_ENC, -2.85, 0]], 0x1E293B, 1, 0.5);

    this.addPipePath([[X_ENC, -3.45, 0], [X_ENC - 1.2, -3.35, 0.35], [X_ENC - 1.2, -2.85, 0.2]], 0x7E22CE, 1, 0.45);
    this.addPipePath([[X_ENC, -3.45, 0], [X_ENC + 1.2, -3.35, -0.35], [X_ENC + 1.2, -2.85, -0.2]], 0x7E22CE, 1, 0.45);

    this.addPipePath([[X_ENC, -1.75, 0], [X_ENC, -1.12, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_ENC, -0.28, 0], [X_ENC, 0.42, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_ENC, 1.38, 0], [X_ENC, 1.98, 0]], 0x1E293B, 1, 0.5);

    // Encoder Residual Skip Loops
    this.addPipePath([
      [X_ENC, -3.55, 0],
      [X_ENC - 2.45, -3.55, 1.35],
      [X_ENC - 2.45, -0.7, 1.35],
      [X_ENC - 2.1, -0.7, 0]
    ], 0xD97706, 2, 0.35);

    this.addPipePath([
      [X_ENC, -0.05, 0],
      [X_ENC - 2.45, -0.05, 1.35],
      [X_ENC - 2.45, 2.4, 1.35],
      [X_ENC - 2.1, 2.4, 0]
    ], 0xD97706, 2, 0.35);

    // 2. ENCODER-TO-DECODER CROSS-ATTENTION BRIDGE
    this.addPipePath([
      [X_ENC, 2.85, 0],
      [X_ENC, 3.85, 0],
      [-0.4, 3.85, 0.4],
      [-0.4, -0.1, 0.4],
      [X_DEC - 1.2, -0.1, 0.25],
      [X_DEC - 1.2, 0.35, 0]
    ], 0x0891B2, 3, 0.28);

    this.addPipePath([
      [-0.4, -0.1, 0.4],
      [X_DEC, -0.1, -0.25],
      [X_DEC, 0.35, 0]
    ], 0x0891B2, 2, 0.28);

    // 3. DECODER MAIN VERTICAL SPINE
    this.addPipePath([[X_DEC, -7.5, 0], [X_DEC, -6.55, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, -5.65, 0], [X_DEC, -4.95, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, -3.85, 0], [X_DEC, -2.88, 0]], 0x1E293B, 1, 0.5);

    this.addPipePath([[X_DEC, -3.45, 0], [X_DEC - 1.2, -3.35, 0.35], [X_DEC - 1.2, -2.88, 0.2]], 0x7E22CE, 1, 0.45);
    this.addPipePath([[X_DEC, -3.45, 0], [X_DEC + 1.2, -3.35, -0.35], [X_DEC + 1.2, -2.88, -0.2]], 0x7E22CE, 1, 0.45);

    this.addPipePath([[X_DEC, -1.72, 0], [X_DEC, -1.12, 0]], 0x1E293B, 1, 0.5);

    this.addPipePath([
      [X_DEC, -0.28, 0],
      [X_DEC + 1.2, 0.0, 0],
      [X_DEC + 1.2, 0.35, 0]
    ], 0x1E293B, 1, 0.45);

    this.addPipePath([[X_DEC, 1.45, 0], [X_DEC, 1.98, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, 2.82, 0], [X_DEC, 3.32, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, 4.28, 0], [X_DEC, 4.68, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, 5.52, 0], [X_DEC, 6.28, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, 7.12, 0], [X_DEC, 7.68, 0]], 0x1E293B, 1, 0.5);
    this.addPipePath([[X_DEC, 8.52, 0], [X_DEC, 9.22, 0]], 0x1E293B, 1, 0.5);

    // Decoder Residual Skip Loops
    this.addPipePath([
      [X_DEC, -3.55, 0],
      [X_DEC + 2.45, -3.55, 1.35],
      [X_DEC + 2.45, -0.7, 1.35],
      [X_DEC + 2.1, -0.7, 0]
    ], 0xD97706, 2, 0.35);

    this.addPipePath([
      [X_DEC, -0.05, 0],
      [X_DEC + 2.45, -0.05, 1.35],
      [X_DEC + 2.45, 2.4, 1.35],
      [X_DEC + 2.1, 2.4, 0]
    ], 0xD97706, 2, 0.35);

    this.addPipePath([
      [X_DEC, 3.05, 0],
      [X_DEC + 2.45, 3.05, 1.35],
      [X_DEC + 2.45, 5.1, 1.35],
      [X_DEC + 2.1, 5.1, 0]
    ], 0xD97706, 2, 0.35);
  }

  createHTMLTags() {
    this.labelsLayer.innerHTML = '';
    const comps = window.TransformerArchData.components;

    Object.keys(comps).forEach(id => {
      const comp = comps[id];
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = `tag-3d ${comp.tagStyle}`;
      tag.setAttribute('data-comp-id', id);
      tag.innerHTML = `<span>${comp.label}</span>`;

      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectComponent(id, true);
      });

      this.labelsLayer.appendChild(tag);
      this.tagElementsById[id] = tag;
    });

    // Create the floating 3D Live Data Callout badge that hovers over the active component
    const callout = document.createElement('div');
    callout.id = 'live-data-callout';
    callout.className = 'data-callout-3d';
    this.labelsLayer.appendChild(callout);
    this.liveDataCalloutEl = callout;

    this.updateSelectionVisuals();
  }

  selectComponent(id, focusCamera = true) {
    if (!window.TransformerArchData.components[id]) return;
    const prevComp = window.TransformerArchData.components[this.selectedId];
    this.selectedId = id;
    const comp = window.TransformerArchData.components[id];

    // Animate the 3D Data Carrier from the previous component position into the newly selected component!
    if (prevComp) {
      this.carrierFromPos.set(prevComp.pos[0], prevComp.pos[1], (prevComp.size[2] || 1.5) * 0.68);
    }
    this.carrierToPos.set(comp.pos[0], comp.pos[1], (comp.size[2] || 1.5) * 0.68);
    this.carrierProgress = 0.0;

    if (focusCamera) {
      this.desiredTarget.set(comp.pos[0] * 0.45, comp.pos[1] * 0.65, 0);
    }

    this.updateSelectionVisuals();
    this.onSelect(comp);
  }

  updateSelectionVisuals() {
    const comps = window.TransformerArchData.components;
    const activeComp = comps[this.selectedId];

    Object.keys(this.meshesById).forEach(id => {
      const item = this.meshesById[id];
      const isSelected = id === this.selectedId;

      if (!item.isShell && item.mainMesh && item.mainMesh.material) {
        item.mainMesh.material.emissive = new THREE.Color(isSelected ? 0x334155 : 0x000000);
        item.mainMesh.material.emissiveIntensity = isSelected ? 0.35 : 0;
        const s = isSelected ? 1.07 : 1.0;
        item.group.scale.set(s, s, s);
      }

      const tag = this.tagElementsById[id];
      if (tag) {
        tag.classList.toggle('is-selected', isSelected);
        if (this.labelMode === 'minimal') {
          const isMajor = comps[id].shape.startsWith('enclosure') || id === 'inputs' || id === 'output_probs' || isSelected;
          tag.style.display = isMajor ? 'inline-flex' : 'none';
        } else {
          tag.style.display = 'inline-flex';
        }
      }
    });

    // Update the floating 3D Live Data Transformation Callout content
    if (this.liveDataCalloutEl && activeComp && activeComp.dataFlow) {
      this.liveDataCalloutEl.innerHTML = `
        <div class="font-extrabold text-amber-400 text-[10px] uppercase tracking-wider mb-0.5">
          ${activeComp.dataFlow.badge}
        </div>
        <div class="font-mono text-[11px] text-white">
          <span class="text-slate-300">${activeComp.dataFlow.before}</span>
          <span class="text-amber-400 font-bold mx-1">➔</span>
          <span class="text-emerald-300 font-bold">${activeComp.dataFlow.after}</span>
        </div>
      `;
    }
  }

  setLabelMode(mode) {
    this.labelMode = mode;
    this.updateSelectionVisuals();
  }

  setCameraPreset(preset) {
    if (preset === 'front') {
      this.desiredTarget.set(0, 0.4, 0);
      this.spherical.desiredRadius = 26.5;
      this.spherical.desiredTheta = 0.0;
      this.spherical.desiredPhi = Math.PI / 2;
    } else if (preset === 'angle3d') {
      this.desiredTarget.set(0, 0.4, 0);
      this.spherical.desiredRadius = 26.5;
      this.spherical.desiredTheta = 0.38;
      this.spherical.desiredPhi = 1.34;
    } else if (preset === 'side') {
      this.desiredTarget.set(0, 0.2, 0);
      this.spherical.desiredRadius = 25.0;
      this.spherical.desiredTheta = 0.92;
      this.spherical.desiredPhi = 1.42;
    }
  }

  zoomDelta(delta) {
    this.spherical.desiredRadius = Math.max(12, Math.min(42, this.spherical.desiredRadius + delta));
  }

  bindInteraction() {
    let isDragging = false;
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let movedDistance = 0;

    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      isDragging = true;
      isPanning = e.shiftKey || e.button === 2;
      startX = e.clientX;
      startY = e.clientY;
      movedDistance = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      movedDistance += Math.abs(dx) + Math.abs(dy);

      if (isPanning) {
        this.desiredTarget.x -= dx * 0.022;
        this.desiredTarget.y += dy * 0.022;
      } else {
        this.spherical.desiredTheta -= dx * 0.0075;
        this.spherical.desiredPhi = Math.max(0.35, Math.min(2.75, this.spherical.desiredPhi - dy * 0.0075));
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;

      if (movedDistance < 6 && e.target === dom) {
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.clickableMeshes, false);
        if (hits.length > 0) {
          const compId = hits[0].object.userData.componentId;
          if (compId) {
            this.selectComponent(compId, true);
          }
        }
      }
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomDelta(e.deltaY * 0.015);
    }, { passive: false });

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      this.spherical.desiredTheta -= dx * 0.0075;
      this.spherical.desiredPhi = Math.max(0.35, Math.min(2.75, this.spherical.desiredPhi - dy * 0.0075));
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  onResize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  updateHTMLTagsProjection() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const comps = window.TransformerArchData.components;
    const tempV = new THREE.Vector3();

    Object.keys(comps).forEach(id => {
      const comp = comps[id];
      const tag = this.tagElementsById[id];
      if (!tag) return;

      if (id === 'encoder_shell') {
        tempV.set(comp.pos[0] + 3.35, comp.pos[1] + 0.1, 0.8);
      } else if (id === 'decoder_shell') {
        tempV.set(comp.pos[0] - 3.35, comp.pos[1] - 0.1, 0.8);
      } else if (comp.shape === 'pos_junction') {
        tempV.set(comp.pos[0] + comp.sideOffset, comp.pos[1] - 0.95, 0.5);
      } else {
        tempV.set(comp.pos[0], comp.pos[1], comp.size[2] * 0.58);
      }

      tempV.project(this.camera);

      const x = (tempV.x * 0.5 + 0.5) * w;
      const y = (-(tempV.y * 0.5) + 0.5) * h;

      tag.style.left = `${x}px`;
      tag.style.top = `${y}px`;
      tag.style.zIndex = id === this.selectedId ? '40' : String(Math.round((1 - tempV.z) * 20));
    });

    // Project the floating 3D Live Data Transformation Callout right above the active component
    if (this.liveDataCalloutEl && comps[this.selectedId]) {
      const activeComp = comps[this.selectedId];
      tempV.set(activeComp.pos[0], activeComp.pos[1] + (activeComp.size[1] * 0.55) + 0.45, activeComp.size[2] * 0.65);
      tempV.project(this.camera);
      const cx = (tempV.x * 0.5 + 0.5) * w;
      const cy = (-(tempV.y * 0.5) + 0.5) * h;
      this.liveDataCalloutEl.style.left = `${cx}px`;
      this.liveDataCalloutEl.style.top = `${cy}px`;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    if (this.autoRotate) {
      this.spherical.desiredTheta += dt * 0.28;
    }

    this.spherical.radius += (this.spherical.desiredRadius - this.spherical.radius) * 0.1;
    this.spherical.theta += (this.spherical.desiredTheta - this.spherical.theta) * 0.1;
    this.spherical.phi += (this.spherical.desiredPhi - this.spherical.phi) * 0.1;
    this.target.lerp(this.desiredTarget, 0.1);

    const r = this.spherical.radius;
    const sinPhi = Math.sin(this.spherical.phi);
    this.camera.position.x = this.target.x + r * sinPhi * Math.sin(this.spherical.theta);
    this.camera.position.y = this.target.y + r * Math.cos(this.spherical.phi);
    this.camera.position.z = this.target.z + r * sinPhi * Math.cos(this.spherical.theta);
    this.camera.lookAt(this.target);

    const bobOffset = Math.sin(elapsed * 1.5) * 0.08;
    Object.keys(this.meshesById).forEach(id => {
      const comp = window.TransformerArchData.components[id];
      this.meshesById[id].group.position.y = comp.pos[1] + bobOffset;
    });

    // Animate the Active 3D Data Carrier smoothly traveling into the current component
    if (this.dataCarrierGroup) {
      this.carrierProgress = Math.min(1.0, this.carrierProgress + dt * 2.2);
      const ease = 1 - Math.pow(1 - this.carrierProgress, 3);
      this.dataCarrierGroup.position.lerpVectors(this.carrierFromPos, this.carrierToPos, ease);
      this.dataCarrierGroup.position.y += bobOffset;
      this.dataCarrierGroup.rotation.z = elapsed * 1.2;

      // Pulse the 3 token orbs gently
      this.tokenOrbs.forEach((orb, idx) => {
        const s = 1 + Math.sin(elapsed * 4 + idx * 1.3) * 0.18;
        orb.scale.set(s, s, s);
      });
    }

    // Advance background flow pulses along all 3D pipes
    this.flowPulses.forEach(p => {
      const t = (elapsed * p.speed + p.offset) % 1;
      const pt = p.curve.getPointAt(t);
      p.mesh.position.set(pt.x, pt.y + bobOffset, pt.z);
    });

    this.renderer.render(this.scene, this.camera);
    this.updateHTMLTagsProjection();
  }
};
