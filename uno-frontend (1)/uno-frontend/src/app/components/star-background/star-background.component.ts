import { Component, ElementRef, AfterViewInit, DestroyRef, PLATFORM_ID, inject, viewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-star-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-background.component.html',
  styleUrls: ['./star-background.component.scss']
})
export class StarBackgroundComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly canvasHost = viewChild<ElementRef<HTMLElement>>('canvasHost');

  ngAfterViewInit(): void {
    if (this.isBrowser) void this.initScene();
  }

  /* ---------------------------------------------------------------------
     WebGL: Star field with constellation lines, gold dust particles
     ------------------------------------------------------------------- */
  private async initScene(): Promise<void> {
    const host = this.canvasHost()?.nativeElement;
    if (!host) return;

    let THREE: typeof import('three');
    try {
      THREE = await import('three');
    } catch {
      host.classList.add('no-webgl');
      return;
    }

    let renderer: InstanceType<typeof THREE.WebGLRenderer>;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      host.classList.add('no-webgl');
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    const rig = new THREE.Group();
    scene.add(rig);

    // Stars/Constellation particles
    const STAR_COUNT = 400;
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starSizes = new Float32Array(STAR_COUNT);
    const starColors = new Float32Array(STAR_COUNT * 3);
    
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 5 + Math.random() * 25;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      starPos[i * 3 + 1] = r * Math.cos(b) * 0.6;
      starPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
      starSizes[i] = 0.5 + Math.random() * 2;
      
      // Mix of gold, white, and subtle blue stars
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        // Gold
        starColors[i * 3] = 0.96;
        starColors[i * 3 + 1] = 0.73;
        starColors[i * 3 + 2] = 0.27;
      } else if (colorChoice < 0.7) {
        // White
        starColors[i * 3] = 1;
        starColors[i * 3 + 1] = 1;
        starColors[i * 3 + 2] = 1;
      } else {
        // Subtle blue
        starColors[i * 3] = 0.6;
        starColors[i * 3 + 1] = 0.8;
        starColors[i * 3 + 2] = 1;
      }
    }
    
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d')!;
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,236,190,0.8)');
    grad.addColorStop(1, 'rgba(246,185,69,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(sprite);
    
    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      map: spriteTex,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeo, starMat);
    rig.add(stars);

    // Constellation lines (connect nearby stars)
    const lineGeo = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      for (let j = i + 1; j < STAR_COUNT; j++) {
        const dx = starPos[i * 3] - starPos[j * 3];
        const dy = starPos[i * 3 + 1] - starPos[j * 3 + 1];
        const dz = starPos[i * 3 + 2] - starPos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4 && Math.random() < 0.15) {
          linePositions.push(
            starPos[i * 3], starPos[i * 3 + 1], starPos[i * 3 + 2],
            starPos[j * 3], starPos[j * 3 + 1], starPos[j * 3 + 2]
          );
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2be0cc,
      transparent: true,
      opacity: 0.3
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    rig.add(lines);

    // Gold dust particles
    const DUST = 300;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const r = 3 + Math.random() * 15;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      dustPos[i * 3 + 1] = r * Math.cos(b) * 0.8;
      dustPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustSprite = document.createElement('canvas');
    dustSprite.width = dustSprite.height = 32;
    const dctx = dustSprite.getContext('2d')!;
    const dgrad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    dgrad.addColorStop(0, 'rgba(255,236,190,1)');
    dgrad.addColorStop(0.5, 'rgba(246,185,69,0.5)');
    dgrad.addColorStop(1, 'rgba(246,185,69,0)');
    dctx.fillStyle = dgrad;
    dctx.fillRect(0, 0, 32, 32);
    const dustTex = new THREE.CanvasTexture(dustSprite);
    const dustMat = new THREE.PointsMaterial({
      size: 0.08,
      map: dustTex,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    rig.add(dust);

    // Lights
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambient);
    const teal = new THREE.PointLight(0x2be0cc, 50, 30);
    teal.position.set(-5, 3, 5);
    const violet = new THREE.PointLight(0x9d7dff, 50, 30);
    violet.position.set(5, -2, 4);
    scene.add(teal, violet);

    /* ---- sizing ---- */
    let aspect = 1;
    const resize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      aspect = w / h;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = aspect;
      camera.position.set(0, 0, 20);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      if (reduced) draw(2.6);
    };

    /* ---- interaction ---- */
    let mx = 0, my = 0, smx = 0, smy = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const draw = (time: number) => {
      smx += (mx - smx) * 0.03;
      smy += (my - smy) * 0.03;

      rig.rotation.y = time * 0.02 + smx * 0.2;
      rig.rotation.x = smy * 0.1;
      stars.rotation.y = time * 0.01;
      dust.rotation.y = time * 0.015 + smx * 0.05;
      lines.rotation.y = time * 0.01;

      renderer.render(scene, camera);
    };

    /* ---- loop ---- */
    let raf = 0;
    let running = false;
    let visible = true;
    const t0 = performance.now();
    const frame = () => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      draw((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const onVis = () => !document.hidden && start();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);

    resize();
    host.classList.add('ready');
    if (reduced) draw(2.6);
    else start();

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(raf);
      running = false;
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      starGeo.dispose();
      starMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      spriteTex.dispose();
      dustTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    });
  }
}
