import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Component, ElementRef, AfterViewInit, DestroyRef, PLATFORM_ID, inject, viewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [TranslatePipe, CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit {
  readonly translation = inject(TranslationService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly canvasHost = viewChild<ElementRef<HTMLElement>>('canvasHost');

  /** Headline split into words, then letters, so each letter can rise in turn without breaking words. */
  readonly words = (() => {
    let n = 0;
    return 'Grow Your Wealth'.split(' ').map((w) => ({ chars: w.split('').map((c) => ({ c, i: n++ })) }));
  })();

  readonly ticker = [
    'Rates up to 8.5% p.a.',
    'Tenures from 6 to 120 months',
    'Open an FD from ₹10,000',
    'Insured up to ₹5,00,000 per depositor',
    'Compound or simple interest',
    'Manage every deposit from one dashboard'
  ];

  ngAfterViewInit(): void {
    if (this.isBrowser) void this.initScene();
  }

  startInvesting(): void {
    this.router.navigate([this.auth.isLoggedIn() ? '/apply-fd' : '/signup']);
  }

  openCalculator(): void {
    this.router.navigate(['/calculator']);
  }

  /* ---------------------------------------------------------------------
     WebGL: a spiral of gold coins that grow as they climb (compounding),
     two orbiting rings, drifting gold dust. three.js is loaded lazily.
     ------------------------------------------------------------------- */
  private async initScene(): Promise<void> {
    const host = this.canvasHost()?.nativeElement;
    if (!host) return;

    let THREE: typeof import('three');
    let RoomEnvironment: typeof import('three/examples/jsm/environments/RoomEnvironment.js').RoomEnvironment;
    try {
      THREE = await import('three');
      ({ RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js'));
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const rig = new THREE.Group();
    scene.add(rig);

    // Coin: lathe profile with a raised rim and recessed face
    const profile = [
      [0, -0.07], [0.72, -0.07], [0.78, -0.1], [0.94, -0.1], [1, -0.07],
      [1, 0.07], [0.94, 0.1], [0.78, 0.1], [0.72, 0.07], [0, 0.07]
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const coinGeo = new THREE.LatheGeometry(profile, 72);
    const coinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf6b945,
      metalness: 1,
      roughness: 0.24,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.35,
      side: THREE.DoubleSide
    });
    const COUNT = 34;
    const coins = new THREE.InstancedMesh(coinGeo, coinMat, COUNT);
    rig.add(coins);

    // Rings with small satellites
    const ringGeos: InstanceType<typeof THREE.BufferGeometry>[] = [];
    const makeRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const g = new THREE.TorusGeometry(radius, 0.016, 12, 240);
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 });
      const ring = new THREE.Mesh(g, m);
      ring.rotation.set(tiltX, tiltY, 0);
      const sg = new THREE.SphereGeometry(0.11, 20, 20);
      const sat = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color }));
      sat.position.set(radius, 0, 0);
      ring.add(sat);
      ringGeos.push(g, sg);
      rig.add(ring);
      return ring;
    };
    const ringA = makeRing(5.4, 0x2be0cc, 1.25, 0.1);
    const ringB = makeRing(6.6, 0x9d7dff, 1.9, 0.5);

    // Gold dust
    const DUST = 650;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const r = 3 + Math.random() * 10;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      dustPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      dustPos[i * 3 + 1] = r * Math.cos(b) * 0.8;
      dustPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d')!;
    const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,236,190,1)');
    grad.addColorStop(0.35, 'rgba(246,185,69,0.55)');
    grad.addColorStop(1, 'rgba(246,185,69,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(sprite);
    const dustMat = new THREE.PointsMaterial({
      size: 0.22, map: spriteTex, transparent: true, opacity: 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Lights: teal + violet rims over a gold key
    const key = new THREE.DirectionalLight(0xffe3a3, 1.6);
    key.position.set(4, 6, 8);
    const teal = new THREE.PointLight(0x2be0cc, 90, 40);
    teal.position.set(-7, 2, 6);
    const violet = new THREE.PointLight(0x9d7dff, 90, 40);
    violet.position.set(7, -3, 4);
    scene.add(key, teal, violet);

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
      camera.position.set(0, 0.6, aspect < 1 ? 22 : aspect < 1.9 ? 19 : 15.5);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      rig.position.x = aspect > 1.15 ? Math.min(5.2, aspect * 3.1) : 0;
      if (reduced) draw(2.6);
    };

    /* ---- interaction state ---- */
    let mx = 0, my = 0, smx = 0, smy = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const dummy = new THREE.Object3D();
    const heroEl = host.parentElement as HTMLElement;

    const draw = (time: number) => {
      const heroH = heroEl.offsetHeight || window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / heroH));
      host.style.setProperty('--p', p.toFixed(3));

      smx += (mx - smx) * 0.05;
      smy += (my - smy) * 0.05;

      const intro = 1 - Math.pow(1 - Math.min(1, time / 2.6), 3);

      for (let i = 0; i < COUNT; i++) {
        const t = i / (COUNT - 1);
        const ang = i * 0.55 + time * 0.12;
        const radius = 2.1 + t * 1.7;
        const k = Math.min(1, Math.max(0, intro * 1.5 - t * 0.5)); // coins appear bottom to top
        const sc = (0.46 + t * 0.78) * k;
        dummy.position.set(Math.cos(ang) * radius, -4.1 + t * 8.2, Math.sin(ang) * radius);
        dummy.rotation.set(0.45 + Math.sin(time * 0.8 + i) * 0.16, time * 0.5 + i * 0.42, Math.sin(time * 0.6 + i * 0.7) * 0.22);
        dummy.scale.setScalar(Math.max(sc, 0.0001));
        dummy.updateMatrix();
        coins.setMatrixAt(i, dummy.matrix);
      }
      coins.instanceMatrix.needsUpdate = true;

      rig.rotation.y = time * 0.1 + smx * 0.4 + p * 1.4;
      rig.rotation.x = smy * 0.14;
      rig.position.y = p * 3.2 + Math.sin(time * 0.6) * 0.15;
      ringA.rotation.z = time * 0.25;
      ringB.rotation.z = -time * 0.18;
      dust.rotation.y = time * 0.03 + smx * 0.1;
      dust.position.y = p * 2;

      renderer.render(scene, camera);
    };

    /* ---- loop with visibility control ---- */
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
    io.observe(heroEl);
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
      coinGeo.dispose();
      coinMat.dispose();
      ringGeos.forEach((g) => g.dispose());
      dustGeo.dispose();
      dustMat.dispose();
      spriteTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    });
  }
}
