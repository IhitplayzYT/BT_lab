import { Component, inject, ElementRef, AfterViewInit, DestroyRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AnimationService } from '../../services/animation.service';
import * as THREE from 'three';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit {
  private elementRef = inject(ElementRef);
  private animationService = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  
  private isBrowser = isPlatformBrowser(this.platformId);
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private particles: THREE.Points | null = null;
  private animationFrameId: number | null = null;

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeAnimations();
      this.initializeWebGL();
    }
  }

  private initializeAnimations(): void {
    const headline = this.elementRef.nativeElement.querySelector('.hero-headline');
    const subheadline = this.elementRef.nativeElement.querySelector('.hero-subheadline');
    const ctaButtons = this.elementRef.nativeElement.querySelectorAll('.hero-cta');
    
    this.animationService.textReveal(headline, 0.2);
    this.animationService.textReveal(subheadline, 0.4);
    this.animationService.staggerReveal(Array.from(ctaButtons), 0.1);
  }

  private initializeWebGL(): void {
    const container = this.elementRef.nativeElement.querySelector('.hero-canvas');
    if (!container) return;

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 50;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Create particles
    this.createParticles();

    // Mouse interaction
    this.setupMouseInteraction();

    // Animation loop
    this.animate();

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Cleanup
    this.destroyRef.onDestroy(() => {
      this.cleanupWebGL();
    });
  }

  private createParticles(): void {
    if (!this.scene) return;

    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // Gradient colors (purple to green)
      const t = Math.random();
      colors[i * 3] = 0.39 + t * 0.06; // R
      colors[i * 3 + 1] = 0.4 + t * 0.44; // G
      colors[i * 3 + 2] = 0.95 - t * 0.35; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene?.add(this.particles);
  }

  private setupMouseInteraction(): void {
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Store mouse position for animation loop
    (this as any).mouseX = mouseX;
    (this as any).mouseY = mouseY;
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.particles) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Rotate particles
    this.particles.rotation.x += 0.0005;
    this.particles.rotation.y += 0.001;

    // Mouse interaction
    const mouseX = (this as any).mouseX || 0;
    const mouseY = (this as any).mouseY || 0;
    
    this.particles.rotation.x += mouseY * 0.001;
    this.particles.rotation.y += mouseX * 0.001;

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private cleanupWebGL(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
    
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
  }
}
