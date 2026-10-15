import{A as fe,B as bl,C as ut,D as dt,E as ta,F as ea,G as wl,H as rp,I as Vn,J as En,K as vu,L as er,M as ot,N as xe,O as Ei,Q as vs,R as ys,S as Ss,V as na,W as qe,X as Tl,a as jo,aa as sp,b as ep,c as np,ca as op,d as Oe,da as ap,e as ms,ea as lp,f as gs,ga as cp,i as no,j as ip,ja as hp,l as ai,la as up,m as yl,ma as dp,n as Qi,na as fp,o as Sl,oa as pp,p as Mt,pa as mp,q as _s,qa as El,r as xs,ra as gp,s as Xe,sa as _p,t as ji,u as tr,v as Ml,w as rn,x as sn,y as xu,z as ge}from"./chunk-TRFQKKDP.js";var xp="1.3.26";function Sp(r,t,e){return Math.max(r,Math.min(t,e))}function r0(r,t,e){return(1-e)*r+e*t}function s0(r,t,e,n){return r0(r,t,1-Math.exp(-e*n))}function o0(r,t){return(r%t+t)%t}var a0=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(r){if(!this.isRunning)return;let t=!1;if(this.duration&&this.easing){this.currentTime+=r;let e=Sp(0,this.currentTime/this.duration,1);t=e>=1;let n=t?1:this.easing(e);this.value=this.from+(this.to-this.from)*n}else this.lerp?(this.value=s0(this.value,this.to,this.lerp*60,r),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,t=!0)):(this.value=this.to,t=!0);t&&this.stop(),this.onUpdate?.(this.value,t)}stop(){this.isRunning=!1}fromTo(r,t,{lerp:e,duration:n,easing:i,onStart:s,onUpdate:o}){this.from=this.value=r,this.to=t,this.lerp=e,this.duration=n,this.easing=i,this.currentTime=0,this.isRunning=!0,s?.(),this.onUpdate=o}};function l0(r,t){let e;return function(...n){clearTimeout(e),e=setTimeout(()=>{e=void 0,r.apply(this,n)},t)}}var c0=class{width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;constructor(r,t,{autoResize:e=!0,debounce:n=250}={}){this.wrapper=r,this.content=t,e&&(this.debouncedResize=l0(this.resize,n),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},Mp=class{events={};emit(r,...t){let e=this.events[r]||[];for(let n=0,i=e.length;n<i;n++)e[n]?.(...t)}on(r,t){return this.events[r]?this.events[r].push(t):this.events[r]=[t],()=>{this.events[r]=this.events[r]?.filter(e=>t!==e)}}off(r,t){this.events[r]=this.events[r]?.filter(e=>t!==e)}destroy(){this.events={}}},h0=100/6,Br={passive:!1};function vp(r,t){return r===1?h0:r===2?t:1}var u0=class{touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new Mp;constructor(r,t={wheelMultiplier:1,touchMultiplier:1}){this.element=r,this.options=t,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,Br),this.element.addEventListener("touchstart",this.onTouchStart,Br),this.element.addEventListener("touchmove",this.onTouchMove,Br),this.element.addEventListener("touchend",this.onTouchEnd,Br)}on(r,t){return this.emitter.on(r,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,Br),this.element.removeEventListener("touchstart",this.onTouchStart,Br),this.element.removeEventListener("touchmove",this.onTouchMove,Br),this.element.removeEventListener("touchend",this.onTouchEnd,Br)}onTouchStart=r=>{let{clientX:t,clientY:e}=r.targetTouches?r.targetTouches[0]:r;this.touchStart.x=t,this.touchStart.y=e,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:r})};onTouchMove=r=>{let{clientX:t,clientY:e}=r.targetTouches?r.targetTouches[0]:r,n=-(t-this.touchStart.x)*this.options.touchMultiplier,i=-(e-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=e,this.lastDelta={x:n,y:i},this.emitter.emit("scroll",{deltaX:n,deltaY:i,event:r})};onTouchEnd=r=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:r})};onWheel=r=>{let{deltaX:t,deltaY:e,deltaMode:n}=r,i=vp(n,this.window.width),s=vp(n,this.window.height);t*=i,e*=s,t*=this.options.wheelMultiplier,e*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:e,event:r})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},yp=r=>Math.min(1,1.001-2**(-10*r)),bp=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;_isDraggingSelection=!1;reducedMotionMediaQuery=window.matchMedia("(prefers-reduced-motion: reduce)");isTouching;isIos;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new a0;emitter=new Mp;dimensions;virtualScroll;constructor({wrapper:r=window,content:t=document.documentElement,eventsTarget:e=r,smoothWheel:n=!0,syncTouch:i=!1,syncTouchLerp:s=.075,touchInertiaExponent:o=1.7,duration:a,easing:l,lerp:c=.1,infinite:h=!1,orientation:f="vertical",gestureOrientation:u=f==="horizontal"?"both":"vertical",touchMultiplier:d=1,wheelMultiplier:g=1,autoResize:_=!0,prevent:p,virtualScroll:m,overscroll:b=!0,autoRaf:A=!1,anchors:y=!1,autoToggle:S=!1,allowNestedScroll:w=!1,__experimental__naiveDimensions:E=!1,naiveDimensions:v=E,stopInertiaOnNavigate:T=!1,respectReducedMotion:C=!0}={}){window.lenisVersion=xp,window.lenis||(window.lenis={}),window.lenis.version=xp,f==="horizontal"&&(window.lenis.horizontal=!0),i===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!r||r===document.documentElement)&&(r=window),typeof a=="number"&&typeof l!="function"?l=yp:typeof l=="function"&&typeof a!="number"&&(a=1),this.options={wrapper:r,content:t,eventsTarget:e,smoothWheel:n,syncTouch:i,syncTouchLerp:s,touchInertiaExponent:o,duration:a,easing:l,lerp:c,infinite:h,gestureOrientation:u,orientation:f,touchMultiplier:d,wheelMultiplier:g,autoResize:_,prevent:p,virtualScroll:m,overscroll:b,autoRaf:A,anchors:y,autoToggle:S,allowNestedScroll:w,naiveDimensions:v,stopInertiaOnNavigate:T,respectReducedMotion:C},this.dimensions=new c0(r,t,{autoResize:_}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new u0(e,{touchMultiplier:d,wheelMultiplier:g}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(r,t){return this.emitter.on(r,t)}off(r,t){return this.emitter.off(r,t)}onScrollEnd=r=>{r instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&r.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){let r=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[r]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=r=>{r.propertyName?.includes("overflow")&&r.target===this.rootElement&&this.checkOverflow()};setScroll(r){this.isHorizontal?this.options.wrapper.scrollTo({left:r,behavior:"instant"}):this.options.wrapper.scrollTo({top:r,behavior:"instant"})}onClick=r=>{let t=r.composedPath().filter(n=>n instanceof HTMLAnchorElement&&n.href).map(n=>new URL(n.href)),e=new URL(window.location.href);if(this.options.anchors){let n=t.find(i=>e.host===i.host&&e.pathname===i.pathname&&i.hash);if(n){let i=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,s=decodeURIComponent(n.hash);this.scrollTo(s,i);return}}if(this.options.stopInertiaOnNavigate&&t.some(n=>e.host===n.host&&e.pathname!==n.pathname)){this.reset();return}};onPointerDown=r=>{r.button===1&&this.reset()};isTouchOnSelectionHandle(r){let t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return!1;let e=r.targetTouches[0]??r.changedTouches[0];if(!e)return!1;let n=t.getRangeAt(0).getClientRects();if(n.length===0)return!1;let i=n[0],s=n[n.length-1],o=40,a=Math.hypot(e.clientX-i.left,e.clientY-i.top)<=o,l=Math.hypot(e.clientX-s.right,e.clientY-s.bottom)<=o;return a||l}onVirtualScroll=r=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(r)===!1)return;let{deltaX:t,deltaY:e,event:n}=r;if(this.emitter.emit("virtual-scroll",{deltaX:t,deltaY:e,event:n}),n.ctrlKey||n.lenisStopPropagation)return;let i=n.type.includes("touch"),s=n.type.includes("wheel");if(i&&this.isIos&&(n.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(n)),this._isDraggingSelection)){n.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=n.type==="touchstart"||n.type==="touchmove";let o=t===0&&e===0;if(this.options.syncTouch&&i&&n.type==="touchstart"&&o&&!this.isStopped&&!this.isLocked){this.reset();return}let a=this.options.gestureOrientation==="vertical"&&e===0||this.options.gestureOrientation==="horizontal"&&t===0;if(o||a)return;let l=n.composedPath();l=l.slice(0,l.indexOf(this.rootElement));let c=this.options.prevent,h=Math.abs(t)>=Math.abs(e)?"horizontal":"vertical";if(l.find(g=>g instanceof HTMLElement&&(typeof c=="function"&&c?.(g)||g.hasAttribute?.("data-lenis-prevent")||h==="vertical"&&g.hasAttribute?.("data-lenis-prevent-vertical")||h==="horizontal"&&g.hasAttribute?.("data-lenis-prevent-horizontal")||i&&g.hasAttribute?.("data-lenis-prevent-touch")||s&&g.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.hasNestedScroll(g,{deltaX:t,deltaY:e}))))return;if(this.isStopped||this.isLocked){n.cancelable&&n.preventDefault();return}if(!(this.options.syncTouch&&i||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),n.lenisStopPropagation=!0;return}let f=e;this.options.gestureOrientation==="both"?f=Math.abs(e)>Math.abs(t)?e:t:this.options.gestureOrientation==="horizontal"&&(f=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&e>0||this.animatedScroll===this.limit&&e<0))&&(n.lenisStopPropagation=!0),n.cancelable&&n.preventDefault();let u=i&&this.options.syncTouch,d=i&&n.type==="touchend";d&&(f=Math.sign(f)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+f,jo({programmatic:!1},u?{lerp:d?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}))};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){let r=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-r,this.direction=Math.sign(this.animatedScroll-r),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=r=>{let t=r-(this.time||r);this.time=r,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(r,{offset:t=0,immediate:e=!1,lock:n=!1,programmatic:i=!0,lerp:s=i?this.options.lerp:void 0,duration:o=i?this.options.duration:void 0,easing:a=i?this.options.easing:void 0,onStart:l,onComplete:c,force:h=!1,userData:f}={}){if(this.prefersReducedMotion&&(i?e=!0:(s=1,o=void 0,a=void 0)),(this.isStopped||this.isLocked)&&!h)return;let u=r,d=t;if(typeof u=="string"&&["top","left","start","#"].includes(u))u=0;else if(typeof u=="string"&&["bottom","right","end"].includes(u))u=this.limit;else{let g=null;if(typeof u=="string"?(g=u.startsWith("#")?document.getElementById(u.slice(1)):document.querySelector(u),g||(u==="#top"?u=0:console.warn("Lenis: Target not found",u))):u instanceof HTMLElement&&u?.nodeType&&(g=u),g){if(this.options.wrapper!==window){let y=this.rootElement.getBoundingClientRect();d-=this.isHorizontal?y.left:y.top}let _=g.getBoundingClientRect(),p=getComputedStyle(g),m=this.isHorizontal?Number.parseFloat(p.scrollMarginLeft):Number.parseFloat(p.scrollMarginTop),b=getComputedStyle(this.rootElement),A=this.isHorizontal?Number.parseFloat(b.scrollPaddingLeft):Number.parseFloat(b.scrollPaddingTop);u=(this.isHorizontal?_.left:_.top)+this.animatedScroll-(Number.isNaN(m)?0:m)-(Number.isNaN(A)?0:A)}}if(typeof u=="number"){if(u+=d,this.options.infinite){if(i){this.targetScroll=this.animatedScroll=this.scroll;let g=u-this.animatedScroll;g>this.limit/2?u-=this.limit:g<-this.limit/2&&(u+=this.limit)}}else u=Sp(0,u,this.limit);if(u===this.targetScroll){l?.(this),c?.(this);return}if(this.userData=f??{},e){this.animatedScroll=this.targetScroll=u,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),c?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}i||(this.targetScroll=u),typeof o=="number"&&typeof a!="function"?a=yp:typeof a=="function"&&typeof o!="number"&&(o=1),this.animate.fromTo(this.animatedScroll,u,{duration:o,easing:a,lerp:s,onStart:()=>{n&&(this.isLocked=!0),this.isScrolling="smooth",l?.(this)},onUpdate:(g,_)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=g-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=g,this.setScroll(this.scroll),i&&(this.targetScroll=g),_||this.emit(),_&&(this.reset(),this.emit(),c?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(r,{deltaX:t,deltaY:e}){let n=Date.now();r._lenis||(r._lenis={});let i=r._lenis,s,o,a,l,c,h,f,u,d,g;if(n-(i.time??0)>2e3){i.time=Date.now();let w=window.getComputedStyle(r);if(i.computedStyle=w,s=["auto","overlay","scroll"].includes(w.overflowX),o=["auto","overlay","scroll"].includes(w.overflowY),c=["auto"].includes(w.overscrollBehaviorX),h=["auto"].includes(w.overscrollBehaviorY),i.hasOverflowX=s,i.hasOverflowY=o,!(s||o))return!1;f=r.scrollWidth,u=r.scrollHeight,d=r.clientWidth,g=r.clientHeight,a=f>d,l=u>g,i.isScrollableX=a,i.isScrollableY=l,i.scrollWidth=f,i.scrollHeight=u,i.clientWidth=d,i.clientHeight=g,i.hasOverscrollBehaviorX=c,i.hasOverscrollBehaviorY=h}else a=i.isScrollableX,l=i.isScrollableY,s=i.hasOverflowX,o=i.hasOverflowY,f=i.scrollWidth,u=i.scrollHeight,d=i.clientWidth,g=i.clientHeight,c=i.hasOverscrollBehaviorX,h=i.hasOverscrollBehaviorY;if(!(s&&a||o&&l))return!1;let _=Math.abs(t)>=Math.abs(e)?"horizontal":"vertical",p,m,b,A,y,S;if(_==="horizontal")p=Math.round(r.scrollLeft),m=f-d,b=t,A=s,y=a,S=c;else if(_==="vertical")p=Math.round(r.scrollTop),m=u-g,b=e,A=o,y=l,S=h;else return!1;return!S&&(p>=m||p<=0)?!0:(b>0?p<m:p>0)&&A&&y}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){let r=this.options.wrapper;return this.isHorizontal?r.scrollX??r.scrollLeft:r.scrollY??r.scrollTop}get scroll(){return this.options.infinite?o0(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(r){this._isScrolling!==r&&(this._isScrolling=r,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(r){this._isStopped!==r&&(this._isStopped=r,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(r){this._isLocked!==r&&(this._isLocked=r,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let r="lenis";return this.options.autoToggle&&(r+=" lenis-autoToggle"),this.isStopped&&(r+=" lenis-stopped"),this.isLocked&&(r+=" lenis-locked"),this.isScrolling&&(r+=" lenis-scrolling"),this.isScrolling==="smooth"&&(r+=" lenis-smooth"),r}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(r=>{this.rootElement.classList.add(r)})}cleanUpClassName(){for(let r of Array.from(this.rootElement.classList))(r==="lenis"||r.startsWith("lenis-"))&&this.rootElement.classList.remove(r)}};function xr(r){if(r===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return r}function Np(r,t){r.prototype=Object.create(t.prototype),r.prototype.constructor=r,r.__proto__=t}var ni={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},la={duration:.5,overwrite:!1,delay:0},Fu,yn,Be,Ci=1e8,Re=1/Ci,Au=Math.PI*2,d0=Au/4,f0=0,Lp=Math.sqrt,p0=Math.cos,m0=Math.sin,hn=function(t){return typeof t=="string"},Ye=function(t){return typeof t=="function"},yr=function(t){return typeof t=="number"},Ul=function(t){return typeof t>"u"},rr=function(t){return typeof t=="object"},ei=function(t){return t!==!1},Bu=function(){return typeof window<"u"},Al=function(t){return Ye(t)||hn(t)},Dp=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},Cn=Array.isArray,g0=/random\([^)]+\)/g,_0=/,\s*/g,wp=/(?:-?\.?\d|\.)+/gi,ku=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,Ts=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,yu=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,zu=/[+-]=-?[.\d]+/,x0=/[^,'"\[\]\s]+/gi,v0=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Ve,nr,Cu,Vu,ci={},Il={},Op,Up=function(t){return(Il=ro(t,ci))&&Rn},Fl=function(t,e){return console.warn("Invalid property",t,"set to",e,"Missing plugin? gsap.registerPlugin()")},ca=function(t,e){return!e&&console.warn(t)},Fp=function(t,e){return t&&(ci[t]=e)&&Il&&(Il[t]=e)||ci},ha=function(){return 0},y0={suppressEvents:!0,isStart:!0,kill:!1},Cl={suppressEvents:!0,kill:!1},S0={suppressEvents:!0},Gu={},zr=[],Ru={},Bp,jn={},Su={},Tp=30,Rl=[],Hu="",Wu=function(t){var e=t[0],n,i;if(rr(e)||Ye(e)||(t=[t]),!(n=(e._gsap||{}).harness)){for(i=Rl.length;i--&&!Rl[i].targetTest(e););n=Rl[i]}for(i=t.length;i--;)t[i]&&(t[i]._gsap||(t[i]._gsap=new Zu(t[i],n)))||t.splice(i,1);return t},Vr=function(t){return t._gsap||Wu(Ri(t))[0]._gsap},Xu=function(t,e,n){return(n=t[e])&&Ye(n)?t[e]():Ul(n)&&t.getAttribute&&t.getAttribute(e)||n},Gn=function(t,e){return(t=t.split(",")).forEach(e)||t},Ze=function(t){return Math.round(t*1e5)/1e5||0},ze=function(t){return Math.round(t*1e7)/1e7||0},Es=function(t,e){var n=e.charAt(0),i=parseFloat(e.substr(2));return t=parseFloat(t),n==="+"?t+i:n==="-"?t-i:n==="*"?t*i:t/i},M0=function(t,e){for(var n=e.length,i=0;t.indexOf(e[i])<0&&++i<n;);return i<n},Nl=function(){var t=zr.length,e=zr.slice(0),n,i;for(Ru={},zr.length=0,n=0;n<t;n++)i=e[n],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},qu=function(t){return!!(t._initted||t._startAt||t.add)},kp=function(t,e,n,i){zr.length&&!yn&&Nl(),t.render(e,n,i||!!(yn&&e<0&&qu(t))),zr.length&&!yn&&Nl()},zp=function(t){var e=parseFloat(t);return(e||e===0)&&(t+"").match(x0).length<2?e:hn(t)?t.trim():t},Vp=function(t){return t},hi=function(t,e){for(var n in e)n in t||(t[n]=e[n]);return t},b0=function(t){return function(e,n){for(var i in n)i in e||i==="duration"&&t||i==="ease"||(e[i]=n[i])}},ro=function(t,e){for(var n in e)t[n]=e[n];return t},Ep=function r(t,e){for(var n in e)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(t[n]=rr(e[n])?r(t[n]||(t[n]={}),e[n]):e[n]);return t},Ll=function(t,e){var n={},i;for(i in t)i in e||(n[i]=t[i]);return n},sa=function(t){var e=t.parent||Ve,n=t.keyframes?b0(Cn(t.keyframes)):hi;if(ei(t.inherit))for(;e;)n(t,e.vars.defaults),e=e.parent||e._dp;return t},w0=function(t,e){for(var n=t.length,i=n===e.length;i&&n--&&t[n]===e[n];);return n<0},Gp=function(t,e,n,i,s){n===void 0&&(n="_first"),i===void 0&&(i="_last");var o=t[i],a;if(s)for(a=e[s];o&&o[s]>a;)o=o._prev;return o?(e._next=o._next,o._next=e):(e._next=t[n],t[n]=e),e._next?e._next._prev=e:t[i]=e,e._prev=o,e.parent=e._dp=t,e},Bl=function(t,e,n,i){n===void 0&&(n="_first"),i===void 0&&(i="_last");var s=e._prev,o=e._next;s?s._next=o:t[n]===e&&(t[n]=o),o?o._prev=s:t[i]===e&&(t[i]=s),e._next=e._prev=e.parent=null},Gr=function(t,e){t.parent&&(!e||t.parent.autoRemoveChildren)&&t.parent.remove&&t.parent.remove(t),t._act=0},Ms=function(t,e){if(t&&(!e||e._end>t._dur||e._start<0))for(var n=t;n;)n._dirty=1,n=n.parent;return t},T0=function(t){for(var e=t.parent;e&&e.parent;)e._dirty=1,e.totalDuration(),e=e.parent;return t},Pu=function(t,e,n,i){return t._startAt&&(yn?t._startAt.revert(Cl):t.vars.immediateRender&&!t.vars.autoRevert||t._startAt.render(e,!0,i))},E0=function r(t){return!t||t._ts&&r(t.parent)},Ap=function(t){return t._repeat?so(t._tTime,t=t.duration()+t._rDelay)*t:0},so=function(t,e){var n=Math.floor(t=ze(t/e));return t&&n===t?n-1:n},Dl=function(t,e){return(t-e._start)*e._ts+(e._ts>=0?0:e._dirty?e.totalDuration():e._tDur)},kl=function(t){return t._end=ze(t._start+(t._tDur/Math.abs(t._ts||t._rts||Re)||0))},zl=function(t,e){var n=t._dp;return n&&n.smoothChildTiming&&t._ts&&(t._start=ze(n._time-(t._ts>0?e/t._ts:((t._dirty?t.totalDuration():t._tDur)-e)/-t._ts)),kl(t),n._dirty||Ms(n,t)),t},Hp=function(t,e){var n;if((e._time||!e._dur&&e._initted||e._start<t._time&&(e._dur||!e.add))&&(n=Dl(t.rawTime(),e),(!e._dur||fa(0,e.totalDuration(),n)-e._tTime>Re)&&e.render(n,!0)),Ms(t,e)._dp&&t._initted&&t._time>=t._dur&&t._ts){if(t._dur<t.duration())for(n=t;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;t._zTime=-Re}},ir=function(t,e,n,i){return e.parent&&Gr(e),e._start=ze((yr(n)?n:n||t!==Ve?Ai(t,n,e):t._time)+e._delay),e._end=ze(e._start+(e.totalDuration()/Math.abs(e.timeScale())||0)),Gp(t,e,"_first","_last",t._sort?"_start":0),Iu(e)||(t._recent=e),i||Hp(t,e),t._ts<0&&zl(t,t._tTime),t},Wp=function(t,e){return(ci.ScrollTrigger||Fl("scrollTrigger",e))&&ci.ScrollTrigger.create(e,t)},Xp=function(t,e,n,i,s){if(Ku(t,e,s),!t._initted)return 1;if(!n&&t._pt&&!yn&&(t._dur&&t.vars.lazy!==!1||!t._dur&&t.vars.lazy)&&Bp!==ti.frame)return zr.push(t),t._lazy=[s,i],1},A0=function r(t){var e=t.parent;return e&&e._ts&&e._initted&&!e._lock&&(e.rawTime()<0||r(e))},Iu=function(t){var e=t.data;return e==="isFromStart"||e==="isStart"},C0=function(t,e,n,i){var s=t.ratio,o=e<0||!e&&(!t._start&&A0(t)&&!(!t._initted&&Iu(t))||(t._ts<0||t._dp._ts<0)&&!Iu(t))?0:1,a=t._rDelay,l=0,c,h,f;if(a&&t._repeat&&(l=fa(0,t._tDur,e),h=so(l,a),t._yoyo&&h&1&&(o=1-o),h!==so(t._tTime,a)&&(s=1-o,t.vars.repeatRefresh&&t._initted&&t.invalidate())),o!==s||yn||i||t._zTime===Re||!e&&t._zTime){if(!t._initted&&Xp(t,e,i,n,l))return;for(f=t._zTime,t._zTime=e||(n?Re:0),n||(n=e&&!f),t.ratio=o,t._from&&(o=1-o),t._time=0,t._tTime=l,c=t._pt;c;)c.r(o,c.d),c=c._next;e<0&&Pu(t,e,n,!0),t._onUpdate&&!n&&li(t,"onUpdate"),l&&t._repeat&&!n&&t.parent&&li(t,"onRepeat"),(e>=t._tDur||e<0)&&t.ratio===o&&(o&&Gr(t,1),!n&&!yn&&(li(t,o?"onComplete":"onReverseComplete",!0),t._prom&&t._prom()))}else t._zTime||(t._zTime=e)},R0=function(t,e,n){var i;if(n>e)for(i=t._first;i&&i._start<=n;){if(i.data==="isPause"&&i._start>e)return i;i=i._next}else for(i=t._last;i&&i._start>=n;){if(i.data==="isPause"&&i._start<e)return i;i=i._prev}},oo=function(t,e,n,i){var s=t._repeat,o=ze(e)||0,a=t._tTime/t._tDur;return a&&!i&&(t._time*=o/t._dur),t._dur=o,t._tDur=s?s<0?1e10:ze(o*(s+1)+t._rDelay*s):o,a>0&&!i&&zl(t,t._tTime=t._tDur*a),t.parent&&kl(t),n||Ms(t.parent,t),t},Cp=function(t){return t instanceof An?Ms(t):oo(t,t._dur)},P0={_start:0,endTime:ha,totalDuration:ha},Ai=function r(t,e,n){var i=t.labels,s=t._recent||P0,o=t.duration()>=Ci?s.endTime(!1):t._dur,a,l,c;return hn(e)&&(isNaN(e)||e in i)?(l=e.charAt(0),c=e.substr(-1)==="%",a=e.indexOf("="),l==="<"||l===">"?(a>=0&&(e=e.replace(/=/,"")),(l==="<"?s._start:s.endTime(s._repeat>=0))+(parseFloat(e.substr(1))||0)*(c?(a<0?s:n).totalDuration()/100:1)):a<0?(e in i||(i[e]=o),i[e]):(l=parseFloat(e.charAt(a-1)+e.substr(a+1)),c&&n&&(l=l/100*(Cn(n)?n[0]:n).totalDuration()),a>1?r(t,e.substr(0,a-1),n)+l:o+l)):e==null?o:+e},oa=function(t,e,n){var i=yr(e[1]),s=(i?2:1)+(t<2?0:1),o=e[s],a,l;if(i&&(o.duration=e[1]),o.parent=n,t){for(a=o,l=n;l&&!("immediateRender"in a);)a=l.vars.defaults||{},l=ei(l.vars.inherit)&&l.parent;o.immediateRender=ei(a.immediateRender),t<2?o.runBackwards=1:o.startAt=e[s-1]}return new je(e[0],o,e[s+1])},Hr=function(t,e){return t||t===0?e(t):e},fa=function(t,e,n){return n<t?t:n>e?e:n},Sn=function(t,e){return!hn(t)||!(e=v0.exec(t))?"":e[1]},I0=function(t,e,n){return Hr(n,function(i){return fa(t,e,i)})},Nu=[].slice,qp=function(t,e){return t&&rr(t)&&"length"in t&&(!e&&!t.length||t.length-1 in t&&rr(t[0]))&&!t.nodeType&&t!==nr},N0=function(t,e,n){return n===void 0&&(n=[]),t.forEach(function(i){var s;return hn(i)&&!e||qp(i,1)?(s=n).push.apply(s,Ri(i)):n.push(i)})||n},Ri=function(t,e,n){return Be&&!e&&Be.selector?Be.selector(t):hn(t)&&!n&&(Cu||!ao())?Nu.call((e||Vu).querySelectorAll(t),0):Cn(t)?N0(t,n):qp(t)?Nu.call(t,0):t?[t]:[]},Lu=function(t){return t=Ri(t)[0]||ca("Invalid scope")||{},function(e){var n=t.current||t.nativeElement||t;return Ri(e,n.querySelectorAll?n:n===t?ca("Invalid scope")||Vu.createElement("div"):t)}},Yp=function(t){return t.sort(function(){return .5-Math.random()})},Zp=function(t){if(Ye(t))return t;var e=rr(t)?t:{each:t},n=bs(e.ease),i=e.from||0,s=parseFloat(e.base)||0,o={},a=i>0&&i<1,l=isNaN(i)||a,c=e.axis,h=i,f=i;return hn(i)?h=f={center:.5,edges:.5,end:1}[i]||0:!a&&l&&(h=i[0],f=i[1]),function(u,d,g){var _=(g||e).length,p=o[_],m,b,A,y,S,w,E,v,T;if(!p){if(T=e.grid==="auto"?0:(e.grid||[1,Ci])[1],!T){for(E=-Ci;E<(E=g[T++].getBoundingClientRect().left)&&T<_;);T<_&&T--}for(p=o[_]=[],m=l?Math.min(T,_)*h-.5:i%T,b=T===Ci?0:l?_*f/T-.5:i/T|0,E=0,v=Ci,w=0;w<_;w++)A=w%T-m,y=b-(w/T|0),p[w]=S=c?Math.abs(c==="y"?y:A):Lp(A*A+y*y),S>E&&(E=S),S<v&&(v=S);i==="random"&&Yp(p),p.max=E-v,p.min=v,p.v=_=(parseFloat(e.amount)||parseFloat(e.each)*(T>_?_-1:c?c==="y"?_/T:T:Math.max(T,_/T))||0)*(i==="edges"?-1:1),p.b=_<0?s-_:s,p.u=Sn(e.amount||e.each)||0,n=n&&_<0?X0(n):n}return _=(p[u]-p.min)/p.max||0,ze(p.b+(n?n(_):_)*p.v)+p.u}},Du=function(t){var e=Math.pow(10,((t+"").split(".")[1]||"").length);return function(n){var i=ze(Math.round(parseFloat(n)/t)*t*e);return(i-i%1)/e+(yr(n)?0:Sn(n))}},Jp=function(t,e){var n=Cn(t),i,s;return!n&&rr(t)&&(i=n=t.radius||Ci,t.values?(t=Ri(t.values),(s=!yr(t[0]))&&(i*=i)):t=Du(t.increment)),Hr(e,n?Ye(t)?function(o){return s=t(o),Math.abs(s-o)<=i?s:o}:function(o){for(var a=parseFloat(s?o.x:o),l=parseFloat(s?o.y:0),c=Ci,h=0,f=t.length,u,d;f--;)s?(u=t[f].x-a,d=t[f].y-l,u=u*u+d*d):u=Math.abs(t[f]-a),u<c&&(c=u,h=f);return h=!i||c<=i?t[h]:o,s||h===o||yr(o)?h:h+Sn(o)}:Du(t))},$p=function(t,e,n,i){return Hr(Cn(t)?!e:n===!0?!!(n=0):!i,function(){return Cn(t)?t[~~(Math.random()*t.length)]:(n=n||1e-5)&&(i=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((t-n/2+Math.random()*(e-t+n*.99))/n)*n*i)/i})},L0=function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return function(i){return e.reduce(function(s,o){return o(s)},i)}},D0=function(t,e){return function(n){return t(parseFloat(n))+(e||Sn(n))}},O0=function(t,e,n){return Qp(t,e,0,1,n)},Kp=function(t,e,n){return Hr(n,function(i){return t[~~e(i)]})},U0=function r(t,e,n){var i=e-t;return Cn(t)?Kp(t,r(0,t.length),e):Hr(n,function(s){return(i+(s-t)%i)%i+t})},F0=function r(t,e,n){var i=e-t,s=i*2;return Cn(t)?Kp(t,r(0,t.length-1),e):Hr(n,function(o){return o=(s+(o-t)%s)%s||0,t+(o>i?s-o:o)})},lo=function(t){return t.replace(g0,function(e){var n=e.indexOf("[")+1,i=e.substring(n||7,n?e.indexOf("]"):e.length-1).split(_0);return $p(n?i:+i[0],n?0:+i[1],+i[2]||1e-5)})},Qp=function(t,e,n,i,s){var o=e-t,a=i-n;return Hr(s,function(l){return n+((l-t)/o*a||0)})},B0=function r(t,e,n,i){var s=isNaN(t+e)?0:function(d){return(1-d)*t+d*e};if(!s){var o=hn(t),a={},l,c,h,f,u;if(n===!0&&(i=1)&&(n=null),o)t={p:t},e={p:e};else if(Cn(t)&&!Cn(e)){for(h=[],f=t.length,u=f-2,c=1;c<f;c++)h.push(r(t[c-1],t[c]));f--,s=function(g){g*=f;var _=Math.min(u,~~g);return h[_](g-_)},n=e}else i||(t=ro(Cn(t)?[]:{},t));if(!h){for(l in e)Ju.call(a,t,l,"get",e[l]);s=function(g){return td(g,a)||(o?t.p:t)}}}return Hr(n,s)},Rp=function(t,e,n){var i=t.labels,s=Ci,o,a,l;for(o in i)a=i[o]-e,a<0==!!n&&a&&s>(a=Math.abs(a))&&(l=o,s=a);return l},li=function(t,e,n){var i=t.vars,s=i[e],o=Be,a=t._ctx,l,c,h;if(s)return l=i[e+"Params"],c=i.callbackScope||t,n&&zr.length&&Nl(),a&&(Be=a),h=l?s.apply(c,l):s.call(c),Be=o,h},ia=function(t){return Gr(t),t.scrollTrigger&&t.scrollTrigger.kill(!!yn),t.progress()<1&&li(t,"onInterrupt"),t},io,jp=[],tm=function(t){if(t)if(t=!t.name&&t.default||t,Bu()||t.headless){var e=t.name,n=Ye(t),i=e&&!n&&t.init?function(){this._props=[]}:t,s={init:ha,render:td,add:Ju,kill:ex,modifier:tx,rawVars:0},o={targetTest:0,get:0,getSetter:Vl,aliases:{},register:0};if(ao(),t!==i){if(jn[e])return;hi(i,hi(Ll(t,s),o)),ro(i.prototype,ro(s,Ll(t,o))),jn[i.prop=e]=i,t.targetTest&&(Rl.push(i),Gu[e]=1),e=(e==="css"?"CSS":e.charAt(0).toUpperCase()+e.substr(1))+"Plugin"}Fp(e,i),t.register&&t.register(Rn,i,Hn)}else jp.push(t)},Ce=255,ra={aqua:[0,Ce,Ce],lime:[0,Ce,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,Ce],navy:[0,0,128],white:[Ce,Ce,Ce],olive:[128,128,0],yellow:[Ce,Ce,0],orange:[Ce,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[Ce,0,0],pink:[Ce,192,203],cyan:[0,Ce,Ce],transparent:[Ce,Ce,Ce,0]},Mu=function(t,e,n){return t+=t<0?1:t>1?-1:0,(t*6<1?e+(n-e)*t*6:t<.5?n:t*3<2?e+(n-e)*(2/3-t)*6:e)*Ce+.5|0},em=function(t,e,n){var i=t?yr(t)?[t>>16,t>>8&Ce,t&Ce]:0:ra.black,s,o,a,l,c,h,f,u,d,g;if(!i){if(t.substr(-1)===","&&(t=t.substr(0,t.length-1)),ra[t])i=ra[t];else if(t.charAt(0)==="#"){if(t.length<6&&(s=t.charAt(1),o=t.charAt(2),a=t.charAt(3),t="#"+s+s+o+o+a+a+(t.length===5?t.charAt(4)+t.charAt(4):"")),t.length===9)return i=parseInt(t.substr(1,6),16),[i>>16,i>>8&Ce,i&Ce,parseInt(t.substr(7),16)/255];t=parseInt(t.substr(1),16),i=[t>>16,t>>8&Ce,t&Ce]}else if(t.substr(0,3)==="hsl"){if(i=g=t.match(wp),!e)l=+i[0]%360/360,c=+i[1]/100,h=+i[2]/100,o=h<=.5?h*(c+1):h+c-h*c,s=h*2-o,i.length>3&&(i[3]*=1),i[0]=Mu(l+1/3,s,o),i[1]=Mu(l,s,o),i[2]=Mu(l-1/3,s,o);else if(~t.indexOf("="))return i=t.match(ku),n&&i.length<4&&(i[3]=1),i}else i=t.match(wp)||ra.transparent;i=i.map(Number)}return e&&!g&&(s=i[0]/Ce,o=i[1]/Ce,a=i[2]/Ce,f=Math.max(s,o,a),u=Math.min(s,o,a),h=(f+u)/2,f===u?l=c=0:(d=f-u,c=h>.5?d/(2-f-u):d/(f+u),l=f===s?(o-a)/d+(o<a?6:0):f===o?(a-s)/d+2:(s-o)/d+4,l*=60),i[0]=~~(l+.5),i[1]=~~(c*100+.5),i[2]=~~(h*100+.5)),n&&i.length<4&&(i[3]=1),i},nm=function(t){var e=[],n=[],i=-1;return t.split(vr).forEach(function(s){var o=s.match(Ts)||[];e.push.apply(e,o),n.push(i+=o.length+1)}),e.c=n,e},Pp=function(t,e,n){var i="",s=(t+i).match(vr),o=e?"hsla(":"rgba(",a=0,l,c,h,f;if(!s)return t;if(s=s.map(function(u){return(u=em(u,e,1))&&o+(e?u[0]+","+u[1]+"%,"+u[2]+"%,"+u[3]:u.join(","))+")"}),n&&(h=nm(t),l=n.c,l.join(i)!==h.c.join(i)))for(c=t.replace(vr,"1").split(Ts),f=c.length-1;a<f;a++)i+=c[a]+(~l.indexOf(a)?s.shift()||o+"0,0,0,0)":(h.length?h:s.length?s:n).shift());if(!c)for(c=t.split(vr),f=c.length-1;a<f;a++)i+=c[a]+s[a];return i+c[f]},vr=(function(){var r="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",t;for(t in ra)r+="|"+t+"\\b";return new RegExp(r+")","gi")})(),k0=/hsl[a]?\(/,Yu=function(t){var e=t.join(" "),n;if(vr.lastIndex=0,vr.test(e))return n=k0.test(e),t[1]=Pp(t[1],n),t[0]=Pp(t[0],n,nm(t[1])),!0},ua,ti=(function(){var r=Date.now,t=500,e=33,n=r(),i=n,s=1e3/240,o=s,a=[],l,c,h,f,u,d,g=function _(p){var m=r()-i,b=p===!0,A,y,S,w;if((m>t||m<0)&&(n+=m-e),i+=m,S=i-n,A=S-o,(A>0||b)&&(w=++f.frame,u=S-f.time*1e3,f.time=S=S/1e3,o+=A+(A>=s?4:s-A),y=1),b||(l=c(_)),y)for(d=0;d<a.length;d++)a[d](S,u,w,p)};return f={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(p){return u/(1e3/(p||60))},wake:function(){Op&&(!Cu&&Bu()&&(nr=Cu=window,Vu=nr.document||{},ci.gsap=Rn,(nr.gsapVersions||(nr.gsapVersions=[])).push(Rn.version),Up(Il||nr.GreenSockGlobals||!nr.gsap&&nr||{}),jp.forEach(tm)),h=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&f.sleep(),c=h||function(p){return setTimeout(p,o-f.time*1e3+1|0)},ua=1,g(2))},sleep:function(){(h?cancelAnimationFrame:clearTimeout)(l),ua=0,c=ha},lagSmoothing:function(p,m){t=p||1/0,e=Math.min(m||33,t)},fps:function(p){s=1e3/(p||240),o=f.time*1e3+s},add:function(p,m,b){var A=m?function(y,S,w,E){p(y,S,w,E),f.remove(A)}:p;return f.remove(p),a[b?"unshift":"push"](A),ao(),A},remove:function(p,m){~(m=a.indexOf(p))&&a.splice(m,1)&&d>=m&&d--},_listeners:a},f})(),ao=function(){return!ua&&ti.wake()},ue={},z0=/^[\d.\-M][\d.\-,\s]/,V0=/["']/g,G0=function(t){for(var e={},n=t.substr(1,t.length-3).split(":"),i=n[0],s=1,o=n.length,a,l,c;s<o;s++)l=n[s],a=s!==o-1?l.lastIndexOf(","):l.length,c=l.substr(0,a),e[i]=isNaN(c)?c.replace(V0,"").trim():+c,i=l.substr(a+1).trim();return e},H0=function(t){var e=t.indexOf("(")+1,n=t.indexOf(")"),i=t.indexOf("(",e);return t.substring(e,~i&&i<n?t.indexOf(")",n+1):n)},W0=function(t){var e=(t+"").split("("),n=ue[e[0]];return n&&e.length>1&&n.config?n.config.apply(null,~t.indexOf("{")?[G0(e[1])]:H0(t).split(",").map(zp)):ue._CE&&z0.test(t)?ue._CE("",t):n},X0=function(t){return function(e){return 1-t(1-e)}},bs=function(t,e){return t&&(Ye(t)?t:ue[t]||W0(t))||e},As=function(t,e,n,i){n===void 0&&(n=function(l){return 1-e(1-l)}),i===void 0&&(i=function(l){return l<.5?e(l*2)/2:1-e((1-l)*2)/2});var s={easeIn:e,easeOut:n,easeInOut:i},o;return Gn(t,function(a){ue[a]=ci[a]=s,ue[o=a.toLowerCase()]=n;for(var l in s)ue[o+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=ue[a+"."+l]=s[l]}),s},im=function(t){return function(e){return e<.5?(1-t(1-e*2))/2:.5+t((e-.5)*2)/2}},bu=function r(t,e,n){var i=e>=1?e:1,s=(n||(t?.3:.45))/(e<1?e:1),o=s/Au*(Math.asin(1/i)||0),a=function(h){return h===1?1:i*Math.pow(2,-10*h)*m0((h-o)*s)+1},l=t==="out"?a:t==="in"?function(c){return 1-a(1-c)}:im(a);return s=Au/s,l.config=function(c,h){return r(t,c,h)},l},wu=function r(t,e){e===void 0&&(e=1.70158);var n=function(o){return o?--o*o*((e+1)*o+e)+1:0},i=t==="out"?n:t==="in"?function(s){return 1-n(1-s)}:im(n);return i.config=function(s){return r(t,s)},i};Gn("Linear,Quad,Cubic,Quart,Quint,Strong",function(r,t){var e=t<5?t+1:t;As(r+",Power"+(e-1),t?function(n){return Math.pow(n,e)}:function(n){return n},function(n){return 1-Math.pow(1-n,e)},function(n){return n<.5?Math.pow(n*2,e)/2:1-Math.pow((1-n)*2,e)/2})});ue.Linear.easeNone=ue.none=ue.Linear.easeIn;As("Elastic",bu("in"),bu("out"),bu());(function(r,t){var e=1/t,n=2*e,i=2.5*e,s=function(a){return a<e?r*a*a:a<n?r*Math.pow(a-1.5/t,2)+.75:a<i?r*(a-=2.25/t)*a+.9375:r*Math.pow(a-2.625/t,2)+.984375};As("Bounce",function(o){return 1-s(1-o)},s)})(7.5625,2.75);As("Expo",function(r){return Math.pow(2,10*(r-1))*r+r*r*r*r*r*r*(1-r)});As("Circ",function(r){return-(Lp(1-r*r)-1)});As("Sine",function(r){return r===1?1:-p0(r*d0)+1});As("Back",wu("in"),wu("out"),wu());ue.SteppedEase=ue.steps=ci.SteppedEase={config:function(t,e){t===void 0&&(t=1);var n=1/t,i=t+(e?0:1),s=e?1:0,o=1-Re;return function(a){return((i*fa(0,o,a)|0)+s)*n}}};la.ease=ue["quad.out"];Gn("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(r){return Hu+=r+","+r+"Params,"});var Zu=function(t,e){this.id=f0++,t._gsap=this,this.target=t,this.harness=e,this.get=e?e.get:Xu,this.set=e?e.getSetter:Vl},da=(function(){function r(e){this.vars=e,this._delay=+e.delay||0,(this._repeat=e.repeat===1/0?-2:e.repeat||0)&&(this._rDelay=e.repeatDelay||0,this._yoyo=!!e.yoyo||!!e.yoyoEase),this._ts=1,oo(this,+e.duration,1,1),this.data=e.data,Be&&(this._ctx=Be,Be.data.push(this)),ua||ti.wake()}var t=r.prototype;return t.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},t.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},t.totalDuration=function(n){return arguments.length?(this._dirty=0,oo(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},t.totalTime=function(n,i){if(ao(),!arguments.length)return this._tTime;var s=this._dp;if(s&&s.smoothChildTiming&&this._ts){for(zl(this,n),!s._dp||s.parent||Hp(s,this);s&&s.parent;)s.parent._time!==s._start+(s._ts>=0?s._tTime/s._ts:(s.totalDuration()-s._tTime)/-s._ts)&&s.totalTime(s._tTime,!0),s=s.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&ir(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===Re||!this._initted&&this._dur&&n||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),kp(this,n,i)),this},t.time=function(n,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+Ap(this))%(this._dur+this._rDelay)||(n?this._dur:0),i):this._time},t.totalProgress=function(n,i){return arguments.length?this.totalTime(this.totalDuration()*n,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},t.progress=function(n,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+Ap(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},t.iteration=function(n,i){var s=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*s,i):this._repeat?so(this._tTime,s)+1:1},t.timeScale=function(n,i){if(!arguments.length)return this._rts===-Re?0:this._rts;if(this._rts===n)return this;var s=this.parent&&this._ts?Dl(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-Re?0:this._rts,this.totalTime(fa(-Math.abs(this._delay),this.totalDuration(),s),i!==!1),kl(this),T0(this)},t.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(ao(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==Re&&(this._tTime-=Re)))),this):this._ps},t.startTime=function(n){if(arguments.length){this._start=ze(n);var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&ir(i,this,this._start-this._delay),this}return this._start},t.endTime=function(n){return this._start+(ei(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},t.rawTime=function(n){var i=this.parent||this._dp;return i?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Dl(i.rawTime(n),this):this._tTime:this._tTime},t.revert=function(n){n===void 0&&(n=S0);var i=yn;return yn=n,qu(this)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),yn=i,this},t.globalTime=function(n){for(var i=this,s=arguments.length?n:i.rawTime();i;)s=i._start+s/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(n):s},t.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,Cp(this)):this._repeat===-2?1/0:this._repeat},t.repeatDelay=function(n){if(arguments.length){var i=this._time;return this._rDelay=n,Cp(this),i?this.time(i):this}return this._rDelay},t.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},t.seek=function(n,i){return this.totalTime(Ai(this,n),ei(i))},t.restart=function(n,i){return this.play().totalTime(n?-this._delay:0,ei(i)),this._dur||(this._zTime=-Re),this},t.play=function(n,i){return n!=null&&this.seek(n,i),this.reversed(!1).paused(!1)},t.reverse=function(n,i){return n!=null&&this.seek(n||this.totalDuration(),i),this.reversed(!0).paused(!1)},t.pause=function(n,i){return n!=null&&this.seek(n,i),this.paused(!0)},t.resume=function(){return this.paused(!1)},t.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-Re:0)),this):this._rts<0},t.invalidate=function(){return this._initted=this._act=0,this._zTime=-Re,this},t.isActive=function(){var n=this.parent||this._dp,i=this._start,s;return!!(!n||this._ts&&this._initted&&n.isActive()&&(s=n.rawTime(!0))>=i&&s<this.endTime(!0)-Re)},t.eventCallback=function(n,i,s){var o=this.vars;return arguments.length>1?(i?(o[n]=i,s&&(o[n+"Params"]=s),n==="onUpdate"&&(this._onUpdate=i)):delete o[n],this):o[n]},t.then=function(n){var i=this,s=i._prom;return new Promise(function(o){var a=Ye(n)?n:Vp,l=function(){var h=i.then;i.then=null,s&&s(),Ye(a)&&(a=a(i))&&(a.then||a===i)&&(i.then=h),o(a),i.then=h};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?l():i._prom=l})},t.kill=function(){ia(this)},r})();hi(da.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-Re,_prom:0,_ps:!1,_rts:1});var An=(function(r){Np(t,r);function t(n,i){var s;return n===void 0&&(n={}),s=r.call(this,n)||this,s.labels={},s.smoothChildTiming=!!n.smoothChildTiming,s.autoRemoveChildren=!!n.autoRemoveChildren,s._sort=ei(n.sortChildren),Ve&&ir(n.parent||Ve,xr(s),i),n.reversed&&s.reverse(),n.paused&&s.paused(!0),n.scrollTrigger&&Wp(xr(s),n.scrollTrigger),s}var e=t.prototype;return e.to=function(i,s,o){return oa(0,arguments,this),this},e.from=function(i,s,o){return oa(1,arguments,this),this},e.fromTo=function(i,s,o,a){return oa(2,arguments,this),this},e.set=function(i,s,o){return s.duration=0,s.parent=this,sa(s).repeatDelay||(s.repeat=0),s.immediateRender=!!s.immediateRender,new je(i,s,Ai(this,o),1),this},e.call=function(i,s,o){return ir(this,je.delayedCall(0,i,s),o)},e.staggerTo=function(i,s,o,a,l,c,h){return o.duration=s,o.stagger=o.stagger||a,o.onComplete=c,o.onCompleteParams=h,o.parent=this,new je(i,o,Ai(this,l)),this},e.staggerFrom=function(i,s,o,a,l,c,h){return o.runBackwards=1,sa(o).immediateRender=ei(o.immediateRender),this.staggerTo(i,s,o,a,l,c,h)},e.staggerFromTo=function(i,s,o,a,l,c,h,f){return a.startAt=o,sa(a).immediateRender=ei(a.immediateRender),this.staggerTo(i,s,a,l,c,h,f)},e.render=function(i,s,o){var a=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,h=i<=0?0:ze(i),f=this._zTime<0!=i<0&&(this._initted||!c),u,d,g,_,p,m,b,A,y,S,w,E;if(this!==Ve&&h>l&&i>=0&&(h=l),h!==this._tTime||o||f){if(a!==this._time&&c&&(h+=this._time-a,i+=this._time-a),u=h,y=this._start,A=this._ts,m=!A,f&&(c||(a=this._zTime),(i||!s)&&(this._zTime=i)),this._repeat){if(w=this._yoyo,p=c+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(p*100+i,s,o);if(u=ze(h%p),h===l?(_=this._repeat,u=c):(S=ze(h/p),_=~~S,_&&_===S&&(u=c,_--),u>c&&(u=c)),S=so(this._tTime,p),!a&&this._tTime&&S!==_&&this._tTime-S*p-this._dur<=0&&(S=_),w&&_&1&&(u=c-u,E=1),_!==S&&!this._lock){var v=w&&S&1,T=v===(w&&_&1);if(_<S&&(v=!v),a=v?0:h%c?c:h,this._lock=1,this.render(a||(E?0:ze(_*p)),s,!c)._lock=0,this._tTime=h,!s&&this.parent&&li(this,"onRepeat"),this.vars.repeatRefresh&&!E&&(this.invalidate()._lock=1,S=_),a&&a!==this._time||m!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,T&&(this._lock=2,a=v?c:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!E&&this.invalidate()),this._lock=0,!this._ts&&!m)return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(b=R0(this,ze(a),ze(u)),b&&(h-=u-(u=b._start))),this._tTime=h,this._time=u,this._act=!!A,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,a=0),!a&&h&&c&&!s&&!S&&(li(this,"onStart"),this._tTime!==h))return this;if(u>=a&&i>=0)for(d=this._first;d;){if(g=d._next,(d._act||u>=d._start)&&d._ts&&b!==d){if(d.parent!==this)return this.render(i,s,o);if(d.render(d._ts>0?(u-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(u-d._start)*d._ts,s,o),u!==this._time||!this._ts&&!m){b=0,g&&(h+=this._zTime=-Re);break}}d=g}else{d=this._last;for(var C=i<0?i:u;d;){if(g=d._prev,(d._act||C<=d._end)&&d._ts&&b!==d){if(d.parent!==this)return this.render(i,s,o);if(d.render(d._ts>0?(C-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(C-d._start)*d._ts,s,o||yn&&qu(d)),u!==this._time||!this._ts&&!m){b=0,g&&(h+=this._zTime=C?-Re:Re);break}}d=g}}if(b&&!s&&(this.pause(),b.render(u>=a?0:-Re)._zTime=u>=a?1:-1,this._ts))return this._start=y,kl(this),this.render(i,s,o);this._onUpdate&&!s&&li(this,"onUpdate",!0),(h===l&&this._tTime>=this.totalDuration()||!h&&a)&&(y===this._start||Math.abs(A)!==Math.abs(this._ts))&&(this._lock||((i||!c)&&(h===l&&this._ts>0||!h&&this._ts<0)&&Gr(this,1),!s&&!(i<0&&!a)&&(h||a||!l)&&(li(this,h===l&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(h<l&&this.timeScale()>0)&&this._prom())))}return this},e.add=function(i,s){var o=this;if(yr(s)||(s=Ai(this,s,i)),!(i instanceof da)){if(Cn(i))return i.forEach(function(a){return o.add(a,s)}),this;if(hn(i))return this.addLabel(i,s);if(Ye(i))i=je.delayedCall(0,i);else return this}return this!==i?ir(this,i,s):this},e.getChildren=function(i,s,o,a){i===void 0&&(i=!0),s===void 0&&(s=!0),o===void 0&&(o=!0),a===void 0&&(a=-Ci);for(var l=[],c=this._first;c;)c._start>=a&&(c instanceof je?s&&l.push(c):(o&&l.push(c),i&&l.push.apply(l,c.getChildren(!0,s,o)))),c=c._next;return l},e.getById=function(i){for(var s=this.getChildren(1,1,1),o=s.length;o--;)if(s[o].vars.id===i)return s[o]},e.remove=function(i){return hn(i)?this.removeLabel(i):Ye(i)?this.killTweensOf(i):(i.parent===this&&Bl(this,i),i===this._recent&&(this._recent=this._last),Ms(this))},e.totalTime=function(i,s){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=ze(ti.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),r.prototype.totalTime.call(this,i,s),this._forcing=0,this):this._tTime},e.addLabel=function(i,s){return this.labels[i]=Ai(this,s),this},e.removeLabel=function(i){return delete this.labels[i],this},e.addPause=function(i,s,o){var a=je.delayedCall(0,s||ha,o);return a.data="isPause",this._hasPause=1,ir(this,a,Ai(this,i))},e.removePause=function(i){var s=this._first;for(i=Ai(this,i);s;)s._start===i&&s.data==="isPause"&&Gr(s),s=s._next},e.killTweensOf=function(i,s,o){for(var a=this.getTweensOf(i,o),l=a.length;l--;)kr!==a[l]&&a[l].kill(i,s);return this},e.getTweensOf=function(i,s){for(var o=[],a=Ri(i),l=this._first,c=yr(s),h;l;)l instanceof je?M0(l._targets,a)&&(c?(!kr||l._initted&&l._ts)&&l.globalTime(0)<=s&&l.globalTime(l.totalDuration())>s:!s||l.isActive())&&o.push(l):(h=l.getTweensOf(a,s)).length&&o.push.apply(o,h),l=l._next;return o},e.tweenTo=function(i,s){s=s||{};var o=this,a=Ai(o,i),l=s,c=l.startAt,h=l.onStart,f=l.onStartParams,u=l.immediateRender,d,g=je.to(o,hi({ease:s.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale())||Re,onStart:function(){if(o.pause(),!d){var p=s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale());g._dur!==p&&oo(g,p,0,1).render(g._time,!0,!0),d=1}h&&h.apply(g,f||[])}},s));return u?g.render(0):g},e.tweenFromTo=function(i,s,o){return this.tweenTo(s,hi({startAt:{time:Ai(this,i)}},o))},e.recent=function(){return this._recent},e.nextLabel=function(i){return i===void 0&&(i=this._time),Rp(this,Ai(this,i))},e.previousLabel=function(i){return i===void 0&&(i=this._time),Rp(this,Ai(this,i),1)},e.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+Re)},e.shiftChildren=function(i,s,o){o===void 0&&(o=0);var a=this._first,l=this.labels,c;for(i=ze(i);a;)a._start>=o&&(a._start+=i,a._end+=i),a=a._next;if(s)for(c in l)l[c]>=o&&(l[c]+=i);return Ms(this)},e.invalidate=function(i){var s=this._first;for(this._lock=0;s;)s.invalidate(i),s=s._next;return r.prototype.invalidate.call(this,i)},e.clear=function(i){i===void 0&&(i=!0);for(var s=this._first,o;s;)o=s._next,this.remove(s),s=o;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),Ms(this)},e.totalDuration=function(i){var s=0,o=this,a=o._last,l=Ci,c,h,f;if(arguments.length)return o.timeScale((o._repeat<0?o.duration():o.totalDuration())/(o.reversed()?-i:i));if(o._dirty){for(f=o.parent;a;)c=a._prev,a._dirty&&a.totalDuration(),h=a._start,h>l&&o._sort&&a._ts&&!o._lock?(o._lock=1,ir(o,a,h-a._delay,1)._lock=0):l=h,h<0&&a._ts&&(s-=h,(!f&&!o._dp||f&&f.smoothChildTiming)&&(o._start+=ze(h/o._ts),o._time-=h,o._tTime-=h),o.shiftChildren(-h,!1,-1/0),l=0),a._end>s&&a._ts&&(s=a._end),a=c;oo(o,o===Ve&&o._time>s?o._time:s,1,1),o._dirty=0}return o._tDur},t.updateRoot=function(i){if(Ve._ts&&(kp(Ve,Dl(i,Ve)),Bp=ti.frame),ti.frame>=Tp){Tp+=ni.autoSleep||120;var s=Ve._first;if((!s||!s._ts)&&ni.autoSleep&&ti._listeners.length<2){for(;s&&!s._ts;)s=s._next;s||ti.sleep()}}},t})(da);hi(An.prototype,{_lock:0,_hasPause:0,_forcing:0});var q0=function(t,e,n,i,s,o,a){var l=new Hn(this._pt,t,e,0,1,ju,null,s),c=0,h=0,f,u,d,g,_,p,m,b;for(l.b=n,l.e=i,n+="",i+="",(m=~i.indexOf("random("))&&(i=lo(i)),o&&(b=[n,i],o(b,t,e),n=b[0],i=b[1]),u=n.match(yu)||[];f=yu.exec(i);)g=f[0],_=i.substring(c,f.index),d?d=(d+1)%5:_.substr(-5)==="rgba("&&(d=1),g!==u[h++]&&(p=parseFloat(u[h-1])||0,l._pt={_next:l._pt,p:_||h===1?_:",",s:p,c:g.charAt(1)==="="?Es(p,g)-p:parseFloat(g)-p,m:d&&d<4?Math.round:0},c=yu.lastIndex);return l.c=c<i.length?i.substring(c,i.length):"",l.fp=a,(zu.test(i)||m)&&(l.e=0),this._pt=l,l},Ju=function(t,e,n,i,s,o,a,l,c,h){Ye(i)&&(i=i(s||0,t,o));var f=t[e],u=n!=="get"?n:Ye(f)?c?t[e.indexOf("set")||!Ye(t["get"+e.substr(3)])?e:"get"+e.substr(3)](c):t[e]():f,d=Ye(f)?c?K0:om:Qu,g;if(hn(i)&&(~i.indexOf("random(")&&(i=lo(i)),i.charAt(1)==="="&&(g=Es(u,i)+(Sn(u)||0),(g||g===0)&&(i=g))),!h||u!==i||Ou)return!isNaN(u*i)&&i!==""?(g=new Hn(this._pt,t,e,+u||0,i-(u||0),typeof f=="boolean"?j0:am,0,d),c&&(g.fp=c),a&&g.modifier(a,this,t),this._pt=g):(!f&&!(e in t)&&Fl(e,i),q0.call(this,t,e,u,i,d,l||ni.stringFilter,c))},Y0=function(t,e,n,i,s){if(Ye(t)&&(t=aa(t,s,e,n,i)),!rr(t)||t.style&&t.nodeType||Cn(t)||Dp(t))return hn(t)?aa(t,s,e,n,i):t;var o={},a;for(a in t)o[a]=aa(t[a],s,e,n,i);return o},$u=function(t,e,n,i,s,o){var a,l,c,h;if(jn[t]&&(a=new jn[t]).init(s,a.rawVars?e[t]:Y0(e[t],i,s,o,n),n,i,o)!==!1&&(n._pt=l=new Hn(n._pt,s,t,0,1,a.render,a,0,a.priority),n!==io))for(c=n._ptLookup[n._targets.indexOf(s)],h=a._props.length;h--;)c[a._props[h]]=l;return a},kr,Ou,Ku=function r(t,e,n){var i=t.vars,s=i.ease,o=i.startAt,a=i.immediateRender,l=i.lazy,c=i.onUpdate,h=i.runBackwards,f=i.yoyoEase,u=i.keyframes,d=i.autoRevert,g=t._dur,_=t._startAt,p=t._targets,m=t.parent,b=m&&m.data==="nested"?m.vars.targets:p,A=t._overwrite==="auto"&&!Fu,y=t.timeline,S=i.easeReverse||f,w,E,v,T,C,L,N,z,I,B,X,k,K;if(y&&(!u||!s)&&(s="none"),t._ease=bs(s,la.ease),t._rEase=S&&(bs(S)||t._ease),t._from=!y&&!!i.runBackwards,t._from&&(t.ratio=1),!y||u&&!i.stagger){if(z=p[0]?Vr(p[0]).harness:0,k=z&&i[z.prop],w=Ll(i,Gu),_&&(_._zTime<0&&_.progress(1),e<0&&h&&a&&!d?_.render(-1,!0):_.revert(h&&g?Cl:y0),_._lazy=0),o){if(Gr(t._startAt=je.set(p,hi({data:"isStart",overwrite:!1,parent:m,immediateRender:!0,lazy:!_&&ei(l),startAt:null,delay:0,onUpdate:c&&function(){return li(t,"onUpdate")},stagger:0},o))),t._startAt._dp=0,t._startAt._sat=t,e<0&&(yn||!a&&!d)&&t._startAt.revert(Cl),a&&g&&e<=0&&n<=0){e&&(t._zTime=e);return}}else if(h&&g&&!_){if(e&&(a=!1),v=hi({overwrite:!1,data:"isFromStart",lazy:a&&!_&&ei(l),immediateRender:a,stagger:0,parent:m},w),k&&(v[z.prop]=k),Gr(t._startAt=je.set(p,v)),t._startAt._dp=0,t._startAt._sat=t,e<0&&(yn?t._startAt.revert(Cl):t._startAt.render(-1,!0)),t._zTime=e,!a)r(t._startAt,Re,Re);else if(!e)return}for(t._pt=t._ptCache=0,l=g&&ei(l)||l&&!g,E=0;E<p.length;E++){if(C=p[E],N=C._gsap||Wu(p)[E]._gsap,t._ptLookup[E]=B={},Ru[N.id]&&zr.length&&Nl(),X=b===p?E:b.indexOf(C),z&&(I=new z).init(C,k||w,t,X,b)!==!1&&(t._pt=T=new Hn(t._pt,C,I.name,0,1,I.render,I,0,I.priority),I._props.forEach(function(q){B[q]=T}),I.priority&&(L=1)),!z||k)for(v in w)jn[v]&&(I=$u(v,w,t,X,C,b))?I.priority&&(L=1):B[v]=T=Ju.call(t,C,v,"get",w[v],X,b,0,i.stringFilter);t._op&&t._op[E]&&t.kill(C,t._op[E]),A&&t._pt&&(kr=t,Ve.killTweensOf(C,B,t.globalTime(e)),K=!t.parent,kr=0),t._pt&&l&&(Ru[N.id]=1)}L&&ed(t),t._onInit&&t._onInit(t)}t._onUpdate=c,t._initted=(!t._op||t._pt)&&!K,u&&e<=0&&y.render(Ci,!0,!0)},Z0=function(t,e,n,i,s,o,a,l){var c=(t._pt&&t._ptCache||(t._ptCache={}))[e],h,f,u,d;if(!c)for(c=t._ptCache[e]=[],u=t._ptLookup,d=t._targets.length;d--;){if(h=u[d][e],h&&h.d&&h.d._pt)for(h=h.d._pt;h&&h.p!==e&&h.fp!==e;)h=h._next;if(!h)return Ou=1,t.vars[e]="+=0",Ku(t,a),Ou=0,l?ca(e+" not eligible for reset. Try splitting into individual properties"):1;c.push(h)}for(d=c.length;d--;)f=c[d],h=f._pt||f,h.s=(i||i===0)&&!s?i:h.s+(i||0)+o*h.c,h.c=n-h.s,f.e&&(f.e=Ze(n)+Sn(f.e)),f.b&&(f.b=h.s+Sn(f.b))},J0=function(t,e){var n=t[0]?Vr(t[0]).harness:0,i=n&&n.aliases,s,o,a,l;if(!i)return e;s=ro({},e);for(o in i)if(o in s)for(l=i[o].split(","),a=l.length;a--;)s[l[a]]=s[o];return s},$0=function(t,e,n,i){var s=e.ease||i||"power1.inOut",o,a;if(Cn(e))a=n[t]||(n[t]=[]),e.forEach(function(l,c){return a.push({t:c/(e.length-1)*100,v:l,e:s})});else for(o in e)a=n[o]||(n[o]=[]),o==="ease"||a.push({t:parseFloat(t),v:e[o],e:s})},aa=function(t,e,n,i,s){return Ye(t)?t.call(e,n,i,s):hn(t)&&~t.indexOf("random(")?lo(t):t},rm=Hu+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert",sm={};Gn(rm+",id,stagger,delay,duration,paused,scrollTrigger",function(r){return sm[r]=1});var je=(function(r){Np(t,r);function t(n,i,s,o){var a;typeof i=="number"&&(s.duration=i,i=s,s=null),a=r.call(this,o?i:sa(i))||this;var l=a.vars,c=l.duration,h=l.delay,f=l.immediateRender,u=l.stagger,d=l.overwrite,g=l.keyframes,_=l.defaults,p=l.scrollTrigger,m=i.parent||Ve,b=(Cn(n)||Dp(n)?yr(n[0]):"length"in i)?[n]:Ri(n),A,y,S,w,E,v,T,C;if(a._targets=b.length?Wu(b):ca("GSAP target "+n+" not found. https://gsap.com",!ni.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=d,g||u||Al(c)||Al(h)){i=a.vars;var L=i.easeReverse||i.yoyoEase;if(A=a.timeline=new An({data:"nested",defaults:_||{},targets:m&&m.data==="nested"?m.vars.targets:b}),A.kill(),A.parent=A._dp=xr(a),A._start=0,u||Al(c)||Al(h)){if(w=b.length,T=u&&Zp(u),rr(u))for(E in u)~rm.indexOf(E)&&(C||(C={}),C[E]=u[E]);for(y=0;y<w;y++)S=Ll(i,sm),S.stagger=0,L&&(S.easeReverse=L),C&&ro(S,C),v=b[y],S.duration=+aa(c,xr(a),y,v,b),S.delay=(+aa(h,xr(a),y,v,b)||0)-a._delay,!u&&w===1&&S.delay&&(a._delay=h=S.delay,a._start+=h,S.delay=0),A.to(v,S,T?T(y,v,b):0),A._ease=ue.none;A.duration()?c=h=0:a.timeline=0}else if(g){sa(hi(A.vars.defaults,{ease:"none"})),A._ease=bs(g.ease||i.ease||"none");var N=0,z,I,B;if(Cn(g))g.forEach(function(X){return A.to(b,X,">")}),A.duration();else{S={};for(E in g)E==="ease"||E==="easeEach"||$0(E,g[E],S,g.easeEach);for(E in S)for(z=S[E].sort(function(X,k){return X.t-k.t}),N=0,y=0;y<z.length;y++)I=z[y],B={ease:I.e,duration:(I.t-(y?z[y-1].t:0))/100*c},B[E]=I.v,A.to(b,B,N),N+=B.duration;A.duration()<c&&A.to({},{duration:c-A.duration()})}}c||a.duration(c=A.duration())}else a.timeline=0;return d===!0&&!Fu&&(kr=xr(a),Ve.killTweensOf(b),kr=0),ir(m,xr(a),s),i.reversed&&a.reverse(),i.paused&&a.paused(!0),(f||!c&&!g&&a._start===ze(m._time)&&ei(f)&&E0(xr(a))&&m.data!=="nested")&&(a._tTime=-Re,a.render(Math.max(0,-h)||0)),p&&Wp(xr(a),p),a}var e=t.prototype;return e.render=function(i,s,o){var a=this._time,l=this._tDur,c=this._dur,h=i<0,f=i>l-Re&&!h?l:i<Re?0:i,u,d,g,_,p,m,b,A;if(!c)C0(this,i,s,o);else if(f!==this._tTime||!i||o||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==h||this._lazy){if(u=f,A=this.timeline,this._repeat){if(_=c+this._rDelay,this._repeat<-1&&h)return this.totalTime(_*100+i,s,o);if(u=ze(f%_),f===l?(g=this._repeat,u=c):(p=ze(f/_),g=~~p,g&&g===p?(u=c,g--):u>c&&(u=c)),m=this._yoyo&&g&1,m&&(u=c-u),p=so(this._tTime,_),u===a&&!o&&this._initted&&g===p)return this._tTime=f,this;g!==p&&this.vars.repeatRefresh&&!m&&!this._lock&&u!==_&&this._initted&&(this._lock=o=1,this.render(ze(_*g),!0).invalidate()._lock=0)}if(!this._initted){if(Xp(this,h?i:u,o,s,f))return this._tTime=0,this;if(a!==this._time&&!(o&&this.vars.repeatRefresh&&g!==p))return this;if(c!==this._dur)return this.render(i,s,o)}if(this._rEase){var y=u<a;if(y!==this._inv){var S=y?a:c-a;this._inv=y,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=a,this._invRecip=S?(y?-1:1)/S:0,this._invScale=y?-this.ratio:1-this.ratio,this._invEase=y?this._rEase:this._ease}this.ratio=b=this._invRatio+this._invScale*this._invEase((u-this._invTime)*this._invRecip)}else this.ratio=b=this._ease(u/c);if(this._from&&(this.ratio=b=1-b),this._tTime=f,this._time=u,!this._act&&this._ts&&(this._act=1,this._lazy=0),!a&&f&&!s&&!p&&(li(this,"onStart"),this._tTime!==f))return this;for(d=this._pt;d;)d.r(b,d.d),d=d._next;A&&A.render(i<0?i:A._dur*A._ease(u/this._dur),s,o)||this._startAt&&(this._zTime=i),this._onUpdate&&!s&&(h&&Pu(this,i,s,o),li(this,"onUpdate")),this._repeat&&g!==p&&this.vars.onRepeat&&!s&&this.parent&&li(this,"onRepeat"),(f===this._tDur||!f)&&this._tTime===f&&(h&&!this._onUpdate&&Pu(this,i,!0,!0),(i||!c)&&(f===this._tDur&&this._ts>0||!f&&this._ts<0)&&Gr(this,1),!s&&!(h&&!a)&&(f||a||m)&&(li(this,f===l?"onComplete":"onReverseComplete",!0),this._prom&&!(f<l&&this.timeScale()>0)&&this._prom()))}return this},e.targets=function(){return this._targets},e.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),r.prototype.invalidate.call(this,i)},e.resetTo=function(i,s,o,a,l){ua||ti.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),h;return this._initted||Ku(this,c),h=this._ease(c/this._dur),Z0(this,i,s,o,a,h,c,l)?this.resetTo(i,s,o,a,1):(zl(this,0),this.parent||Gp(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},e.kill=function(i,s){if(s===void 0&&(s="all"),!i&&(!s||s==="all"))return this._lazy=this._pt=0,this.parent?ia(this):this.scrollTrigger&&this.scrollTrigger.kill(!!yn),this;if(this.timeline){var o=this.timeline.totalDuration();return this.timeline.killTweensOf(i,s,kr&&kr.vars.overwrite!==!0)._first||ia(this),this.parent&&o!==this.timeline.totalDuration()&&oo(this,this._dur*this.timeline._tDur/o,0,1),this}var a=this._targets,l=i?Ri(i):a,c=this._ptLookup,h=this._pt,f,u,d,g,_,p,m;if((!s||s==="all")&&w0(a,l))return s==="all"&&(this._pt=0),ia(this);for(f=this._op=this._op||[],s!=="all"&&(hn(s)&&(_={},Gn(s,function(b){return _[b]=1}),s=_),s=J0(a,s)),m=a.length;m--;)if(~l.indexOf(a[m])){u=c[m],s==="all"?(f[m]=s,g=u,d={}):(d=f[m]=f[m]||{},g=s);for(_ in g)p=u&&u[_],p&&((!("kill"in p.d)||p.d.kill(_)===!0)&&Bl(this,p,"_pt"),delete u[_]),d!=="all"&&(d[_]=1)}return this._initted&&!this._pt&&h&&ia(this),this},t.to=function(i,s){return new t(i,s,arguments[2])},t.from=function(i,s){return oa(1,arguments)},t.delayedCall=function(i,s,o,a){return new t(s,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:s,onReverseComplete:s,onCompleteParams:o,onReverseCompleteParams:o,callbackScope:a})},t.fromTo=function(i,s,o){return oa(2,arguments)},t.set=function(i,s){return s.duration=0,s.repeatDelay||(s.repeat=0),new t(i,s)},t.killTweensOf=function(i,s,o){return Ve.killTweensOf(i,s,o)},t})(da);hi(je.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Gn("staggerTo,staggerFrom,staggerFromTo",function(r){je[r]=function(){var t=new An,e=Nu.call(arguments,0);return e.splice(r==="staggerFromTo"?5:4,0,0),t[r].apply(t,e)}});var Qu=function(t,e,n){return t[e]=n},om=function(t,e,n){return t[e](n)},K0=function(t,e,n,i){return t[e](i.fp,n)},Q0=function(t,e,n){return t.setAttribute(e,n)},Vl=function(t,e){return Ye(t[e])?om:Ul(t[e])&&t.setAttribute?Q0:Qu},am=function(t,e){return e.set(e.t,e.p,Math.round((e.s+e.c*t)*1e6)/1e6,e)},j0=function(t,e){return e.set(e.t,e.p,!!(e.s+e.c*t),e)},ju=function(t,e){var n=e._pt,i="";if(!t&&e.b)i=e.b;else if(t===1&&e.e)i=e.e;else{for(;n;)i=n.p+(n.m?n.m(n.s+n.c*t):Math.round((n.s+n.c*t)*1e4)/1e4)+i,n=n._next;i+=e.c}e.set(e.t,e.p,i,e)},td=function(t,e){for(var n=e._pt;n;)n.r(t,n.d),n=n._next},tx=function(t,e,n,i){for(var s=this._pt,o;s;)o=s._next,s.p===i&&s.modifier(t,e,n),s=o},ex=function(t){for(var e=this._pt,n,i;e;)i=e._next,e.p===t&&!e.op||e.op===t?Bl(this,e,"_pt"):e.dep||(n=1),e=i;return!n},nx=function(t,e,n,i){i.mSet(t,e,i.m.call(i.tween,n,i.mt),i)},ed=function(t){for(var e=t._pt,n,i,s,o;e;){for(n=e._next,i=s;i&&i.pr>e.pr;)i=i._next;(e._prev=i?i._prev:o)?e._prev._next=e:s=e,(e._next=i)?i._prev=e:o=e,e=n}t._pt=s},Hn=(function(){function r(e,n,i,s,o,a,l,c,h){this.t=n,this.s=s,this.c=o,this.p=i,this.r=a||am,this.d=l||this,this.set=c||Qu,this.pr=h||0,this._next=e,e&&(e._prev=this)}var t=r.prototype;return t.modifier=function(n,i,s){this.mSet=this.mSet||this.set,this.set=nx,this.m=n,this.mt=s,this.tween=i},r})();Gn(Hu+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse",function(r){return Gu[r]=1});ci.TweenMax=ci.TweenLite=je;ci.TimelineLite=ci.TimelineMax=An;Ve=new An({sortChildren:!1,defaults:la,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});ni.stringFilter=Yu;var ws=[],Pl={},ix=[],Ip=0,rx=0,Tu=function(t){return(Pl[t]||ix).map(function(e){return e()})},Uu=function(){var t=Date.now(),e=[];t-Ip>2&&(Tu("matchMediaInit"),ws.forEach(function(n){var i=n.queries,s=n.conditions,o,a,l,c;for(a in i)o=nr.matchMedia(i[a]).matches,o&&(l=1),o!==s[a]&&(s[a]=o,c=1);c&&(n.revert(),l&&e.push(n))}),Tu("matchMediaRevert"),e.forEach(function(n){return n.onMatch(n,function(i){return n.add(null,i)})}),Ip=t,Tu("matchMedia"))},lm=(function(){function r(e,n){this.selector=n&&Lu(n),this.data=[],this._r=[],this.isReverted=!1,this.id=rx++,e&&this.add(e)}var t=r.prototype;return t.add=function(n,i,s){Ye(n)&&(s=i,i=n,n=Ye);var o=this,a=function(){var c=Be,h=o.selector,f;return c&&c!==o&&c.data.push(o),s&&(o.selector=Lu(s)),Be=o,f=i.apply(o,arguments),Ye(f)&&o._r.push(f),Be=c,o.selector=h,o.isReverted=!1,f};return o.last=a,n===Ye?a(o,function(l){return o.add(null,l)}):n?o[n]=a:a},t.ignore=function(n){var i=Be;Be=null,n(this),Be=i},t.getTweens=function(){var n=[];return this.data.forEach(function(i){return i instanceof r?n.push.apply(n,i.getTweens()):i instanceof je&&!(i.parent&&i.parent.data==="nested")&&n.push(i)}),n},t.clear=function(){this._r.length=this.data.length=0},t.kill=function(n,i){var s=this;if(n?(function(){for(var a=s.getTweens(),l=s.data.length,c;l--;)c=s.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(h){return a.splice(a.indexOf(h),1)}));for(a.map(function(h){return{g:h._dur||h._delay||h._sat&&!h._sat.vars.immediateRender?h.globalTime(0):-1/0,t:h}}).sort(function(h,f){return f.g-h.g||-1/0}).forEach(function(h){return h.t.revert(n)}),l=s.data.length;l--;)c=s.data[l],c instanceof An?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof je)&&c.revert&&c.revert(n);s._r.forEach(function(h){return h(n,s)}),s.isReverted=!0})():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),i)for(var o=ws.length;o--;)ws[o].id===this.id&&ws.splice(o,1)},t.revert=function(n){this.kill(n||{})},r})(),sx=(function(){function r(e){this.contexts=[],this.scope=e,Be&&Be.data.push(this)}var t=r.prototype;return t.add=function(n,i,s){rr(n)||(n={matches:n});var o=new lm(0,s||this.scope),a=o.conditions={},l,c,h;Be&&!o.selector&&(o.selector=Be.selector),this.contexts.push(o),i=o.add("onMatch",i),o.queries=n;for(c in n)c==="all"?h=1:(l=nr.matchMedia(n[c]),l&&(ws.indexOf(o)<0&&ws.push(o),(a[c]=l.matches)&&(h=1),l.addListener?l.addListener(Uu):l.addEventListener("change",Uu)));return h&&i(o,function(f){return o.add(null,f)}),this},t.revert=function(n){this.kill(n||{})},t.kill=function(n){this.contexts.forEach(function(i){return i.kill(n,!0)})},r})(),Ol={registerPlugin:function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];e.forEach(function(i){return tm(i)})},timeline:function(t){return new An(t)},getTweensOf:function(t,e){return Ve.getTweensOf(t,e)},getProperty:function(t,e,n,i){hn(t)&&(t=Ri(t)[0]);var s=Vr(t||{}).get,o=n?Vp:zp;return n==="native"&&(n=""),t&&(e?o((jn[e]&&jn[e].get||s)(t,e,n,i)):function(a,l,c){return o((jn[a]&&jn[a].get||s)(t,a,l,c))})},quickSetter:function(t,e,n){if(t=Ri(t),t.length>1){var i=t.map(function(h){return Rn.quickSetter(h,e,n)}),s=i.length;return function(h){for(var f=s;f--;)i[f](h)}}t=t[0]||{};var o=jn[e],a=Vr(t),l=a.harness&&(a.harness.aliases||{})[e]||e,c=o?function(h){var f=new o;io._pt=0,f.init(t,n?h+n:h,io,0,[t]),f.render(1,f),io._pt&&td(1,io)}:a.set(t,l);return o?c:function(h){return c(t,l,n?h+n:h,a,1)}},quickTo:function(t,e,n){var i,s=Rn.to(t,hi((i={},i[e]="+=0.1",i.paused=!0,i.stagger=0,i),n||{})),o=function(l,c,h){return s.resetTo(e,l,c,h)};return o.tween=s,o},isTweening:function(t){return Ve.getTweensOf(t,!0).length>0},defaults:function(t){return t&&t.ease&&(t.ease=bs(t.ease,la.ease)),Ep(la,t||{})},config:function(t){return Ep(ni,t||{})},registerEffect:function(t){var e=t.name,n=t.effect,i=t.plugins,s=t.defaults,o=t.extendTimeline;(i||"").split(",").forEach(function(a){return a&&!jn[a]&&!ci[a]&&ca(e+" effect requires "+a+" plugin.")}),Su[e]=function(a,l,c){return n(Ri(a),hi(l||{},s),c)},o&&(An.prototype[e]=function(a,l,c){return this.add(Su[e](a,rr(l)?l:(c=l)&&{},this),c)})},registerEase:function(t,e){ue[t]=bs(e)},parseEase:function(t,e){return arguments.length?bs(t,e):ue},getById:function(t){return Ve.getById(t)},exportRoot:function(t,e){t===void 0&&(t={});var n=new An(t),i,s;for(n.smoothChildTiming=ei(t.smoothChildTiming),Ve.remove(n),n._dp=0,n._time=n._tTime=Ve._time,i=Ve._first;i;)s=i._next,(e||!(!i._dur&&i instanceof je&&i.vars.onComplete===i._targets[0]))&&ir(n,i,i._start-i._delay),i=s;return ir(Ve,n,0),n},context:function(t,e){return t?new lm(t,e):Be},matchMedia:function(t){return new sx(t)},matchMediaRefresh:function(){return ws.forEach(function(t){var e=t.conditions,n,i;for(i in e)e[i]&&(e[i]=!1,n=1);n&&t.revert()})||Uu()},addEventListener:function(t,e){var n=Pl[t]||(Pl[t]=[]);~n.indexOf(e)||n.push(e)},removeEventListener:function(t,e){var n=Pl[t],i=n&&n.indexOf(e);i>=0&&n.splice(i,1)},utils:{wrap:U0,wrapYoyo:F0,distribute:Zp,random:$p,snap:Jp,normalize:O0,getUnit:Sn,clamp:I0,splitColor:em,toArray:Ri,selector:Lu,mapRange:Qp,pipe:L0,unitize:D0,interpolate:B0,shuffle:Yp},install:Up,effects:Su,ticker:ti,updateRoot:An.updateRoot,plugins:jn,globalTimeline:Ve,core:{PropTween:Hn,globals:Fp,Tween:je,Timeline:An,Animation:da,getCache:Vr,_removeLinkedListItem:Bl,reverting:function(){return yn},context:function(t){return t&&Be&&(Be.data.push(t),t._ctx=Be),Be},suppressOverwrites:function(t){return Fu=t}}};Gn("to,from,fromTo,delayedCall,set,killTweensOf",function(r){return Ol[r]=je[r]});ti.add(An.updateRoot);io=Ol.to({},{duration:0});var ox=function(t,e){for(var n=t._pt;n&&n.p!==e&&n.op!==e&&n.fp!==e;)n=n._next;return n},ax=function(t,e){var n=t._targets,i,s,o;for(i in e)for(s=n.length;s--;)o=t._ptLookup[s][i],o&&(o=o.d)&&(o._pt&&(o=ox(o,i)),o&&o.modifier&&o.modifier(e[i],t,n[s],i))},Eu=function(t,e){return{name:t,headless:1,rawVars:1,init:function(i,s,o){o._onInit=function(a){var l,c;if(hn(s)&&(l={},Gn(s,function(h){return l[h]=1}),s=l),e){l={};for(c in s)l[c]=e(s[c]);s=l}ax(a,s)}}}},Rn=Ol.registerPlugin({name:"attr",init:function(t,e,n,i,s){var o,a,l;this.tween=n;for(o in e)l=t.getAttribute(o)||"",a=this.add(t,"setAttribute",(l||0)+"",e[o],i,s,0,0,o),a.op=o,a.b=l,this._props.push(o)},render:function(t,e){for(var n=e._pt;n;)yn?n.set(n.t,n.p,n.b,n):n.r(t,n.d),n=n._next}},{name:"endArray",headless:1,init:function(t,e){for(var n=e.length;n--;)this.add(t,n,t[n]||0,e[n],0,0,0,0,0,1)}},Eu("roundProps",Du),Eu("modifiers"),Eu("snap",Jp))||Ol;je.version=An.version=Rn.version="3.15.0";Op=1;Bu()&&ao();var lx=ue.Power0,cx=ue.Power1,hx=ue.Power2,ux=ue.Power3,dx=ue.Power4,fx=ue.Linear,px=ue.Quad,mx=ue.Cubic,gx=ue.Quart,_x=ue.Quint,xx=ue.Strong,vx=ue.Elastic,yx=ue.Back,Sx=ue.SteppedEase,Mx=ue.Bounce,bx=ue.Sine,wx=ue.Expo,Tx=ue.Circ;var cm,Wr,ho,ad,Is,Ex,hm,ld,Ax=function(){return typeof window<"u"},Mr={},Ps=180/Math.PI,uo=Math.PI/180,co=Math.atan2,um=1e8,cd=/([A-Z])/g,Cx=/(left|right|width|margin|padding|x)/i,Rx=/[\s,\(]\S/,sr={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},id=function(t,e){return e.set(e.t,e.p,Math.round((e.s+e.c*t)*1e4)/1e4+e.u,e)},Px=function(t,e){return e.set(e.t,e.p,t===1?e.e:Math.round((e.s+e.c*t)*1e4)/1e4+e.u,e)},Ix=function(t,e){return e.set(e.t,e.p,t?Math.round((e.s+e.c*t)*1e4)/1e4+e.u:e.b,e)},Nx=function(t,e){return e.set(e.t,e.p,t===1?e.e:t?Math.round((e.s+e.c*t)*1e4)/1e4+e.u:e.b,e)},Lx=function(t,e){var n=e.s+e.c*t;e.set(e.t,e.p,~~(n+(n<0?-.5:.5))+e.u,e)},vm=function(t,e){return e.set(e.t,e.p,t?e.e:e.b,e)},ym=function(t,e){return e.set(e.t,e.p,t!==1?e.b:e.e,e)},Dx=function(t,e,n){return t.style[e]=n},Ox=function(t,e,n){return t.style.setProperty(e,n)},Ux=function(t,e,n){return t._gsap[e]=n},Fx=function(t,e,n){return t._gsap.scaleX=t._gsap.scaleY=n},Bx=function(t,e,n,i,s){var o=t._gsap;o.scaleX=o.scaleY=n,o.renderTransform(s,o)},kx=function(t,e,n,i,s){var o=t._gsap;o[e]=n,o.renderTransform(s,o)},Ge="transform",ii=Ge+"Origin",zx=function r(t,e){var n=this,i=this.target,s=i.style,o=i._gsap;if(t in Mr&&s){if(this.tfm=this.tfm||{},t!=="transform")t=sr[t]||t,~t.indexOf(",")?t.split(",").forEach(function(a){return n.tfm[a]=Sr(i,a)}):this.tfm[t]=o.x?o[t]:Sr(i,t),t===ii&&(this.tfm.zOrigin=o.zOrigin);else return sr.transform.split(",").forEach(function(a){return r.call(n,a,e)});if(this.props.indexOf(Ge)>=0)return;o.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(ii,e,"")),t=Ge}(s||e)&&this.props.push(t,e,s[t])},Sm=function(t){t.translate&&(t.removeProperty("translate"),t.removeProperty("scale"),t.removeProperty("rotate"))},Vx=function(){var t=this.props,e=this.target,n=e.style,i=e._gsap,s,o;for(s=0;s<t.length;s+=3)t[s+1]?t[s+1]===2?e[t[s]](t[s+2]):e[t[s]]=t[s+2]:t[s+2]?n[t[s]]=t[s+2]:n.removeProperty(t[s].substr(0,2)==="--"?t[s]:t[s].replace(cd,"-$1").toLowerCase());if(this.tfm){for(o in this.tfm)i[o]=this.tfm[o];i.svg&&(i.renderTransform(),e.setAttribute("data-svg-origin",this.svgo||"")),s=ld(),(!s||!s.isStart)&&!n[Ge]&&(Sm(n),i.zOrigin&&n[ii]&&(n[ii]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},Mm=function(t,e){var n={target:t,props:[],revert:Vx,save:zx};return t._gsap||Rn.core.getCache(t),e&&t.style&&t.nodeType&&e.split(",").forEach(function(i){return n.save(i)}),n},bm,rd=function(t,e){var n=Wr.createElementNS?Wr.createElementNS((e||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),t):Wr.createElement(t);return n&&n.style?n:Wr.createElement(t)},ui=function r(t,e,n){var i=getComputedStyle(t);return i[e]||i.getPropertyValue(e.replace(cd,"-$1").toLowerCase())||i.getPropertyValue(e)||!n&&r(t,fo(e)||e,1)||""},dm="O,Moz,ms,Ms,Webkit".split(","),fo=function(t,e,n){var i=e||Is,s=i.style,o=5;if(t in s&&!n)return t;for(t=t.charAt(0).toUpperCase()+t.substr(1);o--&&!(dm[o]+t in s););return o<0?null:(o===3?"ms":o>=0?dm[o]:"")+t},sd=function(){Ax()&&window.document&&(cm=window,Wr=cm.document,ho=Wr.documentElement,Is=rd("div")||{style:{}},Ex=rd("div"),Ge=fo(Ge),ii=Ge+"Origin",Is.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",bm=!!fo("perspective"),ld=Rn.core.reverting,ad=1)},fm=function(t){var e=t.ownerSVGElement,n=rd("svg",e&&e.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),i=t.cloneNode(!0),s;i.style.display="block",n.appendChild(i),ho.appendChild(n);try{s=i.getBBox()}catch{}return n.removeChild(i),ho.removeChild(n),s},pm=function(t,e){for(var n=e.length;n--;)if(t.hasAttribute(e[n]))return t.getAttribute(e[n])},wm=function(t){var e,n;try{e=t.getBBox()}catch{e=fm(t),n=1}return e&&(e.width||e.height)||n||(e=fm(t)),e&&!e.width&&!e.x&&!e.y?{x:+pm(t,["x","cx","x1"])||0,y:+pm(t,["y","cy","y1"])||0,width:0,height:0}:e},Tm=function(t){return!!(t.getCTM&&(!t.parentNode||t.ownerSVGElement)&&wm(t))},qr=function(t,e){if(e){var n=t.style,i;e in Mr&&e!==ii&&(e=Ge),n.removeProperty?(i=e.substr(0,2),(i==="ms"||e.substr(0,6)==="webkit")&&(e="-"+e),n.removeProperty(i==="--"?e:e.replace(cd,"-$1").toLowerCase())):n.removeAttribute(e)}},Xr=function(t,e,n,i,s,o){var a=new Hn(t._pt,e,n,0,1,o?ym:vm);return t._pt=a,a.b=i,a.e=s,t._props.push(n),a},mm={deg:1,rad:1,turn:1},Gx={grid:1,flex:1},Yr=function r(t,e,n,i){var s=parseFloat(n)||0,o=(n+"").trim().substr((s+"").length)||"px",a=Is.style,l=Cx.test(e),c=t.tagName.toLowerCase()==="svg",h=(c?"client":"offset")+(l?"Width":"Height"),f=100,u=i==="px",d=i==="%",g,_,p,m;if(i===o||!s||mm[i]||mm[o])return s;if(o!=="px"&&!u&&(s=r(t,e,n,"px")),m=t.getCTM&&Tm(t),(d||o==="%")&&(Mr[e]||~e.indexOf("adius")))return g=m?t.getBBox()[l?"width":"height"]:t[h],Ze(d?s/g*f:s/100*g);if(a[l?"width":"height"]=f+(u?o:i),_=i!=="rem"&&~e.indexOf("adius")||i==="em"&&t.appendChild&&!c?t:t.parentNode,m&&(_=(t.ownerSVGElement||{}).parentNode),(!_||_===Wr||!_.appendChild)&&(_=Wr.body),p=_._gsap,p&&d&&p.width&&l&&p.time===ti.time&&!p.uncache)return Ze(s/p.width*f);if(d&&(e==="height"||e==="width")){var b=t.style[e];t.style[e]=f+i,g=t[h],b?t.style[e]=b:qr(t,e)}else(d||o==="%")&&!Gx[ui(_,"display")]&&(a.position=ui(t,"position")),_===t&&(a.position="static"),_.appendChild(Is),g=Is[h],_.removeChild(Is),a.position="absolute";return l&&d&&(p=Vr(_),p.time=ti.time,p.width=_[h]),Ze(u?g*s/f:g&&s?f/g*s:0)},Sr=function(t,e,n,i){var s;return ad||sd(),e in sr&&e!=="transform"&&(e=sr[e],~e.indexOf(",")&&(e=e.split(",")[0])),Mr[e]&&e!=="transform"?(s=ga(t,i),s=e!=="transformOrigin"?s[e]:s.svg?s.origin:Hl(ui(t,ii))+" "+s.zOrigin+"px"):(s=t.style[e],(!s||s==="auto"||i||~(s+"").indexOf("calc("))&&(s=Gl[e]&&Gl[e](t,e,n)||ui(t,e)||Xu(t,e)||(e==="opacity"?1:0))),n&&!~(s+"").trim().indexOf(" ")?Yr(t,e,s,n)+n:s},Hx=function(t,e,n,i){if(!n||n==="none"){var s=fo(e,t,1),o=s&&ui(t,s,1);o&&o!==n?(e=s,n=o):e==="borderColor"&&(n=ui(t,"borderTopColor"))}var a=new Hn(this._pt,t.style,e,0,1,ju),l=0,c=0,h,f,u,d,g,_,p,m,b,A,y,S;if(a.b=n,a.e=i,n+="",i+="",i.substring(0,6)==="var(--"&&(i=ui(t,i.substring(4,i.indexOf(")")))),i==="auto"&&(_=t.style[e],t.style[e]=i,i=ui(t,e)||i,_?t.style[e]=_:qr(t,e)),h=[n,i],Yu(h),n=h[0],i=h[1],u=n.match(Ts)||[],S=i.match(Ts)||[],S.length){for(;f=Ts.exec(i);)p=f[0],b=i.substring(l,f.index),g?g=(g+1)%5:(b.substr(-5)==="rgba("||b.substr(-5)==="hsla(")&&(g=1),p!==(_=u[c++]||"")&&(d=parseFloat(_)||0,y=_.substr((d+"").length),p.charAt(1)==="="&&(p=Es(d,p)+y),m=parseFloat(p),A=p.substr((m+"").length),l=Ts.lastIndex-A.length,A||(A=A||ni.units[e]||y,l===i.length&&(i+=A,a.e+=A)),y!==A&&(d=Yr(t,e,_,A)||0),a._pt={_next:a._pt,p:b||c===1?b:",",s:d,c:m-d,m:g&&g<4||e==="zIndex"?Math.round:0});a.c=l<i.length?i.substring(l,i.length):""}else a.r=e==="display"&&i==="none"?ym:vm;return zu.test(i)&&(a.e=0),this._pt=a,a},gm={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},Wx=function(t){var e=t.split(" "),n=e[0],i=e[1]||"50%";return(n==="top"||n==="bottom"||i==="left"||i==="right")&&(t=n,n=i,i=t),e[0]=gm[n]||n,e[1]=gm[i]||i,e.join(" ")},Xx=function(t,e){if(e.tween&&e.tween._time===e.tween._dur){var n=e.t,i=n.style,s=e.u,o=n._gsap,a,l,c;if(s==="all"||s===!0)i.cssText="",l=1;else for(s=s.split(","),c=s.length;--c>-1;)a=s[c],Mr[a]&&(l=1,a=a==="transformOrigin"?ii:Ge),qr(n,a);l&&(qr(n,Ge),o&&(o.svg&&n.removeAttribute("transform"),i.scale=i.rotate=i.translate="none",ga(n,1),o.uncache=1,Sm(i)))}},Gl={clearProps:function(t,e,n,i,s){if(s.data!=="isFromStart"){var o=t._pt=new Hn(t._pt,e,n,0,0,Xx);return o.u=i,o.pr=-10,o.tween=s,t._props.push(n),1}}},ma=[1,0,0,1,0,0],Em={},Am=function(t){return t==="matrix(1, 0, 0, 1, 0, 0)"||t==="none"||!t},_m=function(t){var e=ui(t,Ge);return Am(e)?ma:e.substr(7).match(ku).map(Ze)},hd=function(t,e){var n=t._gsap||Vr(t),i=t.style,s=_m(t),o,a,l,c;return n.svg&&t.getAttribute("transform")?(l=t.transform.baseVal.consolidate().matrix,s=[l.a,l.b,l.c,l.d,l.e,l.f],s.join(",")==="1,0,0,1,0,0"?ma:s):(s===ma&&!t.offsetParent&&t!==ho&&!n.svg&&(l=i.display,i.display="block",o=t.parentNode,(!o||!t.offsetParent&&!t.getBoundingClientRect().width)&&(c=1,a=t.nextElementSibling,ho.appendChild(t)),s=_m(t),l?i.display=l:qr(t,"display"),c&&(a?o.insertBefore(t,a):o?o.appendChild(t):ho.removeChild(t))),e&&s.length>6?[s[0],s[1],s[4],s[5],s[12],s[13]]:s)},od=function(t,e,n,i,s,o){var a=t._gsap,l=s||hd(t,!0),c=a.xOrigin||0,h=a.yOrigin||0,f=a.xOffset||0,u=a.yOffset||0,d=l[0],g=l[1],_=l[2],p=l[3],m=l[4],b=l[5],A=e.split(" "),y=parseFloat(A[0])||0,S=parseFloat(A[1])||0,w,E,v,T;n?l!==ma&&(E=d*p-g*_)&&(v=y*(p/E)+S*(-_/E)+(_*b-p*m)/E,T=y*(-g/E)+S*(d/E)-(d*b-g*m)/E,y=v,S=T):(w=wm(t),y=w.x+(~A[0].indexOf("%")?y/100*w.width:y),S=w.y+(~(A[1]||A[0]).indexOf("%")?S/100*w.height:S)),i||i!==!1&&a.smooth?(m=y-c,b=S-h,a.xOffset=f+(m*d+b*_)-m,a.yOffset=u+(m*g+b*p)-b):a.xOffset=a.yOffset=0,a.xOrigin=y,a.yOrigin=S,a.smooth=!!i,a.origin=e,a.originIsAbsolute=!!n,t.style[ii]="0px 0px",o&&(Xr(o,a,"xOrigin",c,y),Xr(o,a,"yOrigin",h,S),Xr(o,a,"xOffset",f,a.xOffset),Xr(o,a,"yOffset",u,a.yOffset)),t.setAttribute("data-svg-origin",y+" "+S)},ga=function(t,e){var n=t._gsap||new Zu(t);if("x"in n&&!e&&!n.uncache)return n;var i=t.style,s=n.scaleX<0,o="px",a="deg",l=getComputedStyle(t),c=ui(t,ii)||"0",h,f,u,d,g,_,p,m,b,A,y,S,w,E,v,T,C,L,N,z,I,B,X,k,K,q,R,j,Tt,Et,Wt,Ht;return h=f=u=_=p=m=b=A=y=0,d=g=1,n.svg=!!(t.getCTM&&Tm(t)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(i[Ge]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Ge]!=="none"?l[Ge]:"")),i.scale=i.rotate=i.translate="none"),E=hd(t,n.svg),n.svg&&(n.uncache?(K=t.getBBox(),c=n.xOrigin-K.x+"px "+(n.yOrigin-K.y)+"px",k=""):k=!e&&t.getAttribute("data-svg-origin"),od(t,k||c,!!k||n.originIsAbsolute,n.smooth!==!1,E)),S=n.xOrigin||0,w=n.yOrigin||0,E!==ma&&(L=E[0],N=E[1],z=E[2],I=E[3],h=B=E[4],f=X=E[5],E.length===6?(d=Math.sqrt(L*L+N*N),g=Math.sqrt(I*I+z*z),_=L||N?co(N,L)*Ps:0,b=z||I?co(z,I)*Ps+_:0,b&&(g*=Math.abs(Math.cos(b*uo))),n.svg&&(h-=S-(S*L+w*z),f-=w-(S*N+w*I))):(Ht=E[6],Et=E[7],R=E[8],j=E[9],Tt=E[10],Wt=E[11],h=E[12],f=E[13],u=E[14],v=co(Ht,Tt),p=v*Ps,v&&(T=Math.cos(-v),C=Math.sin(-v),k=B*T+R*C,K=X*T+j*C,q=Ht*T+Tt*C,R=B*-C+R*T,j=X*-C+j*T,Tt=Ht*-C+Tt*T,Wt=Et*-C+Wt*T,B=k,X=K,Ht=q),v=co(-z,Tt),m=v*Ps,v&&(T=Math.cos(-v),C=Math.sin(-v),k=L*T-R*C,K=N*T-j*C,q=z*T-Tt*C,Wt=I*C+Wt*T,L=k,N=K,z=q),v=co(N,L),_=v*Ps,v&&(T=Math.cos(v),C=Math.sin(v),k=L*T+N*C,K=B*T+X*C,N=N*T-L*C,X=X*T-B*C,L=k,B=K),p&&Math.abs(p)+Math.abs(_)>359.9&&(p=_=0,m=180-m),d=Ze(Math.sqrt(L*L+N*N+z*z)),g=Ze(Math.sqrt(X*X+Ht*Ht)),v=co(B,X),b=Math.abs(v)>2e-4?v*Ps:0,y=Wt?1/(Wt<0?-Wt:Wt):0),n.svg&&(k=t.getAttribute("transform"),n.forceCSS=t.setAttribute("transform","")||!Am(ui(t,Ge)),k&&t.setAttribute("transform",k))),Math.abs(b)>90&&Math.abs(b)<270&&(s?(d*=-1,b+=_<=0?180:-180,_+=_<=0?180:-180):(g*=-1,b+=b<=0?180:-180)),e=e||n.uncache,n.x=h-((n.xPercent=h&&(!e&&n.xPercent||(Math.round(t.offsetWidth/2)===Math.round(-h)?-50:0)))?t.offsetWidth*n.xPercent/100:0)+o,n.y=f-((n.yPercent=f&&(!e&&n.yPercent||(Math.round(t.offsetHeight/2)===Math.round(-f)?-50:0)))?t.offsetHeight*n.yPercent/100:0)+o,n.z=u+o,n.scaleX=Ze(d),n.scaleY=Ze(g),n.rotation=Ze(_)+a,n.rotationX=Ze(p)+a,n.rotationY=Ze(m)+a,n.skewX=b+a,n.skewY=A+a,n.transformPerspective=y+o,(n.zOrigin=parseFloat(c.split(" ")[2])||!e&&n.zOrigin||0)&&(i[ii]=Hl(c)),n.xOffset=n.yOffset=0,n.force3D=ni.force3D,n.renderTransform=n.svg?Yx:bm?Cm:qx,n.uncache=0,n},Hl=function(t){return(t=t.split(" "))[0]+" "+t[1]},nd=function(t,e,n){var i=Sn(e);return Ze(parseFloat(e)+parseFloat(Yr(t,"x",n+"px",i)))+i},qx=function(t,e){e.z="0px",e.rotationY=e.rotationX="0deg",e.force3D=0,Cm(t,e)},Cs="0deg",pa="0px",Rs=") ",Cm=function(t,e){var n=e||this,i=n.xPercent,s=n.yPercent,o=n.x,a=n.y,l=n.z,c=n.rotation,h=n.rotationY,f=n.rotationX,u=n.skewX,d=n.skewY,g=n.scaleX,_=n.scaleY,p=n.transformPerspective,m=n.force3D,b=n.target,A=n.zOrigin,y="",S=m==="auto"&&t&&t!==1||m===!0;if(A&&(f!==Cs||h!==Cs)){var w=parseFloat(h)*uo,E=Math.sin(w),v=Math.cos(w),T;w=parseFloat(f)*uo,T=Math.cos(w),o=nd(b,o,E*T*-A),a=nd(b,a,-Math.sin(w)*-A),l=nd(b,l,v*T*-A+A)}p!==pa&&(y+="perspective("+p+Rs),(i||s)&&(y+="translate("+i+"%, "+s+"%) "),(S||o!==pa||a!==pa||l!==pa)&&(y+=l!==pa||S?"translate3d("+o+", "+a+", "+l+") ":"translate("+o+", "+a+Rs),c!==Cs&&(y+="rotate("+c+Rs),h!==Cs&&(y+="rotateY("+h+Rs),f!==Cs&&(y+="rotateX("+f+Rs),(u!==Cs||d!==Cs)&&(y+="skew("+u+", "+d+Rs),(g!==1||_!==1)&&(y+="scale("+g+", "+_+Rs),b.style[Ge]=y||"translate(0, 0)"},Yx=function(t,e){var n=e||this,i=n.xPercent,s=n.yPercent,o=n.x,a=n.y,l=n.rotation,c=n.skewX,h=n.skewY,f=n.scaleX,u=n.scaleY,d=n.target,g=n.xOrigin,_=n.yOrigin,p=n.xOffset,m=n.yOffset,b=n.forceCSS,A=parseFloat(o),y=parseFloat(a),S,w,E,v,T;l=parseFloat(l),c=parseFloat(c),h=parseFloat(h),h&&(h=parseFloat(h),c+=h,l+=h),l||c?(l*=uo,c*=uo,S=Math.cos(l)*f,w=Math.sin(l)*f,E=Math.sin(l-c)*-u,v=Math.cos(l-c)*u,c&&(h*=uo,T=Math.tan(c-h),T=Math.sqrt(1+T*T),E*=T,v*=T,h&&(T=Math.tan(h),T=Math.sqrt(1+T*T),S*=T,w*=T)),S=Ze(S),w=Ze(w),E=Ze(E),v=Ze(v)):(S=f,v=u,w=E=0),(A&&!~(o+"").indexOf("px")||y&&!~(a+"").indexOf("px"))&&(A=Yr(d,"x",o,"px"),y=Yr(d,"y",a,"px")),(g||_||p||m)&&(A=Ze(A+g-(g*S+_*E)+p),y=Ze(y+_-(g*w+_*v)+m)),(i||s)&&(T=d.getBBox(),A=Ze(A+i/100*T.width),y=Ze(y+s/100*T.height)),T="matrix("+S+","+w+","+E+","+v+","+A+","+y+")",d.setAttribute("transform",T),b&&(d.style[Ge]=T)},Zx=function(t,e,n,i,s){var o=360,a=hn(s),l=parseFloat(s)*(a&&~s.indexOf("rad")?Ps:1),c=l-i,h=i+c+"deg",f,u;return a&&(f=s.split("_")[1],f==="short"&&(c%=o,c!==c%(o/2)&&(c+=c<0?o:-o)),f==="cw"&&c<0?c=(c+o*um)%o-~~(c/o)*o:f==="ccw"&&c>0&&(c=(c-o*um)%o-~~(c/o)*o)),t._pt=u=new Hn(t._pt,e,n,i,c,Px),u.e=h,u.u="deg",t._props.push(n),u},xm=function(t,e){for(var n in e)t[n]=e[n];return t},Jx=function(t,e,n){var i=xm({},n._gsap),s="perspective,force3D,transformOrigin,svgOrigin",o=n.style,a,l,c,h,f,u,d,g;i.svg?(c=n.getAttribute("transform"),n.setAttribute("transform",""),o[Ge]=e,a=ga(n,1),qr(n,Ge),n.setAttribute("transform",c)):(c=getComputedStyle(n)[Ge],o[Ge]=e,a=ga(n,1),o[Ge]=c);for(l in Mr)c=i[l],h=a[l],c!==h&&s.indexOf(l)<0&&(d=Sn(c),g=Sn(h),f=d!==g?Yr(n,l,c,g):parseFloat(c),u=parseFloat(h),t._pt=new Hn(t._pt,a,l,f,u-f,id),t._pt.u=g||0,t._props.push(l));xm(a,i)};Gn("padding,margin,Width,Radius",function(r,t){var e="Top",n="Right",i="Bottom",s="Left",o=(t<3?[e,n,i,s]:[e+s,e+n,i+n,i+s]).map(function(a){return t<2?r+a:"border"+a+r});Gl[t>1?"border"+r:r]=function(a,l,c,h,f){var u,d;if(arguments.length<4)return u=o.map(function(g){return Sr(a,g,c)}),d=u.join(" "),d.split(u[0]).length===5?u[0]:d;u=(h+"").split(" "),d={},o.forEach(function(g,_){return d[g]=u[_]=u[_]||u[(_-1)/2|0]}),a.init(l,d,f)}});var ud={name:"css",register:sd,targetTest:function(t){return t.style&&t.nodeType},init:function(t,e,n,i,s){var o=this._props,a=t.style,l=n.vars.startAt,c,h,f,u,d,g,_,p,m,b,A,y,S,w,E,v,T;ad||sd(),this.styles=this.styles||Mm(t),v=this.styles.props,this.tween=n;for(_ in e)if(_!=="autoRound"&&(h=e[_],!(jn[_]&&$u(_,e,n,i,t,s)))){if(d=typeof h,g=Gl[_],d==="function"&&(h=h.call(n,i,t,s),d=typeof h),d==="string"&&~h.indexOf("random(")&&(h=lo(h)),g)g(this,t,_,h,n)&&(E=1);else if(_.substr(0,2)==="--")c=(getComputedStyle(t).getPropertyValue(_)+"").trim(),h+="",vr.lastIndex=0,vr.test(c)||(p=Sn(c),m=Sn(h),m?p!==m&&(c=Yr(t,_,c,m)+m):p&&(h+=p)),this.add(a,"setProperty",c,h,i,s,0,0,_),o.push(_),v.push(_,0,a[_]);else if(d!=="undefined"){if(l&&_ in l?(c=typeof l[_]=="function"?l[_].call(n,i,t,s):l[_],hn(c)&&~c.indexOf("random(")&&(c=lo(c)),Sn(c+"")||c==="auto"||(c+=ni.units[_]||Sn(Sr(t,_))||""),(c+"").charAt(1)==="="&&(c=Sr(t,_))):c=Sr(t,_),u=parseFloat(c),b=d==="string"&&h.charAt(1)==="="&&h.substr(0,2),b&&(h=h.substr(2)),f=parseFloat(h),_ in sr&&(_==="autoAlpha"&&(u===1&&Sr(t,"visibility")==="hidden"&&f&&(u=0),v.push("visibility",0,a.visibility),Xr(this,a,"visibility",u?"inherit":"hidden",f?"inherit":"hidden",!f)),_!=="scale"&&_!=="transform"&&(_=sr[_],~_.indexOf(",")&&(_=_.split(",")[0]))),A=_ in Mr,A){if(this.styles.save(_),T=h,d==="string"&&h.substring(0,6)==="var(--"){if(h=ui(t,h.substring(4,h.indexOf(")"))),h.substring(0,5)==="calc("){var C=t.style.perspective;t.style.perspective=h,h=ui(t,"perspective"),C?t.style.perspective=C:qr(t,"perspective")}f=parseFloat(h)}if(y||(S=t._gsap,S.renderTransform&&!e.parseTransform||ga(t,e.parseTransform),w=e.smoothOrigin!==!1&&S.smooth,y=this._pt=new Hn(this._pt,a,Ge,0,1,S.renderTransform,S,0,-1),y.dep=1),_==="scale")this._pt=new Hn(this._pt,S,"scaleY",S.scaleY,(b?Es(S.scaleY,b+f):f)-S.scaleY||0,id),this._pt.u=0,o.push("scaleY",_),_+="X";else if(_==="transformOrigin"){v.push(ii,0,a[ii]),h=Wx(h),S.svg?od(t,h,0,w,0,this):(m=parseFloat(h.split(" ")[2])||0,m!==S.zOrigin&&Xr(this,S,"zOrigin",S.zOrigin,m),Xr(this,a,_,Hl(c),Hl(h)));continue}else if(_==="svgOrigin"){od(t,h,1,w,0,this);continue}else if(_ in Em){Zx(this,S,_,u,b?Es(u,b+h):h);continue}else if(_==="smoothOrigin"){Xr(this,S,"smooth",S.smooth,h);continue}else if(_==="force3D"){S[_]=h;continue}else if(_==="transform"){Jx(this,h,t);continue}}else _ in a||(_=fo(_)||_);if(A||(f||f===0)&&(u||u===0)&&!Rx.test(h)&&_ in a)p=(c+"").substr((u+"").length),f||(f=0),m=Sn(h)||(_ in ni.units?ni.units[_]:p),p!==m&&(u=Yr(t,_,c,m)),this._pt=new Hn(this._pt,A?S:a,_,u,(b?Es(u,b+f):f)-u,!A&&(m==="px"||_==="zIndex")&&e.autoRound!==!1?Lx:id),this._pt.u=m||0,A&&T!==h?(this._pt.b=c,this._pt.e=T,this._pt.r=Nx):p!==m&&m!=="%"&&(this._pt.b=c,this._pt.r=Ix);else if(_ in a)Hx.call(this,t,_,c,b?b+h:h);else if(_ in t)this.add(t,_,c||t[_],b?b+h:h,i,s);else if(_!=="parseTransform"){Fl(_,h);continue}A||(_ in a?v.push(_,0,a[_]):typeof t[_]=="function"?v.push(_,2,t[_]()):v.push(_,1,c||t[_])),o.push(_)}}E&&ed(this)},render:function(t,e){if(e.tween._time||!ld())for(var n=e._pt;n;)n.r(t,n.d),n=n._next;else e.styles.revert()},get:Sr,aliases:sr,getSetter:function(t,e,n){var i=sr[e];return i&&i.indexOf(",")<0&&(e=i),e in Mr&&e!==ii&&(t._gsap.x||Sr(t,"x"))?n&&hm===n?e==="scale"?Fx:Ux:(hm=n||{})&&(e==="scale"?Bx:kx):t.style&&!Ul(t.style[e])?Dx:~e.indexOf("-")?Ox:Vl(t,e)},core:{_removeProperty:qr,_getMatrix:hd}};Rn.utils.checkPrefix=fo;Rn.core.getStyleSaver=Mm;(function(r,t,e,n){var i=Gn(r+","+t+","+e,function(s){Mr[s]=1});Gn(t,function(s){ni.units[s]="deg",Em[s]=1}),sr[i[13]]=r+","+t,Gn(n,function(s){var o=s.split(":");sr[o[1]]=i[o[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Gn("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(r){ni.units[r]="px"});Rn.registerPlugin(ud);var Wn=Rn.registerPlugin(ud)||Rn,Rw=Wn.core.Tween;function Rm(r,t){for(var e=0;e<t.length;e++){var n=t[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(r,n.key,n)}}function $x(r,t,e){return t&&Rm(r.prototype,t),e&&Rm(r,e),r}var Mn,ql,Kx,di,Zr,Jr,mo,Im,Ns,go,Nm,br,Bi,Lm,Dm=function(){return Mn||typeof window<"u"&&(Mn=window.gsap)&&Mn.registerPlugin&&Mn},Om=1,po=[],ie=[],ki=[],xa=Date.now,dd=function(t,e){return e},Qx=function(){var t=go.core,e=t.bridge||{},n=t._scrollers,i=t._proxies;n.push.apply(n,ie),i.push.apply(i,ki),ie=n,ki=i,dd=function(o,a){return e[o](a)}},Tr=function(t,e){return~ki.indexOf(t)&&ki[ki.indexOf(t)+1][e]},va=function(t){return!!~Nm.indexOf(t)},qn=function(t,e,n,i,s){return t.addEventListener(e,n,{passive:i!==!1,capture:!!s})},Xn=function(t,e,n,i){return t.removeEventListener(e,n,!!i)},Wl="scrollLeft",Xl="scrollTop",fd=function(){return br&&br.isPressed||ie.cache++},Yl=function(t,e){var n=function i(s){if(s||s===0){Om&&(di.history.scrollRestoration="manual");var o=br&&br.isPressed;s=i.v=Math.round(s)||(br&&br.iOS?1:0),t(s),i.cacheID=ie.cache,o&&dd("ss",s)}else(e||ie.cache!==i.cacheID||dd("ref"))&&(i.cacheID=ie.cache,i.v=t());return i.v+i.offset};return n.offset=0,t&&n},Pn={s:Wl,p:"left",p2:"Left",os:"right",os2:"Right",d:"width",d2:"Width",a:"x",sc:Yl(function(r){return arguments.length?di.scrollTo(r,on.sc()):di.pageXOffset||Zr[Wl]||Jr[Wl]||mo[Wl]||0})},on={s:Xl,p:"top",p2:"Top",os:"bottom",os2:"Bottom",d:"height",d2:"Height",a:"y",op:Pn,sc:Yl(function(r){return arguments.length?di.scrollTo(Pn.sc(),r):di.pageYOffset||Zr[Xl]||Jr[Xl]||mo[Xl]||0})},Yn=function(t,e){return(e&&e._ctx&&e._ctx.selector||Mn.utils.toArray)(t)[0]||(typeof t=="string"&&Mn.config().nullTargetWarn!==!1?console.warn("Element not found:",t):null)},jx=function(t,e){for(var n=e.length;n--;)if(e[n]===t||e[n].contains(t))return!0;return!1},wr=function(t,e){var n=e.s,i=e.sc;va(t)&&(t=Zr.scrollingElement||Jr);var s=ie.indexOf(t),o=i===on.sc?1:2;!~s&&(s=ie.push(t)-1),ie[s+o]||qn(t,"scroll",fd);var a=ie[s+o],l=a||(ie[s+o]=Yl(Tr(t,n),!0)||(va(t)?i:Yl(function(c){return arguments.length?t[n]=c:t[n]})));return l.target=t,a||(l.smooth=Mn.getProperty(t,"scrollBehavior")==="smooth"),l},Zl=function(t,e,n){var i=t,s=t,o=xa(),a=o,l=e||50,c=Math.max(500,l*3),h=function(g,_){var p=xa();_||p-o>l?(s=i,i=g,a=o,o=p):n?i+=g:i=s+(g-s)/(p-a)*(o-a)},f=function(){s=i=n?0:i,a=o=0},u=function(g){var _=a,p=s,m=xa();return(g||g===0)&&g!==i&&h(g),o===a||m-a>c?0:(i+(n?p:-p))/((n?m:o)-_)*1e3};return{update:h,reset:f,getVelocity:u}},_a=function(t,e){return e&&!t._gsapAllow&&t.cancelable!==!1&&t.preventDefault(),t.changedTouches?t.changedTouches[0]:t},Pm=function(t){var e=Math.max.apply(Math,t),n=Math.min.apply(Math,t);return Math.abs(e)>=Math.abs(n)?e:n},Um=function(){go=Mn.core.globals().ScrollTrigger,go&&go.core&&Qx()},Fm=function(t){return Mn=t||Dm(),!ql&&Mn&&typeof document<"u"&&document.body&&(di=window,Zr=document,Jr=Zr.documentElement,mo=Zr.body,Nm=[di,Zr,Jr,mo],Kx=Mn.utils.clamp,Lm=Mn.core.context||function(){},Ns="onpointerenter"in mo?"pointer":"mouse",Im=Je.isTouch=di.matchMedia&&di.matchMedia("(hover: none), (pointer: coarse)").matches?1:"ontouchstart"in di||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0?2:0,Bi=Je.eventTypes=("ontouchstart"in Jr?"touchstart,touchmove,touchcancel,touchend":"onpointerdown"in Jr?"pointerdown,pointermove,pointercancel,pointerup":"mousedown,mousemove,mouseup,mouseup").split(","),setTimeout(function(){return Om=0},500),ql=1),go||Um(),ql};Pn.op=on;ie.cache=0;var Je=(function(){function r(e){this.init(e)}var t=r.prototype;return t.init=function(n){ql||Fm(Mn)||console.warn("Please gsap.registerPlugin(Observer)"),go||Um();var i=n.tolerance,s=n.dragMinimum,o=n.type,a=n.target,l=n.lineHeight,c=n.debounce,h=n.preventDefault,f=n.onStop,u=n.onStopDelay,d=n.ignore,g=n.wheelSpeed,_=n.event,p=n.onDragStart,m=n.onDragEnd,b=n.onDrag,A=n.onPress,y=n.onRelease,S=n.onRight,w=n.onLeft,E=n.onUp,v=n.onDown,T=n.onChangeX,C=n.onChangeY,L=n.onChange,N=n.onToggleX,z=n.onToggleY,I=n.onHover,B=n.onHoverEnd,X=n.onMove,k=n.ignoreCheck,K=n.isNormalizer,q=n.onGestureStart,R=n.onGestureEnd,j=n.onWheel,Tt=n.onEnable,Et=n.onDisable,Wt=n.onClick,Ht=n.scrollSpeed,qt=n.capture,J=n.allowClicks,tt=n.lockAxis,yt=n.onLockAxis;this.target=a=Yn(a)||Jr,this.vars=n,d&&(d=Mn.utils.toArray(d)),i=i||1e-9,s=s||0,g=g||1,Ht=Ht||1,o=o||"wheel,touch,pointer",c=c!==!1,l||(l=parseFloat(di.getComputedStyle(mo).lineHeight)||22);var Vt,xt,kt,Gt,Dt,Jt,te,V=this,se=0,we=0,ke=n.passive||!h&&n.passive!==!1,$t=wr(a,Pn),ve=wr(a,on),U=$t(),Fe=ve(),Yt=~o.indexOf("touch")&&!~o.indexOf("pointer")&&Bi[0]==="pointerdown",P=va(a),x=a.ownerDocument||Zr,F=[0,0,0],H=[0,0,0],$=0,ht=function(){return $=xa()},at=function(rt,Ft){return(V.event=rt)&&d&&jx(rt.target,d)||Ft&&Yt&&rt.pointerType!=="touch"||k&&k(rt,Ft)},Q=function(){V._vx.reset(),V._vy.reset(),xt.pause(),f&&f(V)},nt=function(){var rt=V.deltaX=Pm(F),Ft=V.deltaY=Pm(H),st=Math.abs(rt)>=i,Bt=Math.abs(Ft)>=i;L&&(st||Bt)&&L(V,rt,Ft,F,H),st&&(S&&V.deltaX>0&&S(V),w&&V.deltaX<0&&w(V),T&&T(V),N&&V.deltaX<0!=se<0&&N(V),se=V.deltaX,F[0]=F[1]=F[2]=0),Bt&&(v&&V.deltaY>0&&v(V),E&&V.deltaY<0&&E(V),C&&C(V),z&&V.deltaY<0!=we<0&&z(V),we=V.deltaY,H[0]=H[1]=H[2]=0),(Gt||kt)&&(X&&X(V),kt&&(p&&kt===1&&p(V),b&&b(V),kt=0),Gt=!1),Jt&&!(Jt=!1)&&yt&&yt(V),Dt&&(j(V),Dt=!1),Vt=0},mt=function(rt,Ft,st){F[st]+=rt,H[st]+=Ft,V._vx.update(rt),V._vy.update(Ft),c?Vt||(Vt=requestAnimationFrame(nt)):nt()},Pt=function(rt,Ft){tt&&!te&&(V.axis=te=Math.abs(rt)>Math.abs(Ft)?"x":"y",Jt=!0),te!=="y"&&(F[2]+=rt,V._vx.update(rt,!0)),te!=="x"&&(H[2]+=Ft,V._vy.update(Ft,!0)),c?Vt||(Vt=requestAnimationFrame(nt)):nt()},gt=function(rt){if(!at(rt,1)){rt=_a(rt,h);var Ft=rt.clientX,st=rt.clientY,Bt=Ft-V.x,It=st-V.y,Kt=V.isDragging;V.x=Ft,V.y=st,(Kt||(Bt||It)&&(Math.abs(V.startX-Ft)>=s||Math.abs(V.startY-st)>=s))&&(kt||(kt=Kt?2:1),Kt||(V.isDragging=!0),Pt(Bt,It))}},pt=V.onPress=function(lt){at(lt,1)||lt&&lt.button||(V.axis=te=null,xt.pause(),V.isPressed=!0,lt=_a(lt),se=we=0,V.startX=V.x=lt.clientX,V.startY=V.y=lt.clientY,V._vx.reset(),V._vy.reset(),qn(K?a:x,Bi[1],gt,ke,!0),V.deltaX=V.deltaY=0,A&&A(V))},ct=V.onRelease=function(lt){if(!at(lt,1)){Xn(K?a:x,Bi[1],gt,!0);var rt=!isNaN(V.y-V.startY),Ft=V.isDragging,st=Ft&&(Math.abs(V.x-V.startX)>3||Math.abs(V.y-V.startY)>3),Bt=_a(lt);!st&&rt&&(V._vx.reset(),V._vy.reset(),h&&J&&Mn.delayedCall(.08,function(){if(xa()-$>300&&!lt.defaultPrevented){if(lt.target.click)lt.target.click();else if(x.createEvent){var It=x.createEvent("MouseEvents");It.initMouseEvent("click",!0,!0,di,1,Bt.screenX,Bt.screenY,Bt.clientX,Bt.clientY,!1,!1,!1,!1,0,null),lt.target.dispatchEvent(It)}}})),V.isDragging=V.isGesturing=V.isPressed=!1,f&&Ft&&!K&&xt.restart(!0),kt&&nt(),m&&Ft&&m(V),y&&y(V,st)}},Ot=function(rt){return rt.touches&&rt.touches.length>1&&(V.isGesturing=!0)&&q(rt,V.isDragging)},zt=function(){return(V.isGesturing=!1)||R(V)},D=function(rt){if(!at(rt)){var Ft=$t(),st=ve();mt((Ft-U)*Ht,(st-Fe)*Ht,1),U=Ft,Fe=st,f&&xt.restart(!0)}},ft=function(rt){if(!at(rt)){rt=_a(rt,h),j&&(Dt=!0);var Ft=(rt.deltaMode===1?l:rt.deltaMode===2?di.innerHeight:1)*g;mt(rt.deltaX*Ft,rt.deltaY*Ft,0),f&&!K&&xt.restart(!0)}},et=function(rt){if(!at(rt)){var Ft=rt.clientX,st=rt.clientY,Bt=Ft-V.x,It=st-V.y;V.x=Ft,V.y=st,Gt=!0,f&&xt.restart(!0),(Bt||It)&&Pt(Bt,It)}},_t=function(rt){V.event=rt,I(V)},St=function(rt){V.event=rt,B(V)},it=function(rt){return at(rt)||_a(rt,h)&&Wt(V)};xt=V._dc=Mn.delayedCall(u||.25,Q).pause(),V.deltaX=V.deltaY=0,V._vx=Zl(0,50,!0),V._vy=Zl(0,50,!0),V.scrollX=$t,V.scrollY=ve,V.isDragging=V.isGesturing=V.isPressed=!1,Lm(this),V.enable=function(lt){return V.isEnabled||(qn(P?x:a,"scroll",fd),o.indexOf("scroll")>=0&&qn(P?x:a,"scroll",D,ke,qt),o.indexOf("wheel")>=0&&qn(a,"wheel",ft,ke,qt),(o.indexOf("touch")>=0&&Im||o.indexOf("pointer")>=0)&&(qn(a,Bi[0],pt,ke,qt),qn(x,Bi[2],ct),qn(x,Bi[3],ct),J&&qn(a,"click",ht,!0,!0),Wt&&qn(a,"click",it),q&&qn(x,"gesturestart",Ot),R&&qn(x,"gestureend",zt),I&&qn(a,Ns+"enter",_t),B&&qn(a,Ns+"leave",St),X&&qn(a,Ns+"move",et)),V.isEnabled=!0,V.isDragging=V.isGesturing=V.isPressed=Gt=kt=!1,V._vx.reset(),V._vy.reset(),U=$t(),Fe=ve(),lt&&lt.type&&pt(lt),Tt&&Tt(V)),V},V.disable=function(){V.isEnabled&&(po.filter(function(lt){return lt!==V&&va(lt.target)}).length||Xn(P?x:a,"scroll",fd),V.isPressed&&(V._vx.reset(),V._vy.reset(),Xn(K?a:x,Bi[1],gt,!0)),Xn(P?x:a,"scroll",D,qt),Xn(a,"wheel",ft,qt),Xn(a,Bi[0],pt,qt),Xn(x,Bi[2],ct),Xn(x,Bi[3],ct),Xn(a,"click",ht,!0),Xn(a,"click",it),Xn(x,"gesturestart",Ot),Xn(x,"gestureend",zt),Xn(a,Ns+"enter",_t),Xn(a,Ns+"leave",St),Xn(a,Ns+"move",et),V.isEnabled=V.isPressed=V.isDragging=!1,Et&&Et(V))},V.kill=V.revert=function(){V.disable();var lt=po.indexOf(V);lt>=0&&po.splice(lt,1),br===V&&(br=0)},po.push(V),K&&va(a)&&(br=V),V.enable(_)},$x(r,[{key:"velocityX",get:function(){return this._vx.getVelocity()}},{key:"velocityY",get:function(){return this._vy.getVelocity()}}]),r})();Je.version="3.15.0";Je.create=function(r){return new Je(r)};Je.register=Fm;Je.getAll=function(){return po.slice()};Je.getById=function(r){return po.filter(function(t){return t.vars.id===r})[0]};Dm()&&Mn.registerPlugin(Je);var Rt,yo,ae,be,mi,Se,Ad,hc,La,Ea,Sa,Jl,In,fc,yd,Jn,Bm,km,So,eg,pd,ng,Zn,Sd,ig,rg,$r,Md,Cd,Mo,Rd,Aa,bd,md,$l=1,Nn=Date.now,gd=Nn(),Ni=0,Ma=0,zm=function(t,e,n){var i=pi(t)&&(t.substr(0,6)==="clamp("||t.indexOf("max")>-1);return n["_"+e+"Clamp"]=i,i?t.substr(6,t.length-7):t},Vm=function(t,e){return e&&(!pi(t)||t.substr(0,6)!=="clamp(")?"clamp("+t+")":t},tv=function r(){return Ma&&requestAnimationFrame(r)},Gm=function(){return fc=1},Hm=function(){return fc=0},or=function(t){return t},ba=function(t){return Math.round(t*1e5)/1e5||0},sg=function(){return typeof window<"u"},og=function(){return Rt||sg()&&(Rt=window.gsap)&&Rt.registerPlugin&&Rt},Bs=function(t){return!!~Ad.indexOf(t)},ag=function(t){return(t==="Height"?Rd:ae["inner"+t])||mi["client"+t]||Se["client"+t]},lg=function(t){return Tr(t,"getBoundingClientRect")||(Bs(t)?function(){return cc.width=ae.innerWidth,cc.height=Rd,cc}:function(){return Er(t)})},ev=function(t,e,n){var i=n.d,s=n.d2,o=n.a;return(o=Tr(t,"getBoundingClientRect"))?function(){return o()[i]}:function(){return(e?ag(s):t["client"+s])||0}},nv=function(t,e){return!e||~ki.indexOf(t)?lg(t):function(){return cc}},ar=function(t,e){var n=e.s,i=e.d2,s=e.d,o=e.a;return Math.max(0,(n="scroll"+i)&&(o=Tr(t,n))?o()-lg(t)()[s]:Bs(t)?(mi[n]||Se[n])-ag(i):t[n]-t["offset"+i])},Kl=function(t,e){for(var n=0;n<So.length;n+=3)(!e||~e.indexOf(So[n+1]))&&t(So[n],So[n+1],So[n+2])},pi=function(t){return typeof t=="string"},Ln=function(t){return typeof t=="function"},wa=function(t){return typeof t=="number"},Ls=function(t){return typeof t=="object"},ya=function(t,e,n){return t&&t.progress(e?0:1)&&n&&t.pause()},_o=function(t,e,n){if(t.enabled){var i=t._ctx?t._ctx.add(function(){return e(t,n)}):e(t,n);i&&i.totalTime&&(t.callbackAnimation=i)}},xo=Math.abs,cg="left",hg="top",Pd="right",Id="bottom",Os="width",Us="height",Ca="Right",Ra="Left",Pa="Top",Ia="Bottom",an="padding",Pi="margin",wo="Width",Nd="Height",un="px",Ii=function(t){return ae.getComputedStyle(t.nodeType===Node.DOCUMENT_NODE?t.scrollingElement:t)},iv=function(t){var e=Ii(t).position;t.style.position=e==="absolute"||e==="fixed"?e:"relative"},Wm=function(t,e){for(var n in e)n in t||(t[n]=e[n]);return t},Er=function(t,e){var n=e&&Ii(t)[yd]!=="matrix(1, 0, 0, 1, 0, 0)"&&Rt.to(t,{x:0,y:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scale:1,skewX:0,skewY:0}).progress(1),i=t.getBoundingClientRect?t.getBoundingClientRect():t.scrollingElement.getBoundingClientRect();return n&&n.progress(0).kill(),i},uc=function(t,e){var n=e.d2;return t["offset"+n]||t["client"+n]||0},ug=function(t){var e=[],n=t.labels,i=t.duration(),s;for(s in n)e.push(n[s]/i);return e},rv=function(t){return function(e){return Rt.utils.snap(ug(t),e)}},Ld=function(t){var e=Rt.utils.snap(t),n=Array.isArray(t)&&t.slice(0).sort(function(i,s){return i-s});return n?function(i,s,o){o===void 0&&(o=.001);var a;if(!s)return e(i);if(s>0){for(i-=o,a=0;a<n.length;a++)if(n[a]>=i)return n[a];return n[a-1]}else for(a=n.length,i+=o;a--;)if(n[a]<=i)return n[a];return n[0]}:function(i,s,o){o===void 0&&(o=.001);var a=e(i);return!s||Math.abs(a-i)<o||a-i<0==s<0?a:e(s<0?i-t:i+t)}},sv=function(t){return function(e,n){return Ld(ug(t))(e,n.direction)}},Ql=function(t,e,n,i){return n.split(",").forEach(function(s){return t(e,s,i)})},_n=function(t,e,n,i,s){return t.addEventListener(e,n,{passive:!i,capture:!!s})},gn=function(t,e,n,i){return t.removeEventListener(e,n,!!i)},jl=function(t,e,n){n=n&&n.wheelHandler,n&&(t(e,"wheel",n),t(e,"touchmove",n))},Xm={startColor:"green",endColor:"red",indent:0,fontSize:"16px",fontWeight:"normal"},tc={toggleActions:"play",anticipatePin:0},dc={top:0,left:0,center:.5,bottom:1,right:1},sc=function(t,e){if(pi(t)){var n=t.indexOf("="),i=~n?+(t.charAt(n-1)+1)*parseFloat(t.substr(n+1)):0;~n&&(t.indexOf("%")>n&&(i*=e/100),t=t.substr(0,n-1)),t=i+(t in dc?dc[t]*e:~t.indexOf("%")?parseFloat(t)*e/100:parseFloat(t)||0)}return t},ec=function(t,e,n,i,s,o,a,l){var c=s.startColor,h=s.endColor,f=s.fontSize,u=s.indent,d=s.fontWeight,g=be.createElement("div"),_=Bs(n)||Tr(n,"pinType")==="fixed",p=t.indexOf("scroller")!==-1,m=_?Se:n.tagName==="IFRAME"?n.contentDocument.body:n,b=t.indexOf("start")!==-1,A=b?c:h,y="border-color:"+A+";font-size:"+f+";color:"+A+";font-weight:"+d+";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";return y+="position:"+((p||l)&&_?"fixed;":"absolute;"),(p||l||!_)&&(y+=(i===on?Pd:Id)+":"+(o+parseFloat(u))+"px;"),a&&(y+="box-sizing:border-box;text-align:left;width:"+a.offsetWidth+"px;"),g._isStart=b,g.setAttribute("class","gsap-marker-"+t+(e?" marker-"+e:"")),g.style.cssText=y,g.innerText=e||e===0?t+"-"+e:t,m.children[0]?m.insertBefore(g,m.children[0]):m.appendChild(g),g._offset=g["offset"+i.op.d2],oc(g,0,i,b),g},oc=function(t,e,n,i){var s={display:"block"},o=n[i?"os2":"p2"],a=n[i?"p2":"os2"];t._isFlipped=i,s[n.a+"Percent"]=i?-100:0,s[n.a]=i?"1px":0,s["border"+o+wo]=1,s["border"+a+wo]=0,s[n.p]=e+"px",Rt.set(t,s)},re=[],wd={},Da,qm=function(){return Nn()-Ni>34&&(Da||(Da=requestAnimationFrame(Ar)))},vo=function(){(!Zn||!Zn.isPressed||Zn.startX>Se.clientWidth)&&(ie.cache++,Zn?Da||(Da=requestAnimationFrame(Ar)):Ar(),Ni||zs("scrollStart"),Ni=Nn())},_d=function(){rg=ae.innerWidth,ig=ae.innerHeight},Ta=function(t){ie.cache++,(t===!0||!In&&!ng&&!be.fullscreenElement&&!be.webkitFullscreenElement&&(!Sd||rg!==ae.innerWidth||Math.abs(ae.innerHeight-ig)>ae.innerHeight*.25))&&hc.restart(!0)},ks={},ov=[],dg=function r(){return gn(jt,"scrollEnd",r)||Ds(!0)},zs=function(t){return ks[t]&&ks[t].map(function(e){return e()})||ov},fi=[],fg=function(t){for(var e=0;e<fi.length;e+=5)(!t||fi[e+4]&&fi[e+4].query===t)&&(fi[e].style.cssText=fi[e+1],fi[e].getBBox&&fi[e].setAttribute("transform",fi[e+2]||""),fi[e+3].uncache=1)},pg=function(){return ie.forEach(function(t){return Ln(t)&&++t.cacheID&&(t.rec=t())})},Dd=function(t,e){var n;for(Jn=0;Jn<re.length;Jn++)n=re[Jn],n&&(!e||n._ctx===e)&&(t?n.kill(1):n.revert(!0,!0));Aa=!0,e&&fg(e),e||zs("revert")},mg=function(t,e){ie.cache++,(e||!$n)&&ie.forEach(function(n){return Ln(n)&&n.cacheID++&&(n.rec=0)}),pi(t)&&(ae.history.scrollRestoration=Cd=t)},$n,Fs=0,Ym,av=function(){if(Ym!==Fs){var t=Ym=Fs;requestAnimationFrame(function(){return t===Fs&&Ds(!0)})}},gg=function(){Se.appendChild(Mo),Rd=!Zn&&Mo.offsetHeight||ae.innerHeight,Se.removeChild(Mo)},Zm=function(t){return La(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(e){return e.style.display=t?"none":"block"})},Ds=function(t,e){if(mi=be.documentElement,Se=be.body,Ad=[ae,be,mi,Se],Ni&&!t&&!Aa){_n(jt,"scrollEnd",dg);return}gg(),$n=jt.isRefreshing=!0,Aa||pg();var n=zs("refreshInit");eg&&jt.sort(),e||Dd(),ie.forEach(function(i){Ln(i)&&(i.smooth&&(i.target.style.scrollBehavior="auto"),i(0))}),re.slice(0).forEach(function(i){return i.refresh()}),Aa=!1,re.forEach(function(i){if(i._subPinOffset&&i.pin){var s=i.vars.horizontal?"offsetWidth":"offsetHeight",o=i.pin[s];i.revert(!0,1),i.adjustPinSpacing(i.pin[s]-o),i.refresh()}}),bd=1,Zm(!0),re.forEach(function(i){var s=ar(i.scroller,i._dir),o=i.vars.end==="max"||i._endClamp&&i.end>s,a=i._startClamp&&i.start>=s;(o||a)&&i.setPositions(a?s-1:i.start,o?Math.max(a?s:i.start+1,s):i.end,!0)}),Zm(!1),bd=0,n.forEach(function(i){return i&&i.render&&i.render(-1)}),ie.forEach(function(i){Ln(i)&&(i.smooth&&requestAnimationFrame(function(){return i.target.style.scrollBehavior="smooth"}),i.rec&&i(i.rec))}),mg(Cd,1),hc.pause(),Fs++,$n=2,Ar(2),re.forEach(function(i){return Ln(i.vars.onRefresh)&&i.vars.onRefresh(i)}),$n=jt.isRefreshing=!1,zs("refresh")},Td=0,ac=1,Na,Ar=function(t){if(t===2||!$n&&!Aa){jt.isUpdating=!0,Na&&Na.update(0);var e=re.length,n=Nn(),i=n-gd>=50,s=e&&re[0].scroll();if(ac=Td>s?-1:1,$n||(Td=s),i&&(Ni&&!fc&&n-Ni>200&&(Ni=0,zs("scrollEnd")),Sa=gd,gd=n),ac<0){for(Jn=e;Jn-- >0;)re[Jn]&&re[Jn].update(0,i);ac=1}else for(Jn=0;Jn<e;Jn++)re[Jn]&&re[Jn].update(0,i);jt.isUpdating=!1}Da=0},Ed=[cg,hg,Id,Pd,Pi+Ia,Pi+Ca,Pi+Pa,Pi+Ra,"display","flexShrink","float","zIndex","gridColumnStart","gridColumnEnd","gridRowStart","gridRowEnd","gridArea","justifySelf","alignSelf","placeSelf","order"],lc=Ed.concat([Os,Us,"boxSizing","max"+wo,"max"+Nd,"position",Pi,an,an+Pa,an+Ca,an+Ia,an+Ra]),lv=function(t,e,n){bo(n);var i=t._gsap;if(i.spacerIsNative)bo(i.spacerState);else if(t._gsap.swappedIn){var s=e.parentNode;s&&(s.insertBefore(t,e),s.removeChild(e))}t._gsap.swappedIn=!1},xd=function(t,e,n,i){if(!t._gsap.swappedIn){for(var s=Ed.length,o=e.style,a=t.style,l;s--;)l=Ed[s],o[l]=n[l];o.position=n.position==="absolute"?"absolute":"relative",n.display==="inline"&&(o.display="inline-block"),a[Id]=a[Pd]="auto",o.flexBasis=n.flexBasis||"auto",o.overflow="visible",o.boxSizing="border-box",o[Os]=uc(t,Pn)+un,o[Us]=uc(t,on)+un,o[an]=a[Pi]=a[hg]=a[cg]="0",bo(i),a[Os]=a["max"+wo]=n[Os],a[Us]=a["max"+Nd]=n[Us],a[an]=n[an],t.parentNode!==e&&(t.parentNode.insertBefore(e,t),e.appendChild(t)),t._gsap.swappedIn=!0}},cv=/([A-Z])/g,bo=function(t){if(t){var e=t.t.style,n=t.length,i=0,s,o;for((t.t._gsap||Rt.core.getCache(t.t)).uncache=1;i<n;i+=2)o=t[i+1],s=t[i],o?e[s]=o:e[s]&&e.removeProperty(s.replace(cv,"-$1").toLowerCase())}},nc=function(t){for(var e=lc.length,n=t.style,i=[],s=0;s<e;s++)i.push(lc[s],n[lc[s]]);return i.t=t,i},hv=function(t,e,n){for(var i=[],s=t.length,o=n?8:0,a;o<s;o+=2)a=t[o],i.push(a,a in e?e[a]:t[o+1]);return i.t=t.t,i},cc={left:0,top:0},Jm=function(t,e,n,i,s,o,a,l,c,h,f,u,d,g){Ln(t)&&(t=t(l)),pi(t)&&t.substr(0,3)==="max"&&(t=u+(t.charAt(4)==="="?sc("0"+t.substr(3),n):0));var _=d?d.time():0,p,m,b;if(d&&d.seek(0),isNaN(t)||(t=+t),wa(t))d&&(t=Rt.utils.mapRange(d.scrollTrigger.start,d.scrollTrigger.end,0,u,t)),a&&oc(a,n,i,!0);else{Ln(e)&&(e=e(l));var A=(t||"0").split(" "),y,S,w,E;b=Yn(e,l)||Se,y=Er(b)||{},(!y||!y.left&&!y.top)&&Ii(b).display==="none"&&(E=b.style.display,b.style.display="block",y=Er(b),E?b.style.display=E:b.style.removeProperty("display")),S=sc(A[0],y[i.d]),w=sc(A[1]||"0",n),t=y[i.p]-c[i.p]-h+S+s-w,a&&oc(a,w,i,n-w<20||a._isStart&&w>20),n-=n-w}if(g&&(l[g]=t||-.001,t<0&&(t=0)),o){var v=t+n,T=o._isStart;p="scroll"+i.d2,oc(o,v,i,T&&v>20||!T&&(f?Math.max(Se[p],mi[p]):o.parentNode[p])<=v+1),f&&(c=Er(a),f&&(o.style[i.op.p]=c[i.op.p]-i.op.m-o._offset+un))}return d&&b&&(p=Er(b),d.seek(u),m=Er(b),d._caScrollDist=p[i.p]-m[i.p],t=t/d._caScrollDist*u),d&&d.seek(_),d?t:Math.round(t)},uv=/(webkit|moz|length|cssText|inset)/i,$m=function(t,e,n,i){if(t.parentNode!==e){var s=t.style,o,a;if(e===Se){t._stOrig=s.cssText,a=Ii(t);for(o in a)!+o&&!uv.test(o)&&a[o]&&typeof s[o]=="string"&&o!=="0"&&(s[o]=a[o]);s.top=n,s.left=i}else s.cssText=t._stOrig;Rt.core.getCache(t).uncache=1,e.appendChild(t)}},_g=function(t,e,n){var i=e,s=i;return function(o){var a=Math.round(t());return a!==i&&a!==s&&Math.abs(a-i)>3&&Math.abs(a-s)>3&&(o=a,n&&n()),s=i,i=Math.round(o),i}},ic=function(t,e,n){var i={};i[e.p]="+="+n,Rt.set(t,i)},Km=function(t,e){var n=wr(t,e),i="_scroll"+e.p2,s=function o(a,l,c,h,f){var u=o.tween,d=l.onComplete,g={};c=c||n();var _=_g(n,c,function(){u.kill(),o.tween=0});return f=h&&f||0,h=h||a-c,u&&u.kill(),l[i]=a,l.inherit=!1,l.modifiers=g,g[i]=function(){return _(c+h*u.ratio+f*u.ratio*u.ratio)},l.onUpdate=function(){ie.cache++,o.tween&&Ar()},l.onComplete=function(){o.tween=0,d&&d.call(u)},u=o.tween=Rt.to(t,l),u};return t[i]=n,n.wheelHandler=function(){return s.tween&&s.tween.kill()&&(s.tween=0)},_n(t,"wheel",n.wheelHandler),jt.isTouch&&_n(t,"touchmove",n.wheelHandler),s},jt=(function(){function r(e,n){yo||r.register(Rt)||console.warn("Please gsap.registerPlugin(ScrollTrigger)"),Md(this),this.init(e,n)}var t=r.prototype;return t.init=function(n,i){if(this.progress=this.start=0,this.vars&&this.kill(!0,!0),!Ma){this.update=this.refresh=this.kill=or;return}n=Wm(pi(n)||wa(n)||n.nodeType?{trigger:n}:n,tc);var s=n,o=s.onUpdate,a=s.toggleClass,l=s.id,c=s.onToggle,h=s.onRefresh,f=s.scrub,u=s.trigger,d=s.pin,g=s.pinSpacing,_=s.invalidateOnRefresh,p=s.anticipatePin,m=s.onScrubComplete,b=s.onSnapComplete,A=s.once,y=s.snap,S=s.pinReparent,w=s.pinSpacer,E=s.containerAnimation,v=s.fastScrollEnd,T=s.preventOverlaps,C=n.horizontal||n.containerAnimation&&n.horizontal!==!1?Pn:on,L=!f&&f!==0,N=Yn(n.scroller||ae),z=Rt.core.getCache(N),I=Bs(N),B=("pinType"in n?n.pinType:Tr(N,"pinType")||I&&"fixed")==="fixed",X=[n.onEnter,n.onLeave,n.onEnterBack,n.onLeaveBack],k=L&&n.toggleActions.split(" "),K="markers"in n?n.markers:tc.markers,q=I?0:parseFloat(Ii(N)["border"+C.p2+wo])||0,R=this,j=n.onRefreshInit&&function(){return n.onRefreshInit(R)},Tt=ev(N,I,C),Et=nv(N,I),Wt=0,Ht=0,qt=0,J=wr(N,C),tt,yt,Vt,xt,kt,Gt,Dt,Jt,te,V,se,we,ke,$t,ve,U,Fe,Yt,P,x,F,H,$,ht,at,Q,nt,mt,Pt,gt,pt,ct,Ot,zt,D,ft,et,_t,St;if(R._startClamp=R._endClamp=!1,R._dir=C,p*=45,R.scroller=N,R.scroll=E?E.time.bind(E):J,xt=J(),R.vars=n,i=i||n.animation,"refreshPriority"in n&&(eg=1,n.refreshPriority===-9999&&(Na=R)),z.tweenScroll=z.tweenScroll||{top:Km(N,on),left:Km(N,Pn)},R.tweenTo=tt=z.tweenScroll[C.p],R.scrubDuration=function(st){Ot=wa(st)&&st,Ot?ct?ct.duration(st):ct=Rt.to(i,{ease:"expo",totalProgress:"+=0",inherit:!1,duration:Ot,paused:!0,onComplete:function(){return m&&m(R)}}):(ct&&ct.progress(1).kill(),ct=0)},i&&(i.vars.lazy=!1,i._initted&&!R.isReverted||i.vars.immediateRender!==!1&&n.immediateRender!==!1&&i.duration()&&i.render(0,!0,!0),R.animation=i.pause(),i.scrollTrigger=R,R.scrubDuration(f),gt=0,l||(l=i.vars.id)),y&&((!Ls(y)||y.push)&&(y={snapTo:y}),"scrollBehavior"in Se.style&&Rt.set(I?[Se,mi]:N,{scrollBehavior:"auto"}),ie.forEach(function(st){return Ln(st)&&st.target===(I?be.scrollingElement||mi:N)&&(st.smooth=!1)}),Vt=Ln(y.snapTo)?y.snapTo:y.snapTo==="labels"?rv(i):y.snapTo==="labelsDirectional"?sv(i):y.directional!==!1?function(st,Bt){return Ld(y.snapTo)(st,Nn()-Ht<500?0:Bt.direction)}:Rt.utils.snap(y.snapTo),zt=y.duration||{min:.1,max:2},zt=Ls(zt)?Ea(zt.min,zt.max):Ea(zt,zt),D=Rt.delayedCall(y.delay||Ot/2||.1,function(){var st=J(),Bt=Nn()-Ht<500,It=tt.tween;if((Bt||Math.abs(R.getVelocity())<10)&&!It&&!fc&&Wt!==st){var Kt=(st-Gt)/$t,tn=i&&!L?i.totalProgress():Kt,oe=Bt?0:(tn-pt)/(Nn()-Sa)*1e3||0,Ne=Rt.utils.clamp(-Kt,1-Kt,xo(oe/2)*oe/.185),pn=Kt+(y.inertia===!1?0:Ne),Le,Ee,he=y,Bn=he.onStart,Pe=he.onInterrupt,wn=he.onComplete;if(Le=Vt(pn,R),wa(Le)||(Le=pn),Ee=Math.max(0,Math.round(Gt+Le*$t)),st<=Dt&&st>=Gt&&Ee!==st){if(It&&!It._initted&&It.data<=xo(Ee-st))return;y.inertia===!1&&(Ne=Le-Kt),tt(Ee,{duration:zt(xo(Math.max(xo(pn-tn),xo(Le-tn))*.185/oe/.05||0)),ease:y.ease||"power3",data:xo(Ee-st),onInterrupt:function(){return D.restart(!0)&&Pe&&_o(R,Pe)},onComplete:function(){R.update(),Wt=J(),i&&!L&&(ct?ct.resetTo("totalProgress",Le,i._tTime/i._tDur):i.progress(Le)),gt=pt=i&&!L?i.totalProgress():R.progress,b&&b(R),wn&&_o(R,wn)}},st,Ne*$t,Ee-st-Ne*$t),Bn&&_o(R,Bn,tt.tween)}}else R.isActive&&Wt!==st&&D.restart(!0)}).pause()),l&&(wd[l]=R),u=R.trigger=Yn(u||d!==!0&&d),St=u&&u._gsap&&u._gsap.stRevert,St&&(St=St(R)),d=d===!0?u:Yn(d),pi(a)&&(a={targets:u,className:a}),d&&(g===!1||g===Pi||(g=!g&&d.parentNode&&d.parentNode.style&&Ii(d.parentNode).display==="flex"?!1:an),R.pin=d,yt=Rt.core.getCache(d),yt.spacer?ve=yt.pinState:(w&&(w=Yn(w),w&&!w.nodeType&&(w=w.current||w.nativeElement),yt.spacerIsNative=!!w,w&&(yt.spacerState=nc(w))),yt.spacer=Yt=w||be.createElement("div"),Yt.classList.add("pin-spacer"),l&&Yt.classList.add("pin-spacer-"+l),yt.pinState=ve=nc(d)),n.force3D!==!1&&Rt.set(d,{force3D:!0}),R.spacer=Yt=yt.spacer,Pt=Ii(d),ht=Pt[g+C.os2],x=Rt.getProperty(d),F=Rt.quickSetter(d,C.a,un),xd(d,Yt,Pt),Fe=nc(d)),K){we=Ls(K)?Wm(K,Xm):Xm,V=ec("scroller-start",l,N,C,we,0),se=ec("scroller-end",l,N,C,we,0,V),P=V["offset"+C.op.d2];var it=Yn(Tr(N,"content")||N);Jt=this.markerStart=ec("start",l,it,C,we,P,0,E),te=this.markerEnd=ec("end",l,it,C,we,P,0,E),E&&(_t=Rt.quickSetter([Jt,te],C.a,un)),!B&&!(ki.length&&Tr(N,"fixedMarkers")===!0)&&(iv(I?Se:N),Rt.set([V,se],{force3D:!0}),Q=Rt.quickSetter(V,C.a,un),mt=Rt.quickSetter(se,C.a,un))}if(E){var lt=E.vars.onUpdate,rt=E.vars.onUpdateParams;E.eventCallback("onUpdate",function(){R.update(0,0,1),lt&&lt.apply(E,rt||[])})}if(R.previous=function(){return re[re.indexOf(R)-1]},R.next=function(){return re[re.indexOf(R)+1]},R.revert=function(st,Bt){if(!Bt)return R.kill(!0);var It=st!==!1||!R.enabled,Kt=In;It!==R.isReverted&&(It&&(ft=Math.max(J(),R.scroll.rec||0),qt=R.progress,et=i&&i.progress()),Jt&&[Jt,te,V,se].forEach(function(tn){return tn.style.display=It?"none":"block"}),It&&(In=R,R.update(It)),d&&(!S||!R.isActive)&&(It?lv(d,Yt,ve):xd(d,Yt,Ii(d),at)),It||R.update(It),In=Kt,R.isReverted=It)},R.refresh=function(st,Bt,It,Kt){if(!((In||!R.enabled)&&!Bt)){if(d&&st&&Ni){_n(r,"scrollEnd",dg);return}!$n&&j&&j(R),In=R,tt.tween&&!It&&(tt.tween.kill(),tt.tween=0),ct&&ct.pause(),_&&i&&(i.revert({kill:!1}).invalidate(),i.getChildren?i.getChildren(!0,!0,!1).forEach(function(vt){return vt.vars.immediateRender&&vt.render(0,!0,!0)}):i.vars.immediateRender&&i.render(0,!0,!0)),R.isReverted||R.revert(!0,!0),R._subPinOffset=!1;var tn=Tt(),oe=Et(),Ne=E?E.duration():ar(N,C),pn=$t<=.01||!$t,Le=0,Ee=Kt||0,he=Ls(It)?It.end:n.end,Bn=n.endTrigger||u,Pe=Ls(It)?It.start:n.start||(n.start===0||!u?0:d?"0 0":"0 100%"),wn=R.pinnedContainer=n.pinnedContainer&&Yn(n.pinnedContainer,R),kn=u&&Math.max(0,re.indexOf(R))||0,en=kn,We,cn,$i,Qs,mn,Ke,wi,js,M,O,Y,G,W;for(K&&Ls(It)&&(G=Rt.getProperty(V,C.p),W=Rt.getProperty(se,C.p));en-- >0;)Ke=re[en],Ke.end||Ke.refresh(0,1)||(In=R),wi=Ke.pin,wi&&(wi===u||wi===d||wi===wn)&&!Ke.isReverted&&(O||(O=[]),O.unshift(Ke),Ke.revert(!0,!0)),Ke!==re[en]&&(kn--,en--);for(Ln(Pe)&&(Pe=Pe(R)),Pe=zm(Pe,"start",R),Gt=Jm(Pe,u,tn,C,J(),Jt,V,R,oe,q,B,Ne,E,R._startClamp&&"_startClamp")||(d?-.001:0),Ln(he)&&(he=he(R)),pi(he)&&!he.indexOf("+=")&&(~he.indexOf(" ")?he=(pi(Pe)?Pe.split(" ")[0]:"")+he:(Le=sc(he.substr(2),tn),he=pi(Pe)?Pe:(E?Rt.utils.mapRange(0,E.duration(),E.scrollTrigger.start,E.scrollTrigger.end,Gt):Gt)+Le,Bn=u)),he=zm(he,"end",R),Dt=Math.max(Gt,Jm(he||(Bn?"100% 0":Ne),Bn,tn,C,J()+Le,te,se,R,oe,q,B,Ne,E,R._endClamp&&"_endClamp"))||-.001,Le=0,en=kn;en--;)Ke=re[en]||{},wi=Ke.pin,wi&&Ke.start-Ke._pinPush<=Gt&&!E&&Ke.end>0&&(We=Ke.end-(R._startClamp?Math.max(0,Ke.start):Ke.start),(wi===u&&Ke.start-Ke._pinPush<Gt||wi===wn)&&isNaN(Pe)&&(Le+=We*(1-Ke.progress)),wi===d&&(Ee+=We));if(Gt+=Le,Dt+=Le,R._startClamp&&(R._startClamp+=Le),R._endClamp&&!$n&&(R._endClamp=Dt||-.001,Dt=Math.min(Dt,ar(N,C))),$t=Dt-Gt||(Gt-=.01)&&.001,pn&&(qt=Rt.utils.clamp(0,1,Rt.utils.normalize(Gt,Dt,ft))),R._pinPush=Ee,Jt&&Le&&(We={},We[C.a]="+="+Le,wn&&(We[C.p]="-="+J()),Rt.set([Jt,te],We)),d&&!(bd&&R.end>=ar(N,C)))We=Ii(d),Qs=C===on,$i=J(),H=parseFloat(x(C.a))+Ee,!Ne&&Dt>1&&(Y=(I?be.scrollingElement||mi:N).style,Y={style:Y,value:Y["overflow"+C.a.toUpperCase()]},I&&Ii(Se)["overflow"+C.a.toUpperCase()]!=="scroll"&&(Y.style["overflow"+C.a.toUpperCase()]="scroll")),xd(d,Yt,We),Fe=nc(d),cn=Er(d,!0),js=B&&wr(N,Qs?Pn:on)(),g?(at=[g+C.os2,$t+Ee+un],at.t=Yt,en=g===an?uc(d,C)+$t+Ee:0,en&&(at.push(C.d,en+un),Yt.style.flexBasis!=="auto"&&(Yt.style.flexBasis=en+un)),bo(at),wn&&re.forEach(function(vt){vt.pin===wn&&vt.vars.pinSpacing!==!1&&(vt._subPinOffset=!0)}),B&&J(ft)):(en=uc(d,C),en&&Yt.style.flexBasis!=="auto"&&(Yt.style.flexBasis=en+un)),B&&(mn={top:cn.top+(Qs?$i-Gt:js)+un,left:cn.left+(Qs?js:$i-Gt)+un,boxSizing:"border-box",position:"fixed"},mn[Os]=mn["max"+wo]=Math.ceil(cn.width)+un,mn[Us]=mn["max"+Nd]=Math.ceil(cn.height)+un,mn[Pi]=mn[Pi+Pa]=mn[Pi+Ca]=mn[Pi+Ia]=mn[Pi+Ra]="0",mn[an]=We[an],mn[an+Pa]=We[an+Pa],mn[an+Ca]=We[an+Ca],mn[an+Ia]=We[an+Ia],mn[an+Ra]=We[an+Ra],U=hv(ve,mn,S),$n&&J(0)),i?(M=i._initted,pd(1),i.render(i.duration(),!0,!0),$=x(C.a)-H+$t+Ee,nt=Math.abs($t-$)>1,B&&nt&&U.splice(U.length-2,2),i.render(0,!0,!0),M||i.invalidate(!0),i.parent||i.totalTime(i.totalTime()),pd(0)):$=$t,Y&&(Y.value?Y.style["overflow"+C.a.toUpperCase()]=Y.value:Y.style.removeProperty("overflow-"+C.a));else if(u&&J()&&!E)for(cn=u.parentNode;cn&&cn!==Se;)cn._pinOffset&&(Gt-=cn._pinOffset,Dt-=cn._pinOffset),cn=cn.parentNode;O&&O.forEach(function(vt){return vt.revert(!1,!0)}),R.start=Gt,R.end=Dt,xt=kt=$n?ft:J(),!E&&!$n&&(xt<ft&&J(ft),R.scroll.rec=0),R.revert(!1,!0),Ht=Nn(),D&&(Wt=-1,D.restart(!0)),In=0,i&&L&&(i._initted||et)&&i.progress()!==et&&i.progress(et||0,!0).render(i.time(),!0,!0),(pn||qt!==R.progress||E||_||i&&!i._initted)&&(i&&!L&&(i._initted||qt||i.vars.immediateRender!==!1)&&i.totalProgress(E&&Gt<-.001&&!qt?Rt.utils.normalize(Gt,Dt,0):qt,!0),R.progress=pn||(xt-Gt)/$t===qt?0:qt),d&&g&&(Yt._pinOffset=Math.round(R.progress*$)),ct&&ct.invalidate(),isNaN(G)||(G-=Rt.getProperty(V,C.p),W-=Rt.getProperty(se,C.p),ic(V,C,G),ic(Jt,C,G-(Kt||0)),ic(se,C,W),ic(te,C,W-(Kt||0))),pn&&!$n&&R.update(),h&&!$n&&!ke&&(ke=!0,h(R),ke=!1)}},R.getVelocity=function(){return(J()-kt)/(Nn()-Sa)*1e3||0},R.endAnimation=function(){ya(R.callbackAnimation),i&&(ct?ct.progress(1):i.paused()?L||ya(i,R.direction<0,1):ya(i,i.reversed()))},R.labelToScroll=function(st){return i&&i.labels&&(Gt||R.refresh()||Gt)+i.labels[st]/i.duration()*$t||0},R.getTrailing=function(st){var Bt=re.indexOf(R),It=R.direction>0?re.slice(0,Bt).reverse():re.slice(Bt+1);return(pi(st)?It.filter(function(Kt){return Kt.vars.preventOverlaps===st}):It).filter(function(Kt){return R.direction>0?Kt.end<=Gt:Kt.start>=Dt})},R.update=function(st,Bt,It){if(!(E&&!It&&!st)){var Kt=$n===!0?ft:R.scroll(),tn=st?0:(Kt-Gt)/$t,oe=tn<0?0:tn>1?1:tn||0,Ne=R.progress,pn,Le,Ee,he,Bn,Pe,wn,kn;if(Bt&&(kt=xt,xt=E?J():Kt,y&&(pt=gt,gt=i&&!L?i.totalProgress():oe)),p&&d&&!In&&!$l&&Ni&&(!oe&&Gt<Kt+(Kt-kt)/(Nn()-Sa)*p?oe=1e-4:oe===1&&Dt>Kt+(Kt-kt)/(Nn()-Sa)*p&&(oe=.9999)),oe!==Ne&&R.enabled){if(pn=R.isActive=!!oe&&oe<1,Le=!!Ne&&Ne<1,Pe=pn!==Le,Bn=Pe||!!oe!=!!Ne,R.direction=oe>Ne?1:-1,R.progress=oe,Bn&&!In&&(Ee=oe&&!Ne?0:oe===1?1:Ne===1?2:3,L&&(he=!Pe&&k[Ee+1]!=="none"&&k[Ee+1]||k[Ee],kn=i&&(he==="complete"||he==="reset"||he in i))),T&&(Pe||kn)&&(kn||f||!i)&&(Ln(T)?T(R):R.getTrailing(T).forEach(function($i){return $i.endAnimation()})),L||(ct&&!In&&!$l?(ct._dp._time-ct._start!==ct._time&&ct.render(ct._dp._time-ct._start),ct.resetTo?ct.resetTo("totalProgress",oe,i._tTime/i._tDur):(ct.vars.totalProgress=oe,ct.invalidate().restart())):i&&i.totalProgress(oe,!!(In&&(Ht||st)))),d){if(st&&g&&(Yt.style[g+C.os2]=ht),!B)F(ba(H+$*oe));else if(Bn){if(wn=!st&&oe>Ne&&Dt+1>Kt&&Kt+1>=ar(N,C),S)if(!st&&(pn||wn)){var en=Er(d,!0),We=Kt-Gt;$m(d,Se,en.top+(C===on?We:0)+un,en.left+(C===on?0:We)+un)}else $m(d,Yt);bo(pn||wn?U:Fe),nt&&oe<1&&pn||F(H+(oe===1&&!wn?$:0))}}y&&!tt.tween&&!In&&!$l&&D.restart(!0),a&&(Pe||A&&oe&&(oe<1||!md))&&La(a.targets).forEach(function($i){return $i.classList[pn||A?"add":"remove"](a.className)}),o&&!L&&!st&&o(R),Bn&&!In?(L&&(kn&&(he==="complete"?i.pause().totalProgress(1):he==="reset"?i.restart(!0).pause():he==="restart"?i.restart(!0):i[he]()),o&&o(R)),(Pe||!md)&&(c&&Pe&&_o(R,c),X[Ee]&&_o(R,X[Ee]),A&&(oe===1?R.kill(!1,1):X[Ee]=0),Pe||(Ee=oe===1?1:3,X[Ee]&&_o(R,X[Ee]))),v&&!pn&&Math.abs(R.getVelocity())>(wa(v)?v:2500)&&(ya(R.callbackAnimation),ct?ct.progress(1):ya(i,he==="reverse"?1:!oe,1))):L&&o&&!In&&o(R)}if(mt){var cn=E?Kt/E.duration()*(E._caScrollDist||0):Kt;Q(cn+(V._isFlipped?1:0)),mt(cn)}_t&&_t(-Kt/E.duration()*(E._caScrollDist||0))}},R.enable=function(st,Bt){R.enabled||(R.enabled=!0,_n(N,"resize",Ta),I||_n(N,"scroll",vo),j&&_n(r,"refreshInit",j),st!==!1&&(R.progress=qt=0,xt=kt=Wt=J()),Bt!==!1&&R.refresh())},R.getTween=function(st){return st&&tt?tt.tween:ct},R.setPositions=function(st,Bt,It,Kt){if(E){var tn=E.scrollTrigger,oe=E.duration(),Ne=tn.end-tn.start;st=tn.start+Ne*st/oe,Bt=tn.start+Ne*Bt/oe}R.refresh(!1,!1,{start:Vm(st,It&&!!R._startClamp),end:Vm(Bt,It&&!!R._endClamp)},Kt),R.update()},R.adjustPinSpacing=function(st){if(at&&st){var Bt=at.indexOf(C.d)+1;at[Bt]=parseFloat(at[Bt])+st+un,at[1]=parseFloat(at[1])+st+un,bo(at)}},R.disable=function(st,Bt){if(st!==!1&&R.revert(!0,!0),R.enabled&&(R.enabled=R.isActive=!1,Bt||ct&&ct.pause(),ft=0,yt&&(yt.uncache=1),j&&gn(r,"refreshInit",j),D&&(D.pause(),tt.tween&&tt.tween.kill()&&(tt.tween=0)),!I)){for(var It=re.length;It--;)if(re[It].scroller===N&&re[It]!==R)return;gn(N,"resize",Ta),I||gn(N,"scroll",vo)}},R.kill=function(st,Bt){R.disable(st,Bt),ct&&!Bt&&ct.kill(),l&&delete wd[l];var It=re.indexOf(R);It>=0&&re.splice(It,1),It===Jn&&ac>0&&Jn--,It=0,re.forEach(function(Kt){return Kt.scroller===R.scroller&&(It=1)}),It||$n||(R.scroll.rec=0),i&&(i.scrollTrigger=null,st&&i.revert({kill:!1}),Bt||i.kill()),Jt&&[Jt,te,V,se].forEach(function(Kt){return Kt.parentNode&&Kt.parentNode.removeChild(Kt)}),Na===R&&(Na=0),d&&(yt&&(yt.uncache=1),It=0,re.forEach(function(Kt){return Kt.pin===d&&It++}),It||(yt.spacer=0)),n.onKill&&n.onKill(R)},re.push(R),R.enable(!1,!1),St&&St(R),i&&i.add&&!$t){var Ft=R.update;R.update=function(){R.update=Ft,ie.cache++,Gt||Dt||R.refresh()},Rt.delayedCall(.01,R.update),$t=.01,Gt=Dt=0}else R.refresh();d&&av()},r.register=function(n){return yo||(Rt=n||og(),sg()&&window.document&&r.enable(),yo=Ma),yo},r.defaults=function(n){if(n)for(var i in n)tc[i]=n[i];return tc},r.disable=function(n,i){Ma=0,re.forEach(function(o){return o[i?"kill":"disable"](n)}),gn(ae,"wheel",vo),gn(be,"scroll",vo),clearInterval(Jl),gn(be,"touchcancel",or),gn(Se,"touchstart",or),Ql(gn,be,"pointerdown,touchstart,mousedown",Gm),Ql(gn,be,"pointerup,touchend,mouseup",Hm),hc.kill(),Kl(gn);for(var s=0;s<ie.length;s+=3)jl(gn,ie[s],ie[s+1]),jl(gn,ie[s],ie[s+2])},r.enable=function(){if(ae=window,be=document,mi=be.documentElement,Se=be.body,Rt){if(La=Rt.utils.toArray,Ea=Rt.utils.clamp,Md=Rt.core.context||or,pd=Rt.core.suppressOverwrites||or,Cd=ae.history.scrollRestoration||"auto",Td=ae.pageYOffset||0,Rt.core.globals("ScrollTrigger",r),Se){Ma=1,Mo=document.createElement("div"),Mo.style.height="100vh",Mo.style.position="absolute",gg(),tv(),Je.register(Rt),r.isTouch=Je.isTouch,$r=Je.isTouch&&/(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent),Sd=Je.isTouch===1,_n(ae,"wheel",vo),Ad=[ae,be,mi,Se],Rt.matchMedia?(r.matchMedia=function(h){var f=Rt.matchMedia(),u;for(u in h)f.add(u,h[u]);return f},Rt.addEventListener("matchMediaInit",function(){pg(),Dd()}),Rt.addEventListener("matchMediaRevert",function(){return fg()}),Rt.addEventListener("matchMedia",function(){Ds(0,1),zs("matchMedia")}),Rt.matchMedia().add("(orientation: portrait)",function(){return _d(),_d})):console.warn("Requires GSAP 3.11.0 or later"),_d(),_n(be,"scroll",vo);var n=Se.hasAttribute("style"),i=Se.style,s=i.borderTopStyle,o=Rt.core.Animation.prototype,a,l;for(o.revert||Object.defineProperty(o,"revert",{value:function(){return this.time(-.01,!0)}}),i.borderTopStyle="solid",a=Er(Se),on.m=Math.round(a.top+on.sc())||0,Pn.m=Math.round(a.left+Pn.sc())||0,s?i.borderTopStyle=s:i.removeProperty("border-top-style"),n||(Se.setAttribute("style",""),Se.removeAttribute("style")),Jl=setInterval(qm,250),Rt.delayedCall(.5,function(){return $l=0}),_n(be,"touchcancel",or),_n(Se,"touchstart",or),Ql(_n,be,"pointerdown,touchstart,mousedown",Gm),Ql(_n,be,"pointerup,touchend,mouseup",Hm),yd=Rt.utils.checkPrefix("transform"),lc.push(yd),yo=Nn(),hc=Rt.delayedCall(.2,Ds).pause(),So=[be,"visibilitychange",function(){var h=ae.innerWidth,f=ae.innerHeight;be.hidden?(Bm=h,km=f):(Bm!==h||km!==f)&&Ta()},be,"DOMContentLoaded",Ds,ae,"load",Ds,ae,"resize",Ta],Kl(_n),re.forEach(function(h){return h.enable(0,1)}),l=0;l<ie.length;l+=3)jl(gn,ie[l],ie[l+1]),jl(gn,ie[l],ie[l+2])}else if(be){var c=function h(){r.enable(),be.removeEventListener("DOMContentLoaded",h)};be.addEventListener("DOMContentLoaded",c)}}},r.config=function(n){"limitCallbacks"in n&&(md=!!n.limitCallbacks);var i=n.syncInterval;i&&clearInterval(Jl)||(Jl=i)&&setInterval(qm,i),"ignoreMobileResize"in n&&(Sd=r.isTouch===1&&n.ignoreMobileResize),"autoRefreshEvents"in n&&(Kl(gn)||Kl(_n,n.autoRefreshEvents||"none"),ng=(n.autoRefreshEvents+"").indexOf("resize")===-1)},r.scrollerProxy=function(n,i){var s=Yn(n),o=ie.indexOf(s),a=Bs(s);~o&&ie.splice(o,a?6:2),i&&(a?ki.unshift(ae,i,Se,i,mi,i):ki.unshift(s,i))},r.clearMatchMedia=function(n){re.forEach(function(i){return i._ctx&&i._ctx.query===n&&i._ctx.kill(!0,!0)})},r.isInViewport=function(n,i,s){var o=(pi(n)?Yn(n):n).getBoundingClientRect(),a=o[s?Os:Us]*i||0;return s?o.right-a>0&&o.left+a<ae.innerWidth:o.bottom-a>0&&o.top+a<ae.innerHeight},r.positionInViewport=function(n,i,s){pi(n)&&(n=Yn(n));var o=n.getBoundingClientRect(),a=o[s?Os:Us],l=i==null?a/2:i in dc?dc[i]*a:~i.indexOf("%")?parseFloat(i)*a/100:parseFloat(i)||0;return s?(o.left+l)/ae.innerWidth:(o.top+l)/ae.innerHeight},r.killAll=function(n){if(re.slice(0).forEach(function(s){return s.vars.id!=="ScrollSmoother"&&s.kill()}),n!==!0){var i=ks.killAll||[];ks={},i.forEach(function(s){return s()})}},r})();jt.version="3.15.0";jt.saveStyles=function(r){return r?La(r).forEach(function(t){if(t&&t.style){var e=fi.indexOf(t);e>=0&&fi.splice(e,5),fi.push(t,t.style.cssText,t.getBBox&&t.getAttribute("transform"),Rt.core.getCache(t),Md())}}):fi};jt.revert=function(r,t){return Dd(!r,t)};jt.create=function(r,t){return new jt(r,t)};jt.refresh=function(r){return r?Ta(!0):(yo||jt.register())&&Ds(!0)};jt.update=function(r){return++ie.cache&&Ar(r===!0?2:0)};jt.clearScrollMemory=mg;jt.maxScroll=function(r,t){return ar(r,t?Pn:on)};jt.getScrollFunc=function(r,t){return wr(Yn(r),t?Pn:on)};jt.getById=function(r){return wd[r]};jt.getAll=function(){return re.filter(function(r){return r.vars.id!=="ScrollSmoother"})};jt.isScrolling=function(){return!!Ni};jt.snapDirectional=Ld;jt.addEventListener=function(r,t){var e=ks[r]||(ks[r]=[]);~e.indexOf(t)||e.push(t)};jt.removeEventListener=function(r,t){var e=ks[r],n=e&&e.indexOf(t);n>=0&&e.splice(n,1)};jt.batch=function(r,t){var e=[],n={},i=t.interval||.016,s=t.batchMax||1e9,o=function(c,h){var f=[],u=[],d=Rt.delayedCall(i,function(){h(f,u),f=[],u=[]}).pause();return function(g){f.length||d.restart(!0),f.push(g.trigger),u.push(g),s<=f.length&&d.progress(1)}},a;for(a in t)n[a]=a.substr(0,2)==="on"&&Ln(t[a])&&a!=="onRefreshInit"?o(a,t[a]):t[a];return Ln(s)&&(s=s(),_n(jt,"refresh",function(){return s=t.batchMax()})),La(r).forEach(function(l){var c={};for(a in n)c[a]=n[a];c.trigger=l,e.push(jt.create(c))}),e};var Qm=function(t,e,n,i){return e>i?t(i):e<0&&t(0),n>i?(i-e)/(n-e):n<0?e/(e-n):1},vd=function r(t,e){e===!0?t.style.removeProperty("touch-action"):t.style.touchAction=e===!0?"auto":e?"pan-"+e+(Je.isTouch?" pinch-zoom":""):"none",t===mi&&r(Se,e)},rc={auto:1,scroll:1},dv=function(t){var e=t.event,n=t.target,i=t.axis,s=(e.changedTouches?e.changedTouches[0]:e).target,o=s._gsap||Rt.core.getCache(s),a=Nn(),l;if(!o._isScrollT||a-o._isScrollT>2e3){for(;s&&s!==Se&&(s.scrollHeight<=s.clientHeight&&s.scrollWidth<=s.clientWidth||!(rc[(l=Ii(s)).overflowY]||rc[l.overflowX]));)s=s.parentNode;o._isScroll=s&&s!==n&&!Bs(s)&&(rc[(l=Ii(s)).overflowY]||rc[l.overflowX]),o._isScrollT=a}(o._isScroll||i==="x")&&(e.stopPropagation(),e._gsapAllow=!0)},xg=function(t,e,n,i){return Je.create({target:t,capture:!0,debounce:!1,lockAxis:!0,type:e,onWheel:i=i&&dv,onPress:i,onDrag:i,onScroll:i,onEnable:function(){return n&&_n(be,Je.eventTypes[0],tg,!1,!0)},onDisable:function(){return gn(be,Je.eventTypes[0],tg,!0)}})},fv=/(input|label|select|textarea)/i,jm,tg=function(t){var e=fv.test(t.target.tagName);(e||jm)&&(t._gsapAllow=!0,jm=e)},pv=function(t){Ls(t)||(t={}),t.preventDefault=t.isNormalizer=t.allowClicks=!0,t.type||(t.type="wheel,touch"),t.debounce=!!t.debounce,t.id=t.id||"normalizer";var e=t,n=e.normalizeScrollX,i=e.momentum,s=e.allowNestedScroll,o=e.onRelease,a,l,c=Yn(t.target)||mi,h=Rt.core.globals().ScrollSmoother,f=h&&h.get(),u=$r&&(t.content&&Yn(t.content)||f&&t.content!==!1&&!f.smooth()&&f.content()),d=wr(c,on),g=wr(c,Pn),_=1,p=(Je.isTouch&&ae.visualViewport?ae.visualViewport.scale*ae.visualViewport.width:ae.outerWidth)/ae.innerWidth,m=0,b=Ln(i)?function(){return i(a)}:function(){return i||2.8},A,y,S=xg(c,t.type,!0,s),w=function(){return y=!1},E=or,v=or,T=function(){l=ar(c,on),v=Ea($r?1:0,l),n&&(E=Ea(0,ar(c,Pn))),A=Fs},C=function(){u._gsap.y=ba(parseFloat(u._gsap.y)+d.offset)+"px",u.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+parseFloat(u._gsap.y)+", 0, 1)",d.offset=d.cacheID=0},L=function(){if(y){requestAnimationFrame(w);var K=ba(a.deltaY/2),q=v(d.v-K);if(u&&q!==d.v+d.offset){d.offset=q-d.v;var R=ba((parseFloat(u&&u._gsap.y)||0)-d.offset);u.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+R+", 0, 1)",u._gsap.y=R+"px",d.cacheID=ie.cache,Ar()}return!0}d.offset&&C(),y=!0},N,z,I,B,X=function(){T(),N.isActive()&&N.vars.scrollY>l&&(d()>l?N.progress(1)&&d(l):N.resetTo("scrollY",l))};return u&&Rt.set(u,{y:"+=0"}),t.ignoreCheck=function(k){return $r&&k.type==="touchmove"&&L(k)||_>1.05&&k.type!=="touchstart"||a.isGesturing||k.touches&&k.touches.length>1},t.onPress=function(){y=!1;var k=_;_=ba((ae.visualViewport&&ae.visualViewport.scale||1)/p),N.pause(),k!==_&&vd(c,_>1.01?!0:n?!1:"x"),z=g(),I=d(),T(),A=Fs},t.onRelease=t.onGestureStart=function(k,K){if(d.offset&&C(),!K)B.restart(!0);else{ie.cache++;var q=b(),R,j;n&&(R=g(),j=R+q*.05*-k.velocityX/.227,q*=Qm(g,R,j,ar(c,Pn)),N.vars.scrollX=E(j)),R=d(),j=R+q*.05*-k.velocityY/.227,q*=Qm(d,R,j,ar(c,on)),N.vars.scrollY=v(j),N.invalidate().duration(q).play(.01),($r&&N.vars.scrollY>=l||R>=l-1)&&Rt.to({},{onUpdate:X,duration:q})}o&&o(k)},t.onWheel=function(){N._ts&&N.pause(),Nn()-m>1e3&&(A=0,m=Nn())},t.onChange=function(k,K,q,R,j){if(Fs!==A&&T(),K&&n&&g(E(R[2]===K?z+(k.startX-k.x):g()+K-R[1])),q){d.offset&&C();var Tt=j[2]===q,Et=Tt?I+k.startY-k.y:d()+q-j[1],Wt=v(Et);Tt&&Et!==Wt&&(I+=Wt-Et),d(Wt)}(q||K)&&Ar()},t.onEnable=function(){vd(c,n?!1:"x"),jt.addEventListener("refresh",X),_n(ae,"resize",X),d.smooth&&(d.target.style.scrollBehavior="auto",d.smooth=g.smooth=!1),S.enable()},t.onDisable=function(){vd(c,!0),gn(ae,"resize",X),jt.removeEventListener("refresh",X),S.kill()},t.lockAxis=t.lockAxis!==!1,a=new Je(t),a.iOS=$r,$r&&!d()&&d(1),$r&&Rt.ticker.add(or),B=a._dc,N=Rt.to(a,{ease:"power4",paused:!0,inherit:!1,scrollX:n?"+=0.1":"+=0",scrollY:"+=0.1",modifiers:{scrollY:_g(d,d(),function(){return N.pause()})},onUpdate:Ar,onComplete:B.vars.onComplete}),a};jt.sort=function(r){if(Ln(r))return re.sort(r);var t=ae.pageYOffset||0;return jt.getAll().forEach(function(e){return e._sortY=e.trigger?t+e.trigger.getBoundingClientRect().top:e.start+ae.innerHeight}),re.sort(r||function(e,n){return(e.vars.refreshPriority||0)*-1e6+(e.vars.containerAnimation?1e6:e._sortY)-((n.vars.containerAnimation?1e6:n._sortY)+(n.vars.refreshPriority||0)*-1e6)})};jt.observe=function(r){return new Je(r)};jt.normalizeScroll=function(r){if(typeof r>"u")return Zn;if(r===!0&&Zn)return Zn.enable();if(r===!1){Zn&&Zn.kill(),Zn=r;return}var t=r instanceof Je?r:pv(r);return Zn&&Zn.target===t.target&&Zn.kill(),Bs(t.target)&&(Zn=t),t};jt.core={_getVelocityProp:Zl,_inputObserver:xg,_scrollers:ie,_proxies:ki,bridge:{ss:function(){Ni||zs("scrollStart"),Ni=Nn()},ref:function(){return In}}};og()&&Rt.registerPlugin(jt);var Li=class r{lenis=null;platformId=Oe(yl);ngZone=Oe(ip);destroyRef=Oe(no);isBrowser=Tl(this.platformId);easing={expoOut:"expo.out",power4InOut:"power4.inOut",power3InOut:"power3.inOut",elasticOut:"elastic.out(1, 0.5)"};durations={fast:.3,normal:.6,slow:1,verySlow:1.5};constructor(){this.isBrowser&&Wn.registerPlugin(jt)}initializeSmoothScroll(){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{this.lenis=new bp({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),orientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2,infinite:!1}),this.lenis.on("scroll",jt.update),Wn.ticker.add(t=>{this.lenis?.raf(t*1e3)}),Wn.ticker.lagSmoothing(0),this.destroyRef.onDestroy(()=>{this.lenis&&(this.lenis.destroy(),Wn.ticker.remove(this.lenis.raf))})})}textReveal(t,e=0){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{Wn.fromTo(t,{y:100,opacity:0},{y:0,opacity:1,duration:this.durations.normal,ease:this.easing.power4InOut,delay:e})})}staggerReveal(t,e=.1){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{Wn.fromTo(t,{y:50,opacity:0},{y:0,opacity:1,duration:this.durations.normal,ease:this.easing.power4InOut,stagger:e})})}magneticButton(t){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{let e=Wn.quickTo(t,"x",{duration:.5,ease:this.easing.elasticOut}),n=Wn.quickTo(t,"y",{duration:.5,ease:this.easing.elasticOut});t.addEventListener("mousemove",i=>{let s=t.getBoundingClientRect(),o=i.clientX-s.left-s.width/2,a=i.clientY-s.top-s.height/2;e(o*.3),n(a*.3)}),t.addEventListener("mouseleave",()=>{e(0),n(0)})})}parallax(t,e=.5){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{Wn.to(t,{y:()=>jt.maxScroll(window)*e,ease:"none",scrollTrigger:{trigger:t,start:"top bottom",end:"bottom top",scrub:!0}})})}clipPathReveal(t,e="up"){if(!this.isBrowser)return;let n={up:"inset(100% 0 0 0)",down:"inset(0 0 100% 0)",left:"inset(0 100% 0 0)",right:"inset(0 0 0 100%)"};this.ngZone.runOutsideAngular(()=>{Wn.fromTo(t,{clipPath:n[e]},{clipPath:"inset(0 0 0 0)",duration:this.durations.slow,ease:this.easing.power4InOut})})}counterAnimation(t,e,n=2){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{let i={value:0};Wn.to(i,{value:e,duration:n,ease:this.easing.power4InOut,onUpdate:()=>{t.textContent=Math.round(i.value).toLocaleString()}})})}scrollProgress(t){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{Wn.to(t,{scaleX:1,ease:"none",scrollTrigger:{trigger:"body",start:"top top",end:"bottom bottom",scrub:.3}})})}fadeInOnScroll(t,e="top 80%"){this.isBrowser&&this.ngZone.runOutsideAngular(()=>{Wn.fromTo(t,{opacity:0,y:50},{opacity:1,y:0,duration:this.durations.normal,ease:this.easing.power4InOut,scrollTrigger:{trigger:t,start:e}})})}cleanup(){this.lenis&&(this.lenis.destroy(),this.lenis=null),jt.getAll().forEach(t=>t.kill())}static \u0275fac=function(e){return new(e||r)};static \u0275prov=np({token:r,factory:r.\u0275fac,providedIn:"root"})};function mv(r,t){if(r&1){let e=ea();ut(0,"button",12),Vn("click",function(){ms(e);let i=En();return gs(i.navigateTo("/login"))}),ot(1,"Login"),dt(),ut(2,"button",13),Vn("click",function(){ms(e);let i=En();return gs(i.navigateTo("/signup"))}),ot(3,"Get Started"),dt()}}function gv(r,t){if(r&1){let e=ea();ut(0,"button",12),Vn("click",function(){ms(e);let i=En();return gs(i.navigateTo("/dashboard"))}),ot(1,"Dashboard"),dt(),ut(2,"button",13),Vn("click",function(){ms(e);let i=En();return gs(i.logout())}),ot(3,"Logout"),dt()}}var pc=class r{authService=Oe(_p);router=Oe(sp);animationService=Oe(Li);elementRef=Oe(Qi);destroyRef=Oe(no);isLoggedIn=this.authService.isLoggedIn;user=this.authService.user;isScrolled=!1;isMobileMenuOpen=!1;ngAfterViewInit(){this.initializeScrollListener(),this.animationService.initializeSmoothScroll()}initializeScrollListener(){window.addEventListener("scroll",()=>{this.isScrolled=window.scrollY>50})}toggleMobileMenu(){this.isMobileMenuOpen=!this.isMobileMenuOpen}navigateTo(t){this.router.navigate([t]),this.isMobileMenuOpen=!1}async logout(){await this.authService.logout()}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-navbar"]],decls:23,vars:5,consts:[[1,"navbar"],[1,"container"],[1,"navbar-content"],["href","/",1,"logo"],[1,"logo-text"],[1,"logo-subtitle"],[1,"nav-links"],["href","#features",1,"nav-link",3,"click"],["href","#calculator",1,"nav-link",3,"click"],["href","#how-it-works",1,"nav-link",3,"click"],["href","#pricing",1,"nav-link",3,"click"],[1,"mobile-menu-toggle",3,"click"],[1,"btn","btn-secondary",3,"click"],[1,"btn","btn-primary",3,"click"]],template:function(e,n){e&1&&(ut(0,"nav",0)(1,"div",1)(2,"div",2)(3,"a",3)(4,"span",4),ot(5,"UNO"),dt(),ut(6,"span",5),ot(7,"Bank"),dt()(),ut(8,"div",6)(9,"a",7),Vn("click",function(){return n.navigateTo("/")}),ot(10,"Features"),dt(),ut(11,"a",8),Vn("click",function(){return n.navigateTo("/")}),ot(12,"Calculator"),dt(),ut(13,"a",9),Vn("click",function(){return n.navigateTo("/")}),ot(14,"How It Works"),dt(),ut(15,"a",10),Vn("click",function(){return n.navigateTo("/")}),ot(16,"Pricing"),dt(),ji(17,mv,4,0)(18,gv,4,0),dt(),ut(19,"button",11),Vn("click",function(){return n.toggleMobileMenu()}),ta(20,"span")(21,"span")(22,"span"),dt()()()()),e&2&&(er("scrolled",n.isScrolled),Mt(8),er("mobile-open",n.isMobileMenuOpen),Mt(9),tr(n.isLoggedIn()?18:17))},dependencies:[qe],styles:[".navbar[_ngcontent-%COMP%]{position:fixed;top:0;left:0;right:0;z-index:1000;padding:1.5rem 0;transition:all var(--%NS%transition-normal)}.navbar.scrolled[_ngcontent-%COMP%]{padding:1rem 0;background:var(--%NS%glass-bg);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--%NS%glass-border)}.navbar-content[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:var(--%NS%spacing-lg)}.logo[_ngcontent-%COMP%]{display:flex;align-items:baseline;gap:.25rem;text-decoration:none}.logo-text[_ngcontent-%COMP%]{font-family:var(--%NS%font-display);font-size:2rem;font-weight:700;color:var(--%NS%color-text-primary);letter-spacing:-.02em}.logo-subtitle[_ngcontent-%COMP%]{font-size:.875rem;font-weight:500;color:var(--%NS%color-text-secondary);text-transform:uppercase;letter-spacing:.1em}.nav-links[_ngcontent-%COMP%]{display:flex;align-items:center;gap:var(--%NS%spacing-lg)}.nav-link[_ngcontent-%COMP%]{color:var(--%NS%color-text-secondary);font-weight:500;transition:color var(--%NS%transition-fast)}.nav-link[_ngcontent-%COMP%]:hover{color:var(--%NS%color-primary)}.mobile-menu-toggle[_ngcontent-%COMP%]{display:none;flex-direction:column;gap:.375rem;background:none;border:none;padding:.5rem}.mobile-menu-toggle[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{width:24px;height:2px;background:var(--%NS%color-text-primary);transition:all var(--%NS%transition-normal)}@media(max-width:768px){.nav-links[_ngcontent-%COMP%]{position:fixed;top:0;right:-100%;width:80%;max-width:300px;height:100vh;background:var(--%NS%color-bg-card);flex-direction:column;justify-content:center;padding:var(--%NS%spacing-xl);gap:var(--%NS%spacing-lg);transition:right var(--%NS%transition-normal);border-left:1px solid var(--%NS%color-border)}.nav-links.mobile-open[_ngcontent-%COMP%]{right:0}.mobile-menu-toggle[_ngcontent-%COMP%]{display:flex}}"]})};var zg=0,uf=1,Vg=2;var ol=1,Gg=2,Xo=3,hs=0,Qn=1,pr=2,mr=0,qo=1,al=2,df=3,ff=4,Hg=5;var Zs=100,Wg=101,Xg=102,qg=103,Yg=104,Zg=200,Jg=201,$g=202,Kg=203,pf=204,mf=205,Qg=206,jg=207,t_=208,e_=209,n_=210,i_=211,r_=212,s_=213,o_=214,Bc=0,kc=1,zc=2,ko=3,Vc=4,Gc=5,Hc=6,Wc=7,gf=0,a_=1,l_=2,qi=0,_f=1,xf=2,vf=3,yf=4,Sf=5,Mf=6,bf=7;var wf=300,us=301,Js=302,mh=303,gh=304,ll=306,Xc=1e3,hr=1001,qc=1002,vn=1003,c_=1004;var cl=1005;var bn=1006,_h=1007;var ds=1008;var bi=1009,Tf=1010,Ef=1011,Yo=1012,xh=1013,Yi=1014,Zi=1015,Ji=1016,vh=1017,yh=1018,Zo=1020,Af=35902,Cf=35899,Rf=1021,Pf=1022,Fi=1023,ur=1026,fs=1027,If=1028,Sh=1029,ps=1030,Mh=1031;var bh=1033,hl=33776,ul=33777,dl=33778,fl=33779,wh=35840,Th=35841,Eh=35842,Ah=35843,Ch=36196,Rh=37492,Ph=37496,Ih=37488,Nh=37489,pl=37490,Lh=37491,Dh=37808,Oh=37809,Uh=37810,Fh=37811,Bh=37812,kh=37813,zh=37814,Vh=37815,Gh=37816,Hh=37817,Wh=37818,Xh=37819,qh=37820,Yh=37821,Zh=36492,Jh=36494,$h=36495,Kh=36283,Qh=36284,ml=36285,jh=36286;var za=2300,Yc=2301,Uc=2302,rf=2303,sf=2400,of=2401,af=2402;var h_=3200;var Nf=0,u_=1,Dr="",xi="srgb",Va="srgb-linear",Ga="linear",Me="srgb";var Fc=7680;var d_=519,f_=512,p_=513,m_=514,tu=515,g_=516,__=517,eu=518,x_=519,v_=35044;var Lf="300 es",Xi=2e3,Ha=2001;function _v(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function xv(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Wa(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function y_(){let r=Wa("canvas");return r.style.display="block",r}var vg={},zo=null;function Df(...r){let t="THREE."+r.shift();zo?zo("log",t,...r):console.log(t,...r)}function S_(r){let t=r[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=r[1];e&&e.isStackTrace?r[0]+=" "+e.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function Xt(...r){r=S_(r);let t="THREE."+r.shift();if(zo)zo("warn",t,...r);else{let e=r[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...r)}}function Zt(...r){r=S_(r);let t="THREE."+r.shift();if(zo)zo("error",t,...r);else{let e=r[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...r)}}function qs(...r){let t=r.join(" ");t in vg||(vg[t]=!0,Xt(...r))}function M_(r,t,e){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:n()}}setTimeout(s,e)})}var b_={[Bc]:kc,[zc]:Hc,[Vc]:Wc,[ko]:Gc,[kc]:Bc,[Hc]:zc,[Wc]:Vc,[Gc]:ko},dr=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let s=i.indexOf(e);s!==-1&&i.splice(s,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,t);t.target=null}}},Dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Od=Math.PI/180,Zc=180/Math.PI;function gl(){let r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Dn[r&255]+Dn[r>>8&255]+Dn[r>>16&255]+Dn[r>>24&255]+"-"+Dn[t&255]+Dn[t>>8&255]+"-"+Dn[t>>16&15|64]+Dn[t>>24&255]+"-"+Dn[e&63|128]+Dn[e>>8&255]+"-"+Dn[e>>16&255]+Dn[e>>24&255]+Dn[n&255]+Dn[n>>8&255]+Dn[n>>16&255]+Dn[n>>24&255]).toLowerCase()}function de(r,t,e){return Math.max(t,Math.min(e,r))}function vv(r,t){return(r%t+t)%t}function Ud(r,t,e){return(1-e)*r+e*t}function Oa(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:case Uint8ClampedArray:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ri(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var _e=class r{static{r.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(de(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(de(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*n-o*i+t.x,this.y=s*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},fr=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,s,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],f=n[i+3],u=s[o+0],d=s[o+1],g=s[o+2],_=s[o+3];if(f!==_||l!==u||c!==d||h!==g){let p=l*u+c*d+h*g+f*_;p<0&&(u=-u,d=-d,g=-g,_=-_,p=-p);let m=1-a;if(p<.9995){let b=Math.acos(p),A=Math.sin(b);m=Math.sin(m*b)/A,a=Math.sin(a*b)/A,l=l*m+u*a,c=c*m+d*a,h=h*m+g*a,f=f*m+_*a}else{l=l*m+u*a,c=c*m+d*a,h=h*m+g*a,f=f*m+_*a;let b=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=b,c*=b,h*=b,f*=b}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,i,s,o){let a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],f=s[o],u=s[o+1],d=s[o+2],g=s[o+3];return t[e]=a*g+h*f+l*d-c*u,t[e+1]=l*g+h*u+c*f-a*d,t[e+2]=c*g+h*d+a*u-l*f,t[e+3]=h*g-a*f-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,s=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),f=a(s/2),u=l(n/2),d=l(i/2),g=l(s/2);switch(o){case"XYZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"YXZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"ZXY":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"ZYX":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"YZX":this._x=u*h*f+c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f-u*d*g;break;case"XZY":this._x=u*h*f-c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f+u*d*g;break;default:Xt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],s=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],f=e[10],u=n+a+f;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-l)*d,this._y=(s-c)*d,this._z=(o-i)*d}else if(n>a&&n>f){let d=2*Math.sqrt(1+n-a-f);this._w=(h-l)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(s+c)/d}else if(a>f){let d=2*Math.sqrt(1+a-n-f);this._w=(s-c)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+f-n-a);this._w=(o-i)/d,this._x=(s+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(de(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,s=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-s*l,this._y=i*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-s*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,s=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,i=-i,s=-s,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+s*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+s*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Z=class r{static{r.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(yg.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(yg.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*i,this.y=s[1]*e+s[4]*n+s[7]*i,this.z=s[2]*e+s[5]*n+s[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=t.elements,o=1/(s[3]*e+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*e+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*e+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,s=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),h=2*(a*e-s*i),f=2*(s*n-o*e);return this.x=e+l*c+o*f-a*h,this.y=n+l*h+a*c-s*f,this.z=i+l*f+s*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*i,this.y=s[1]*e+s[5]*n+s[9]*i,this.z=s[2]*e+s[6]*n+s[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(de(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,s=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-s*a,this.y=s*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Fd.copy(this).projectOnVector(t),this.sub(Fd)}reflect(t){return this.sub(Fd.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(de(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Fd=new Z,yg=new fr,Qt=class r{static{r.prototype.isMatrix3=!0}constructor(t,e,n,i,s,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,l,c)}set(t,e,n,i,s,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],f=n[7],u=n[2],d=n[5],g=n[8],_=i[0],p=i[3],m=i[6],b=i[1],A=i[4],y=i[7],S=i[2],w=i[5],E=i[8];return s[0]=o*_+a*b+l*S,s[3]=o*p+a*A+l*w,s[6]=o*m+a*y+l*E,s[1]=c*_+h*b+f*S,s[4]=c*p+h*A+f*w,s[7]=c*m+h*y+f*E,s[2]=u*_+d*b+g*S,s[5]=u*p+d*A+g*w,s[8]=u*m+d*y+g*E,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*s*h+n*a*l+i*s*c-i*o*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=h*o-a*c,u=a*l-h*s,d=c*s-o*l,g=e*f+n*u+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=f*_,t[1]=(i*c-h*n)*_,t[2]=(a*n-i*o)*_,t[3]=u*_,t[4]=(h*e-i*l)*_,t[5]=(i*s-a*e)*_,t[6]=d*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*s)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return qs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Bd.makeScale(t,e)),this}rotate(t){return qs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Bd.makeRotation(-t)),this}translate(t,e){return qs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Bd.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Bd=new Qt,Sg=new Qt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mg=new Qt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function yv(){let r={enabled:!0,workingColorSpace:Va,spaces:{},convert:function(i,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===Me&&(i.r=Lr(i.r),i.g=Lr(i.g),i.b=Lr(i.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[s].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Me&&(i.r=Bo(i.r),i.g=Bo(i.g),i.b=Bo(i.b))),i},workingToColorSpace:function(i,s){return this.convert(i,this.workingColorSpace,s)},colorSpaceToWorking:function(i,s){return this.convert(i,s,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Dr?Ga:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,s=this.workingColorSpace){return i.fromArray(this.spaces[s].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,s,o){return i.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,s){return qs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(i,s)},toWorkingColorSpace:function(i,s){return qs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(i,s)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return r.define({[Va]:{primaries:t,whitePoint:n,transfer:Ga,toXYZ:Sg,fromXYZ:Mg,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:xi},outputColorSpaceConfig:{drawingBufferColorSpace:xi}},[xi]:{primaries:t,whitePoint:n,transfer:Me,toXYZ:Sg,fromXYZ:Mg,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:xi}}}),r}var ce=yv();function Lr(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Bo(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var To,Jc=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{To===void 0&&(To=Wa("canvas")),To.width=t.width,To.height=t.height;let i=To.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=To}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Wa("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=Lr(s[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Lr(e[n]/255)*255):e[n]=Lr(e[n]);return{data:e,width:t.width,height:t.height}}else return Xt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Sv=0,Vo=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Sv++}),this.uuid=gl(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(kd(i[o].image)):s.push(kd(i[o]))}else s=kd(i);n.url=s}return e||(t.images[this.uuid]=n),n}};function kd(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Jc.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(Xt("Texture: Unable to serialize Texture."),{})}var Mv=0,zd=new Z,si=class r extends dr{constructor(t=r.DEFAULT_IMAGE,e=r.DEFAULT_MAPPING,n=hr,i=hr,s=bn,o=ds,a=Fi,l=bi,c=r.DEFAULT_ANISOTROPY,h=Dr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mv++}),this.uuid=gl(),this.name="",this.source=new Vo(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new _e(0,0),this.repeat=new _e(1,1),this.center=new _e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(zd).x}get height(){return this.source.getSize(zd).y}get depth(){return this.source.getSize(zd).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Xt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Xt(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==wf)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Xc:t.x=t.x-Math.floor(t.x);break;case hr:t.x=t.x<0?0:1;break;case qc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Xc:t.y=t.y-Math.floor(t.y);break;case hr:t.y=t.y<0?0:1;break;case qc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};si.DEFAULT_IMAGE=null;si.DEFAULT_MAPPING=wf;si.DEFAULT_ANISOTROPY=1;var He=class r{static{r.prototype.isVector4=!0}constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,s,l=t.elements,c=l[0],h=l[4],f=l[8],u=l[1],d=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let A=(c+1)/2,y=(d+1)/2,S=(m+1)/2,w=(h+u)/4,E=(f+_)/4,v=(g+p)/4;return A>y&&A>S?A<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(A),i=w/n,s=E/n):y>S?y<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(y),n=w/i,s=v/i):S<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(S),n=E/s,i=v/s),this.set(n,i,s,e),this}let b=Math.sqrt((p-g)*(p-g)+(f-_)*(f-_)+(u-h)*(u-h));return Math.abs(b)<.001&&(b=1),this.x=(p-g)/b,this.y=(f-_)/b,this.z=(u-h)/b,this.w=Math.acos((c+d+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this.w=de(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this.w=de(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(de(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},$c=class extends dr{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:bn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new He(0,0,t,e),this.scissorTest=!1,this.viewport=new He(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},s=new si(i),o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:bn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new Vo(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},oi=class extends $c{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Xa=class extends si{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=vn,this.minFilter=vn,this.wrapR=hr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Kc=class extends si{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=vn,this.minFilter=vn,this.wrapR=hr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var $e=class r{static{r.prototype.isMatrix4=!0}constructor(t,e,n,i,s,o,a,l,c,h,f,u,d,g,_,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,l,c,h,f,u,d,g,_,p)}set(t,e,n,i,s,o,a,l,c,h,f,u,d,g,_,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=f,m[14]=u,m[3]=d,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/Eo.setFromMatrixColumn(t,0).length(),s=1/Eo.setFromMatrixColumn(t,1).length(),o=1/Eo.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,s=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(s),f=Math.sin(s);if(t.order==="XYZ"){let u=o*h,d=o*f,g=a*h,_=a*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=d+g*c,e[5]=u-_*c,e[9]=-a*l,e[2]=_-u*c,e[6]=g+d*c,e[10]=o*l}else if(t.order==="YXZ"){let u=l*h,d=l*f,g=c*h,_=c*f;e[0]=u+_*a,e[4]=g*a-d,e[8]=o*c,e[1]=o*f,e[5]=o*h,e[9]=-a,e[2]=d*a-g,e[6]=_+u*a,e[10]=o*l}else if(t.order==="ZXY"){let u=l*h,d=l*f,g=c*h,_=c*f;e[0]=u-_*a,e[4]=-o*f,e[8]=g+d*a,e[1]=d+g*a,e[5]=o*h,e[9]=_-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let u=o*h,d=o*f,g=a*h,_=a*f;e[0]=l*h,e[4]=g*c-d,e[8]=u*c+_,e[1]=l*f,e[5]=_*c+u,e[9]=d*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let u=o*l,d=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-u*f,e[8]=g*f+d,e[1]=f,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=d*f+g,e[10]=u-_*f}else if(t.order==="XZY"){let u=o*l,d=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=u*f+_,e[5]=o*h,e[9]=d*f-g,e[2]=g*f-d,e[6]=a*h,e[10]=_*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(bv,t,wv)}lookAt(t,e,n){let i=this.elements;return gi.subVectors(t,e),gi.lengthSq()===0&&(gi.z=1),gi.normalize(),Kr.crossVectors(n,gi),Kr.lengthSq()===0&&(Math.abs(n.z)===1?gi.x+=1e-4:gi.z+=1e-4,gi.normalize(),Kr.crossVectors(n,gi)),Kr.normalize(),mc.crossVectors(gi,Kr),i[0]=Kr.x,i[4]=mc.x,i[8]=gi.x,i[1]=Kr.y,i[5]=mc.y,i[9]=gi.y,i[2]=Kr.z,i[6]=mc.z,i[10]=gi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],f=n[5],u=n[9],d=n[13],g=n[2],_=n[6],p=n[10],m=n[14],b=n[3],A=n[7],y=n[11],S=n[15],w=i[0],E=i[4],v=i[8],T=i[12],C=i[1],L=i[5],N=i[9],z=i[13],I=i[2],B=i[6],X=i[10],k=i[14],K=i[3],q=i[7],R=i[11],j=i[15];return s[0]=o*w+a*C+l*I+c*K,s[4]=o*E+a*L+l*B+c*q,s[8]=o*v+a*N+l*X+c*R,s[12]=o*T+a*z+l*k+c*j,s[1]=h*w+f*C+u*I+d*K,s[5]=h*E+f*L+u*B+d*q,s[9]=h*v+f*N+u*X+d*R,s[13]=h*T+f*z+u*k+d*j,s[2]=g*w+_*C+p*I+m*K,s[6]=g*E+_*L+p*B+m*q,s[10]=g*v+_*N+p*X+m*R,s[14]=g*T+_*z+p*k+m*j,s[3]=b*w+A*C+y*I+S*K,s[7]=b*E+A*L+y*B+S*q,s[11]=b*v+A*N+y*X+S*R,s[15]=b*T+A*z+y*k+S*j,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],f=t[6],u=t[10],d=t[14],g=t[3],_=t[7],p=t[11],m=t[15],b=l*d-c*u,A=a*d-c*f,y=a*u-l*f,S=o*d-c*h,w=o*u-l*h,E=o*f-a*h;return e*(_*b-p*A+m*y)-n*(g*b-p*S+m*w)+i*(g*A-_*S+m*E)-s*(g*y-_*w+p*E)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-n*(s*h-a*l)+i*(s*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=t[9],u=t[10],d=t[11],g=t[12],_=t[13],p=t[14],m=t[15],b=e*a-n*o,A=e*l-i*o,y=e*c-s*o,S=n*l-i*a,w=n*c-s*a,E=i*c-s*l,v=h*_-f*g,T=h*p-u*g,C=h*m-d*g,L=f*p-u*_,N=f*m-d*_,z=u*m-d*p,I=b*z-A*N+y*L+S*C-w*T+E*v;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/I;return t[0]=(a*z-l*N+c*L)*B,t[1]=(i*N-n*z-s*L)*B,t[2]=(_*E-p*w+m*S)*B,t[3]=(u*w-f*E-d*S)*B,t[4]=(l*C-o*z-c*T)*B,t[5]=(e*z-i*C+s*T)*B,t[6]=(p*y-g*E-m*A)*B,t[7]=(h*E-u*y+d*A)*B,t[8]=(o*N-a*C+c*v)*B,t[9]=(n*C-e*N-s*v)*B,t[10]=(g*w-_*y+m*b)*B,t[11]=(f*y-h*w-d*b)*B,t[12]=(a*T-o*L-l*v)*B,t[13]=(e*L-n*T+i*v)*B,t[14]=(_*A-g*S-p*b)*B,t[15]=(h*S-f*A+u*b)*B,this}scale(t){let e=this.elements,n=t.x,i=t.y,s=t.z;return e[0]*=n,e[4]*=i,e[8]*=s,e[1]*=n,e[5]*=i,e[9]*=s,e[2]*=n,e[6]*=i,e[10]*=s,e[3]*=n,e[7]*=i,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),s=1-n,o=t.x,a=t.y,l=t.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,s*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,s,o){return this.set(1,n,s,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,s=e._x,o=e._y,a=e._z,l=e._w,c=s+s,h=o+o,f=a+a,u=s*c,d=s*h,g=s*f,_=o*h,p=o*f,m=a*f,b=l*c,A=l*h,y=l*f,S=n.x,w=n.y,E=n.z;return i[0]=(1-(_+m))*S,i[1]=(d+y)*S,i[2]=(g-A)*S,i[3]=0,i[4]=(d-y)*w,i[5]=(1-(u+m))*w,i[6]=(p+b)*w,i[7]=0,i[8]=(g+A)*E,i[9]=(p-b)*E,i[10]=(1-(u+_))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let s=this.determinantAffine();if(s===0)return n.set(1,1,1),e.identity(),this;let o=Eo.set(i[0],i[1],i[2]).length(),a=Eo.set(i[4],i[5],i[6]).length(),l=Eo.set(i[8],i[9],i[10]).length();s<0&&(o=-o),Vi.copy(this);let c=1/o,h=1/a,f=1/l;return Vi.elements[0]*=c,Vi.elements[1]*=c,Vi.elements[2]*=c,Vi.elements[4]*=h,Vi.elements[5]*=h,Vi.elements[6]*=h,Vi.elements[8]*=f,Vi.elements[9]*=f,Vi.elements[10]*=f,e.setFromRotationMatrix(Vi),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,i,s,o,a=Xi,l=!1){let c=this.elements,h=2*s/(e-t),f=2*s/(n-i),u=(e+t)/(e-t),d=(n+i)/(n-i),g,_;if(l)g=s/(o-s),_=o*s/(o-s);else if(a===Xi)g=-(o+s)/(o-s),_=-2*o*s/(o-s);else if(a===Ha)g=-o/(o-s),_=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,s,o,a=Xi,l=!1){let c=this.elements,h=2/(e-t),f=2/(n-i),u=-(e+t)/(e-t),d=-(n+i)/(n-i),g,_;if(l)g=1/(o-s),_=o/(o-s);else if(a===Xi)g=-2/(o-s),_=-(o+s)/(o-s);else if(a===Ha)g=-1/(o-s),_=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Eo=new Z,Vi=new $e,bv=new Z(0,0,0),wv=new Z(1,1,1),Kr=new Z,mc=new Z,gi=new Z,bg=new $e,wg=new fr,is=class r{constructor(t=0,e=0,n=0,i=r.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,s=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],f=i[2],u=i[6],d=i[10];switch(e){case"XYZ":this._y=Math.asin(de(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-de(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(de(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-de(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(de(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-de(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,d),this._y=0);break;default:Xt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return bg.makeRotationFromQuaternion(t),this.setFromRotationMatrix(bg,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return wg.setFromEuler(this),this.setFromQuaternion(wg,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};is.DEFAULT_ORDER="XYZ";var qa=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Tv=0,Tg=new Z,Ao=new fr,Cr=new $e,gc=new Z,Ua=new Z,Ev=new Z,Av=new fr,Eg=new Z(1,0,0),Ag=new Z(0,1,0),Cg=new Z(0,0,1),Rg={type:"added"},Cv={type:"removed"},Co={type:"childadded",child:null},Vd={type:"childremoved",child:null},vi=class r extends dr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Tv++}),this.uuid=gl(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let t=new Z,e=new is,n=new fr,i=new Z(1,1,1);function s(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new $e},normalMatrix:{value:new Qt}}),this.matrix=new $e,this.matrixWorld=new $e,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ao.setFromAxisAngle(t,e),this.quaternion.multiply(Ao),this}rotateOnWorldAxis(t,e){return Ao.setFromAxisAngle(t,e),this.quaternion.premultiply(Ao),this}rotateX(t){return this.rotateOnAxis(Eg,t)}rotateY(t){return this.rotateOnAxis(Ag,t)}rotateZ(t){return this.rotateOnAxis(Cg,t)}translateOnAxis(t,e){return Tg.copy(t).applyQuaternion(this.quaternion),this.position.add(Tg.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Eg,t)}translateY(t){return this.translateOnAxis(Ag,t)}translateZ(t){return this.translateOnAxis(Cg,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Cr.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?gc.copy(t):gc.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Ua.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cr.lookAt(Ua,gc,this.up):Cr.lookAt(gc,Ua,this.up),this.quaternion.setFromRotationMatrix(Cr),i&&(Cr.extractRotation(i.matrixWorld),Ao.setFromRotationMatrix(Cr),this.quaternion.premultiply(Ao.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Zt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Rg),Co.child=t,this.dispatchEvent(Co),Co.child=null):Zt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Cv),Vd.child=t,this.dispatchEvent(Vd),Vd.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Cr.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Cr.multiply(t.parent.matrixWorld)),t.applyMatrix4(Cr),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Rg),Co.child=t,this.dispatchEvent(Co),Co.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ua,t,Ev),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ua,Av,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,s=this.matrix.elements;s[12]+=e-s[0]*e-s[4]*n-s[8]*i,s[13]+=n-s[1]*e-s[5]*n-s[9]*i,s[14]+=i-s[2]*e-s[6]*n-s[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>ep(jo({},a),{boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>jo({},a)),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let f=l[c];s(t.shapes,f)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(t.materials,this.material[l]));i.material=a}else i.material=s(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(s(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),f=o(t.shapes),u=o(t.skeletons),d=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),u.length>0&&(n.skeletons=u),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};vi.DEFAULT_UP=new Z(0,1,0);vi.DEFAULT_MATRIX_AUTO_UPDATE=!0;vi.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xs=class extends vi{constructor(){super(),this.isGroup=!0,this.type="Group"}},Rv={type:"move"},Go=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Z,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let p=e.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Rv)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Xs;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},w_={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Qr={h:0,s:0,l:0},_c={h:0,s:0,l:0};function Gd(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}var pe=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=xi){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ce.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=ce.workingColorSpace){return this.r=t,this.g=e,this.b=n,ce.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=ce.workingColorSpace){if(t=vv(t,1),e=de(e,0,1),n=de(n,0,1),e===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+e):n+e-n*e,o=2*n-s;this.r=Gd(o,s,t+1/3),this.g=Gd(o,s,t),this.b=Gd(o,s,t-1/3)}return ce.colorSpaceToWorking(this,i),this}setStyle(t,e=xi){function n(s){s!==void 0&&parseFloat(s)<1&&Xt("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:Xt("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);Xt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=xi){let n=w_[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Xt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Lr(t.r),this.g=Lr(t.g),this.b=Lr(t.b),this}copyLinearToSRGB(t){return this.r=Bo(t.r),this.g=Bo(t.g),this.b=Bo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=xi){return ce.workingToColorSpace(On.copy(this),t),Math.round(de(On.r*255,0,255))*65536+Math.round(de(On.g*255,0,255))*256+Math.round(de(On.b*255,0,255))}getHexString(t=xi){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ce.workingColorSpace){ce.workingToColorSpace(On.copy(this),e);let n=On.r,i=On.g,s=On.b,o=Math.max(n,i,s),a=Math.min(n,i,s),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let f=o-a;switch(c=h<=.5?f/(o+a):f/(2-o-a),o){case n:l=(i-s)/f+(i<s?6:0);break;case i:l=(s-n)/f+2;break;case s:l=(n-i)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ce.workingColorSpace){return ce.workingToColorSpace(On.copy(this),e),t.r=On.r,t.g=On.g,t.b=On.b,t}getStyle(t=xi){ce.workingToColorSpace(On.copy(this),t);let e=On.r,n=On.g,i=On.b;return t!==xi?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Qr),this.setHSL(Qr.h+t,Qr.s+e,Qr.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Qr),t.getHSL(_c);let n=Ud(Qr.h,_c.h,e),i=Ud(Qr.s,_c.s,e),s=Ud(Qr.l,_c.l,e);return this.setHSL(n,i,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*i,this.g=s[1]*e+s[4]*n+s[7]*i,this.b=s[2]*e+s[5]*n+s[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},On=new pe;pe.NAMES=w_;var Ya=class extends vi{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new is,this.environmentIntensity=1,this.environmentRotation=new is,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Gi=new Z,Rr=new Z,Hd=new Z,Pr=new Z,Ro=new Z,Po=new Z,Pg=new Z,Wd=new Z,Xd=new Z,qd=new Z,Yd=new He,Zd=new He,Jd=new He,ns=class r{constructor(t=new Z,e=new Z,n=new Z){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Gi.subVectors(t,e),i.cross(Gi);let s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(t,e,n,i,s){Gi.subVectors(i,e),Rr.subVectors(n,e),Hd.subVectors(t,e);let o=Gi.dot(Gi),a=Gi.dot(Rr),l=Gi.dot(Hd),c=Rr.dot(Rr),h=Rr.dot(Hd),f=o*c-a*a;if(f===0)return s.set(0,0,0),null;let u=1/f,d=(c*l-a*h)*u,g=(o*h-a*l)*u;return s.set(1-d-g,g,d)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Pr)===null?!1:Pr.x>=0&&Pr.y>=0&&Pr.x+Pr.y<=1}static getInterpolation(t,e,n,i,s,o,a,l){return this.getBarycoord(t,e,n,i,Pr)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Pr.x),l.addScaledVector(o,Pr.y),l.addScaledVector(a,Pr.z),l)}static getInterpolatedAttribute(t,e,n,i,s,o){return Yd.setScalar(0),Zd.setScalar(0),Jd.setScalar(0),Yd.fromBufferAttribute(t,e),Zd.fromBufferAttribute(t,n),Jd.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(Yd,s.x),o.addScaledVector(Zd,s.y),o.addScaledVector(Jd,s.z),o}static isFrontFacing(t,e,n,i){return Gi.subVectors(n,e),Rr.subVectors(t,e),Gi.cross(Rr).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Gi.subVectors(this.c,this.b),Rr.subVectors(this.a,this.b),Gi.cross(Rr).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return r.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return r.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,s){return r.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}containsPoint(t){return r.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return r.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,s=this.c,o,a;Ro.subVectors(i,n),Po.subVectors(s,n),Wd.subVectors(t,n);let l=Ro.dot(Wd),c=Po.dot(Wd);if(l<=0&&c<=0)return e.copy(n);Xd.subVectors(t,i);let h=Ro.dot(Xd),f=Po.dot(Xd);if(h>=0&&f<=h)return e.copy(i);let u=l*f-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Ro,o);qd.subVectors(t,s);let d=Ro.dot(qd),g=Po.dot(qd);if(g>=0&&d<=g)return e.copy(s);let _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Po,a);let p=h*g-d*f;if(p<=0&&f-h>=0&&d-g>=0)return Pg.subVectors(s,i),a=(f-h)/(f-h+(d-g)),e.copy(i).addScaledVector(Pg,a);let m=1/(p+_+u);return o=_*m,a=u*m,e.copy(n).addScaledVector(Ro,o).addScaledVector(Po,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},rs=class{constructor(t=new Z(1/0,1/0,1/0),e=new Z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Hi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Hi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Hi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Hi):Hi.fromBufferAttribute(s,o),Hi.applyMatrix4(t.matrixWorld),this.expandByPoint(Hi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),xc.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),xc.copy(n.boundingBox)),xc.applyMatrix4(t.matrixWorld),this.union(xc)}let i=t.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Hi),Hi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Fa),vc.subVectors(this.max,Fa),Io.subVectors(t.a,Fa),No.subVectors(t.b,Fa),Lo.subVectors(t.c,Fa),jr.subVectors(No,Io),ts.subVectors(Lo,No),Vs.subVectors(Io,Lo);let e=[0,-jr.z,jr.y,0,-ts.z,ts.y,0,-Vs.z,Vs.y,jr.z,0,-jr.x,ts.z,0,-ts.x,Vs.z,0,-Vs.x,-jr.y,jr.x,0,-ts.y,ts.x,0,-Vs.y,Vs.x,0];return!$d(e,Io,No,Lo,vc)||(e=[1,0,0,0,1,0,0,0,1],!$d(e,Io,No,Lo,vc))?!1:(yc.crossVectors(jr,ts),e=[yc.x,yc.y,yc.z],$d(e,Io,No,Lo,vc))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Hi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Hi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ir[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ir[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ir[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ir[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ir[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ir[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ir[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ir[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ir),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ir=[new Z,new Z,new Z,new Z,new Z,new Z,new Z,new Z],Hi=new Z,xc=new rs,Io=new Z,No=new Z,Lo=new Z,jr=new Z,ts=new Z,Vs=new Z,Fa=new Z,vc=new Z,yc=new Z,Gs=new Z;function $d(r,t,e,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){Gs.fromArray(r,s);let a=i.x*Math.abs(Gs.x)+i.y*Math.abs(Gs.y)+i.z*Math.abs(Gs.z),l=t.dot(Gs),c=e.dot(Gs),h=n.dot(Gs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var ln=new Z,Sc=new _e,Pv=0,Kn=class extends dr{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Pv++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=v_,this.updateRanges=[],this.gpuType=Zi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Sc.fromBufferAttribute(this,e),Sc.applyMatrix3(t),this.setXY(e,Sc.x,Sc.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ln.fromBufferAttribute(this,e),ln.applyMatrix3(t),this.setXYZ(e,ln.x,ln.y,ln.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ln.fromBufferAttribute(this,e),ln.applyMatrix4(t),this.setXYZ(e,ln.x,ln.y,ln.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ln.fromBufferAttribute(this,e),ln.applyNormalMatrix(t),this.setXYZ(e,ln.x,ln.y,ln.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ln.fromBufferAttribute(this,e),ln.transformDirection(t),this.setXYZ(e,ln.x,ln.y,ln.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Oa(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ri(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Oa(e,this.array)),e}setX(t,e){return this.normalized&&(e=ri(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Oa(e,this.array)),e}setY(t,e){return this.normalized&&(e=ri(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Oa(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ri(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Oa(e,this.array)),e}setW(t,e){return this.normalized&&(e=ri(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ri(e,this.array),n=ri(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=ri(e,this.array),n=ri(n,this.array),i=ri(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,s){return t*=this.itemSize,this.normalized&&(e=ri(e,this.array),n=ri(n,this.array),i=ri(i,this.array),s=ri(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Za=class extends Kn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Ja=class extends Kn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Oi=class extends Kn{constructor(t,e,n){super(new Float32Array(t),e,n)}},Iv=new rs,Ba=new Z,Kd=new Z,Ys=class{constructor(t=new Z,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Iv.setFromPoints(t).getCenter(n);let i=0;for(let s=0,o=t.length;s<o;s++)i=Math.max(i,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ba.subVectors(t,this.center);let e=Ba.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Ba,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Kd.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ba.copy(t.center).add(Kd)),this.expandByPoint(Ba.copy(t.center).sub(Kd))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Nv=0,Di=new $e,Qd=new vi,Do=new Z,_i=new rs,ka=new rs,xn=new Z,yi=class r extends dr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nv++}),this.uuid=gl(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(_v(t)?Ja:Za)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Qt().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Di.makeRotationFromQuaternion(t),this.applyMatrix4(Di),this}rotateX(t){return Di.makeRotationX(t),this.applyMatrix4(Di),this}rotateY(t){return Di.makeRotationY(t),this.applyMatrix4(Di),this}rotateZ(t){return Di.makeRotationZ(t),this.applyMatrix4(Di),this}translate(t,e,n){return Di.makeTranslation(t,e,n),this.applyMatrix4(Di),this}scale(t,e,n){return Di.makeScale(t,e,n),this.applyMatrix4(Di),this}lookAt(t){return Qd.lookAt(t),Qd.updateMatrix(),this.applyMatrix4(Qd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Do).negate(),this.translate(Do.x,Do.y,Do.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,s=t.length;i<s;i++){let o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Oi(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let s=t[i];e.setXYZ(i,s.x,s.y,s.z||0)}t.length>e.count&&Xt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rs);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Zt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Z(-1/0,-1/0,-1/0),new Z(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let s=e[n];_i.setFromBufferAttribute(s),this.morphTargetsRelative?(xn.addVectors(this.boundingBox.min,_i.min),this.boundingBox.expandByPoint(xn),xn.addVectors(this.boundingBox.max,_i.max),this.boundingBox.expandByPoint(xn)):(this.boundingBox.expandByPoint(_i.min),this.boundingBox.expandByPoint(_i.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Zt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ys);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Zt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Z,1/0);return}if(t){let n=this.boundingSphere.center;if(_i.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){let a=e[s];ka.setFromBufferAttribute(a),this.morphTargetsRelative?(xn.addVectors(_i.min,ka.min),_i.expandByPoint(xn),xn.addVectors(_i.max,ka.max),_i.expandByPoint(xn)):(_i.expandByPoint(ka.min),_i.expandByPoint(ka.max))}_i.getCenter(n);let i=0;for(let s=0,o=t.count;s<o;s++)xn.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(xn));if(e)for(let s=0,o=e.length;s<o;s++){let a=e[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)xn.fromBufferAttribute(a,c),l&&(Do.fromBufferAttribute(t,c),xn.add(Do)),i=Math.max(i,n.distanceToSquared(xn))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Zt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Zt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,s=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Kn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let v=0;v<n.count;v++)a[v]=new Z,l[v]=new Z;let c=new Z,h=new Z,f=new Z,u=new _e,d=new _e,g=new _e,_=new Z,p=new Z;function m(v,T,C){c.fromBufferAttribute(n,v),h.fromBufferAttribute(n,T),f.fromBufferAttribute(n,C),u.fromBufferAttribute(s,v),d.fromBufferAttribute(s,T),g.fromBufferAttribute(s,C),h.sub(c),f.sub(c),d.sub(u),g.sub(u);let L=1/(d.x*g.y-g.x*d.y);isFinite(L)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(f,-d.y).multiplyScalar(L),p.copy(f).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(L),a[v].add(_),a[T].add(_),a[C].add(_),l[v].add(p),l[T].add(p),l[C].add(p))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let v=0,T=b.length;v<T;++v){let C=b[v],L=C.start,N=C.count;for(let z=L,I=L+N;z<I;z+=3)m(t.getX(z+0),t.getX(z+1),t.getX(z+2))}let A=new Z,y=new Z,S=new Z,w=new Z;function E(v){S.fromBufferAttribute(i,v),w.copy(S);let T=a[v];A.copy(T),A.sub(S.multiplyScalar(S.dot(T))).normalize(),y.crossVectors(w,T);let L=y.dot(l[v])<0?-1:1;o.setXYZW(v,A.x,A.y,A.z,L)}for(let v=0,T=b.length;v<T;++v){let C=b[v],L=C.start,N=C.count;for(let z=L,I=L+N;z<I;z+=3)E(t.getX(z+0)),E(t.getX(z+1)),E(t.getX(z+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Kn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);let i=new Z,s=new Z,o=new Z,a=new Z,l=new Z,c=new Z,h=new Z,f=new Z;if(t)for(let u=0,d=t.count;u<d;u+=3){let g=t.getX(u+0),_=t.getX(u+1),p=t.getX(u+2);i.fromBufferAttribute(e,g),s.fromBufferAttribute(e,_),o.fromBufferAttribute(e,p),h.subVectors(o,s),f.subVectors(i,s),h.cross(f),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let u=0,d=e.count;u<d;u+=3)i.fromBufferAttribute(e,u+0),s.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,s),f.subVectors(i,s),h.cross(f),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)xn.fromBufferAttribute(t,e),xn.normalize(),t.setXYZ(e,xn.x,xn.y,xn.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,f=a.normalized,u=new c.constructor(l.length*h),d=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*h;for(let m=0;m<h;m++)u[g++]=c[d++]}return new Kn(u,h,f)}if(this.index===null)return Xt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new r,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=t(l,n);e.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let h=0,f=c.length;h<f;h++){let u=c[h],d=t(u,n);l.push(d)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){let d=c[f];h.push(d.toJSON(t.data))}h.length>0&&(i[l]=h,s=!0)}s&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(e))}let s=t.morphAttributes;for(let c in s){let h=[],f=s[c];for(let u=0,d=f.length;u<d;u++)h.push(f[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var jd=new Z,Lv=new Z,Dv=new Qt,Wi=class{constructor(t=new Z(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=jd.subVectors(n,e).cross(Lv.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(jd),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/s;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(i,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Dv.getNormalMatrix(t),i=this.coplanarPoint(jd).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Ov=0,ss=class extends dr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ov++}),this.uuid=gl(),this.name="",this.type="Material",this.blending=qo,this.side=hs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=pf,this.blendDst=mf,this.blendEquation=Zs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new pe(0,0,0),this.blendAlpha=0,this.depthFunc=ko,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=d_,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fc,this.stencilZFail=Fc,this.stencilZPass=Fc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Xt(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Xt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(e){let s=i(t.textures),o=i(t.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new pe().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Wi().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new _e().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new _e().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Nr=new Z,tf=new Z,Mc=new Z,bc=new Z,$a=class{constructor(t=new Z,e=new Z(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Nr)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Nr.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Nr.copy(this.origin).addScaledVector(this.direction,e),Nr.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){tf.copy(t).add(e).multiplyScalar(.5),Mc.copy(e).sub(t).normalize(),bc.copy(this.origin).sub(tf);let s=t.distanceTo(e)*.5,o=-this.direction.dot(Mc),a=bc.dot(this.direction),l=-bc.dot(Mc),c=bc.lengthSq(),h=Math.abs(1-o*o),f,u,d,g;if(h>0)if(f=o*l-a,u=o*a-l,g=s*h,f>=0)if(u>=-g)if(u<=g){let _=1/h;f*=_,u*=_,d=f*(f+o*u+2*a)+u*(o*f+u+2*l)+c}else u=s,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*l)+c;else u=-s,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*l)+c;else u<=-g?(f=Math.max(0,-(-o*s+a)),u=f>0?-s:Math.min(Math.max(-s,-l),s),d=-f*f+u*(u+2*l)+c):u<=g?(f=0,u=Math.min(Math.max(-s,-l),s),d=u*(u+2*l)+c):(f=Math.max(0,-(o*s+a)),u=f>0?s:Math.min(Math.max(-s,-l),s),d=-f*f+u*(u+2*l)+c);else u=o>0?-s:s,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),i&&i.copy(tf).addScaledVector(Mc,u),d}intersectSphere(t,e){if(t.radius<0)return null;Nr.subVectors(t.center,this.origin);let n=Nr.dot(this.direction),i=Nr.dot(Nr)-n*n,s=t.radius*t.radius;if(i>s)return null;let o=Math.sqrt(s-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,s,o,a,l,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,i=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,i=(t.min.x-u.x)*c),h>=0?(s=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(s=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),f>=0?(a=(t.min.z-u.z)*f,l=(t.max.z-u.z)*f):(a=(t.max.z-u.z)*f,l=(t.min.z-u.z)*f),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Nr)!==null}intersectTriangle(t,e,n,i,s){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,f=t.x-o.x,u=t.y-o.y,d=t.z-o.z,g=e.x-o.x,_=e.y-o.y,p=e.z-o.z,m=n.x-o.x,b=n.y-o.y,A=n.z-o.z,y=Math.abs(l),S=Math.abs(c),w=Math.abs(h),E,v,T,C,L,N,z,I,B,X,k,K;if(y>=S&&y>=w?(T=l,N=f,B=g,K=m,l>=0?(E=c,v=h,C=u,L=d,z=_,I=p,X=b,k=A):(E=h,v=c,C=d,L=u,z=p,I=_,X=A,k=b)):S>=w?(T=c,N=u,B=_,K=b,c>=0?(E=h,v=l,C=d,L=f,z=p,I=g,X=A,k=m):(E=l,v=h,C=f,L=d,z=g,I=p,X=m,k=A)):(T=h,N=d,B=p,K=A,h>=0?(E=l,v=c,C=f,L=u,z=g,I=_,X=m,k=b):(E=c,v=l,C=u,L=f,z=_,I=g,X=b,k=m)),T===0)return null;let q=E/T,R=v/T,j=1/T,Tt=C-q*N,Et=L-R*N,Wt=z-q*B,Ht=I-R*B,qt=X-q*K,J=k-R*K,tt=qt*Ht-J*Wt,yt=Tt*J-Et*qt,Vt=Wt*Et-Ht*Tt;if(i){if(tt<0||yt<0||Vt<0)return null}else if((tt<0||yt<0||Vt<0)&&(tt>0||yt>0||Vt>0))return null;let xt=tt+yt+Vt;if(xt===0)return null;let kt=j*(tt*N+yt*B+Vt*K);return(xt>0?kt<0:kt>0)?null:this.at(kt/xt,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ka=class extends ss{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new pe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new is,this.combine=gf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Ig=new $e,Hs=new $a,wc=new Ys,Ng=new Z,Tc=new Z,Ec=new Z,Ac=new Z,ef=new Z,Cc=new Z,Lg=new Z,Rc=new Z,Ui=class extends vi{constructor(t=new yi,e=new Ka){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let a=this.morphTargetInfluences;if(s&&a){Cc.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=a[l],f=s[l];h!==0&&(ef.fromBufferAttribute(f,t),o?Cc.addScaledVector(ef,h):Cc.addScaledVector(ef.sub(e),h))}e.add(Cc)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),wc.copy(n.boundingSphere),wc.applyMatrix4(s),Hs.copy(t.ray).recast(t.near),!(wc.containsPoint(Hs.origin)===!1&&(Hs.intersectSphere(wc,Ng)===null||Hs.origin.distanceToSquared(Ng)>(t.far-t.near)**2))&&(Ig.copy(s).invert(),Hs.copy(t.ray).applyMatrix4(Ig),!(n.boundingBox!==null&&Hs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Hs)))}_computeIntersections(t,e,n){let i,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,f=s.attributes.normal,u=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){let p=u[g],m=o[p.materialIndex],b=Math.max(p.start,d.start),A=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let y=b,S=A;y<S;y+=3){let w=a.getX(y),E=a.getX(y+1),v=a.getX(y+2);i=Pc(this,m,t,n,c,h,f,w,E,v),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let g=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let p=g,m=_;p<m;p+=3){let b=a.getX(p),A=a.getX(p+1),y=a.getX(p+2);i=Pc(this,o,t,n,c,h,f,b,A,y),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){let p=u[g],m=o[p.materialIndex],b=Math.max(p.start,d.start),A=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let y=b,S=A;y<S;y+=3){let w=y,E=y+1,v=y+2;i=Pc(this,m,t,n,c,h,f,w,E,v),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let p=g,m=_;p<m;p+=3){let b=p,A=p+1,y=p+2;i=Pc(this,o,t,n,c,h,f,b,A,y),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}};function Uv(r,t,e,n,i,s,o,a){let l;if(t.side===Qn?l=n.intersectTriangle(o,s,i,!0,a):l=n.intersectTriangle(i,s,o,t.side===hs,a),l===null)return null;Rc.copy(a),Rc.applyMatrix4(r.matrixWorld);let c=e.ray.origin.distanceTo(Rc);return c<e.near||c>e.far?null:{distance:c,point:Rc.clone(),object:r}}function Pc(r,t,e,n,i,s,o,a,l,c){r.getVertexPosition(a,Tc),r.getVertexPosition(l,Ec),r.getVertexPosition(c,Ac);let h=Uv(r,t,e,n,Tc,Ec,Ac,Lg);if(h){let f=new Z;ns.getBarycoord(Lg,Tc,Ec,Ac,f),i&&(h.uv=ns.getInterpolatedAttribute(i,a,l,c,f,new _e)),s&&(h.uv1=ns.getInterpolatedAttribute(s,a,l,c,f,new _e)),o&&(h.normal=ns.getInterpolatedAttribute(o,a,l,c,f,new Z),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new Z,materialIndex:0};ns.getNormal(Tc,Ec,Ac,u.normal),h.face=u,h.barycoord=f}return h}var Qc=class extends si{constructor(t=null,e=1,n=1,i,s,o,a,l,c=vn,h=vn,f,u){super(null,o,a,l,c,h,i,s,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ws=new Ys,Fv=new _e(.5,.5),Ic=new Z,Qa=class{constructor(t=new Wi,e=new Wi,n=new Wi,i=new Wi,s=new Wi,o=new Wi){this.planes=[t,e,n,i,s,o]}set(t,e,n,i,s,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Xi,n=!1){let i=this.planes,s=t.elements,o=s[0],a=s[1],l=s[2],c=s[3],h=s[4],f=s[5],u=s[6],d=s[7],g=s[8],_=s[9],p=s[10],m=s[11],b=s[12],A=s[13],y=s[14],S=s[15];if(i[0].setComponents(c-o,d-h,m-g,S-b).normalize(),i[1].setComponents(c+o,d+h,m+g,S+b).normalize(),i[2].setComponents(c+a,d+f,m+_,S+A).normalize(),i[3].setComponents(c-a,d-f,m-_,S-A).normalize(),n)i[4].setComponents(l,u,p,y).normalize(),i[5].setComponents(c-l,d-u,m-p,S-y).normalize();else if(i[4].setComponents(c-l,d-u,m-p,S-y).normalize(),e===Xi)i[5].setComponents(c+l,d+u,m+p,S+y).normalize();else if(e===Ha)i[5].setComponents(l,u,p,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ws.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ws.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ws)}intersectsSprite(t){Ws.center.set(0,0,0);let e=Fv.distanceTo(t.center);return Ws.radius=.7071067811865476+e,Ws.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ws)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(Ic.x=i.normal.x>0?t.max.x:t.min.x,Ic.y=i.normal.y>0?t.max.y:t.min.y,Ic.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Ic)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Ho=class extends ss{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new pe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Dg=new $e,lf=new $a,Nc=new Ys,Lc=new Z,ja=class extends vi{constructor(t=new yi,e=new Ho){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.matrixWorld,s=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Nc.copy(n.boundingSphere),Nc.applyMatrix4(i),Nc.radius+=s,t.ray.intersectsSphere(Nc)===!1)return;Dg.copy(i).invert(),lf.copy(t.ray).applyMatrix4(Dg);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,f=n.attributes.position;if(c!==null){let u=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let g=u,_=d;g<_;g++){let p=c.getX(g);Lc.fromBufferAttribute(f,p),Og(Lc,p,l,i,t,e,this)}}else{let u=Math.max(0,o.start),d=Math.min(f.count,o.start+o.count);for(let g=u,_=d;g<_;g++)Lc.fromBufferAttribute(f,g),Og(Lc,g,l,i,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){let a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function Og(r,t,e,n,i,s,o){let a=lf.distanceSqToPoint(r);if(a<e){let l=new Z;lf.closestPointToPoint(r,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var tl=class extends si{constructor(t=[],e=us,n,i,s,o,a,l,c,h){super(t,e,n,i,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}};var os=class extends si{constructor(t,e,n=Yi,i,s,o,a=vn,l=vn,c,h=ur,f=1){if(h!==ur&&h!==fs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:f};super(u,i,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Vo(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},jc=class extends os{constructor(t,e=Yi,n=us,i,s,o=vn,a=vn,l,c=ur){let h={width:t,height:t,depth:1},f=[h,h,h,h,h,h];super(t,t,e,n,i,s,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},el=class extends si{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Wo=class r extends yi{constructor(t=1,e=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};let a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],h=[],f=[],u=0,d=0;g("z","y","x",-1,-1,n,e,t,o,s,0),g("z","y","x",1,-1,n,e,-t,o,s,1),g("x","z","y",1,1,t,n,e,i,o,2),g("x","z","y",1,-1,t,n,-e,i,o,3),g("x","y","z",1,-1,t,e,n,i,s,4),g("x","y","z",-1,-1,t,e,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new Oi(c,3)),this.setAttribute("normal",new Oi(h,3)),this.setAttribute("uv",new Oi(f,2));function g(_,p,m,b,A,y,S,w,E,v,T){let C=y/E,L=S/v,N=y/2,z=S/2,I=w/2,B=E+1,X=v+1,k=0,K=0,q=new Z;for(let R=0;R<X;R++){let j=R*L-z;for(let Tt=0;Tt<B;Tt++){let Et=Tt*C-N;q[_]=Et*b,q[p]=j*A,q[m]=I,c.push(q.x,q.y,q.z),q[_]=0,q[p]=0,q[m]=w>0?1:-1,h.push(q.x,q.y,q.z),f.push(Tt/E),f.push(1-R/v),k+=1}}for(let R=0;R<v;R++)for(let j=0;j<E;j++){let Tt=u+j+B*R,Et=u+j+B*(R+1),Wt=u+(j+1)+B*(R+1),Ht=u+(j+1)+B*R;l.push(Tt,Et,Ht),l.push(Et,Wt,Ht),K+=6}a.addGroup(d,K,T),d+=K,u+=k}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var nl=class r extends yi{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let s=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,f=t/a,u=e/l,d=[],g=[],_=[],p=[];for(let m=0;m<h;m++){let b=m*u-o;for(let A=0;A<c;A++){let y=A*f-s;g.push(y,-b,0),_.push(0,0,1),p.push(A/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let b=0;b<a;b++){let A=b+c*m,y=b+c*(m+1),S=b+1+c*(m+1),w=b+1+c*m;d.push(A,y,w),d.push(y,S,w)}this.setIndex(d),this.setAttribute("position",new Oi(g,3)),this.setAttribute("normal",new Oi(_,3)),this.setAttribute("uv",new Oi(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.widthSegments,t.heightSegments)}};function $s(r){let t={};for(let e in r){t[e]={};for(let n in r[e]){let i=r[e][n];if(Ug(i))i.isRenderTargetTexture?(Xt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(Ug(i[0])){let s=[];for(let o=0,a=i.length;o<a;o++)s[o]=i[o].clone();t[e][n]=s}else t[e][n]=i.slice();else t[e][n]=i}}return t}function Fn(r){let t={};for(let e=0;e<r.length;e++){let n=$s(r[e]);for(let i in n)t[i]=n[i]}return t}function Ug(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function Bv(r){let t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function Of(r){let t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ce.workingColorSpace}var T_={clone:$s,merge:Fn},kv=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,zv=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Si=class extends ss{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=kv,this.fragmentShader=zv,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=$s(t.uniforms),this.uniformsGroups=Bv(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new pe().setHex(i.value);break;case"v2":this.uniforms[n].value=new _e().fromArray(i.value);break;case"v3":this.uniforms[n].value=new Z().fromArray(i.value);break;case"v4":this.uniforms[n].value=new He().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Qt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new $e().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},th=class extends Si{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var eh=class extends ss{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=h_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},nh=class extends ss{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Oo(r,t){return!r||r.constructor===t?r:typeof t.BYTES_PER_ELEMENT=="number"?new t(r):Array.prototype.slice.call(r)}function nf(r){return r!==void 0&&r.inTangents!==void 0&&r.outTangents!==void 0}var as=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],s=e[n-1];n:{t:{let o;e:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<s)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=i,i=e[++n],t<i)break t}o=e.length;break e}if(!(t>=s)){let a=e[1];t<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=s,s=e[--n-1],t>=s)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(i=e[n],s=e[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=t*i;for(let o=0;o!==i;++o)e[o]=n[s+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ih=class extends as{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:sf,endingEnd:sf}}intervalChanged_(t,e,n){let i=this.parameterPositions,s=t-2,o=t+1,a=i[s],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case of:s=t,a=2*e-n;break;case af:s=i.length-2,a=e+i[s]-i[s+1];break;default:s=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case of:o=t,l=2*n-e;break;case af:o=1,l=n+i[1]-i[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,f=this._offsetNext,u=this._weightPrev,d=this._weightNext,g=(n-e)/(i-e),_=g*g,p=_*g,m=-u*p+2*u*_-u*g,b=(1+u)*p+(-1.5-2*u)*_+(-.5+u)*g+1,A=(-1-d)*p+(1.5+d)*_+.5*g,y=d*p-d*_;for(let S=0;S!==a;++S)s[S]=m*o[h+S]+b*o[c+S]+A*o[l+S]+y*o[f+S];return s}},rh=class extends as{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(i-e),f=1-h;for(let u=0;u!==a;++u)s[u]=o[c+u]*f+o[l+u]*h;return s}},sh=class extends as{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},oh=class extends as{interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,f=this.outTangents;if(!h||!f){let g=(n-e)/(i-e),_=1-g;for(let p=0;p!==a;++p)s[p]=o[c+p]*_+o[l+p]*g;return s}let u=a*2,d=t-1;for(let g=0;g!==a;++g){let _=o[c+g],p=o[l+g],m=d*u+g*2,b=f[m],A=f[m+1],y=t*u+g*2,S=h[y],w=h[y+1],E=Gv(n,e,b,S,i);s[g]=E_(E,_,A,w,p)}return s}};function E_(r,t,e,n,i){let s=1-r;return s*s*s*t+3*s*s*r*e+3*s*r*r*n+r*r*r*i}function Vv(r,t,e,n,i){let s=1-r;return 3*s*s*(e-t)+6*s*r*(n-e)+3*r*r*(i-n)}function Gv(r,t,e,n,i){let s=(r-t)/(i-t);for(let o=0;o<8;o++){let a=E_(s,t,e,n,i)-r;if(Math.abs(a)<1e-10)break;let l=Vv(s,t,e,n,i);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}var Mi=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Oo(e,this.TimeBufferType),this.values=Oo(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Oo(t.times,Array),values:Oo(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),nf(t.settings)&&(n.settings={inTangents:Oo(t.settings.inTangents,Array),outTangents:Oo(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new sh(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new rh(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ih(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new oh(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case za:e=this.InterpolantFactoryMethodDiscrete;break;case Yc:e=this.InterpolantFactoryMethodLinear;break;case Uc:e=this.InterpolantFactoryMethodSmooth;break;case rf:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Xt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return za;case this.InterpolantFactoryMethodLinear:return Yc;case this.InterpolantFactoryMethodSmooth:return Uc;case this.InterpolantFactoryMethodBezier:return rf}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;nf(this.settings)&&(Fg(this.settings.inTangents,t),Fg(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,s=0,o=i-1;for(;s!==i&&n[s]<t;)++s;for(;o!==-1&&n[o]>e;)--o;if(++o,s!==0||o!==i){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Zt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,s=n.length;s===0&&(Zt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Zt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Zt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(i!==void 0&&xv(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){Zt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Uc,s=t.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(i)l=!0;else{let f=a*n,u=f-n,d=f+n;for(let g=0;g!==n;++g){let _=e[f+g];if(_!==e[u+g]||_!==e[d+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let f=a*n,u=o*n;for(let d=0;d!==n;++d)e[u+d]=e[f+d]}++o}}if(s>0){t[o]=t[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,nf(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function Fg(r,t){for(let e=0,n=r.length;e!==n;e+=2)r[e]*=t}Mi.prototype.ValueTypeName="";Mi.prototype.TimeBufferType=Float32Array;Mi.prototype.ValueBufferType=Float32Array;Mi.prototype.DefaultInterpolation=Yc;var ls=class extends Mi{constructor(t,e,n){super(t,e,n)}};ls.prototype.ValueTypeName="bool";ls.prototype.ValueBufferType=Array;ls.prototype.DefaultInterpolation=za;ls.prototype.InterpolantFactoryMethodLinear=void 0;ls.prototype.InterpolantFactoryMethodSmooth=void 0;var ah=class extends Mi{constructor(t,e,n,i){super(t,e,n,i)}};ah.prototype.ValueTypeName="color";var lh=class extends Mi{constructor(t,e,n,i){super(t,e,n,i)}};lh.prototype.ValueTypeName="number";var ch=class extends as{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(i-e),c=t*a;for(let h=c+a;c!==h;c+=4)fr.slerpFlat(s,0,o,c-a,o,c,l);return s}},il=class extends Mi{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new ch(this.times,this.values,this.getValueSize(),t)}};il.prototype.ValueTypeName="quaternion";il.prototype.InterpolantFactoryMethodSmooth=void 0;var cs=class extends Mi{constructor(t,e,n){super(t,e,n)}};cs.prototype.ValueTypeName="string";cs.prototype.ValueBufferType=Array;cs.prototype.DefaultInterpolation=za;cs.prototype.InterpolantFactoryMethodLinear=void 0;cs.prototype.InterpolantFactoryMethodSmooth=void 0;var hh=class extends Mi{constructor(t,e,n,i){super(t,e,n,i)}};hh.prototype.ValueTypeName="vector";var uh=class{constructor(t,e,n){let i=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,s===!1&&i.onStart!==void 0&&i.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,u=c.length;f<u;f+=2){let d=c[f],g=c[f+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},A_=new uh,dh=class{constructor(t){this.manager=t!==void 0?t:A_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,s){n.load(t,i,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};dh.DEFAULT_MATERIAL_NAME="__DEFAULT";var Dc=new Z,Oc=new fr,cr=new Z,rl=class extends vi{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new $e,this.projectionMatrix=new $e,this.projectionMatrixInverse=new $e,this.coordinateSystem=Xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Dc,Oc,cr),cr.x===1&&cr.y===1&&cr.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Dc,Oc,cr.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Dc,Oc,cr),cr.x===1&&cr.y===1&&cr.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Dc,Oc,cr.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},es=new Z,Bg=new _e,kg=new _e,Un=class extends rl{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Zc*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Od*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Zc*2*Math.atan(Math.tan(Od*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){es.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(es.x,es.y).multiplyScalar(-t/es.z),es.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(es.x,es.y).multiplyScalar(-t/es.z)}getViewSize(t,e){return this.getViewBounds(t,Bg,kg),e.subVectors(kg,Bg)}setViewOffset(t,e,n,i,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Od*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,s=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var sl=class extends rl{constructor(t=-1,e=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}};var Uo=-90,Fo=1,fh=class extends vi{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Un(Uo,Fo,t,e);i.layers=this.layers,this.add(i);let s=new Un(Uo,Fo,t,e);s.layers=this.layers,this.add(s);let o=new Un(Uo,Fo,t,e);o.layers=this.layers,this.add(o);let a=new Un(Uo,Fo,t,e);a.layers=this.layers,this.add(a);let l=new Un(Uo,Fo,t,e);l.layers=this.layers,this.add(l);let c=new Un(Uo,Fo,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,s,o,a,l]=e;for(let c of e)this.remove(c);if(t===Xi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ha)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,s),t.setRenderTarget(n,1,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(f,u,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ph=class extends Un{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Uf="\\[\\]\\.:\\/",Hv=new RegExp("["+Uf+"]","g"),Ff="[^"+Uf+"]",Wv="[^"+Uf.replace("\\.","")+"]",Xv=/((?:WC+[\/:])*)/.source.replace("WC",Ff),qv=/(WCOD+)?/.source.replace("WCOD",Wv),Yv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ff),Zv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ff),Jv=new RegExp("^"+Xv+qv+Yv+Zv+"$"),$v=["material","materials","bones","map"],cf=class{constructor(t,e,n){let i=n||Ue.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Ue=class r{constructor(t,e,n){this.path=e,this.parsedPath=n||r.parseTrackName(e),this.node=r.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new r.Composite(t,e,n):new r(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Hv,"")}static parseTrackName(t){let e=Jv.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);$v.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,s=e.propertyIndex;if(t||(t=r.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Xt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Zt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Zt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Zt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Zt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Zt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[i];if(o===void 0){let c=e.nodeName;Zt("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){Zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ue.Composite=cf;Ue.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ue.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ue.prototype.GetterByBindingType=[Ue.prototype._getValue_direct,Ue.prototype._getValue_array,Ue.prototype._getValue_arrayElement,Ue.prototype._getValue_toArray];Ue.prototype.SetterByBindingTypeAndVersioning=[[Ue.prototype._setValue_direct,Ue.prototype._setValue_direct_setNeedsUpdate,Ue.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ue.prototype._setValue_array,Ue.prototype._setValue_array_setNeedsUpdate,Ue.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ue.prototype._setValue_arrayElement,Ue.prototype._setValue_arrayElement_setNeedsUpdate,Ue.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ue.prototype._setValue_fromArray,Ue.prototype._setValue_fromArray_setNeedsUpdate,Ue.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var $w=new Float32Array(1);var hf=class r{static{r.prototype.isMatrix2=!0}constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let s=this.elements;return s[0]=t,s[2]=e,s[1]=n,s[3]=i,this}};function Bf(r,t,e,n){let i=Kv(n);switch(e){case Rf:return r*t;case If:return r*t/i.components*i.byteLength;case Sh:return r*t/i.components*i.byteLength;case ps:return r*t*2/i.components*i.byteLength;case Mh:return r*t*2/i.components*i.byteLength;case Pf:return r*t*3/i.components*i.byteLength;case Fi:return r*t*4/i.components*i.byteLength;case bh:return r*t*4/i.components*i.byteLength;case hl:case ul:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case dl:case fl:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Th:case Ah:return Math.max(r,16)*Math.max(t,8)/4;case wh:case Eh:return Math.max(r,8)*Math.max(t,8)/2;case Ch:case Rh:case Ih:case Nh:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case Ph:case pl:case Lh:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Dh:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Oh:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case Uh:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case Fh:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case Bh:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case kh:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case zh:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case Vh:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case Gh:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case Hh:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case Wh:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case Xh:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case qh:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case Yh:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case Zh:case Jh:case $h:return Math.ceil(r/4)*Math.ceil(t/4)*16;case Kh:case Qh:return Math.ceil(r/4)*Math.ceil(t/4)*8;case ml:case jh:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Kv(r){switch(r){case bi:case Tf:return{byteLength:1,components:1};case Yo:case Ef:case Ji:return{byteLength:2,components:1};case vh:case yh:return{byteLength:2,components:4};case Yi:case xh:case Zi:return{byteLength:4,components:1};case Af:case Cf:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Xt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function J_(){let r=null,t=!1,e=null,n=null;function i(s,o){n=r.requestAnimationFrame(i),e(s,o)}return{start:function(){t!==!0&&e!==null&&r!==null&&(n=r.requestAnimationFrame(i),t=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function jv(r){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,f=c.byteLength,u=r.createBuffer();r.bindBuffer(l,u),r.bufferData(l,c,h),a.onUploadCallback();let d;if(c instanceof Float32Array)d=r.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=r.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=r.HALF_FLOAT:d=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=r.SHORT;else if(c instanceof Uint32Array)d=r.UNSIGNED_INT;else if(c instanceof Int32Array)d=r.INT;else if(c instanceof Int8Array)d=r.BYTE;else if(c instanceof Uint8Array)d=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,c){let h=l.array,f=l.updateRanges;if(r.bindBuffer(c,a),f.length===0)r.bufferSubData(c,0,h);else{f.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<f.length;d++){let g=f[u],_=f[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,f[u]=_)}f.length=u+1;for(let d=0,g=f.length;d<g;d++){let _=f[d];r.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(r.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:s,update:o}}var ty=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ey=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ny=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,iy=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ry=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sy=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,oy=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ay=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ly=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,cy=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,hy=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,uy=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,dy=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,fy=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,py=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,my=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,gy=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,_y=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,xy=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,vy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,yy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Sy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,My=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,by=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,wy=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ty=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Ey=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ay=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Cy=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ry=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Py="gl_FragColor = linearToOutputTexel( gl_FragColor );",Iy=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ny=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Ly=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Dy=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Oy=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Uy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Fy=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,By=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ky=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zy=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Vy=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Gy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Hy=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Wy=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Xy=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,qy=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Yy=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Zy=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Jy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$y=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ky=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Qy=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,jy=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,tS=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,eS=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,nS=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,iS=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,rS=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sS=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,oS=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,aS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,lS=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,cS=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,hS=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,uS=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,dS=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,fS=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,pS=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,mS=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gS=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,_S=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xS=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,vS=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,yS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,SS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,MS=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,bS=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,wS=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,TS=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ES=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,AS=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,CS=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,RS=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,PS=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,IS=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,NS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,LS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,DS=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,OS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,US=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,FS=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,BS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,kS=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,zS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,VS=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,GS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,HS=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,WS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,XS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,YS=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,ZS=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,JS=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,$S=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,KS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,QS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,tM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,eM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,iM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,oM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,aM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,lM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,cM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,hM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,uM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,pM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,mM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_M=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yM=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,SM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,MM=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,TM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,EM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,AM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,CM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,RM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,PM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,IM=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,NM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,LM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ne={alphahash_fragment:ty,alphahash_pars_fragment:ey,alphamap_fragment:ny,alphamap_pars_fragment:iy,alphatest_fragment:ry,alphatest_pars_fragment:sy,aomap_fragment:oy,aomap_pars_fragment:ay,batching_pars_vertex:ly,batching_vertex:cy,begin_vertex:hy,beginnormal_vertex:uy,bsdfs:dy,iridescence_fragment:fy,bumpmap_pars_fragment:py,clipping_planes_fragment:my,clipping_planes_pars_fragment:gy,clipping_planes_pars_vertex:_y,clipping_planes_vertex:xy,color_fragment:vy,color_pars_fragment:yy,color_pars_vertex:Sy,color_vertex:My,common:by,cube_uv_reflection_fragment:wy,defaultnormal_vertex:Ty,displacementmap_pars_vertex:Ey,displacementmap_vertex:Ay,emissivemap_fragment:Cy,emissivemap_pars_fragment:Ry,colorspace_fragment:Py,colorspace_pars_fragment:Iy,envmap_fragment:Ny,envmap_common_pars_fragment:Ly,envmap_pars_fragment:Dy,envmap_pars_vertex:Oy,envmap_physical_pars_fragment:qy,envmap_vertex:Uy,fog_vertex:Fy,fog_pars_vertex:By,fog_fragment:ky,fog_pars_fragment:zy,gradientmap_pars_fragment:Vy,lightmap_pars_fragment:Gy,lights_lambert_fragment:Hy,lights_lambert_pars_fragment:Wy,lights_pars_begin:Xy,lights_toon_fragment:Yy,lights_toon_pars_fragment:Zy,lights_phong_fragment:Jy,lights_phong_pars_fragment:$y,lights_physical_fragment:Ky,lights_physical_pars_fragment:Qy,lights_fragment_begin:jy,lights_fragment_maps:tS,lights_fragment_end:eS,lightprobes_pars_fragment:nS,logdepthbuf_fragment:iS,logdepthbuf_pars_fragment:rS,logdepthbuf_pars_vertex:sS,logdepthbuf_vertex:oS,map_fragment:aS,map_pars_fragment:lS,map_particle_fragment:cS,map_particle_pars_fragment:hS,metalnessmap_fragment:uS,metalnessmap_pars_fragment:dS,morphinstance_vertex:fS,morphcolor_vertex:pS,morphnormal_vertex:mS,morphtarget_pars_vertex:gS,morphtarget_vertex:_S,normal_fragment_begin:xS,normal_fragment_maps:vS,normal_pars_fragment:yS,normal_pars_vertex:SS,normal_vertex:MS,normalmap_pars_fragment:bS,clearcoat_normal_fragment_begin:wS,clearcoat_normal_fragment_maps:TS,clearcoat_pars_fragment:ES,iridescence_pars_fragment:AS,opaque_fragment:CS,packing:RS,premultiplied_alpha_fragment:PS,project_vertex:IS,dithering_fragment:NS,dithering_pars_fragment:LS,roughnessmap_fragment:DS,roughnessmap_pars_fragment:OS,shadowmap_pars_fragment:US,shadowmap_pars_vertex:FS,shadowmap_vertex:BS,shadowmask_pars_fragment:kS,skinbase_vertex:zS,skinning_pars_vertex:VS,skinning_vertex:GS,skinnormal_vertex:HS,specularmap_fragment:WS,specularmap_pars_fragment:XS,tonemapping_fragment:qS,tonemapping_pars_fragment:YS,transmission_fragment:ZS,transmission_pars_fragment:JS,uv_pars_fragment:$S,uv_pars_vertex:KS,uv_vertex:QS,worldpos_vertex:jS,background_vert:tM,background_frag:eM,backgroundCube_vert:nM,backgroundCube_frag:iM,cube_vert:rM,cube_frag:sM,depth_vert:oM,depth_frag:aM,distance_vert:lM,distance_frag:cM,equirect_vert:hM,equirect_frag:uM,linedashed_vert:dM,linedashed_frag:fM,meshbasic_vert:pM,meshbasic_frag:mM,meshlambert_vert:gM,meshlambert_frag:_M,meshmatcap_vert:xM,meshmatcap_frag:vM,meshnormal_vert:yM,meshnormal_frag:SM,meshphong_vert:MM,meshphong_frag:bM,meshphysical_vert:wM,meshphysical_frag:TM,meshtoon_vert:EM,meshtoon_frag:AM,points_vert:CM,points_frag:RM,shadow_vert:PM,shadow_frag:IM,sprite_vert:NM,sprite_frag:LM},bt={common:{diffuse:{value:new pe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qt}},envmap:{envMap:{value:null},envMapRotation:{value:new Qt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qt},normalScale:{value:new _e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new pe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new Z},probesMax:{value:new Z},probesResolution:{value:new Z}},points:{diffuse:{value:new pe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0},uvTransform:{value:new Qt}},sprite:{diffuse:{value:new pe(16777215)},opacity:{value:1},center:{value:new _e(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}}},_r={basic:{uniforms:Fn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.fog]),vertexShader:ne.meshbasic_vert,fragmentShader:ne.meshbasic_frag},lambert:{uniforms:Fn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new pe(0)},envMapIntensity:{value:1}}]),vertexShader:ne.meshlambert_vert,fragmentShader:ne.meshlambert_frag},phong:{uniforms:Fn([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new pe(0)},specular:{value:new pe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ne.meshphong_vert,fragmentShader:ne.meshphong_frag},standard:{uniforms:Fn([bt.common,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.roughnessmap,bt.metalnessmap,bt.fog,bt.lights,{emissive:{value:new pe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag},toon:{uniforms:Fn([bt.common,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.gradientmap,bt.fog,bt.lights,{emissive:{value:new pe(0)}}]),vertexShader:ne.meshtoon_vert,fragmentShader:ne.meshtoon_frag},matcap:{uniforms:Fn([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,{matcap:{value:null}}]),vertexShader:ne.meshmatcap_vert,fragmentShader:ne.meshmatcap_frag},points:{uniforms:Fn([bt.points,bt.fog]),vertexShader:ne.points_vert,fragmentShader:ne.points_frag},dashed:{uniforms:Fn([bt.common,bt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ne.linedashed_vert,fragmentShader:ne.linedashed_frag},depth:{uniforms:Fn([bt.common,bt.displacementmap]),vertexShader:ne.depth_vert,fragmentShader:ne.depth_frag},normal:{uniforms:Fn([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,{opacity:{value:1}}]),vertexShader:ne.meshnormal_vert,fragmentShader:ne.meshnormal_frag},sprite:{uniforms:Fn([bt.sprite,bt.fog]),vertexShader:ne.sprite_vert,fragmentShader:ne.sprite_frag},background:{uniforms:{uvTransform:{value:new Qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ne.background_vert,fragmentShader:ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qt}},vertexShader:ne.backgroundCube_vert,fragmentShader:ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ne.cube_vert,fragmentShader:ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ne.equirect_vert,fragmentShader:ne.equirect_frag},distance:{uniforms:Fn([bt.common,bt.displacementmap,{referencePosition:{value:new Z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ne.distance_vert,fragmentShader:ne.distance_frag},shadow:{uniforms:Fn([bt.lights,bt.fog,{color:{value:new pe(0)},opacity:{value:1}}]),vertexShader:ne.shadow_vert,fragmentShader:ne.shadow_frag}};_r.physical={uniforms:Fn([_r.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qt},clearcoatNormalScale:{value:new _e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qt},sheen:{value:0},sheenColor:{value:new pe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qt},transmissionSamplerSize:{value:new _e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qt},attenuationDistance:{value:0},attenuationColor:{value:new pe(0)},specularColor:{value:new pe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qt},anisotropyVector:{value:new _e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qt}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag};var nu={r:0,b:0,g:0},DM=new $e,$_=new Qt;$_.set(-1,0,0,0,1,0,0,0,1);function OM(r,t,e,n,i,s){let o=new pe(0),a=i===!0?0:1,l,c,h=null,f=0,u=null;function d(b){let A=b.isScene===!0?b.background:null;if(A&&A.isTexture){let y=b.backgroundBlurriness>0;A=t.get(A,y)}return A}function g(b){let A=!1,y=d(b);y===null?p(o,a):y&&y.isColor&&(p(y,1),A=!0);let S=r.xr.getEnvironmentBlendMode();S==="additive"?e.buffers.color.setClear(0,0,0,1,s):S==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,s),(r.autoClear||A)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function _(b,A){let y=d(A);y&&(y.isCubeTexture||y.mapping===ll)?(c===void 0&&(c=new Ui(new Wo(1,1,1),new Si({name:"BackgroundCubeMaterial",uniforms:$s(_r.backgroundCube.uniforms),vertexShader:_r.backgroundCube.vertexShader,fragmentShader:_r.backgroundCube.fragmentShader,side:Qn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,w,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(DM.makeRotationFromEuler(A.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply($_),c.material.toneMapped=ce.getTransfer(y.colorSpace)!==Me,(h!==y||f!==y.version||u!==r.toneMapping)&&(c.material.needsUpdate=!0,h=y,f=y.version,u=r.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Ui(new nl(2,2),new Si({name:"BackgroundMaterial",uniforms:$s(_r.background.uniforms),vertexShader:_r.background.vertexShader,fragmentShader:_r.background.fragmentShader,side:hs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=ce.getTransfer(y.colorSpace)!==Me,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||f!==y.version||u!==r.toneMapping)&&(l.material.needsUpdate=!0,h=y,f=y.version,u=r.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function p(b,A){b.getRGB(nu,Of(r)),e.buffers.color.setClear(nu.r,nu.g,nu.b,A,s)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,A=1){o.set(b),a=A,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(b){a=b,p(o,a)},render:g,addToRenderList:_,dispose:m}}function UM(r,t){let e=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=u(null),s=i,o=!1;function a(L,N,z,I,B){let X=!1,k=f(L,I,z,N);s!==k&&(s=k,c(s.object)),X=d(L,I,z,B),X&&g(L,I,z,B),B!==null&&t.update(B,r.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,y(L,N,z,I),B!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function l(){return r.createVertexArray()}function c(L){return r.bindVertexArray(L)}function h(L){return r.deleteVertexArray(L)}function f(L,N,z,I){let B=I.wireframe===!0,X=n[N.id];X===void 0&&(X={},n[N.id]=X);let k=L.isInstancedMesh===!0?L.id:0,K=X[k];K===void 0&&(K={},X[k]=K);let q=K[z.id];q===void 0&&(q={},K[z.id]=q);let R=q[B];return R===void 0&&(R=u(l()),q[B]=R),R}function u(L){let N=[],z=[],I=[];for(let B=0;B<e;B++)N[B]=0,z[B]=0,I[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:z,attributeDivisors:I,object:L,attributes:{},index:null}}function d(L,N,z,I){let B=s.attributes,X=N.attributes,k=0,K=z.getAttributes();for(let q in K)if(K[q].location>=0){let j=B[q],Tt=X[q];if(Tt===void 0&&(q==="instanceMatrix"&&L.instanceMatrix&&(Tt=L.instanceMatrix),q==="instanceColor"&&L.instanceColor&&(Tt=L.instanceColor)),j===void 0||j.attribute!==Tt||Tt&&j.data!==Tt.data)return!0;k++}return s.attributesNum!==k||s.index!==I}function g(L,N,z,I){let B={},X=N.attributes,k=0,K=z.getAttributes();for(let q in K)if(K[q].location>=0){let j=X[q];j===void 0&&(q==="instanceMatrix"&&L.instanceMatrix&&(j=L.instanceMatrix),q==="instanceColor"&&L.instanceColor&&(j=L.instanceColor));let Tt={};Tt.attribute=j,j&&j.data&&(Tt.data=j.data),B[q]=Tt,k++}s.attributes=B,s.attributesNum=k,s.index=I}function _(){let L=s.newAttributes;for(let N=0,z=L.length;N<z;N++)L[N]=0}function p(L){m(L,0)}function m(L,N){let z=s.newAttributes,I=s.enabledAttributes,B=s.attributeDivisors;z[L]=1,I[L]===0&&(r.enableVertexAttribArray(L),I[L]=1),B[L]!==N&&(r.vertexAttribDivisor(L,N),B[L]=N)}function b(){let L=s.newAttributes,N=s.enabledAttributes;for(let z=0,I=N.length;z<I;z++)N[z]!==L[z]&&(r.disableVertexAttribArray(z),N[z]=0)}function A(L,N,z,I,B,X,k){k===!0?r.vertexAttribIPointer(L,N,z,B,X):r.vertexAttribPointer(L,N,z,I,B,X)}function y(L,N,z,I){_();let B=I.attributes,X=z.getAttributes(),k=N.defaultAttributeValues;for(let K in X){let q=X[K];if(q.location>=0){let R=B[K];if(R===void 0&&(K==="instanceMatrix"&&L.instanceMatrix&&(R=L.instanceMatrix),K==="instanceColor"&&L.instanceColor&&(R=L.instanceColor)),R!==void 0){let j=R.normalized,Tt=R.itemSize,Et=t.get(R);if(Et===void 0)continue;let Wt=Et.buffer,Ht=Et.type,qt=Et.bytesPerElement,J=Ht===r.INT||Ht===r.UNSIGNED_INT||R.gpuType===xh;if(R.isInterleavedBufferAttribute){let tt=R.data,yt=tt.stride,Vt=R.offset;if(tt.isInstancedInterleavedBuffer){for(let xt=0;xt<q.locationSize;xt++)m(q.location+xt,tt.meshPerAttribute);L.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let xt=0;xt<q.locationSize;xt++)p(q.location+xt);r.bindBuffer(r.ARRAY_BUFFER,Wt);for(let xt=0;xt<q.locationSize;xt++)A(q.location+xt,Tt/q.locationSize,Ht,j,yt*qt,(Vt+Tt/q.locationSize*xt)*qt,J)}else{if(R.isInstancedBufferAttribute){for(let tt=0;tt<q.locationSize;tt++)m(q.location+tt,R.meshPerAttribute);L.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=R.meshPerAttribute*R.count)}else for(let tt=0;tt<q.locationSize;tt++)p(q.location+tt);r.bindBuffer(r.ARRAY_BUFFER,Wt);for(let tt=0;tt<q.locationSize;tt++)A(q.location+tt,Tt/q.locationSize,Ht,j,Tt*qt,Tt/q.locationSize*tt*qt,J)}}else if(k!==void 0){let j=k[K];if(j!==void 0)switch(j.length){case 2:r.vertexAttrib2fv(q.location,j);break;case 3:r.vertexAttrib3fv(q.location,j);break;case 4:r.vertexAttrib4fv(q.location,j);break;default:r.vertexAttrib1fv(q.location,j)}}}}b()}function S(){T();for(let L in n){let N=n[L];for(let z in N){let I=N[z];for(let B in I){let X=I[B];for(let k in X)h(X[k].object),delete X[k];delete I[B]}}delete n[L]}}function w(L){if(n[L.id]===void 0)return;let N=n[L.id];for(let z in N){let I=N[z];for(let B in I){let X=I[B];for(let k in X)h(X[k].object),delete X[k];delete I[B]}}delete n[L.id]}function E(L){for(let N in n){let z=n[N];for(let I in z){let B=z[I];if(B[L.id]===void 0)continue;let X=B[L.id];for(let k in X)h(X[k].object),delete X[k];delete B[L.id]}}}function v(L){for(let N in n){let z=n[N],I=L.isInstancedMesh===!0?L.id:0,B=z[I];if(B!==void 0){for(let X in B){let k=B[X];for(let K in k)h(k[K].object),delete k[K];delete B[X]}delete z[I],Object.keys(z).length===0&&delete n[N]}}}function T(){C(),o=!0,s!==i&&(s=i,c(s.object))}function C(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:T,resetDefaultState:C,dispose:S,releaseStatesOfGeometry:w,releaseStatesOfObject:v,releaseStatesOfProgram:E,initAttributes:_,enableAttribute:p,disableUnusedAttributes:b}}function FM(r,t,e){let n;function i(l){n=l}function s(l,c){r.drawArrays(n,l,c),e.update(c,n,1)}function o(l,c,h){h!==0&&(r.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let d=0;d<h;d++)u+=c[d];e.update(u,n,1)}this.setMode=i,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function BM(r,t,e,n){let i;function s(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let E=t.get("EXT_texture_filter_anisotropic");i=r.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(E){return!(E!==Fi&&n.convert(E)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){let v=E===Ji&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==bi&&E!==Zi&&!v&&n.convert(E)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE))}function l(E){if(E==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Xt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Xt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=r.getParameter(r.MAX_TEXTURE_SIZE),p=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),m=r.getParameter(r.MAX_VERTEX_ATTRIBS),b=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),A=r.getParameter(r.MAX_VARYING_VECTORS),y=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),S=r.getParameter(r.MAX_SAMPLES),w=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:b,maxVaryings:A,maxFragmentUniforms:y,maxSamples:S,samples:w}}function kM(r){let t=this,e=null,n=0,i=!1,s=!1,o=new Wi,a=new Qt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){let d=f.length!==0||u||n!==0||i;return i=u,n=f.length,d},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,d){let g=f.clippingPlanes,_=f.clipIntersection,p=f.clipShadows,m=r.get(f);if(!i||g===null||g.length===0||s&&!p)s?h(null):c();else{let b=s?0:n,A=b*4,y=m.clippingState||null;l.value=y,y=h(g,u,A,d);for(let S=0;S!==A;++S)y[S]=e[S];m.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(f,u,d,g){let _=f!==null?f.length:0,p=null;if(_!==0){if(p=l.value,g!==!0||p===null){let m=d+_*4,b=u.matrixWorldInverse;a.getNormalMatrix(b),(p===null||p.length<m)&&(p=new Float32Array(m));for(let A=0,y=d;A!==_;++A,y+=4)o.copy(f[A]).applyMatrix4(b,a),o.normal.toArray(p,y),p[y+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,p}}var $o=4,zM=6,VM=20,GM=256,_l=new sl,C_=new pe,kf=null,zf=0,Vf=0,Gf=!1,HM=new Z,Ks=new Z,ru=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,i=100,s={}){let{size:o=256,position:a=HM}=s;kf=this._renderer.getRenderTarget(),zf=this._renderer.getActiveCubeFace(),Vf=this._renderer.getActiveMipmapLevel(),Gf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,i,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=I_(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=P_(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(kf,zf,Vf),this._renderer.xr.enabled=Gf,t.scissorTest=!1,Jo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===us||t.mapping===Js?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),kf=this._renderer.getRenderTarget(),zf=this._renderer.getActiveCubeFace(),Vf=this._renderer.getActiveMipmapLevel(),Gf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:bn,minFilter:bn,generateMipmaps:!1,type:Ji,format:Fi,colorSpace:Va,depthBuffer:!1},i=R_(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=R_(t,e,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=WM(s)),this._blurMaterial=qM(s,t,e),this._ggxMaterial=XM(s,t,e)}return i}_compileMaterial(t){let e=new Ui(new yi,t);this._renderer.compile(e,_l)}_sceneToCubeUV(t,e,n,i,s){let l=new Un(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],f=this._renderer,u=f.autoClear,d=f.toneMapping;f.getClearColor(C_),f.toneMapping=qi,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(i),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ui(new Wo,new Ka({name:"PMREM.Background",side:Qn,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,p=_.material,m=!1,b=t.background;b?b.isColor&&(p.color.copy(b),t.background=null,m=!0):(p.color.copy(C_),m=!0);for(let A=0;A<6;A++){let y=A%3;y===0?(l.up.set(0,c[A],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+h[A],s.y,s.z)):y===1?(l.up.set(0,0,c[A]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+h[A],s.z)):(l.up.set(0,c[A],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+h[A]));let S=this._cubeSize;Jo(i,y*S,A>2?S:0,S,S),f.setRenderTarget(i),m&&f.render(_,l),f.render(t,l)}f.toneMapping=d,f.autoClear=u,t.background=b}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===us||t.mapping===Js;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=I_()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=P_());let s=i?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=t;let l=this._cubeSize;Jo(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,_l)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let s=1;s<i;s++)this._applyGGXFilter(t,s-1,s);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),f=Math.sqrt(c*c-h*h),u=c*1.25,d=f*u,{_lodMax:g}=this,_=this._sizeLods[n],p=3*_*(n>g-$o?n-g+$o:0),m=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=g-e,Jo(s,p,m,3*_,2*_),i.setRenderTarget(s),i.render(a,_l),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=g-n,Jo(t,p,m,3*_,2*_),i.setRenderTarget(t),i.render(a,_l)}_blur(t,e,n,i){let s=this._pingPongRenderTarget,o=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,s,e,n,o),this._blurPass(s,t,n,n,o)}_blurPass(t,e,n,i,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[i];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=s,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[i],f=3*h*(i>this._lodMax-$o?i-this._lodMax+$o:0),u=4*(this._cubeSize-h);Jo(e,f,u,3*h,2*h),o.setRenderTarget(e),o.render(l,_l)}};function WM(r){let t=[],e=[],n=r,i=r-$o+1+zM;for(let s=0;s<i;s++){let o=Math.pow(2,n);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,u=6,d=3,g=new Float32Array(d*u*f),_=new Float32Array(d*u*f);for(let m=0;m<f;m++){let b=m%3*2/3-1,A=m>2?0:-1,y=[b,A,0,b+2/3,A,0,b+2/3,A+1,0,b,A,0,b+2/3,A+1,0,b,A+1,0];g.set(y,d*u*m);for(let S=0;S<u;S++){let w=h[S*2]*2-1,E=h[S*2+1]*2-1;m===0?Ks.set(1,E,w):m===1?Ks.set(-w,1,-E):m===2?Ks.set(-w,E,1):m===3?Ks.set(-1,E,-w):m===4?Ks.set(-w,-1,E):Ks.set(w,E,-1),Ks.toArray(_,(m*u+S)*d)}}let p=new yi;p.setAttribute("position",new Kn(g,d)),p.setAttribute("outputDirection",new Kn(_,d)),e.push(new Ui(p,null)),n>$o&&n--}return{lodMeshes:e,sizeLods:t}}function R_(r,t,e){let n=new oi(r,t,e);return n.texture.mapping=ll,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Jo(r,t,e,n,i){r.viewport.set(t,e,n,i),r.scissor.set(t,e,n,i)}function XM(r,t,e){return new Si({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:GM,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:au(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:mr,depthTest:!1,depthWrite:!1})}function qM(r,t,e){return new Si({name:"SphericalGaussianBlur",defines:{SAMPLES:VM,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:au(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:mr,depthTest:!1,depthWrite:!1})}function P_(){return new Si({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:au(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:mr,depthTest:!1,depthWrite:!1})}function I_(){return new Si({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:au(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:mr,depthTest:!1,depthWrite:!1})}function au(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var su=class extends oi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new tl(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Wo(5,5,5),s=new Si({name:"CubemapFromEquirect",uniforms:$s(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qn,blending:mr});s.uniforms.tEquirect.value=e;let o=new Ui(i,s),a=e.minFilter;return e.minFilter===ds&&(e.minFilter=bn),new fh(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(s)}};function YM(r){let t=new WeakMap,e=new WeakMap,n=null;function i(u,d=!1){return u==null?null:d?o(u):s(u)}function s(u){if(u&&u.isTexture){let d=u.mapping;if(d===mh||d===gh)if(t.has(u)){let g=t.get(u).texture;return a(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let _=new su(g.height);return _.fromEquirectangularTexture(r,u),t.set(u,_),u.addEventListener("dispose",c),a(_.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){let d=u.mapping,g=d===mh||d===gh,_=d===us||d===Js;if(g||_){let p=e.get(u),m=p!==void 0?p.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return n===null&&(n=new ru(r)),p=g?n.fromEquirectangular(u,p):n.fromCubemap(u,p),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),p.texture;if(p!==void 0)return p.texture;{let b=u.image;return g&&b&&b.height>0||_&&b&&l(b)?(n===null&&(n=new ru(r)),p=g?n.fromEquirectangular(u):n.fromCubemap(u),p.texture.pmremVersion=u.pmremVersion,e.set(u,p),u.addEventListener("dispose",h),p.texture):null}}}return u}function a(u,d){return d===mh?u.mapping=us:d===gh&&(u.mapping=Js),u}function l(u){let d=0,g=6;for(let _=0;_<g;_++)u[_]!==void 0&&d++;return d===g}function c(u){let d=u.target;d.removeEventListener("dispose",c);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function h(u){let d=u.target;d.removeEventListener("dispose",h);let g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:f}}function ZM(r){let t={};function e(n){if(t[n]!==void 0)return t[n];let i=r.getExtension(n);return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let i=e(n);return i===null&&qs("WebGLRenderer: "+n+" extension not supported."),i}}}function JM(r,t,e,n){let i={},s=new WeakMap;function o(f){let u=f.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete i[u.id];let d=s.get(u);d&&(t.remove(d),s.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(f,u){return i[u.id]===!0||(u.addEventListener("dispose",o),i[u.id]=!0,e.memory.geometries++),u}function l(f){let u=f.attributes;for(let d in u)t.update(u[d],r.ARRAY_BUFFER)}function c(f){let u=[],d=f.index,g=f.attributes.position,_=0;if(g===void 0)return;if(d!==null){let b=d.array;_=d.version;for(let A=0,y=b.length;A<y;A+=3){let S=b[A+0],w=b[A+1],E=b[A+2];u.push(S,w,w,E,E,S)}}else{let b=g.array;_=g.version;for(let A=0,y=b.length/3-1;A<y;A+=3){let S=A+0,w=A+1,E=A+2;u.push(S,w,w,E,E,S)}}let p=new(g.count>=65535?Ja:Za)(u,1);p.version=_;let m=s.get(f);m&&t.remove(m),s.set(f,p)}function h(f){let u=s.get(f);if(u){let d=f.index;d!==null&&u.version<d.version&&c(f)}else c(f);return s.get(f)}return{get:a,update:l,getWireframeAttribute:h}}function $M(r,t,e){let n;function i(f){n=f}let s,o;function a(f){s=f.type,o=f.bytesPerElement}function l(f,u){r.drawElements(n,u,s,f*o),e.update(u,n,1)}function c(f,u,d){d!==0&&(r.drawElementsInstanced(n,u,s,f*o,d),e.update(u,n,d))}function h(f,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,s,f,0,d);let _=0;for(let p=0;p<d;p++)_+=u[p];e.update(_,n,1)}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function KM(r){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:Zt("WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function QM(r,t,e){let n=new WeakMap,i=new He;function s(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=h!==void 0?h.length:0,u=n.get(a);if(u===void 0||u.count!==f){let T=function(){E.dispose(),n.delete(a),a.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();let d=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],A=0;d===!0&&(A=1),g===!0&&(A=2),_===!0&&(A=3);let y=a.attributes.position.count*A,S=1;y>t.maxTextureSize&&(S=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let w=new Float32Array(y*S*4*f),E=new Xa(w,y,S,f);E.type=Zi,E.needsUpdate=!0;let v=A*4;for(let C=0;C<f;C++){let L=p[C],N=m[C],z=b[C],I=y*S*4*C;for(let B=0;B<L.count;B++){let X=B*v;d===!0&&(i.fromBufferAttribute(L,B),w[I+X+0]=i.x,w[I+X+1]=i.y,w[I+X+2]=i.z,w[I+X+3]=0),g===!0&&(i.fromBufferAttribute(N,B),w[I+X+4]=i.x,w[I+X+5]=i.y,w[I+X+6]=i.z,w[I+X+7]=0),_===!0&&(i.fromBufferAttribute(z,B),w[I+X+8]=i.x,w[I+X+9]=i.y,w[I+X+10]=i.z,w[I+X+11]=z.itemSize===4?i.w:1)}}u={count:f,texture:E,size:new _e(y,S)},n.set(a,u),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",o.morphTexture,e);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];let g=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(r,"morphTargetBaseInfluence",g),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(r,"morphTargetsTextureSize",u.size)}return{update:s}}function jM(r,t,e,n,i){let s=new WeakMap;function o(c){let h=i.render.frame,f=c.geometry,u=t.get(c,f);if(s.get(u)!==h&&(t.update(u),s.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==h&&(e.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,r.ARRAY_BUFFER),s.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;s.get(d)!==h&&(d.update(),s.set(d,h))}return u}function a(){s=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var tb={[_f]:"LINEAR_TONE_MAPPING",[xf]:"REINHARD_TONE_MAPPING",[vf]:"CINEON_TONE_MAPPING",[yf]:"ACES_FILMIC_TONE_MAPPING",[Mf]:"AGX_TONE_MAPPING",[bf]:"NEUTRAL_TONE_MAPPING",[Sf]:"CUSTOM_TONE_MAPPING"};function eb(r,t,e,n,i,s){let o=new oi(t,e,{type:r,depthBuffer:i,stencilBuffer:s,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new yi;c.setAttribute("position",new Oi([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Oi([0,2,0,0,2,0],2));let h=new th({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Ui(c,h),u=new sl(-1,1,1,-1,0,1),d=null,g=null,_=!1,p,m=null,b=[],A=!1;this.setSize=function(y,S){o.setSize(y,S),a!==null&&a.setSize(y,S),l!==null&&l.setSize(y,S);for(let w=0;w<b.length;w++){let E=b[w];E.setSize&&E.setSize(y,S)}},this.setEffects=function(y){b=y,A=b.length>0&&b[0].isRenderPass===!0;let S=o.width,w=o.height;b.length>0&&a===null&&(a=new oi(S,w,{type:Ji,depthBuffer:!1,stencilBuffer:!1}),l=new oi(S,w,{type:Ji,depthBuffer:!1,stencilBuffer:!1}));for(let E=0;E<b.length;E++){let v=b[E];v.setSize&&v.setSize(S,w)}},this.begin=function(y,S){if(_||y.toneMapping===qi&&b.length===0)return!1;if(m=S,S!==null){let w=S.width,E=S.height;(o.width!==w||o.height!==E)&&this.setSize(w,E)}return A===!1&&y.setRenderTarget(o),p=y.toneMapping,y.toneMapping=qi,!0},this.hasRenderPass=function(){return A},this.end=function(y,S){y.toneMapping=p,_=!0;let w=o,E=a;for(let v=0;v<b.length;v++){let T=b[v];T.enabled!==!1&&(T.render(y,E,w,S),T.needsSwap!==!1&&(w=E,E=E===a?l:a))}if(d!==y.outputColorSpace||g!==y.toneMapping){d=y.outputColorSpace,g=y.toneMapping,h.defines={},ce.getTransfer(d)===Me&&(h.defines.SRGB_TRANSFER="");let v=tb[g];v&&(h.defines[v]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,y.setRenderTarget(m),y.render(f,u),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var K_=new si,Xf=new os(1,1),Q_=new Xa,j_=new Kc,t0=new tl,N_=[],L_=[],D_=new Float32Array(16),O_=new Float32Array(9),U_=new Float32Array(4);function Qo(r,t,e){let n=r[0];if(n<=0||n>0)return r;let i=t*e,s=N_[i];if(s===void 0&&(s=new Float32Array(i),N_[i]=s),t!==0){n.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function dn(r,t){if(r.length!==t.length)return!1;for(let e=0,n=r.length;e<n;e++)if(r[e]!==t[e])return!1;return!0}function fn(r,t){for(let e=0,n=t.length;e<n;e++)r[e]=t[e]}function lu(r,t){let e=L_[t];e===void 0&&(e=new Int32Array(t),L_[t]=e);for(let n=0;n!==t;++n)e[n]=r.allocateTextureUnit();return e}function nb(r,t){let e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function ib(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(dn(e,t))return;r.uniform2fv(this.addr,t),fn(e,t)}}function rb(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(dn(e,t))return;r.uniform3fv(this.addr,t),fn(e,t)}}function sb(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(dn(e,t))return;r.uniform4fv(this.addr,t),fn(e,t)}}function ob(r,t){let e=this.cache,n=t.elements;if(n===void 0){if(dn(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),fn(e,t)}else{if(dn(e,n))return;U_.set(n),r.uniformMatrix2fv(this.addr,!1,U_),fn(e,n)}}function ab(r,t){let e=this.cache,n=t.elements;if(n===void 0){if(dn(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),fn(e,t)}else{if(dn(e,n))return;O_.set(n),r.uniformMatrix3fv(this.addr,!1,O_),fn(e,n)}}function lb(r,t){let e=this.cache,n=t.elements;if(n===void 0){if(dn(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),fn(e,t)}else{if(dn(e,n))return;D_.set(n),r.uniformMatrix4fv(this.addr,!1,D_),fn(e,n)}}function cb(r,t){let e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function hb(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(dn(e,t))return;r.uniform2iv(this.addr,t),fn(e,t)}}function ub(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(dn(e,t))return;r.uniform3iv(this.addr,t),fn(e,t)}}function db(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(dn(e,t))return;r.uniform4iv(this.addr,t),fn(e,t)}}function fb(r,t){let e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function pb(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(dn(e,t))return;r.uniform2uiv(this.addr,t),fn(e,t)}}function mb(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(dn(e,t))return;r.uniform3uiv(this.addr,t),fn(e,t)}}function gb(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(dn(e,t))return;r.uniform4uiv(this.addr,t),fn(e,t)}}function _b(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(Xf.compareFunction=e.isReversedDepthBuffer()?eu:tu,s=Xf):s=K_,e.setTexture2D(t||s,i)}function xb(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||j_,i)}function vb(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||t0,i)}function yb(r,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Q_,i)}function Sb(r){switch(r){case 5126:return nb;case 35664:return ib;case 35665:return rb;case 35666:return sb;case 35674:return ob;case 35675:return ab;case 35676:return lb;case 5124:case 35670:return cb;case 35667:case 35671:return hb;case 35668:case 35672:return ub;case 35669:case 35673:return db;case 5125:return fb;case 36294:return pb;case 36295:return mb;case 36296:return gb;case 35678:case 36198:case 36298:case 36306:case 35682:return _b;case 35679:case 36299:case 36307:return xb;case 35680:case 36300:case 36308:case 36293:return vb;case 36289:case 36303:case 36311:case 36292:return yb}}function Mb(r,t){r.uniform1fv(this.addr,t)}function bb(r,t){let e=Qo(t,this.size,2);r.uniform2fv(this.addr,e)}function wb(r,t){let e=Qo(t,this.size,3);r.uniform3fv(this.addr,e)}function Tb(r,t){let e=Qo(t,this.size,4);r.uniform4fv(this.addr,e)}function Eb(r,t){let e=Qo(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function Ab(r,t){let e=Qo(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function Cb(r,t){let e=Qo(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function Rb(r,t){r.uniform1iv(this.addr,t)}function Pb(r,t){r.uniform2iv(this.addr,t)}function Ib(r,t){r.uniform3iv(this.addr,t)}function Nb(r,t){r.uniform4iv(this.addr,t)}function Lb(r,t){r.uniform1uiv(this.addr,t)}function Db(r,t){r.uniform2uiv(this.addr,t)}function Ob(r,t){r.uniform3uiv(this.addr,t)}function Ub(r,t){r.uniform4uiv(this.addr,t)}function Fb(r,t,e){let n=this.cache,i=t.length,s=lu(e,i);dn(n,s)||(r.uniform1iv(this.addr,s),fn(n,s));let o;this.type===r.SAMPLER_2D_SHADOW?o=Xf:o=K_;for(let a=0;a!==i;++a)e.setTexture2D(t[a]||o,s[a])}function Bb(r,t,e){let n=this.cache,i=t.length,s=lu(e,i);dn(n,s)||(r.uniform1iv(this.addr,s),fn(n,s));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||j_,s[o])}function kb(r,t,e){let n=this.cache,i=t.length,s=lu(e,i);dn(n,s)||(r.uniform1iv(this.addr,s),fn(n,s));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||t0,s[o])}function zb(r,t,e){let n=this.cache,i=t.length,s=lu(e,i);dn(n,s)||(r.uniform1iv(this.addr,s),fn(n,s));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||Q_,s[o])}function Vb(r){switch(r){case 5126:return Mb;case 35664:return bb;case 35665:return wb;case 35666:return Tb;case 35674:return Eb;case 35675:return Ab;case 35676:return Cb;case 5124:case 35670:return Rb;case 35667:case 35671:return Pb;case 35668:case 35672:return Ib;case 35669:case 35673:return Nb;case 5125:return Lb;case 36294:return Db;case 36295:return Ob;case 36296:return Ub;case 35678:case 36198:case 36298:case 36306:case 35682:return Fb;case 35679:case 36299:case 36307:return Bb;case 35680:case 36300:case 36308:case 36293:return kb;case 36289:case 36303:case 36311:case 36292:return zb}}var qf=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Sb(e.type)}},Yf=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Vb(e.type)}},Zf=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let s=0,o=i.length;s!==o;++s){let a=i[s];a.setValue(t,e[a.id],n)}}},Hf=/(\w+)(\])?(\[|\.)?/g;function F_(r,t){r.seq.push(t),r.map[t.id]=t}function Gb(r,t,e){let n=r.name,i=n.length;for(Hf.lastIndex=0;;){let s=Hf.exec(n),o=Hf.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){F_(e,c===void 0?new qf(a,r,t):new Yf(a,r,t));break}else{let f=e.map[a];f===void 0&&(f=new Zf(a),F_(e,f)),e=f}}}var Ko=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);Gb(a,l,this)}let i=[],s=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?i.push(o):s.push(o);i.length>0&&(this.seq=i.concat(s))}setValue(t,e,n,i){let s=this.map[e];s!==void 0&&s.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let s=0,o=e.length;s!==o;++s){let a=e[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,s=t.length;i!==s;++i){let o=t[i];o.id in e&&n.push(o)}return n}};function B_(r,t,e){let n=r.createShader(t);return r.shaderSource(n,e),r.compileShader(n),n}var Hb=37297,Wb=0;function Xb(r,t){let e=r.split(`
`),n=[],i=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=i;o<s;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var k_=new Qt;function qb(r){ce._getMatrix(k_,ce.workingColorSpace,r);let t=`mat3( ${k_.elements.map(e=>e.toFixed(4))} )`;switch(ce.getTransfer(r)){case Ga:return[t,"LinearTransferOETF"];case Me:return[t,"sRGBTransferOETF"];default:return Xt("WebGLProgram: Unsupported color space: ",r),[t,"LinearTransferOETF"]}}function z_(r,t,e){let n=r.getShaderParameter(t,r.COMPILE_STATUS),s=(r.getShaderInfoLog(t)||"").trim();if(n&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+s+`

`+Xb(r.getShaderSource(t),a)}else return s}function Yb(r,t){let e=qb(t);return[`vec4 ${r}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Zb={[_f]:"Linear",[xf]:"Reinhard",[vf]:"Cineon",[yf]:"ACESFilmic",[Mf]:"AgX",[bf]:"Neutral",[Sf]:"Custom"};function Jb(r,t){let e=Zb[t];return e===void 0?(Xt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var iu=new Z;function $b(){ce.getLuminanceCoefficients(iu);let r=iu.x.toFixed(4),t=iu.y.toFixed(4),e=iu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Kb(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vl).join(`
`)}function Qb(r){let t=[];for(let e in r){let n=r[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function jb(r,t){let e={},n=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let s=r.getActiveAttrib(t,i),o=s.name,a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function vl(r){return r!==""}function V_(r,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function G_(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var t1=/^[ \t]*#include +<([\w\d./]+)>/gm;function Jf(r){return r.replace(t1,n1)}var e1=new Map;function n1(r,t){let e=ne[t];if(e===void 0){let n=e1.get(t);if(n!==void 0)e=ne[n],Xt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Jf(e)}var i1=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function H_(r){return r.replace(i1,r1)}function r1(r,t,e,n){let i="";for(let s=parseInt(t);s<parseInt(e);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function W_(r){let t=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var s1={[ol]:"SHADOWMAP_TYPE_PCF",[Xo]:"SHADOWMAP_TYPE_VSM"};function o1(r){return s1[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var a1={[us]:"ENVMAP_TYPE_CUBE",[Js]:"ENVMAP_TYPE_CUBE",[ll]:"ENVMAP_TYPE_CUBE_UV"};function l1(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":a1[r.envMapMode]||"ENVMAP_TYPE_CUBE"}var c1={[Js]:"ENVMAP_MODE_REFRACTION"};function h1(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":c1[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}var u1={[gf]:"ENVMAP_BLENDING_MULTIPLY",[a_]:"ENVMAP_BLENDING_MIX",[l_]:"ENVMAP_BLENDING_ADD"};function d1(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":u1[r.combine]||"ENVMAP_BLENDING_NONE"}function f1(r){let t=r.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function p1(r,t,e,n){let i=r.getContext(),s=e.defines,o=e.vertexShader,a=e.fragmentShader,l=o1(e),c=l1(e),h=h1(e),f=d1(e),u=f1(e),d=Kb(e),g=Qb(s),_=i.createProgram(),p,m,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(vl).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(vl).join(`
`),m.length>0&&(m+=`
`)):(p=[W_(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vl).join(`
`),m=[W_(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==qi?"#define TONE_MAPPING":"",e.toneMapping!==qi?ne.tonemapping_pars_fragment:"",e.toneMapping!==qi?Jb("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ne.colorspace_pars_fragment,Yb("linearToOutputTexel",e.outputColorSpace),$b(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(vl).join(`
`)),o=Jf(o),o=V_(o,e),o=G_(o,e),a=Jf(a),a=V_(a,e),a=G_(a,e),o=H_(o),a=H_(a),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,p=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Lf?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Lf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let A=b+p+o,y=b+m+a,S=B_(i,i.VERTEX_SHADER,A),w=B_(i,i.FRAGMENT_SHADER,y);i.attachShader(_,S),i.attachShader(_,w),e.index0AttributeName!==void 0?i.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function E(L){if(r.debug.checkShaderErrors){let N=i.getProgramInfoLog(_)||"",z=i.getShaderInfoLog(S)||"",I=i.getShaderInfoLog(w)||"",B=N.trim(),X=z.trim(),k=I.trim(),K=!0,q=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(K=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,_,S,w);else{let R=z_(i,S,"vertex"),j=z_(i,w,"fragment");Zt("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+B+`
`+R+`
`+j)}else B!==""?Xt("WebGLProgram: Program Info Log:",B):(X===""||k==="")&&(q=!1);q&&(L.diagnostics={runnable:K,programLog:B,vertexShader:{log:X,prefix:p},fragmentShader:{log:k,prefix:m}})}i.deleteShader(S),i.deleteShader(w),v=new Ko(i,_),T=jb(i,_)}let v;this.getUniforms=function(){return v===void 0&&E(this),v};let T;this.getAttributes=function(){return T===void 0&&E(this),T};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=i.getProgramParameter(_,Hb)),C},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Wb++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=S,this.fragmentShader=w,this}var m1=0,$f=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);return i.has(e)===!1&&(i.add(e),e.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Kf(t),e.set(t,n)),n}},Kf=class{constructor(t){this.id=m1++,this.code=t,this.usedTimes=0}};function g1(r){return r===ps||r===pl||r===ml}function _1(r,t,e,n,i,s){let o=new qa,a=new $f,l=new Set,c=[],h=new Map,f=n.logarithmicDepthBuffer,u=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function _(v,T,C,L,N,z){let I=L.fog,B=N.geometry,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,k=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,K=t.get(v.envMap||X,k),q=K&&K.mapping===ll?K.image.height:null,R=d[v.type];v.precision!==null&&(u=n.getMaxPrecision(v.precision),u!==v.precision&&Xt("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));let j=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Tt=j!==void 0?j.length:0,Et=0;B.morphAttributes.position!==void 0&&(Et=1),B.morphAttributes.normal!==void 0&&(Et=2),B.morphAttributes.color!==void 0&&(Et=3);let Wt,Ht,qt,J;if(R){let Ft=_r[R];Wt=Ft.vertexShader,Ht=Ft.fragmentShader}else{Wt=v.vertexShader,Ht=v.fragmentShader;let Ft=a.getVertexShaderStage(v),st=a.getFragmentShaderStage(v);a.update(v,Ft,st),qt=Ft.id,J=st.id}let tt=r.getRenderTarget(),yt=r.state.buffers.depth.getReversed(),Vt=N.isInstancedMesh===!0,xt=N.isBatchedMesh===!0,kt=!!v.map,Gt=!!v.matcap,Dt=!!K,Jt=!!v.aoMap,te=!!v.lightMap,V=!!v.bumpMap&&v.wireframe===!1,se=!!v.normalMap,we=!!v.displacementMap,ke=!!v.emissiveMap,$t=!!v.metalnessMap,ve=!!v.roughnessMap,U=v.anisotropy>0,Fe=v.clearcoat>0,Yt=v.dispersion>0,P=v.retroreflectivity>0,x=v.iridescence>0,F=v.sheen>0,H=v.transmission>0,$=U&&!!v.anisotropyMap,ht=Fe&&!!v.clearcoatMap,at=Fe&&!!v.clearcoatNormalMap,Q=Fe&&!!v.clearcoatRoughnessMap,nt=x&&!!v.iridescenceMap,mt=x&&!!v.iridescenceThicknessMap,Pt=F&&!!v.sheenColorMap,gt=F&&!!v.sheenRoughnessMap,pt=!!v.specularMap,ct=!!v.specularColorMap,Ot=!!v.specularIntensityMap,zt=H&&!!v.transmissionMap,D=H&&!!v.thicknessMap,ft=!!v.gradientMap,et=!!v.alphaMap,_t=v.alphaTest>0,St=!!v.alphaHash,it=!!v.extensions,lt=qi;v.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(lt=r.toneMapping);let rt={shaderID:R,shaderType:v.type,shaderName:v.name,vertexShader:Wt,fragmentShader:Ht,defines:v.defines,customVertexShaderID:qt,customFragmentShaderID:J,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:xt,batchingColor:xt&&N._colorsTexture!==null,instancing:Vt,instancingColor:Vt&&N.instanceColor!==null,instancingMorph:Vt&&N.morphTexture!==null,outputColorSpace:tt===null?r.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:ce.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:kt,matcap:Gt,envMap:Dt,envMapMode:Dt&&K.mapping,envMapCubeUVHeight:q,aoMap:Jt,lightMap:te,bumpMap:V,normalMap:se,displacementMap:we,emissiveMap:ke,normalMapObjectSpace:se&&v.normalMapType===u_,normalMapTangentSpace:se&&v.normalMapType===Nf,packedNormalMap:se&&v.normalMapType===Nf&&g1(v.normalMap.format),metalnessMap:$t,roughnessMap:ve,anisotropy:U,anisotropyMap:$,clearcoat:Fe,clearcoatMap:ht,clearcoatNormalMap:at,clearcoatRoughnessMap:Q,dispersion:Yt,retroreflection:P,iridescence:x,iridescenceMap:nt,iridescenceThicknessMap:mt,sheen:F,sheenColorMap:Pt,sheenRoughnessMap:gt,specularMap:pt,specularColorMap:ct,specularIntensityMap:Ot,transmission:H,transmissionMap:zt,thicknessMap:D,gradientMap:ft,opaque:v.transparent===!1&&v.blending===qo&&v.alphaToCoverage===!1,alphaMap:et,alphaTest:_t,alphaHash:St,combine:v.combine,mapUv:kt&&g(v.map.channel),aoMapUv:Jt&&g(v.aoMap.channel),lightMapUv:te&&g(v.lightMap.channel),bumpMapUv:V&&g(v.bumpMap.channel),normalMapUv:se&&g(v.normalMap.channel),displacementMapUv:we&&g(v.displacementMap.channel),emissiveMapUv:ke&&g(v.emissiveMap.channel),metalnessMapUv:$t&&g(v.metalnessMap.channel),roughnessMapUv:ve&&g(v.roughnessMap.channel),anisotropyMapUv:$&&g(v.anisotropyMap.channel),clearcoatMapUv:ht&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:at&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:nt&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:mt&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:Pt&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:gt&&g(v.sheenRoughnessMap.channel),specularMapUv:pt&&g(v.specularMap.channel),specularColorMapUv:ct&&g(v.specularColorMap.channel),specularIntensityMapUv:Ot&&g(v.specularIntensityMap.channel),transmissionMapUv:zt&&g(v.transmissionMap.channel),thicknessMapUv:D&&g(v.thicknessMap.channel),alphaMapUv:et&&g(v.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(se||U),vertexNormals:!!B.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!B.attributes.uv&&(kt||et),fog:!!I,useFog:v.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||B.attributes.normal===void 0&&se===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:yt,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Tt,morphTextureStride:Et,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:v.dithering,shadowMapEnabled:r.shadowMap.enabled&&C.length>0,shadowMapType:r.shadowMap.type,toneMapping:lt,decodeVideoTexture:kt&&v.map.isVideoTexture===!0&&ce.getTransfer(v.map.colorSpace)===Me,decodeVideoTextureEmissive:ke&&v.emissiveMap.isVideoTexture===!0&&ce.getTransfer(v.emissiveMap.colorSpace)===Me,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===pr,flipSided:v.side===Qn,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:it&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(it&&v.extensions.multiDraw===!0||xt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return rt.vertexUv1s=l.has(1),rt.vertexUv2s=l.has(2),rt.vertexUv3s=l.has(3),l.clear(),rt}function p(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let C in v.defines)T.push(C),T.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(m(T,v),b(T,v),T.push(r.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function m(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numSunLights),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numSunLightShadows),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function b(v,T){o.disableAll(),T.instancing&&o.enable(0),T.instancingColor&&o.enable(1),T.instancingMorph&&o.enable(2),T.matcap&&o.enable(3),T.envMap&&o.enable(4),T.normalMapObjectSpace&&o.enable(5),T.normalMapTangentSpace&&o.enable(6),T.clearcoat&&o.enable(7),T.iridescence&&o.enable(8),T.alphaTest&&o.enable(9),T.vertexColors&&o.enable(10),T.vertexAlphas&&o.enable(11),T.vertexUv1s&&o.enable(12),T.vertexUv2s&&o.enable(13),T.vertexUv3s&&o.enable(14),T.vertexTangents&&o.enable(15),T.anisotropy&&o.enable(16),T.alphaHash&&o.enable(17),T.batching&&o.enable(18),T.dispersion&&o.enable(19),T.retroreflection&&o.enable(24),T.batchingColor&&o.enable(20),T.gradientMap&&o.enable(21),T.packedNormalMap&&o.enable(22),T.vertexNormals&&o.enable(23),v.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.reversedDepthBuffer&&o.enable(4),T.skinning&&o.enable(5),T.morphTargets&&o.enable(6),T.morphNormals&&o.enable(7),T.morphColors&&o.enable(8),T.premultipliedAlpha&&o.enable(9),T.shadowMapEnabled&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),T.decodeVideoTextureEmissive&&o.enable(20),T.alphaToCoverage&&o.enable(21),T.numLightProbeGrids>0&&o.enable(22),T.hasPositionAttribute&&o.enable(23),v.push(o.mask)}function A(v){let T=d[v.type],C;if(T){let L=_r[T];C=T_.clone(L.uniforms)}else C=v.uniforms;return C}function y(v,T){let C=h.get(T);return C!==void 0?++C.usedTimes:(C=new p1(r,T,v,i),c.push(C),h.set(T,C)),C}function S(v){if(--v.usedTimes===0){let T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function w(v){a.remove(v)}function E(){a.dispose()}return{getParameters:_,getProgramCacheKey:p,getUniforms:A,acquireProgram:y,releaseProgram:S,releaseShaderCache:w,programs:c,dispose:E}}function x1(){let r=new WeakMap;function t(o){return r.has(o)}function e(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function n(o){r.delete(o)}function i(o,a,l){r.get(o)[a]=l}function s(){r=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:s}}function v1(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.materialVariant!==t.materialVariant?r.materialVariant-t.materialVariant:r.z!==t.z?r.z-t.z:r.id-t.id}function X_(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function q_(){let r=[],t=0,e=[],n=[],i=[];function s(){t=0,e.length=0,n.length=0,i.length=0}function o(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function a(u,d,g,_,p,m){let b=r[t];return b===void 0?(b={id:u.id,object:u,geometry:d,material:g,materialVariant:o(u),groupOrder:_,renderOrder:u.renderOrder,z:p,group:m},r[t]=b):(b.id=u.id,b.object=u,b.geometry=d,b.material=g,b.materialVariant=o(u),b.groupOrder=_,b.renderOrder=u.renderOrder,b.z=p,b.group=m),t++,b}function l(u,d,g,_,p,m,b){b.reversedDepth===!0&&(p=-p);let A=a(u,d,g,_,p,m);g.transmission>0?n.push(A):g.transparent===!0?i.push(A):e.push(A)}function c(u,d,g,_,p,m){let b=a(u,d,g,_,p,m);g.transmission>0?n.unshift(b):g.transparent===!0?i.unshift(b):e.unshift(b)}function h(u,d){e.length>1&&e.sort(u||v1),n.length>1&&n.sort(d||X_),i.length>1&&i.sort(d||X_)}function f(){for(let u=t,d=r.length;u<d;u++){let g=r[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:i,init:s,push:l,unshift:c,finish:f,sort:h}}function y1(){let r=new WeakMap;function t(n,i){let s=r.get(n),o;return s===void 0?(o=new q_,r.set(n,[o])):i>=s.length?(o=new q_,s.push(o)):o=s[i],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function S1(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new Z,color:new pe};break;case"SpotLight":e={position:new Z,direction:new Z,color:new pe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new Z,color:new pe,distance:0,decay:0};break;case"HemisphereLight":e={direction:new Z,skyColor:new pe,groundColor:new pe};break;case"RectAreaLight":e={color:new pe,position:new Z,halfWidth:new Z,halfHeight:new Z};break}return r[t.id]=e,e}}}function M1(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}var b1=0;function w1(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function T1(r){let t=new S1,e=M1(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new Z);let i=new Z,s=new $e,o=new $e;function a(c){let h=0,f=0,u=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let d=0,g=0,_=0,p=0,m=0,b=0,A=0,y=0,S=0,w=0,E=0,v=0,T=0,C=0;c.sort(w1);for(let N=0,z=c.length;N<z;N++){let I=c[N],B=I.color,X=I.intensity,k=I.distance,K=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===ps?K=I.shadow.map.texture:K=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=B.r*X,f+=B.g*X,u+=B.b*X;else if(I.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(I.sh.coefficients[q],X);C++}else if(I.isSunLight){let q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let R=I.shadow,j=e.get(I);j.shadowIntensity=R.intensity,j.shadowBias=R.bias,j.shadowNormalBias=R.normalBias,j.shadowRadius=R.radius,j.shadowMapSize.copy(R.mapSize).multiply(R.getFrameExtents()),n.sunShadow[g]=j,n.sunShadowMap[g]=K;let Tt=R.getViewportCount();for(let Et=0;Et<Tt;Et++)n.sunShadowMatrix[_+Et]=R.getMatrix(Et),n.sunShadowCascade[_+Et]=R._cascadeData[Et];_+=Tt,g++}n.sun[d]=q,d++}else if(I.isDirectionalLight){let q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let R=I.shadow,j=e.get(I);j.shadowIntensity=R.intensity,j.shadowBias=R.bias,j.shadowNormalBias=R.normalBias,j.shadowRadius=R.radius,j.shadowMapSize=R.mapSize,n.directionalShadow[p]=j,n.directionalShadowMap[p]=K,n.directionalShadowMatrix[p]=I.shadow.matrix,S++}n.directional[p]=q,p++}else if(I.isSpotLight){let q=t.get(I);q.position.setFromMatrixPosition(I.matrixWorld),q.color.copy(B).multiplyScalar(X),q.distance=k,q.coneCos=Math.cos(I.angle),q.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),q.decay=I.decay,n.spot[b]=q;let R=I.shadow;if(I.map&&(n.spotLightMap[v]=I.map,v++,R.updateMatrices(I),I.castShadow&&T++),n.spotLightMatrix[b]=R.matrix,I.castShadow){let j=e.get(I);j.shadowIntensity=R.intensity,j.shadowBias=R.bias,j.shadowNormalBias=R.normalBias,j.shadowRadius=R.radius,j.shadowMapSize=R.mapSize,n.spotShadow[b]=j,n.spotShadowMap[b]=K,E++}b++}else if(I.isRectAreaLight){let q=t.get(I);q.color.copy(B).multiplyScalar(X),q.halfWidth.set(I.width*.5,0,0),q.halfHeight.set(0,I.height*.5,0),n.rectArea[A]=q,A++}else if(I.isPointLight){let q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),q.distance=I.distance,q.decay=I.decay,I.castShadow){let R=I.shadow,j=e.get(I);j.shadowIntensity=R.intensity,j.shadowBias=R.bias,j.shadowNormalBias=R.normalBias,j.shadowRadius=R.radius,j.shadowMapSize=R.mapSize,j.shadowCameraNear=R.camera.near,j.shadowCameraFar=R.camera.far,n.pointShadow[m]=j,n.pointShadowMap[m]=K,n.pointShadowMatrix[m]=I.shadow.matrix,w++}n.point[m]=q,m++}else if(I.isHemisphereLight){let q=t.get(I);q.skyColor.copy(I.color).multiplyScalar(X),q.groundColor.copy(I.groundColor).multiplyScalar(X),n.hemi[y]=q,y++}}A>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=bt.LTC_FLOAT_1,n.rectAreaLTC2=bt.LTC_FLOAT_2):(n.rectAreaLTC1=bt.LTC_HALF_1,n.rectAreaLTC2=bt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=u;let L=n.hash;(L.sunLength!==d||L.directionalLength!==p||L.pointLength!==m||L.spotLength!==b||L.rectAreaLength!==A||L.hemiLength!==y||L.numSunShadows!==g||L.numDirectionalShadows!==S||L.numPointShadows!==w||L.numSpotShadows!==E||L.numSpotMaps!==v||L.numLightProbes!==C)&&(n.sun.length=d,n.directional.length=p,n.spot.length=b,n.rectArea.length=A,n.point.length=m,n.hemi.length=y,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.directionalShadowMatrix.length=S,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=E,n.spotShadowMap.length=E,n.spotLightMatrix.length=E+v-T,n.spotLightMap.length=v,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=C,L.sunLength=d,L.directionalLength=p,L.pointLength=m,L.spotLength=b,L.rectAreaLength=A,L.hemiLength=y,L.numSunShadows=g,L.numDirectionalShadows=S,L.numPointShadows=w,L.numSpotShadows=E,L.numSpotMaps=v,L.numLightProbes=C,n.version=b1++)}function l(c,h){let f=0,u=0,d=0,g=0,_=0,p=0,m=h.matrixWorldInverse;for(let b=0,A=c.length;b<A;b++){let y=c[b];if(y.isSunLight){let S=n.sun[f];S.direction.setFromMatrixPosition(y.matrixWorld),S.direction.transformDirection(m),f++}else if(y.isDirectionalLight){let S=n.directional[u];S.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(m),u++}else if(y.isSpotLight){let S=n.spot[g];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(m),g++}else if(y.isRectAreaLight){let S=n.rectArea[_];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),o.identity(),s.copy(y.matrixWorld),s.premultiply(m),o.extractRotation(s),S.halfWidth.set(y.width*.5,0,0),S.halfHeight.set(0,y.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),_++}else if(y.isPointLight){let S=n.point[d];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),d++}else if(y.isHemisphereLight){let S=n.hemi[p];S.direction.setFromMatrixPosition(y.matrixWorld),S.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:n}}function Y_(r){let t=new T1(r),e=[],n=[],i=[];function s(u){f.camera=u,e.length=0,n.length=0,i.length=0}function o(u){e.push(u)}function a(u){n.push(u)}function l(u){i.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let f={lightsArray:e,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:f,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function E1(r){let t=new WeakMap;function e(i,s=0){let o=t.get(i),a;return o===void 0?(a=new Y_(r),t.set(i,[a])):s>=o.length?(a=new Y_(r),o.push(a)):a=o[s],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var A1=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,C1=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,R1=[new Z(1,0,0),new Z(-1,0,0),new Z(0,1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1)],P1=[new Z(0,-1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1),new Z(0,-1,0),new Z(0,-1,0)],Z_=new $e,xl=new Z,Wf=new Z;function I1(r,t,e){let n=new Qa,i=new _e,s=new _e,o=new He,a=new eh,l=new nh,c={},h=e.maxTextureSize,f={[hs]:Qn,[Qn]:hs,[pr]:pr},u=new Si({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _e},radius:{value:4}},vertexShader:A1,fragmentShader:C1}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let g=new yi;g.setAttribute("position",new Kn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Ui(g,u),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ol;let m=this.type;this.render=function(w,E,v){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;this.type===Gg&&(Xt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ol);let T=r.getRenderTarget(),C=r.getActiveCubeFace(),L=r.getActiveMipmapLevel(),N=r.state;N.setBlending(mr),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let z=m!==this.type;z&&E.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(B=>B.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,B=w.length;I<B;I++){let X=w[I],k=X.shadow;if(k===void 0){Xt("WebGLShadowMap:",X,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;i.copy(k.mapSize);let K=k.getFrameExtents();i.multiply(K),s.copy(k.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(s.x=Math.floor(h/K.x),i.x=s.x*K.x,k.mapSize.x=s.x),i.y>h&&(s.y=Math.floor(h/K.y),i.y=s.y*K.y,k.mapSize.y=s.y));let q=r.state.buffers.depth.getReversed();if(k.camera._reversedDepth=q,k.map===null||z===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===Xo){if(X.isPointLight){Xt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new oi(i.x,i.y,{format:ps,type:Ji,minFilter:bn,magFilter:bn,generateMipmaps:!1}),k.map.texture.name=X.name+".shadowMap",k.map.depthTexture=new os(i.x,i.y,Zi),k.map.depthTexture.name=X.name+".shadowMapDepth",k.map.depthTexture.format=ur,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=vn,k.map.depthTexture.magFilter=vn}else X.isPointLight?(k.map=new su(i.x),k.map.depthTexture=new jc(i.x,Yi)):(k.map=new oi(i.x,i.y),k.map.depthTexture=new os(i.x,i.y,Yi)),k.map.depthTexture.name=X.name+".shadowMap",k.map.depthTexture.format=ur,this.type===ol?(k.map.depthTexture.compareFunction=q?eu:tu,k.map.depthTexture.minFilter=bn,k.map.depthTexture.magFilter=bn):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=vn,k.map.depthTexture.magFilter=vn);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==i.x||k.map.height!==i.y)&&k.map.setSize(i.x,i.y);let R=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();X.isPointLight!==!0&&k.updateMatrices(X,v);for(let j=0;j<R;j++){let Tt=k.getCamera(j);if(X.isPointLight){let Et=k.camera,Wt=k.matrix,Ht=X.distance||Et.far;Ht!==Et.far&&(Et.far=Ht,Et.updateProjectionMatrix()),xl.setFromMatrixPosition(X.matrixWorld),Et.position.copy(xl),Wf.copy(Et.position),Wf.add(R1[j]),Et.up.copy(P1[j]),Et.lookAt(Wf),Et.updateMatrixWorld(),Wt.makeTranslation(-xl.x,-xl.y,-xl.z),Z_.multiplyMatrices(Et.projectionMatrix,Et.matrixWorldInverse),k._frustum.setFromProjectionMatrix(Z_,Et.coordinateSystem,Et.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)r.setRenderTarget(k.map,j),r.clear();else{j===0&&(r.setRenderTarget(k.map),r.clear());let Et=k.getViewport(j);o.set(s.x*Et.x,s.y*Et.y,s.x*Et.z,s.y*Et.w),N.viewport(o)}n=k.getFrustum(j),y(E,v,Tt,X,this.type)}k.isPointLightShadow!==!0&&this.type===Xo&&b(k,v),k.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(T,C,L)};function b(w,E){let v=t.update(_);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null?w.mapPass=new oi(i.x,i.y,{format:ps,type:Ji}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value.set(w.map.width,w.map.height),u.uniforms.radius.value=w.radius,r.setRenderTarget(w.mapPass),r.clear(),r.renderBufferDirect(E,null,v,u,_,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value.set(w.map.width,w.map.height),d.uniforms.radius.value=w.radius,r.setRenderTarget(w.map),r.clear(),r.renderBufferDirect(E,null,v,d,_,null)}function A(w,E,v,T){let C=null,L=v.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(L!==void 0)C=L;else if(C=v.isPointLight===!0?l:a,r.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let N=C.uuid,z=E.uuid,I=c[N];I===void 0&&(I={},c[N]=I);let B=I[z];B===void 0&&(B=C.clone(),I[z]=B,E.addEventListener("dispose",S)),C=B}if(C.visible=E.visible,C.wireframe=E.wireframe,T===Xo?C.side=E.shadowSide!==null?E.shadowSide:E.side:C.side=E.shadowSide!==null?E.shadowSide:f[E.side],C.alphaMap=E.alphaMap,C.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,C.map=E.map,C.clipShadows=E.clipShadows,C.clippingPlanes=E.clippingPlanes,C.clipIntersection=E.clipIntersection,C.displacementMap=E.displacementMap,C.displacementScale=E.displacementScale,C.displacementBias=E.displacementBias,C.wireframeLinewidth=E.wireframeLinewidth,C.linewidth=E.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let N=r.properties.get(C);N.light=v}return C}function y(w,E,v,T,C){if(w.visible===!1)return;if(w.layers.test(E.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&C===Xo)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,w.matrixWorld);let z=t.update(w),I=w.material;if(Array.isArray(I)){let B=z.groups;for(let X=0,k=B.length;X<k;X++){let K=B[X],q=I[K.materialIndex];if(q&&q.visible){let R=A(w,q,T,C);w.onBeforeShadow(r,w,E,v,z,R,K),r.renderBufferDirect(v,null,z,R,w,K),w.onAfterShadow(r,w,E,v,z,R,K)}}}else if(I.visible){let B=A(w,I,T,C);w.onBeforeShadow(r,w,E,v,z,B,null),r.renderBufferDirect(v,null,z,B,w,null),w.onAfterShadow(r,w,E,v,z,B,null)}}let N=w.children;for(let z=0,I=N.length;z<I;z++)y(N[z],E,v,T,C)}function S(w){w.target.removeEventListener("dispose",S);for(let v in c){let T=c[v],C=w.target.uuid;C in T&&(T[C].dispose(),delete T[C])}}}function N1(r,t){function e(){let D=!1,ft=new He,et=null,_t=new He(0,0,0,0);return{setMask:function(St){et!==St&&!D&&(r.colorMask(St,St,St,St),et=St)},setLocked:function(St){D=St},setClear:function(St,it,lt,rt,Ft){Ft===!0&&(St*=rt,it*=rt,lt*=rt),ft.set(St,it,lt,rt),_t.equals(ft)===!1&&(r.clearColor(St,it,lt,rt),_t.copy(ft))},reset:function(){D=!1,et=null,_t.set(-1,0,0,0)}}}function n(){let D=!1,ft=!1,et=null,_t=null,St=null;return{setReversed:function(it){if(ft!==it){let lt=t.get("EXT_clip_control");it?lt.clipControlEXT(lt.LOWER_LEFT_EXT,lt.ZERO_TO_ONE_EXT):lt.clipControlEXT(lt.LOWER_LEFT_EXT,lt.NEGATIVE_ONE_TO_ONE_EXT),ft=it;let rt=St;St=null,this.setClear(rt)}},getReversed:function(){return ft},setTest:function(it){it?tt(r.DEPTH_TEST):yt(r.DEPTH_TEST)},setMask:function(it){et!==it&&!D&&(r.depthMask(it),et=it)},setFunc:function(it){if(ft&&(it=b_[it]),_t!==it){switch(it){case Bc:r.depthFunc(r.NEVER);break;case kc:r.depthFunc(r.ALWAYS);break;case zc:r.depthFunc(r.LESS);break;case ko:r.depthFunc(r.LEQUAL);break;case Vc:r.depthFunc(r.EQUAL);break;case Gc:r.depthFunc(r.GEQUAL);break;case Hc:r.depthFunc(r.GREATER);break;case Wc:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}_t=it}},setLocked:function(it){D=it},setClear:function(it){St!==it&&(St=it,ft&&(it=1-it),r.clearDepth(it))},reset:function(){D=!1,et=null,_t=null,St=null,ft=!1}}}function i(){let D=!1,ft=null,et=null,_t=null,St=null,it=null,lt=null,rt=null,Ft=null;return{setTest:function(st){D||(st?tt(r.STENCIL_TEST):yt(r.STENCIL_TEST))},setMask:function(st){ft!==st&&!D&&(r.stencilMask(st),ft=st)},setFunc:function(st,Bt,It){(et!==st||_t!==Bt||St!==It)&&(r.stencilFunc(st,Bt,It),et=st,_t=Bt,St=It)},setOp:function(st,Bt,It){(it!==st||lt!==Bt||rt!==It)&&(r.stencilOp(st,Bt,It),it=st,lt=Bt,rt=It)},setLocked:function(st){D=st},setClear:function(st){Ft!==st&&(r.clearStencil(st),Ft=st)},reset:function(){D=!1,ft=null,et=null,_t=null,St=null,it=null,lt=null,rt=null,Ft=null}}}let s=new e,o=new n,a=new i,l=new WeakMap,c=new WeakMap,h={},f={},u={},d=new WeakMap,g=[],_=null,p=!1,m=null,b=null,A=null,y=null,S=null,w=null,E=null,v=new pe(0,0,0),T=0,C=!1,L=null,N=null,z=null,I=null,B=null,X=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,K=0,q=r.getParameter(r.VERSION);q.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(q)[1]),k=K>=1):q.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),k=K>=2);let R=null,j={},Tt=r.getParameter(r.SCISSOR_BOX),Et=r.getParameter(r.VIEWPORT),Wt=new He().fromArray(Tt),Ht=new He().fromArray(Et);function qt(D,ft,et,_t){let St=new Uint8Array(4),it=r.createTexture();r.bindTexture(D,it),r.texParameteri(D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(D,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let lt=0;lt<et;lt++)D===r.TEXTURE_3D||D===r.TEXTURE_2D_ARRAY?r.texImage3D(ft,0,r.RGBA,1,1,_t,0,r.RGBA,r.UNSIGNED_BYTE,St):r.texImage2D(ft+lt,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,St);return it}let J={};J[r.TEXTURE_2D]=qt(r.TEXTURE_2D,r.TEXTURE_2D,1),J[r.TEXTURE_CUBE_MAP]=qt(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[r.TEXTURE_2D_ARRAY]=qt(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),J[r.TEXTURE_3D]=qt(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),tt(r.DEPTH_TEST),o.setFunc(ko),V(!1),se(uf),tt(r.CULL_FACE),Jt(mr);function tt(D){h[D]!==!0&&(r.enable(D),h[D]=!0)}function yt(D){h[D]!==!1&&(r.disable(D),h[D]=!1)}function Vt(D,ft){return u[D]!==ft?(r.bindFramebuffer(D,ft),u[D]=ft,D===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=ft),D===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=ft),!0):!1}function xt(D,ft){let et=g,_t=!1;if(D){et=d.get(ft),et===void 0&&(et=[],d.set(ft,et));let St=D.textures;if(et.length!==St.length||et[0]!==r.COLOR_ATTACHMENT0){for(let it=0,lt=St.length;it<lt;it++)et[it]=r.COLOR_ATTACHMENT0+it;et.length=St.length,_t=!0}}else et[0]!==r.BACK&&(et[0]=r.BACK,_t=!0);_t&&r.drawBuffers(et)}function kt(D){return _!==D?(r.useProgram(D),_=D,!0):!1}let Gt={[Zs]:r.FUNC_ADD,[Wg]:r.FUNC_SUBTRACT,[Xg]:r.FUNC_REVERSE_SUBTRACT};Gt[qg]=r.MIN,Gt[Yg]=r.MAX;let Dt={[Zg]:r.ZERO,[Jg]:r.ONE,[$g]:r.SRC_COLOR,[pf]:r.SRC_ALPHA,[n_]:r.SRC_ALPHA_SATURATE,[t_]:r.DST_COLOR,[Qg]:r.DST_ALPHA,[Kg]:r.ONE_MINUS_SRC_COLOR,[mf]:r.ONE_MINUS_SRC_ALPHA,[e_]:r.ONE_MINUS_DST_COLOR,[jg]:r.ONE_MINUS_DST_ALPHA,[i_]:r.CONSTANT_COLOR,[r_]:r.ONE_MINUS_CONSTANT_COLOR,[s_]:r.CONSTANT_ALPHA,[o_]:r.ONE_MINUS_CONSTANT_ALPHA};function Jt(D,ft,et,_t,St,it,lt,rt,Ft,st){if(D===mr){p===!0&&(yt(r.BLEND),p=!1);return}if(p===!1&&(tt(r.BLEND),p=!0),D!==Hg){if(D!==m||st!==C){if((b!==Zs||S!==Zs)&&(r.blendEquation(r.FUNC_ADD),b=Zs,S=Zs),st)switch(D){case qo:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case al:r.blendFunc(r.ONE,r.ONE);break;case df:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case ff:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Zt("WebGLState: Invalid blending: ",D);break}else switch(D){case qo:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case al:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case df:Zt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ff:Zt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Zt("WebGLState: Invalid blending: ",D);break}A=null,y=null,w=null,E=null,v.set(0,0,0),T=0,m=D,C=st}return}St=St||ft,it=it||et,lt=lt||_t,(ft!==b||St!==S)&&(r.blendEquationSeparate(Gt[ft],Gt[St]),b=ft,S=St),(et!==A||_t!==y||it!==w||lt!==E)&&(r.blendFuncSeparate(Dt[et],Dt[_t],Dt[it],Dt[lt]),A=et,y=_t,w=it,E=lt),(rt.equals(v)===!1||Ft!==T)&&(r.blendColor(rt.r,rt.g,rt.b,Ft),v.copy(rt),T=Ft),m=D,C=!1}function te(D,ft){D.side===pr?yt(r.CULL_FACE):tt(r.CULL_FACE);let et=D.side===Qn;ft&&(et=!et),V(et),D.blending===qo&&D.transparent===!1?Jt(mr):Jt(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),s.setMask(D.colorWrite);let _t=D.stencilWrite;a.setTest(_t),_t&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),ke(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?tt(r.SAMPLE_ALPHA_TO_COVERAGE):yt(r.SAMPLE_ALPHA_TO_COVERAGE)}function V(D){L!==D&&(D?r.frontFace(r.CW):r.frontFace(r.CCW),L=D)}function se(D){D!==zg?(tt(r.CULL_FACE),D!==N&&(D===uf?r.cullFace(r.BACK):D===Vg?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):yt(r.CULL_FACE),N=D}function we(D){D!==z&&(k&&r.lineWidth(D),z=D)}function ke(D,ft,et){D?(tt(r.POLYGON_OFFSET_FILL),(I!==ft||B!==et)&&(I=ft,B=et,o.getReversed()&&(ft=-ft),r.polygonOffset(ft,et))):yt(r.POLYGON_OFFSET_FILL)}function $t(D){D?tt(r.SCISSOR_TEST):yt(r.SCISSOR_TEST)}function ve(D){D===void 0&&(D=r.TEXTURE0+X-1),R!==D&&(r.activeTexture(D),R=D)}function U(D,ft,et){et===void 0&&(R===null?et=r.TEXTURE0+X-1:et=R);let _t=j[et];_t===void 0&&(_t={type:void 0,texture:void 0},j[et]=_t),(_t.type!==D||_t.texture!==ft)&&(R!==et&&(r.activeTexture(et),R=et),r.bindTexture(D,ft||J[D]),_t.type=D,_t.texture=ft)}function Fe(){let D=j[R];D!==void 0&&D.type!==void 0&&(r.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function Yt(){try{r.compressedTexImage2D(...arguments)}catch(D){Zt("WebGLState:",D)}}function P(){try{r.compressedTexImage3D(...arguments)}catch(D){Zt("WebGLState:",D)}}function x(){try{r.texSubImage2D(...arguments)}catch(D){Zt("WebGLState:",D)}}function F(){try{r.texSubImage3D(...arguments)}catch(D){Zt("WebGLState:",D)}}function H(){try{r.compressedTexSubImage2D(...arguments)}catch(D){Zt("WebGLState:",D)}}function $(){try{r.compressedTexSubImage3D(...arguments)}catch(D){Zt("WebGLState:",D)}}function ht(){try{r.texStorage2D(...arguments)}catch(D){Zt("WebGLState:",D)}}function at(){try{r.texStorage3D(...arguments)}catch(D){Zt("WebGLState:",D)}}function Q(){try{r.texImage2D(...arguments)}catch(D){Zt("WebGLState:",D)}}function nt(){try{r.texImage3D(...arguments)}catch(D){Zt("WebGLState:",D)}}function mt(D){return f[D]!==void 0?f[D]:r.getParameter(D)}function Pt(D,ft){f[D]!==ft&&(r.pixelStorei(D,ft),f[D]=ft)}function gt(D){Wt.equals(D)===!1&&(r.scissor(D.x,D.y,D.z,D.w),Wt.copy(D))}function pt(D){Ht.equals(D)===!1&&(r.viewport(D.x,D.y,D.z,D.w),Ht.copy(D))}function ct(D,ft){let et=c.get(ft);et===void 0&&(et=new WeakMap,c.set(ft,et));let _t=et.get(D);_t===void 0&&(_t=r.getUniformBlockIndex(ft,D.name),et.set(D,_t))}function Ot(D,ft){let _t=c.get(ft).get(D);l.get(ft)!==_t&&(r.uniformBlockBinding(ft,_t,D.__bindingPointIndex),l.set(ft,_t))}function zt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),h={},f={},R=null,j={},u={},d=new WeakMap,g=[],_=null,p=!1,m=null,b=null,A=null,y=null,S=null,w=null,E=null,v=new pe(0,0,0),T=0,C=!1,L=null,N=null,z=null,I=null,B=null,Wt.set(0,0,r.canvas.width,r.canvas.height),Ht.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:tt,disable:yt,bindFramebuffer:Vt,drawBuffers:xt,useProgram:kt,setBlending:Jt,setMaterial:te,setFlipSided:V,setCullFace:se,setLineWidth:we,setPolygonOffset:ke,setScissorTest:$t,activeTexture:ve,bindTexture:U,unbindTexture:Fe,compressedTexImage2D:Yt,compressedTexImage3D:P,texImage2D:Q,texImage3D:nt,pixelStorei:Pt,getParameter:mt,updateUBOMapping:ct,uniformBlockBinding:Ot,texStorage2D:ht,texStorage3D:at,texSubImage2D:x,texSubImage3D:F,compressedTexSubImage2D:H,compressedTexSubImage3D:$,scissor:gt,viewport:pt,reset:zt}}function L1(r,t,e,n,i,s,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new _e,h=new WeakMap,f=new Set,u,d=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(P,x){return g?new OffscreenCanvas(P,x):Wa("canvas")}function p(P,x,F){let H=1,$=Yt(P);if(($.width>F||$.height>F)&&(H=F/Math.max($.width,$.height)),H<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let ht=Math.floor(H*$.width),at=Math.floor(H*$.height);u===void 0&&(u=_(ht,at));let Q=x?_(ht,at):u;return Q.width=ht,Q.height=at,Q.getContext("2d").drawImage(P,0,0,ht,at),Xt("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+ht+"x"+at+")."),Q}else return"data"in P&&Xt("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),P;return P}function m(P){return P.generateMipmaps}function b(P){r.generateMipmap(P)}function A(P){return P.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?r.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function y(P,x,F,H,$,ht=!1){if(P!==null){if(r[P]!==void 0)return r[P];Xt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let at;H&&(at=t.get("EXT_texture_norm16"),at||Xt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=x;if(x===r.RED&&(F===r.FLOAT&&(Q=r.R32F),F===r.HALF_FLOAT&&(Q=r.R16F),F===r.UNSIGNED_BYTE&&(Q=r.R8),F===r.UNSIGNED_SHORT&&at&&(Q=at.R16_EXT),F===r.SHORT&&at&&(Q=at.R16_SNORM_EXT)),x===r.RED_INTEGER&&(F===r.UNSIGNED_BYTE&&(Q=r.R8UI),F===r.UNSIGNED_SHORT&&(Q=r.R16UI),F===r.UNSIGNED_INT&&(Q=r.R32UI),F===r.BYTE&&(Q=r.R8I),F===r.SHORT&&(Q=r.R16I),F===r.INT&&(Q=r.R32I)),x===r.RG&&(F===r.FLOAT&&(Q=r.RG32F),F===r.HALF_FLOAT&&(Q=r.RG16F),F===r.UNSIGNED_BYTE&&(Q=r.RG8),F===r.UNSIGNED_SHORT&&at&&(Q=at.RG16_EXT),F===r.SHORT&&at&&(Q=at.RG16_SNORM_EXT)),x===r.RG_INTEGER&&(F===r.UNSIGNED_BYTE&&(Q=r.RG8UI),F===r.UNSIGNED_SHORT&&(Q=r.RG16UI),F===r.UNSIGNED_INT&&(Q=r.RG32UI),F===r.BYTE&&(Q=r.RG8I),F===r.SHORT&&(Q=r.RG16I),F===r.INT&&(Q=r.RG32I)),x===r.RGB_INTEGER&&(F===r.UNSIGNED_BYTE&&(Q=r.RGB8UI),F===r.UNSIGNED_SHORT&&(Q=r.RGB16UI),F===r.UNSIGNED_INT&&(Q=r.RGB32UI),F===r.BYTE&&(Q=r.RGB8I),F===r.SHORT&&(Q=r.RGB16I),F===r.INT&&(Q=r.RGB32I)),x===r.RGBA_INTEGER&&(F===r.UNSIGNED_BYTE&&(Q=r.RGBA8UI),F===r.UNSIGNED_SHORT&&(Q=r.RGBA16UI),F===r.UNSIGNED_INT&&(Q=r.RGBA32UI),F===r.BYTE&&(Q=r.RGBA8I),F===r.SHORT&&(Q=r.RGBA16I),F===r.INT&&(Q=r.RGBA32I)),x===r.RGB&&(F===r.UNSIGNED_SHORT&&at&&(Q=at.RGB16_EXT),F===r.SHORT&&at&&(Q=at.RGB16_SNORM_EXT),F===r.UNSIGNED_INT_5_9_9_9_REV&&(Q=r.RGB9_E5),F===r.UNSIGNED_INT_10F_11F_11F_REV&&(Q=r.R11F_G11F_B10F)),x===r.RGBA){let nt=ht?Ga:ce.getTransfer($);F===r.FLOAT&&(Q=r.RGBA32F),F===r.HALF_FLOAT&&(Q=r.RGBA16F),F===r.UNSIGNED_BYTE&&(Q=nt===Me?r.SRGB8_ALPHA8:r.RGBA8),F===r.UNSIGNED_SHORT&&at&&(Q=at.RGBA16_EXT),F===r.SHORT&&at&&(Q=at.RGBA16_SNORM_EXT),F===r.UNSIGNED_SHORT_4_4_4_4&&(Q=r.RGBA4),F===r.UNSIGNED_SHORT_5_5_5_1&&(Q=r.RGB5_A1)}return(Q===r.R16F||Q===r.R32F||Q===r.RG16F||Q===r.RG32F||Q===r.RGBA16F||Q===r.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function S(P,x){let F;return P?x===null||x===Yi||x===Zo?F=r.DEPTH24_STENCIL8:x===Zi?F=r.DEPTH32F_STENCIL8:x===Yo&&(F=r.DEPTH24_STENCIL8,Xt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Yi||x===Zo?F=r.DEPTH_COMPONENT24:x===Zi?F=r.DEPTH_COMPONENT32F:x===Yo&&(F=r.DEPTH_COMPONENT16),F}function w(P,x){return m(P)===!0||P.isFramebufferTexture&&P.minFilter!==vn&&P.minFilter!==bn?Math.log2(Math.max(x.width,x.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?x.mipmaps.length:1}function E(P){let x=P.target;x.removeEventListener("dispose",E),T(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&f.delete(x)}function v(P){let x=P.target;x.removeEventListener("dispose",v),L(x)}function T(P){let x=n.get(P);if(x.__webglInit===void 0)return;let F=P.source,H=d.get(F);if(H){let $=H[x.__cacheKey];$.usedTimes--,$.usedTimes===0&&C(P),Object.keys(H).length===0&&d.delete(F)}n.remove(P)}function C(P){let x=n.get(P);r.deleteTexture(x.__webglTexture);let F=P.source,H=d.get(F);delete H[x.__cacheKey],o.memory.textures--}function L(P){let x=n.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),n.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(x.__webglFramebuffer[H]))for(let $=0;$<x.__webglFramebuffer[H].length;$++)r.deleteFramebuffer(x.__webglFramebuffer[H][$]);else r.deleteFramebuffer(x.__webglFramebuffer[H]);x.__webglDepthbuffer&&r.deleteRenderbuffer(x.__webglDepthbuffer[H])}else{if(Array.isArray(x.__webglFramebuffer))for(let H=0;H<x.__webglFramebuffer.length;H++)r.deleteFramebuffer(x.__webglFramebuffer[H]);else r.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&r.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&r.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let H=0;H<x.__webglColorRenderbuffer.length;H++)x.__webglColorRenderbuffer[H]&&r.deleteRenderbuffer(x.__webglColorRenderbuffer[H]);x.__webglDepthRenderbuffer&&r.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let F=P.textures;for(let H=0,$=F.length;H<$;H++){let ht=n.get(F[H]);ht.__webglTexture&&(r.deleteTexture(ht.__webglTexture),o.memory.textures--),n.remove(F[H])}n.remove(P)}let N=0;function z(){N=0}function I(){return N}function B(P){N=P}function X(){let P=N;return P>=i.maxTextures&&Xt("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+i.maxTextures),N+=1,P}function k(P){let x=[];return x.push(P.wrapS),x.push(P.wrapT),x.push(P.wrapR||0),x.push(P.magFilter),x.push(P.minFilter),x.push(P.anisotropy),x.push(P.internalFormat),x.push(P.format),x.push(P.type),x.push(P.generateMipmaps),x.push(P.premultiplyAlpha),x.push(P.flipY),x.push(P.unpackAlignment),x.push(P.colorSpace),x.join()}function K(P,x){let F=n.get(P);if(P.isVideoTexture&&U(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&F.__version!==P.version){let H=P.image;if(H===null)Xt("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)Xt("WebGLRenderer: Texture marked for update but image is incomplete");else{yt(F,P,x);return}}else P.isExternalTexture&&(F.__webglTexture=P.sourceTexture?P.sourceTexture:null);e.bindTexture(r.TEXTURE_2D,F.__webglTexture,r.TEXTURE0+x)}function q(P,x){let F=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&F.__version!==P.version){yt(F,P,x);return}else P.isExternalTexture&&(F.__webglTexture=P.sourceTexture?P.sourceTexture:null);e.bindTexture(r.TEXTURE_2D_ARRAY,F.__webglTexture,r.TEXTURE0+x)}function R(P,x){let F=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&F.__version!==P.version){yt(F,P,x);return}e.bindTexture(r.TEXTURE_3D,F.__webglTexture,r.TEXTURE0+x)}function j(P,x){let F=n.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&F.__version!==P.version){Vt(F,P,x);return}e.bindTexture(r.TEXTURE_CUBE_MAP,F.__webglTexture,r.TEXTURE0+x)}let Tt={[Xc]:r.REPEAT,[hr]:r.CLAMP_TO_EDGE,[qc]:r.MIRRORED_REPEAT},Et={[vn]:r.NEAREST,[c_]:r.NEAREST_MIPMAP_NEAREST,[cl]:r.NEAREST_MIPMAP_LINEAR,[bn]:r.LINEAR,[_h]:r.LINEAR_MIPMAP_NEAREST,[ds]:r.LINEAR_MIPMAP_LINEAR},Wt={[f_]:r.NEVER,[x_]:r.ALWAYS,[p_]:r.LESS,[tu]:r.LEQUAL,[m_]:r.EQUAL,[eu]:r.GEQUAL,[g_]:r.GREATER,[__]:r.NOTEQUAL};function Ht(P,x){if(x.type===Zi&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===bn||x.magFilter===_h||x.magFilter===cl||x.magFilter===ds||x.minFilter===bn||x.minFilter===_h||x.minFilter===cl||x.minFilter===ds)&&Xt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(P,r.TEXTURE_WRAP_S,Tt[x.wrapS]),r.texParameteri(P,r.TEXTURE_WRAP_T,Tt[x.wrapT]),(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)&&r.texParameteri(P,r.TEXTURE_WRAP_R,Tt[x.wrapR]),r.texParameteri(P,r.TEXTURE_MAG_FILTER,Et[x.magFilter]),r.texParameteri(P,r.TEXTURE_MIN_FILTER,Et[x.minFilter]),x.compareFunction&&(r.texParameteri(P,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(P,r.TEXTURE_COMPARE_FUNC,Wt[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===vn||x.minFilter!==cl&&x.minFilter!==ds||x.type===Zi&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let F=t.get("EXT_texture_filter_anisotropic");r.texParameterf(P,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,i.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function qt(P,x){let F=!1;P.__webglInit===void 0&&(P.__webglInit=!0,x.addEventListener("dispose",E));let H=x.source,$=d.get(H);$===void 0&&($={},d.set(H,$));let ht=k(x);if(ht!==P.__cacheKey){$[ht]===void 0&&($[ht]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,F=!0),$[ht].usedTimes++;let at=$[P.__cacheKey];at!==void 0&&($[P.__cacheKey].usedTimes--,at.usedTimes===0&&C(x)),P.__cacheKey=ht,P.__webglTexture=$[ht].texture}return F}function J(P,x,F){return Math.floor(Math.floor(P/F)/x)}function tt(P,x,F,H){let ht=P.updateRanges;if(ht.length===0)e.texSubImage2D(r.TEXTURE_2D,0,0,0,x.width,x.height,F,H,x.data);else{ht.sort((Pt,gt)=>Pt.start-gt.start);let at=0;for(let Pt=1;Pt<ht.length;Pt++){let gt=ht[at],pt=ht[Pt],ct=gt.start+gt.count,Ot=J(pt.start,x.width,4),zt=J(gt.start,x.width,4);pt.start<=ct+1&&Ot===zt&&J(pt.start+pt.count-1,x.width,4)===Ot?gt.count=Math.max(gt.count,pt.start+pt.count-gt.start):(++at,ht[at]=pt)}ht.length=at+1;let Q=e.getParameter(r.UNPACK_ROW_LENGTH),nt=e.getParameter(r.UNPACK_SKIP_PIXELS),mt=e.getParameter(r.UNPACK_SKIP_ROWS);e.pixelStorei(r.UNPACK_ROW_LENGTH,x.width);for(let Pt=0,gt=ht.length;Pt<gt;Pt++){let pt=ht[Pt],ct=Math.floor(pt.start/4),Ot=Math.ceil(pt.count/4),zt=ct%x.width,D=Math.floor(ct/x.width),ft=Ot,et=1;e.pixelStorei(r.UNPACK_SKIP_PIXELS,zt),e.pixelStorei(r.UNPACK_SKIP_ROWS,D),e.texSubImage2D(r.TEXTURE_2D,0,zt,D,ft,et,F,H,x.data)}P.clearUpdateRanges(),e.pixelStorei(r.UNPACK_ROW_LENGTH,Q),e.pixelStorei(r.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(r.UNPACK_SKIP_ROWS,mt)}}function yt(P,x,F){let H=r.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(H=r.TEXTURE_2D_ARRAY),x.isData3DTexture&&(H=r.TEXTURE_3D);let $=qt(P,x),ht=x.source;e.bindTexture(H,P.__webglTexture,r.TEXTURE0+F);let at=n.get(ht);if(ht.version!==at.__version||$===!0){if(e.activeTexture(r.TEXTURE0+F),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let et=ce.getPrimaries(ce.workingColorSpace),_t=x.colorSpace===Dr?null:ce.getPrimaries(x.colorSpace),St=x.colorSpace===Dr||et===_t?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,x.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,St)}e.pixelStorei(r.UNPACK_ALIGNMENT,x.unpackAlignment);let nt=p(x.image,!1,i.maxTextureSize);nt=Fe(x,nt);let mt=s.convert(x.format,x.colorSpace),Pt=s.convert(x.type),gt=y(x.internalFormat,mt,Pt,x.normalized,x.colorSpace,x.isVideoTexture);Ht(H,x);let pt,ct=x.mipmaps,Ot=x.isVideoTexture!==!0,zt=at.__version===void 0||$===!0,D=ht.dataReady,ft=w(x,nt);if(x.isDepthTexture)gt=S(x.format===fs,x.type),zt&&(Ot?e.texStorage2D(r.TEXTURE_2D,1,gt,nt.width,nt.height):e.texImage2D(r.TEXTURE_2D,0,gt,nt.width,nt.height,0,mt,Pt,null));else if(x.isDataTexture)if(ct.length>0){Ot&&zt&&e.texStorage2D(r.TEXTURE_2D,ft,gt,ct[0].width,ct[0].height);for(let et=0,_t=ct.length;et<_t;et++)pt=ct[et],Ot?D&&e.texSubImage2D(r.TEXTURE_2D,et,0,0,pt.width,pt.height,mt,Pt,pt.data):e.texImage2D(r.TEXTURE_2D,et,gt,pt.width,pt.height,0,mt,Pt,pt.data);x.generateMipmaps=!1}else Ot?(zt&&e.texStorage2D(r.TEXTURE_2D,ft,gt,nt.width,nt.height),D&&tt(x,nt,mt,Pt)):e.texImage2D(r.TEXTURE_2D,0,gt,nt.width,nt.height,0,mt,Pt,nt.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Ot&&zt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,ft,gt,ct[0].width,ct[0].height,nt.depth);for(let et=0,_t=ct.length;et<_t;et++)if(pt=ct[et],x.format!==Fi)if(mt!==null)if(Ot){if(D)if(x.layerUpdates.size>0){let St=Bf(pt.width,pt.height,x.format,x.type);for(let it of x.layerUpdates){let lt=pt.data.subarray(it*St/pt.data.BYTES_PER_ELEMENT,(it+1)*St/pt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,et,0,0,it,pt.width,pt.height,1,mt,lt)}}else e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,et,0,0,0,pt.width,pt.height,nt.depth,mt,pt.data)}else e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,et,gt,pt.width,pt.height,nt.depth,0,pt.data,0,0);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ot?D&&e.texSubImage3D(r.TEXTURE_2D_ARRAY,et,0,0,0,pt.width,pt.height,nt.depth,mt,Pt,pt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,et,gt,pt.width,pt.height,nt.depth,0,mt,Pt,pt.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{Ot&&zt&&e.texStorage2D(r.TEXTURE_2D,ft,gt,ct[0].width,ct[0].height);for(let et=0,_t=ct.length;et<_t;et++)pt=ct[et],x.format!==Fi?mt!==null?Ot?D&&e.compressedTexSubImage2D(r.TEXTURE_2D,et,0,0,pt.width,pt.height,mt,pt.data):e.compressedTexImage2D(r.TEXTURE_2D,et,gt,pt.width,pt.height,0,pt.data):Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ot?D&&e.texSubImage2D(r.TEXTURE_2D,et,0,0,pt.width,pt.height,mt,Pt,pt.data):e.texImage2D(r.TEXTURE_2D,et,gt,pt.width,pt.height,0,mt,Pt,pt.data)}else if(x.isDataArrayTexture)if(Ot){if(zt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,ft,gt,nt.width,nt.height,nt.depth),D)if(x.layerUpdates.size>0){let et=Bf(nt.width,nt.height,x.format,x.type);for(let _t of x.layerUpdates){let St=nt.data.subarray(_t*et/nt.data.BYTES_PER_ELEMENT,(_t+1)*et/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,_t,nt.width,nt.height,1,mt,Pt,St)}x.clearLayerUpdates()}else e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,mt,Pt,nt.data)}else e.texImage3D(r.TEXTURE_2D_ARRAY,0,gt,nt.width,nt.height,nt.depth,0,mt,Pt,nt.data);else if(x.isData3DTexture)Ot?(zt&&e.texStorage3D(r.TEXTURE_3D,ft,gt,nt.width,nt.height,nt.depth),D&&e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,mt,Pt,nt.data)):e.texImage3D(r.TEXTURE_3D,0,gt,nt.width,nt.height,nt.depth,0,mt,Pt,nt.data);else if(x.isFramebufferTexture){if(zt)if(Ot)e.texStorage2D(r.TEXTURE_2D,ft,gt,nt.width,nt.height);else{let et=nt.width,_t=nt.height;for(let St=0;St<ft;St++)e.texImage2D(r.TEXTURE_2D,St,gt,et,_t,0,mt,Pt,null),et>>=1,_t>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in r){let et=r.canvas;if(et.hasAttribute("layoutsubtree")||et.setAttribute("layoutsubtree","true"),nt.parentNode!==et){et.appendChild(nt),f.add(x),et.onpaint=_t=>{let St=_t.changedElements;for(let it of f)St.includes(it.image)&&(it.needsUpdate=!0)},et.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,nt);else{let St=r.RGBA,it=r.RGBA,lt=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,St,it,lt,nt)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(ct.length>0){if(Ot&&zt){let et=Yt(ct[0]);e.texStorage2D(r.TEXTURE_2D,ft,gt,et.width,et.height)}for(let et=0,_t=ct.length;et<_t;et++)pt=ct[et],Ot?D&&e.texSubImage2D(r.TEXTURE_2D,et,0,0,mt,Pt,pt):e.texImage2D(r.TEXTURE_2D,et,gt,mt,Pt,pt);x.generateMipmaps=!1}else if(Ot){if(zt){let et=Yt(nt);e.texStorage2D(r.TEXTURE_2D,ft,gt,et.width,et.height)}D&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,mt,Pt,nt)}else e.texImage2D(r.TEXTURE_2D,0,gt,mt,Pt,nt);m(x)&&b(H),at.__version=ht.version,x.onUpdate&&x.onUpdate(x)}P.__version=x.version}function Vt(P,x,F){if(x.image.length!==6)return;let H=qt(P,x),$=x.source;e.bindTexture(r.TEXTURE_CUBE_MAP,P.__webglTexture,r.TEXTURE0+F);let ht=n.get($);if($.version!==ht.__version||H===!0){e.activeTexture(r.TEXTURE0+F);let at=ce.getPrimaries(ce.workingColorSpace),Q=x.colorSpace===Dr?null:ce.getPrimaries(x.colorSpace),nt=x.colorSpace===Dr||at===Q?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,x.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),e.pixelStorei(r.UNPACK_ALIGNMENT,x.unpackAlignment),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let mt=x.isCompressedTexture||x.image[0].isCompressedTexture,Pt=x.image[0]&&x.image[0].isDataTexture,gt=[];for(let it=0;it<6;it++)!mt&&!Pt?gt[it]=p(x.image[it],!0,i.maxCubemapSize):gt[it]=Pt?x.image[it].image:x.image[it],gt[it]=Fe(x,gt[it]);let pt=gt[0],ct=s.convert(x.format,x.colorSpace),Ot=s.convert(x.type),zt=y(x.internalFormat,ct,Ot,x.normalized,x.colorSpace),D=x.isVideoTexture!==!0,ft=ht.__version===void 0||H===!0,et=$.dataReady,_t=w(x,pt);Ht(r.TEXTURE_CUBE_MAP,x);let St;if(mt){D&&ft&&e.texStorage2D(r.TEXTURE_CUBE_MAP,_t,zt,pt.width,pt.height);for(let it=0;it<6;it++){St=gt[it].mipmaps;for(let lt=0;lt<St.length;lt++){let rt=St[lt];x.format!==Fi?ct!==null?D?et&&e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt,0,0,rt.width,rt.height,ct,rt.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt,zt,rt.width,rt.height,0,rt.data):Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?et&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt,0,0,rt.width,rt.height,ct,Ot,rt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt,zt,rt.width,rt.height,0,ct,Ot,rt.data)}}}else{if(St=x.mipmaps,D&&ft){St.length>0&&_t++;let it=Yt(gt[0]);e.texStorage2D(r.TEXTURE_CUBE_MAP,_t,zt,it.width,it.height)}for(let it=0;it<6;it++)if(Pt){D?et&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,0,0,gt[it].width,gt[it].height,ct,Ot,gt[it].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,zt,gt[it].width,gt[it].height,0,ct,Ot,gt[it].data);for(let lt=0;lt<St.length;lt++){let Ft=St[lt].image[it].image;D?et&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt+1,0,0,Ft.width,Ft.height,ct,Ot,Ft.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt+1,zt,Ft.width,Ft.height,0,ct,Ot,Ft.data)}}else{D?et&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,0,0,ct,Ot,gt[it]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,0,zt,ct,Ot,gt[it]);for(let lt=0;lt<St.length;lt++){let rt=St[lt];D?et&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt+1,0,0,ct,Ot,rt.image[it]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+it,lt+1,zt,ct,Ot,rt.image[it])}}}m(x)&&b(r.TEXTURE_CUBE_MAP),ht.__version=$.version,x.onUpdate&&x.onUpdate(x)}P.__version=x.version}function xt(P,x,F,H,$,ht){let at=s.convert(F.format,F.colorSpace),Q=s.convert(F.type),nt=y(F.internalFormat,at,Q,F.normalized,F.colorSpace),mt=n.get(x),Pt=n.get(F);if(Pt.__renderTarget=x,!mt.__hasExternalTextures){let gt=Math.max(1,x.width>>ht),pt=Math.max(1,x.height>>ht);$===r.TEXTURE_3D||$===r.TEXTURE_2D_ARRAY?e.texImage3D($,ht,nt,gt,pt,x.depth,0,at,Q,null):e.texImage2D($,ht,nt,gt,pt,0,at,Q,null)}e.bindFramebuffer(r.FRAMEBUFFER,P),ve(x)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,H,$,Pt.__webglTexture,0,$t(x)):($===r.TEXTURE_2D||$>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,H,$,Pt.__webglTexture,ht),e.bindFramebuffer(r.FRAMEBUFFER,null)}function kt(P,x,F){if(r.bindRenderbuffer(r.RENDERBUFFER,P),x.depthBuffer){let H=x.depthTexture,$=H&&H.isDepthTexture?H.type:null,ht=S(x.stencilBuffer,$),at=x.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;ve(x)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,$t(x),ht,x.width,x.height):F?r.renderbufferStorageMultisample(r.RENDERBUFFER,$t(x),ht,x.width,x.height):r.renderbufferStorage(r.RENDERBUFFER,ht,x.width,x.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,at,r.RENDERBUFFER,P)}else{let H=x.textures;for(let $=0;$<H.length;$++){let ht=H[$],at=s.convert(ht.format,ht.colorSpace),Q=s.convert(ht.type),nt=y(ht.internalFormat,at,Q,ht.normalized,ht.colorSpace);ve(x)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,$t(x),nt,x.width,x.height):F?r.renderbufferStorageMultisample(r.RENDERBUFFER,$t(x),nt,x.width,x.height):r.renderbufferStorage(r.RENDERBUFFER,nt,x.width,x.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Gt(P,x,F){let H=x.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(r.FRAMEBUFFER,P),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=n.get(x.depthTexture);if($.__renderTarget=x,(!$.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),H){if($.__webglInit===void 0&&($.__webglInit=!0,x.depthTexture.addEventListener("dispose",E)),$.__webglTexture===void 0){$.__webglTexture=r.createTexture(),e.bindTexture(r.TEXTURE_CUBE_MAP,$.__webglTexture),Ht(r.TEXTURE_CUBE_MAP,x.depthTexture);let mt=s.convert(x.depthTexture.format),Pt=s.convert(x.depthTexture.type),gt;x.depthTexture.format===ur?gt=r.DEPTH_COMPONENT24:x.depthTexture.format===fs&&(gt=r.DEPTH24_STENCIL8);for(let pt=0;pt<6;pt++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+pt,0,gt,x.width,x.height,0,mt,Pt,null)}}else K(x.depthTexture,0);let ht=$.__webglTexture,at=$t(x),Q=H?r.TEXTURE_CUBE_MAP_POSITIVE_X+F:r.TEXTURE_2D,nt=x.depthTexture.format===fs?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(x.depthTexture.format===ur)ve(x)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,nt,Q,ht,0,at):r.framebufferTexture2D(r.FRAMEBUFFER,nt,Q,ht,0);else if(x.depthTexture.format===fs)ve(x)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,nt,Q,ht,0,at):r.framebufferTexture2D(r.FRAMEBUFFER,nt,Q,ht,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Dt(P){let x=n.get(P),F=P.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==P.depthTexture){let H=P.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),H){let $=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,H.removeEventListener("dispose",$)};H.addEventListener("dispose",$),x.__depthDisposeCallback=$}x.__boundDepthTexture=H}if(P.depthTexture&&!x.__autoAllocateDepthBuffer)if(F)for(let H=0;H<6;H++)Gt(x.__webglFramebuffer[H],P,H);else{let H=P.texture.mipmaps;H&&H.length>0?Gt(x.__webglFramebuffer[0],P,0):Gt(x.__webglFramebuffer,P,0)}else if(F){x.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(e.bindFramebuffer(r.FRAMEBUFFER,x.__webglFramebuffer[H]),x.__webglDepthbuffer[H]===void 0)x.__webglDepthbuffer[H]=r.createRenderbuffer(),kt(x.__webglDepthbuffer[H],P,!1);else{let $=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ht=x.__webglDepthbuffer[H];r.bindRenderbuffer(r.RENDERBUFFER,ht),r.framebufferRenderbuffer(r.FRAMEBUFFER,$,r.RENDERBUFFER,ht)}}else{let H=P.texture.mipmaps;if(H&&H.length>0?e.bindFramebuffer(r.FRAMEBUFFER,x.__webglFramebuffer[0]):e.bindFramebuffer(r.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=r.createRenderbuffer(),kt(x.__webglDepthbuffer,P,!1);else{let $=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ht=x.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ht),r.framebufferRenderbuffer(r.FRAMEBUFFER,$,r.RENDERBUFFER,ht)}}e.bindFramebuffer(r.FRAMEBUFFER,null)}function Jt(P,x,F){let H=n.get(P);x!==void 0&&xt(H.__webglFramebuffer,P,P.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),F!==void 0&&Dt(P)}function te(P){let x=P.texture,F=n.get(P),H=n.get(x);P.addEventListener("dispose",v);let $=P.textures,ht=P.isWebGLCubeRenderTarget===!0,at=$.length>1;if(at||(H.__webglTexture===void 0&&(H.__webglTexture=r.createTexture()),H.__version=x.version,o.memory.textures++),ht){F.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer[Q]=[];for(let nt=0;nt<x.mipmaps.length;nt++)F.__webglFramebuffer[Q][nt]=r.createFramebuffer()}else F.__webglFramebuffer[Q]=r.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer=[];for(let Q=0;Q<x.mipmaps.length;Q++)F.__webglFramebuffer[Q]=r.createFramebuffer()}else F.__webglFramebuffer=r.createFramebuffer();if(at)for(let Q=0,nt=$.length;Q<nt;Q++){let mt=n.get($[Q]);mt.__webglTexture===void 0&&(mt.__webglTexture=r.createTexture(),o.memory.textures++)}if(P.samples>0&&ve(P)===!1){F.__webglMultisampledFramebuffer=r.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let Q=0;Q<$.length;Q++){let nt=$[Q];F.__webglColorRenderbuffer[Q]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,F.__webglColorRenderbuffer[Q]);let mt=s.convert(nt.format,nt.colorSpace),Pt=s.convert(nt.type),gt=y(nt.internalFormat,mt,Pt,nt.normalized,nt.colorSpace,P.isXRRenderTarget===!0),pt=$t(P);r.renderbufferStorageMultisample(r.RENDERBUFFER,pt,gt,P.width,P.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Q,r.RENDERBUFFER,F.__webglColorRenderbuffer[Q])}r.bindRenderbuffer(r.RENDERBUFFER,null),P.depthBuffer&&(F.__webglDepthRenderbuffer=r.createRenderbuffer(),kt(F.__webglDepthRenderbuffer,P,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ht){e.bindTexture(r.TEXTURE_CUBE_MAP,H.__webglTexture),Ht(r.TEXTURE_CUBE_MAP,x);for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0)for(let nt=0;nt<x.mipmaps.length;nt++)xt(F.__webglFramebuffer[Q][nt],P,x,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,nt);else xt(F.__webglFramebuffer[Q],P,x,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);m(x)&&b(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(at){for(let Q=0,nt=$.length;Q<nt;Q++){let mt=$[Q],Pt=n.get(mt),gt=r.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(gt=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(gt,Pt.__webglTexture),Ht(gt,mt),xt(F.__webglFramebuffer,P,mt,r.COLOR_ATTACHMENT0+Q,gt,0),m(mt)&&b(gt)}e.unbindTexture()}else{let Q=r.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(Q=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(Q,H.__webglTexture),Ht(Q,x),x.mipmaps&&x.mipmaps.length>0)for(let nt=0;nt<x.mipmaps.length;nt++)xt(F.__webglFramebuffer[nt],P,x,r.COLOR_ATTACHMENT0,Q,nt);else xt(F.__webglFramebuffer,P,x,r.COLOR_ATTACHMENT0,Q,0);m(x)&&b(Q),e.unbindTexture()}P.depthBuffer&&Dt(P)}function V(P){let x=P.textures;for(let F=0,H=x.length;F<H;F++){let $=x[F];if(m($)){let ht=A(P),at=n.get($).__webglTexture;e.bindTexture(ht,at),b(ht),e.unbindTexture()}}}let se=[],we=[];function ke(P){if(P.samples>0){if(ve(P)===!1){let x=P.textures,F=P.width,H=P.height,$=r.COLOR_BUFFER_BIT,ht=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,at=n.get(P),Q=x.length>1;if(Q)for(let mt=0;mt<x.length;mt++)e.bindFramebuffer(r.FRAMEBUFFER,at.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,at.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,at.__webglMultisampledFramebuffer);let nt=P.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(r.DRAW_FRAMEBUFFER,at.__webglFramebuffer[0]):e.bindFramebuffer(r.DRAW_FRAMEBUFFER,at.__webglFramebuffer);for(let mt=0;mt<x.length;mt++){if(P.resolveDepthBuffer&&(P.depthBuffer&&($|=r.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&($|=r.STENCIL_BUFFER_BIT)),Q){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,at.__webglColorRenderbuffer[mt]);let Pt=n.get(x[mt]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Pt,0)}r.blitFramebuffer(0,0,F,H,0,0,F,H,$,r.NEAREST),l===!0&&(se.length=0,we.length=0,se.push(r.COLOR_ATTACHMENT0+mt),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&(se.push(ht),we.push(ht),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,we)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,se))}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Q)for(let mt=0;mt<x.length;mt++){e.bindFramebuffer(r.FRAMEBUFFER,at.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.RENDERBUFFER,at.__webglColorRenderbuffer[mt]);let Pt=n.get(x[mt]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,at.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.TEXTURE_2D,Pt,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,at.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){let x=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[x])}}}function $t(P){return Math.min(i.maxSamples,P.samples)}function ve(P){let x=n.get(P);return P.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(P){let x=o.render.frame;h.get(P)!==x&&(h.set(P,x),P.update())}function Fe(P,x){let F=P.colorSpace,H=P.format,$=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||F!==Va&&F!==Dr&&(ce.getTransfer(F)===Me?(H!==Fi||$!==bi)&&Xt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Zt("WebGLTextures: Unsupported texture color space:",F)),x}function Yt(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=z,this.getTextureUnits=I,this.setTextureUnits=B,this.setTexture2D=K,this.setTexture2DArray=q,this.setTexture3D=R,this.setTextureCube=j,this.rebindTextures=Jt,this.setupRenderTarget=te,this.updateRenderTargetMipmap=V,this.updateMultisampleRenderTarget=ke,this.setupDepthRenderbuffer=Dt,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=ve,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function D1(r,t){function e(n,i=Dr){let s,o=ce.getTransfer(i);if(n===bi)return r.UNSIGNED_BYTE;if(n===vh)return r.UNSIGNED_SHORT_4_4_4_4;if(n===yh)return r.UNSIGNED_SHORT_5_5_5_1;if(n===Af)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===Cf)return r.UNSIGNED_INT_10F_11F_11F_REV;if(n===Tf)return r.BYTE;if(n===Ef)return r.SHORT;if(n===Yo)return r.UNSIGNED_SHORT;if(n===xh)return r.INT;if(n===Yi)return r.UNSIGNED_INT;if(n===Zi)return r.FLOAT;if(n===Ji)return r.HALF_FLOAT;if(n===Rf)return r.ALPHA;if(n===Pf)return r.RGB;if(n===Fi)return r.RGBA;if(n===ur)return r.DEPTH_COMPONENT;if(n===fs)return r.DEPTH_STENCIL;if(n===If)return r.RED;if(n===Sh)return r.RED_INTEGER;if(n===ps)return r.RG;if(n===Mh)return r.RG_INTEGER;if(n===bh)return r.RGBA_INTEGER;if(n===hl||n===ul||n===dl||n===fl)if(o===Me)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===hl)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ul)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===dl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===fl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===hl)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ul)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===dl)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===fl)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===wh||n===Th||n===Eh||n===Ah)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===wh)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Th)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Eh)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ah)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ch||n===Rh||n===Ph||n===Ih||n===Nh||n===pl||n===Lh)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Ch||n===Rh)return o===Me?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Ph)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ih)return s.COMPRESSED_R11_EAC;if(n===Nh)return s.COMPRESSED_SIGNED_R11_EAC;if(n===pl)return s.COMPRESSED_RG11_EAC;if(n===Lh)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Dh||n===Oh||n===Uh||n===Fh||n===Bh||n===kh||n===zh||n===Vh||n===Gh||n===Hh||n===Wh||n===Xh||n===qh||n===Yh)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Dh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Oh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Uh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Fh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Bh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===kh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===zh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Gh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Hh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Wh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===qh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Yh)return o===Me?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Zh||n===Jh||n===$h)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(n===Zh)return o===Me?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Jh)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===$h)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Kh||n===Qh||n===ml||n===jh)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(n===Kh)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Qh)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ml)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===jh)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Zo?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:e}}var O1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,U1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Qf=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new el(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Si({vertexShader:O1,fragmentShader:U1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ui(new nl(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},jf=class extends dr{constructor(t,e){super();let n=this,i=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,f=null,u=null,d=null,g=null,_=typeof XRWebGLBinding<"u",p=new Qf,m={},b=e.getContextAttributes(),A=null,y=null,S=[],w=[],E=new _e,v=null,T=null,C=new Un;C.viewport=new He;let L=new Un;L.viewport=new He;let N=[C,L],z=new ph,I=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let tt=S[J];return tt===void 0&&(tt=new Go,S[J]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(J){let tt=S[J];return tt===void 0&&(tt=new Go,S[J]=tt),tt.getGripSpace()},this.getHand=function(J){let tt=S[J];return tt===void 0&&(tt=new Go,S[J]=tt),tt.getHandSpace()};function X(J){let tt=w.indexOf(J.inputSource);if(tt===-1)return;let yt=S[tt];yt!==void 0&&(yt.update(J.inputSource,J.frame,c||o),yt.dispatchEvent({type:J.type,data:J.inputSource}))}function k(){i.removeEventListener("select",X),i.removeEventListener("selectstart",X),i.removeEventListener("selectend",X),i.removeEventListener("squeeze",X),i.removeEventListener("squeezestart",X),i.removeEventListener("squeezeend",X),i.removeEventListener("end",k),i.removeEventListener("inputsourceschange",K);for(let J=0;J<S.length;J++){let tt=w[J];tt!==null&&(w[J]=null,S[J].disconnect(tt))}I=null,B=null,p.reset();for(let J in m)delete m[J];if(t.setRenderTarget(A),d=null,u=null,f=null,i=null,y=null,qt.stop(),n.isPresenting=!1,t.setPixelRatio(v),t.setSize(E.width,E.height,!1),T!==null){let J=T.camera;J.fov=T.fov,J.zoom=T.zoom,J.updateProjectionMatrix(),T=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){s=J,n.isPresenting===!0&&Xt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,n.isPresenting===!0&&Xt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(i,e)),f},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(J){if(i=J,i!==null){if(A=t.getRenderTarget(),i.addEventListener("select",X),i.addEventListener("selectstart",X),i.addEventListener("selectend",X),i.addEventListener("squeeze",X),i.addEventListener("squeezestart",X),i.addEventListener("squeezeend",X),i.addEventListener("end",k),i.addEventListener("inputsourceschange",K),b.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(E),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let yt=null,Vt=null,xt=null;b.depth&&(xt=b.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,yt=b.stencil?fs:ur,Vt=b.stencil?Zo:Yi);let kt={colorFormat:e.RGBA8,depthFormat:xt,scaleFactor:s};f=this.getBinding(),u=f.createProjectionLayer(kt),i.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new oi(u.textureWidth,u.textureHeight,{format:Fi,type:bi,depthTexture:new os(u.textureWidth,u.textureHeight,Vt,void 0,void 0,void 0,void 0,void 0,void 0,yt),stencilBuffer:b.stencil,colorSpace:t.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let yt={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(i,e,yt),i.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new oi(d.framebufferWidth,d.framebufferHeight,{format:Fi,type:bi,colorSpace:t.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),qt.setContext(i),qt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function K(J){for(let tt=0;tt<J.removed.length;tt++){let yt=J.removed[tt],Vt=w.indexOf(yt);Vt>=0&&(w[Vt]=null,S[Vt].disconnect(yt))}for(let tt=0;tt<J.added.length;tt++){let yt=J.added[tt],Vt=w.indexOf(yt);if(Vt===-1){for(let kt=0;kt<S.length;kt++)if(kt>=w.length){w.push(yt),Vt=kt;break}else if(w[kt]===null){w[kt]=yt,Vt=kt;break}if(Vt===-1)break}let xt=S[Vt];xt&&xt.connect(yt)}}let q=new Z,R=new Z;function j(J,tt,yt){q.setFromMatrixPosition(tt.matrixWorld),R.setFromMatrixPosition(yt.matrixWorld);let Vt=q.distanceTo(R),xt=tt.projectionMatrix.elements,kt=yt.projectionMatrix.elements,Gt=xt[14]/(xt[10]-1),Dt=xt[14]/(xt[10]+1),Jt=(xt[9]+1)/xt[5],te=(xt[9]-1)/xt[5],V=(xt[8]-1)/xt[0],se=(kt[8]+1)/kt[0],we=Gt*V,ke=Gt*se,$t=Vt/(-V+se),ve=$t*-V;if(tt.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(ve),J.translateZ($t),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),xt[10]===-1)J.projectionMatrix.copy(tt.projectionMatrix),J.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{let U=Gt+$t,Fe=Dt+$t,Yt=we-ve,P=ke+(Vt-ve),x=Jt*Dt/Fe*U,F=te*Dt/Fe*U;J.projectionMatrix.makePerspective(Yt,P,x,F,U,Fe),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Tt(J,tt){tt===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(tt.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(i===null)return;let tt=J.near,yt=J.far;p.texture!==null&&(p.depthNear>0&&(tt=p.depthNear),p.depthFar>0&&(yt=p.depthFar)),z.near=L.near=C.near=tt,z.far=L.far=C.far=yt,(I!==z.near||B!==z.far)&&(i.updateRenderState({depthNear:z.near,depthFar:z.far}),I=z.near,B=z.far),z.layers.mask=J.layers.mask|6,C.layers.mask=z.layers.mask&-5,L.layers.mask=z.layers.mask&-3;let Vt=J.parent,xt=z.cameras;Tt(z,Vt);for(let kt=0;kt<xt.length;kt++)Tt(xt[kt],Vt);xt.length===2?j(z,C,L):z.projectionMatrix.copy(C.projectionMatrix),T===null&&J.isPerspectiveCamera&&(T={camera:J,fov:J.fov,zoom:J.zoom}),Et(J,z,Vt)};function Et(J,tt,yt){yt===null?J.matrix.copy(tt.matrixWorld):(J.matrix.copy(yt.matrixWorld),J.matrix.invert(),J.matrix.multiply(tt.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(tt.projectionMatrix),J.projectionMatrixInverse.copy(tt.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Zc*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=J)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(z)},this.getCameraTexture=function(J){return m[J]};let Wt=null;function Ht(J,tt){if(h=tt.getViewerPose(c||o),g=tt,h!==null){let yt=h.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let Vt=!1;yt.length!==z.cameras.length&&(z.cameras.length=0,Vt=!0);for(let Dt=0;Dt<yt.length;Dt++){let Jt=yt[Dt],te=null;if(d!==null)te=d.getViewport(Jt);else{let se=f.getViewSubImage(u,Jt);te=se.viewport,Dt===0&&(t.setRenderTargetTextures(y,se.colorTexture,se.depthStencilTexture),t.setRenderTarget(y))}let V=N[Dt];V===void 0&&(V=new Un,V.layers.enable(Dt),V.viewport=new He,N[Dt]=V),V.matrix.fromArray(Jt.transform.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale),V.projectionMatrix.fromArray(Jt.projectionMatrix),V.projectionMatrixInverse.copy(V.projectionMatrix).invert(),V.viewport.set(te.x,te.y,te.width,te.height),Dt===0&&(z.matrix.copy(V.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Vt===!0&&z.cameras.push(V)}let xt=i.enabledFeatures;if(xt&&xt.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){f=n.getBinding();let Dt=f.getDepthInformation(yt[0]);Dt&&Dt.isValid&&Dt.texture&&p.init(Dt,i.renderState)}if(xt&&xt.includes("camera-access")&&_){t.state.unbindTexture(),f=n.getBinding();for(let Dt=0;Dt<yt.length;Dt++){let Jt=yt[Dt].camera;if(Jt){let te=m[Jt];te||(te=new el,m[Jt]=te);let V=f.getCameraImage(Jt);te.sourceTexture=V}}}}for(let yt=0;yt<S.length;yt++){let Vt=w[yt],xt=S[yt];Vt!==null&&xt!==void 0&&xt.update(Vt,tt,c||o)}Wt&&Wt(J,tt),tt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:tt}),g=null}let qt=new J_;qt.setAnimationLoop(Ht),this.setAnimationLoop=function(J){Wt=J},this.dispose=function(){}}},F1=new $e,e0=new Qt;e0.set(-1,0,0,0,1,0,0,0,1);function B1(r,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Of(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,b,A,y){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?s(p,m):m.isMeshLambertMaterial?(s(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(p,m),f(p,m)):m.isMeshPhongMaterial?(s(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(p,m),u(p,m),m.isMeshPhysicalMaterial&&d(p,m,y)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),_(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,b,A):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Qn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Qn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let b=t.get(m),A=b.envMap,y=b.envMapRotation;A&&(p.envMap.value=A,p.envMapRotation.value.setFromMatrix4(F1.makeRotationFromEuler(y)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(e0),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,b,A){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*b,p.scale.value=A*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function f(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function u(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,b){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Qn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=b.texture,p.transmissionSamplerSize.value.set(b.width,b.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){let b=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(b.matrixWorld),p.nearDistance.value=b.shadow.camera.near,p.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function k1(r,t,e,n){let i={},s={},o=[],a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,S){let w=S.program;n.uniformBlockBinding(y,w)}function c(y,S){let w=i[y.id];w===void 0&&(p(y),w=h(y),i[y.id]=w,y.addEventListener("dispose",b));let E=S.program;n.updateUBOMapping(y,E);let v=t.render.frame;s[y.id]!==v&&(u(y),s[y.id]=v)}function h(y){let S=f();y.__bindingPointIndex=S;let w=r.createBuffer(),E=y.__size,v=y.usage;return r.bindBuffer(r.UNIFORM_BUFFER,w),r.bufferData(r.UNIFORM_BUFFER,E,v),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,S,w),w}function f(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Zt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let S=i[y.id],w=y.uniforms,E=y.__cache;r.bindBuffer(r.UNIFORM_BUFFER,S);for(let v=0,T=w.length;v<T;v++){let C=w[v];if(Array.isArray(C))for(let L=0,N=C.length;L<N;L++)d(C[L],v,L,E);else d(C,v,0,E)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function d(y,S,w,E){if(_(y,S,w,E)===!0){let v=y.__offset,T=y.value;if(Array.isArray(T)){let C=0;for(let L=0;L<T.length;L++){let N=T[L],z=m(N);g(N,y.__data,C),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(C+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,y.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,v,y.__data)}}function g(y,S,w){typeof y=="number"||typeof y=="boolean"?S[0]=y:y.isMatrix3?(S[0]=y.elements[0],S[1]=y.elements[1],S[2]=y.elements[2],S[3]=0,S[4]=y.elements[3],S[5]=y.elements[4],S[6]=y.elements[5],S[7]=0,S[8]=y.elements[6],S[9]=y.elements[7],S[10]=y.elements[8],S[11]=0):ArrayBuffer.isView(y)?S.set(new y.constructor(y.buffer,y.byteOffset,S.length)):y.toArray(S,w)}function _(y,S,w,E){let v=y.value,T=S+"_"+w;if(E[T]===void 0)return typeof v=="number"||typeof v=="boolean"?E[T]=v:ArrayBuffer.isView(v)?E[T]=v.slice():E[T]=v.clone(),!0;{let C=E[T];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return E[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function p(y){let S=y.uniforms,w=0,E=16;for(let T=0,C=S.length;T<C;T++){let L=Array.isArray(S[T])?S[T]:[S[T]];for(let N=0,z=L.length;N<z;N++){let I=L[N],B=Array.isArray(I.value)?I.value:[I.value];for(let X=0,k=B.length;X<k;X++){let K=B[X],q=m(K),R=w%E,j=R%q.boundary,Tt=R+j;w+=j,Tt!==0&&E-Tt<q.storage&&(w+=E-Tt),I.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=w,w+=q.storage}}}let v=w%E;return v>0&&(w+=E-v),y.__size=w,y.__cache={},this}function m(y){let S={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(S.boundary=4,S.storage=4):y.isVector2?(S.boundary=8,S.storage=8):y.isVector3||y.isColor?(S.boundary=16,S.storage=12):y.isVector4?(S.boundary=16,S.storage=16):y.isMatrix3?(S.boundary=48,S.storage=48):y.isMatrix4?(S.boundary=64,S.storage=64):y.isTexture?Xt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(S.boundary=16,S.storage=y.byteLength):Xt("WebGLRenderer: Unsupported uniform value type.",y),S}function b(y){let S=y.target;S.removeEventListener("dispose",b);let w=o.indexOf(S.__bindingPointIndex);o.splice(w,1),r.deleteBuffer(i[S.id]),delete i[S.id],delete s[S.id]}function A(){for(let y in i)r.deleteBuffer(i[y]);o=[],i={},s={}}return{bind:l,update:c,dispose:A}}var z1=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),gr=null;function V1(){return gr===null&&(gr=new Qc(z1,16,16,ps,Ji),gr.name="DFG_LUT",gr.minFilter=bn,gr.magFilter=bn,gr.wrapS=hr,gr.wrapT=hr,gr.generateMipmaps=!1,gr.needsUpdate=!0),gr}var ou=class{constructor(t={}){let{canvas:e=y_(),context:n=null,depth:i=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:u=!1,outputBufferType:d=bi}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let _=d,p=new Set([bh,Mh,Sh]),m=new Set([bi,Yi,Yo,Zo,vh,yh]),b=new Uint32Array(4),A=new Int32Array(4),y=new Z,S=null,w=null,E=[],v=[],T=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=qi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,L=!1,N=null,z=null,I=null,B=null;this._outputColorSpace=xi;let X=0,k=0,K=null,q=-1,R=null,j=new He,Tt=new He,Et=null,Wt=new pe(0),Ht=0,qt=e.width,J=e.height,tt=1,yt=null,Vt=null,xt=new He(0,0,qt,J),kt=new He(0,0,qt,J),Gt=!1,Dt=new Qa,Jt=!1,te=!1,V=new $e,se=new Z,we=new He,ke={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},$t=!1;function ve(){return K===null?tt:1}let U=n;function Fe(M,O){return e.getContext(M,O)}let Yt,P,x,F,H,$,ht,at,Q,nt,mt,Pt,gt,pt,ct,Ot,zt,D,ft,et,_t,St,it;try{let M={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Ft,!1),e.addEventListener("webglcontextrestored",st,!1),e.addEventListener("webglcontextcreationerror",Bt,!1),U===null){let O="webgl2";if(U=Fe(O,M),U===null)throw Fe(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}lt()}catch(M){throw e.removeEventListener("webglcontextlost",Ft,!1),e.removeEventListener("webglcontextrestored",st,!1),e.removeEventListener("webglcontextcreationerror",Bt,!1),Zt("WebGLRenderer: "+M.message),M}function lt(){Yt=new ZM(U),Yt.init(),_t=new D1(U,Yt),P=new BM(U,Yt,t,_t),x=new N1(U,Yt),P.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),z=U.createFramebuffer(),I=U.createFramebuffer(),B=U.createFramebuffer(),F=new KM(U),H=new x1,$=new L1(U,Yt,x,H,P,_t,F),ht=new YM(C),at=new jv(U),St=new UM(U,at),Q=new JM(U,at,F,St),nt=new jM(U,Q,at,St,F),D=new QM(U,P,$),ct=new kM(H),mt=new _1(C,ht,Yt,P,St,ct),Pt=new B1(C,H),gt=new y1,pt=new E1(Yt),zt=new OM(C,ht,x,nt,g,l),Ot=new I1(C,nt,P),it=new k1(U,F,P,x),ft=new FM(U,Yt,F),et=new $M(U,Yt,F),F.programs=mt.programs,C.capabilities=P,C.extensions=Yt,C.properties=H,C.renderLists=gt,C.shadowMap=Ot,C.state=x,C.info=F}_!==bi&&(T=new eb(_,e.width,e.height,a,i,s));let rt=new jf(C,U);this.xr=rt,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let M=Yt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Yt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(M){M!==void 0&&(tt=M,this.setSize(qt,J,!1))},this.getSize=function(M){return M.set(qt,J)},this.setSize=function(M,O,Y=!0){if(rt.isPresenting){Xt("WebGLRenderer: Can't change size while VR device is presenting.");return}qt=M,J=O,e.width=Math.floor(M*tt),e.height=Math.floor(O*tt),Y===!0&&(e.style.width=M+"px",e.style.height=O+"px"),T!==null&&T.setSize(e.width,e.height),this.setViewport(0,0,M,O)},this.getDrawingBufferSize=function(M){return M.set(qt*tt,J*tt).floor()},this.setDrawingBufferSize=function(M,O,Y){qt=M,J=O,tt=Y,e.width=Math.floor(M*Y),e.height=Math.floor(O*Y),this.setViewport(0,0,M,O)},this.setEffects=function(M){if(_===bi){Zt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let O=0;O<M.length;O++)if(M[O].isOutputPass===!0){Xt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(j)},this.getViewport=function(M){return M.copy(xt)},this.setViewport=function(M,O,Y,G){M.isVector4?xt.set(M.x,M.y,M.z,M.w):xt.set(M,O,Y,G),x.viewport(j.copy(xt).multiplyScalar(tt).round())},this.getScissor=function(M){return M.copy(kt)},this.setScissor=function(M,O,Y,G){M.isVector4?kt.set(M.x,M.y,M.z,M.w):kt.set(M,O,Y,G),x.scissor(Tt.copy(kt).multiplyScalar(tt).round())},this.getScissorTest=function(){return Gt},this.setScissorTest=function(M){x.setScissorTest(Gt=M)},this.setOpaqueSort=function(M){yt=M},this.setTransparentSort=function(M){Vt=M},this.getClearColor=function(M){return M.copy(zt.getClearColor())},this.setClearColor=function(){zt.setClearColor(...arguments)},this.getClearAlpha=function(){return zt.getClearAlpha()},this.setClearAlpha=function(){zt.setClearAlpha(...arguments)},this.clear=function(M=!0,O=!0,Y=!0){let G=0;if(M){let W=!1;if(K!==null){let vt=K.texture.format;W=p.has(vt)}if(W){let vt=K.texture.type,Ct=m.has(vt),wt=zt.getClearColor(),Nt=zt.getClearAlpha(),Ut=wt.r,ee=wt.g,le=wt.b;Ct?(b[0]=Ut,b[1]=ee,b[2]=le,b[3]=Nt,U.clearBufferuiv(U.COLOR,0,b)):(A[0]=Ut,A[1]=ee,A[2]=le,A[3]=Nt,U.clearBufferiv(U.COLOR,0,A))}else G|=U.COLOR_BUFFER_BIT}O&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),N=M},this.dispose=function(){e.removeEventListener("webglcontextlost",Ft,!1),e.removeEventListener("webglcontextrestored",st,!1),e.removeEventListener("webglcontextcreationerror",Bt,!1),zt.dispose(),gt.dispose(),pt.dispose(),H.dispose(),ht.dispose(),nt.dispose(),St.dispose(),it.dispose(),mt.dispose(),rt.dispose(),rt.removeEventListener("sessionstart",Le),rt.removeEventListener("sessionend",Ee),he.stop()};function Ft(M){M.preventDefault(),Df("WebGLRenderer: Context Lost."),L=!0}function st(){Df("WebGLRenderer: Context Restored."),L=!1;let M=F.autoReset,O=Ot.enabled,Y=Ot.autoUpdate,G=Ot.needsUpdate,W=Ot.type;lt(),F.autoReset=M,Ot.enabled=O,Ot.autoUpdate=Y,Ot.needsUpdate=G,Ot.type=W}function Bt(M){Zt("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function It(M){let O=M.target;O.removeEventListener("dispose",It),Kt(O)}function Kt(M){tn(M),H.remove(M)}function tn(M){let O=H.get(M).programs;O!==void 0&&(O.forEach(function(Y){mt.releaseProgram(Y)}),M.isShaderMaterial&&mt.releaseShaderCache(M))}this.renderBufferDirect=function(M,O,Y,G,W,vt){O===null&&(O=ke);let Ct=W.isMesh&&W.matrixWorld.determinantAffine()<0,wt=mn(M,O,Y,G,W);x.setMaterial(G,Ct);let Nt=Y.index,Ut=1;if(G.wireframe===!0){if(Nt=Q.getWireframeAttribute(Y),Nt===void 0)return;Ut=2}let ee=Y.drawRange,le=Y.attributes.position,Lt=ee.start*Ut,ye=(ee.start+ee.count)*Ut;vt!==null&&(Lt=Math.max(Lt,vt.start*Ut),ye=Math.min(ye,(vt.start+vt.count)*Ut)),Nt!==null?(Lt=Math.max(Lt,0),ye=Math.min(ye,Nt.count)):le!=null&&(Lt=Math.max(Lt,0),ye=Math.min(ye,le.count));let nn=ye-Lt;if(nn<0||nn===1/0)return;St.setup(W,G,wt,Y,Nt);let De,Ae=ft;if(Nt!==null&&(De=at.get(Nt),Ae=et,Ae.setIndex(De)),W.isMesh)G.wireframe===!0?(x.setLineWidth(G.wireframeLinewidth*ve()),Ae.setMode(U.LINES)):Ae.setMode(U.TRIANGLES);else if(W.isLine){let Tn=G.linewidth;Tn===void 0&&(Tn=1),x.setLineWidth(Tn*ve()),W.isLineSegments?Ae.setMode(U.LINES):W.isLineLoop?Ae.setMode(U.LINE_LOOP):Ae.setMode(U.LINE_STRIP)}else W.isPoints?Ae.setMode(U.POINTS):W.isSprite&&Ae.setMode(U.TRIANGLES);if(W.isBatchedMesh)if(Yt.get("WEBGL_multi_draw"))Ae.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let Tn=W._multiDrawStarts,At=W._multiDrawCounts,zn=W._multiDrawCount,me=Nt?at.get(Nt).bytesPerElement:1,Ti=H.get(G).currentProgram.getUniforms();for(let Ki=0;Ki<zn;Ki++)Ti.setValue(U,"_gl_DrawID",Ki),Ae.render(Tn[Ki]/me,At[Ki])}else if(W.isInstancedMesh)Ae.renderInstances(Lt,nn,W.count);else if(Y.isInstancedBufferGeometry){let Tn=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,At=Math.min(Y.instanceCount,Tn);Ae.renderInstances(Lt,nn,At)}else Ae.render(Lt,nn)};function oe(M,O,Y,G){N!==null&&M.isNodeMaterial&&N.setObject(G,M),Jt===!0&&ct.setState(M,Y,!1),M.transparent===!0&&M.side===pr&&M.forceSinglePass===!1?(M.side=Qn,M.needsUpdate=!0,We(M,O,G),M.side=hs,M.needsUpdate=!0,We(M,O,G),M.side=pr):We(M,O,G)}this.compile=function(M,O,Y=null){Y===null&&(Y=M),N!==null&&N.renderStart(M,O,Y),w=pt.get(Y),w.init(O),v.push(w),Y.traverseVisible(function(W){W.isLight&&W.layers.test(O.layers)&&(w.pushLight(W),W.castShadow&&w.pushShadow(W))}),M!==Y&&M.traverseVisible(function(W){W.isLight&&W.layers.test(O.layers)&&(w.pushLight(W),W.castShadow&&w.pushShadow(W))}),w.setupLights(),N!==null&&N.updateLights(w.state.lightsArray),te=this.localClippingEnabled,Jt=ct.init(this.clippingPlanes,te),Jt===!0&&ct.setGlobalState(this.clippingPlanes,O),N!==null&&Ot.render(w.state.shadowsArray,Y,O);let G=new Set;return M.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let vt=W.material;if(vt)if(Array.isArray(vt))for(let Ct=0;Ct<vt.length;Ct++){let wt=vt[Ct];oe(wt,Y,O,W),G.add(wt)}else oe(vt,Y,O,W),G.add(vt)}),w=v.pop(),N!==null&&N.renderEnd(),G},this.compileAsync=function(M,O,Y=null){let G=this.compile(M,O,Y);return new Promise(W=>{function vt(){if(G.forEach(function(Ct){let Nt=H.get(Ct).currentProgram;(Nt===void 0||Nt.isReady())&&G.delete(Ct)}),G.size===0){W(M);return}setTimeout(vt,10)}Yt.get("KHR_parallel_shader_compile")!==null?vt():setTimeout(vt,10)})};let Ne=null;function pn(M){Ne&&Ne(M)}function Le(){he.stop()}function Ee(){he.start()}let he=new J_;he.setAnimationLoop(pn),typeof self<"u"&&he.setContext(self),this.setAnimationLoop=function(M){Ne=M,rt.setAnimationLoop(M),M===null?he.stop():he.start()},rt.addEventListener("sessionstart",Le),rt.addEventListener("sessionend",Ee),this.render=function(M,O){if(O!==void 0&&O.isCamera!==!0){Zt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;N!==null&&N.renderStart(M,O);let Y=rt.enabled===!0&&rt.isPresenting===!0,G=T!==null&&(K===null||Y)&&T.begin(C,K);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),rt.enabled===!0&&rt.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(rt.cameraAutoUpdate===!0&&rt.updateCamera(O),O=rt.getCamera()),M.isScene===!0&&M.onBeforeRender(C,M,O,K),w=pt.get(M,v.length),w.init(O),w.state.textureUnits=$.getTextureUnits(),v.push(w),V.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Dt.setFromProjectionMatrix(V,Xi,O.reversedDepth),te=this.localClippingEnabled,Jt=ct.init(this.clippingPlanes,te),S=gt.get(M,E.length),S.init(),E.push(S),rt.enabled===!0&&rt.isPresenting===!0){let Ct=C.xr.getDepthSensingMesh();Ct!==null&&Bn(Ct,O,-1/0,C.sortObjects)}Bn(M,O,0,C.sortObjects),S.finish(),N!==null&&N.updateLights(w.state.lightsArray),C.sortObjects===!0&&S.sort(yt,Vt),$t=rt.enabled===!1||rt.isPresenting===!1||rt.hasDepthSensing()===!1,$t&&zt.addToRenderList(S,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Jt===!0&&ct.beginShadows();let W=w.state.shadowsArray;if(Ot.render(W,M,O),Jt===!0&&ct.endShadows(),(G&&T.hasRenderPass())===!1){let Ct=S.opaque,wt=S.transmissive;if(w.setupLights(),O.isArrayCamera){let Nt=O.cameras;if(wt.length>0)for(let Ut=0,ee=Nt.length;Ut<ee;Ut++){let le=Nt[Ut];wn(Ct,wt,M,le)}$t&&zt.render(M);for(let Ut=0,ee=Nt.length;Ut<ee;Ut++){let le=Nt[Ut];Pe(S,M,le,le.viewport)}}else wt.length>0&&wn(Ct,wt,M,O),$t&&zt.render(M),Pe(S,M,O)}K!==null&&k===0&&($.updateMultisampleRenderTarget(K),$.updateRenderTargetMipmap(K)),G&&T.end(C),M.isScene===!0&&M.onAfterRender(C,M,O),St.resetDefaultState(),q=-1,R=null,v.pop(),v.length>0?(w=v[v.length-1],$.setTextureUnits(w.state.textureUnits),Jt===!0&&ct.setGlobalState(C.clippingPlanes,w.state.camera)):w=null,E.pop(),E.length>0?S=E[E.length-1]:S=null,N!==null&&N.renderEnd()};function Bn(M,O,Y,G){if(M.visible===!1)return;if(M.layers.test(O.layers)){if(M.isGroup)Y=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(O);else if(M.isLightProbeGrid)w.pushLightProbeGrid(M);else if(M.isLight)w.pushLight(M),M.castShadow&&w.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(Dt)){G&&we.setFromMatrixPosition(M.matrixWorld).applyMatrix4(V);let Ct=nt.update(M),wt=M.material;wt.visible&&S.push(M,Ct,wt,Y,we.z,null,O)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(Dt))){let Ct=nt.update(M),wt=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),we.copy(M.boundingSphere.center)):(Ct.boundingSphere===null&&Ct.computeBoundingSphere(),we.copy(Ct.boundingSphere.center)),we.applyMatrix4(M.matrixWorld).applyMatrix4(V)),Array.isArray(wt)){let Nt=Ct.groups;for(let Ut=0,ee=Nt.length;Ut<ee;Ut++){let le=Nt[Ut],Lt=wt[le.materialIndex];Lt&&Lt.visible&&S.push(M,Ct,Lt,Y,we.z,le,O)}}else wt.visible&&S.push(M,Ct,wt,Y,we.z,null,O)}}let vt=M.children;for(let Ct=0,wt=vt.length;Ct<wt;Ct++)Bn(vt[Ct],O,Y,G)}function Pe(M,O,Y,G){let{opaque:W,transmissive:vt,transparent:Ct}=M;w.setupLightsView(Y),Jt===!0&&ct.setGlobalState(C.clippingPlanes,Y),G&&x.viewport(j.copy(G)),W.length>0&&kn(W,O,Y),vt.length>0&&kn(vt,O,Y),Ct.length>0&&kn(Ct,O,Y),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function wn(M,O,Y,G){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[G.id]===void 0){let Lt=Yt.has("EXT_color_buffer_half_float")||Yt.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[G.id]=new oi(1,1,{generateMipmaps:!0,type:Lt?Ji:bi,minFilter:ds,samples:Math.max(4,P.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ce.workingColorSpace})}let vt=w.state.transmissionRenderTarget[G.id],Ct=G.viewport||j;vt.setSize(Ct.z*C.transmissionResolutionScale,Ct.w*C.transmissionResolutionScale);let wt=C.getRenderTarget(),Nt=C.getActiveCubeFace(),Ut=C.getActiveMipmapLevel();C.setRenderTarget(vt),C.getClearColor(Wt),Ht=C.getClearAlpha(),Ht<1&&C.setClearColor(16777215,.5),C.clear(),$t&&zt.render(Y);let ee=C.toneMapping;C.toneMapping=qi;let le=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),w.setupLightsView(G),Jt===!0&&ct.setGlobalState(C.clippingPlanes,G),kn(M,Y,G),$.updateMultisampleRenderTarget(vt),$.updateRenderTargetMipmap(vt),Yt.has("WEBGL_multisampled_render_to_texture")===!1){let Lt=!1;for(let ye=0,nn=O.length;ye<nn;ye++){let De=O[ye],{object:Ae,geometry:Tn,material:At,group:zn}=De;if(At.side===pr&&Ae.layers.test(G.layers)){let me=At.side;At.side=Qn,At.needsUpdate=!0,en(Ae,Y,G,Tn,At,zn),At.side=me,At.needsUpdate=!0,Lt=!0}}Lt===!0&&($.updateMultisampleRenderTarget(vt),$.updateRenderTargetMipmap(vt))}C.setRenderTarget(wt,Nt,Ut),C.setClearColor(Wt,Ht),le!==void 0&&(G.viewport=le),C.toneMapping=ee}function kn(M,O,Y){let G=O.isScene===!0?O.overrideMaterial:null;for(let W=0,vt=M.length;W<vt;W++){let Ct=M[W],{object:wt,geometry:Nt,group:Ut}=Ct,ee=Ct.material;ee.allowOverride===!0&&G!==null&&(ee=G),wt.layers.test(Y.layers)&&en(wt,O,Y,Nt,ee,Ut)}}function en(M,O,Y,G,W,vt){N!==null&&W.isNodeMaterial&&N.setObject(M,W),M.onBeforeRender(C,O,Y,G,W,vt),M.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),W.onBeforeRender(C,O,Y,G,M,vt),W.transparent===!0&&W.side===pr&&W.forceSinglePass===!1?(W.side=Qn,W.needsUpdate=!0,C.renderBufferDirect(Y,O,G,W,M,vt),W.side=hs,W.needsUpdate=!0,C.renderBufferDirect(Y,O,G,W,M,vt),W.side=pr):C.renderBufferDirect(Y,O,G,W,M,vt),M.onAfterRender(C,O,Y,G,W,vt)}function We(M,O,Y){O.isScene!==!0&&(O=ke);let G=H.get(M),W=w.state.lights,vt=w.state.shadowsArray,Ct=W.state.version,wt=mt.getParameters(M,W.state,vt,O,Y,w.state.lightProbeGridArray),Nt=mt.getProgramCacheKey(wt),Ut=G.programs;G.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?O.environment:null,G.fog=O.fog;let ee=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;G.envMap=ht.get(M.envMap||G.environment,ee),G.envMapRotation=G.environment!==null&&M.envMap===null?O.environmentRotation:M.envMapRotation,Ut===void 0&&(M.addEventListener("dispose",It),Ut=new Map,G.programs=Ut);let le=Ut.get(Nt);if(le!==void 0){if(G.currentProgram===le&&G.lightsStateVersion===Ct)return $i(M,wt),le}else wt.uniforms=mt.getUniforms(M),N!==null&&M.isNodeMaterial&&N.build(M,Y,wt),M.onBeforeCompile(wt,C),le=mt.acquireProgram(wt,Nt),Ut.set(Nt,le),G.uniforms=wt.uniforms;let Lt=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Lt.clippingPlanes=ct.uniform),$i(M,wt),G.needsLights=wi(M),G.lightsStateVersion=Ct,G.needsLights&&(Lt.ambientLightColor.value=W.state.ambient,Lt.lightProbe.value=W.state.probe,Lt.sunLights.value=W.state.sun,Lt.sunLightShadows.value=W.state.sunShadow,Lt.directionalLights.value=W.state.directional,Lt.directionalLightShadows.value=W.state.directionalShadow,Lt.spotLights.value=W.state.spot,Lt.spotLightShadows.value=W.state.spotShadow,Lt.rectAreaLights.value=W.state.rectArea,Lt.ltc_1.value=W.state.rectAreaLTC1,Lt.ltc_2.value=W.state.rectAreaLTC2,Lt.pointLights.value=W.state.point,Lt.pointLightShadows.value=W.state.pointShadow,Lt.hemisphereLights.value=W.state.hemi,Lt.sunShadowMatrix.value=W.state.sunShadowMatrix,Lt.sunShadowCascade.value=W.state.sunShadowCascade,Lt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Lt.spotLightMatrix.value=W.state.spotLightMatrix,Lt.spotLightMap.value=W.state.spotLightMap,Lt.pointShadowMatrix.value=W.state.pointShadowMatrix),G.lightProbeGrid=w.state.lightProbeGridArray.length>0,G.currentProgram=le,G.uniformsList=null,le}function cn(M){if(M.uniformsList===null){let O=M.currentProgram.getUniforms();M.uniformsList=Ko.seqWithValue(O.seq,M.uniforms)}return M.uniformsList}function $i(M,O){let Y=H.get(M);Y.outputColorSpace=O.outputColorSpace,Y.batching=O.batching,Y.batchingColor=O.batchingColor,Y.instancing=O.instancing,Y.instancingColor=O.instancingColor,Y.instancingMorph=O.instancingMorph,Y.skinning=O.skinning,Y.morphTargets=O.morphTargets,Y.morphNormals=O.morphNormals,Y.morphColors=O.morphColors,Y.morphTargetsCount=O.morphTargetsCount,Y.numClippingPlanes=O.numClippingPlanes,Y.numIntersection=O.numClipIntersection,Y.vertexAlphas=O.vertexAlphas,Y.vertexTangents=O.vertexTangents,Y.toneMapping=O.toneMapping}function Qs(M,O){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(O.matrixWorld);for(let Y=0,G=M.length;Y<G;Y++){let W=M[Y];if(W.texture!==null&&W.boundingBox.containsPoint(y))return W}return null}function mn(M,O,Y,G,W){O.isScene!==!0&&(O=ke),$.resetTextureUnits();let vt=O.fog,Ct=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?O.environment:null,wt=K===null?C.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:ce.workingColorSpace,Nt=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Ut=ht.get(G.envMap||Ct,Nt),ee=G.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,le=!!Y.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Lt=!!Y.morphAttributes.position,ye=!!Y.morphAttributes.normal,nn=!!Y.morphAttributes.color,De=qi;G.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(De=C.toneMapping);let Ae=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Tn=Ae!==void 0?Ae.length:0,At=H.get(G),zn=w.state.lights;if(Jt===!0&&(te===!0||M!==R)){let Ie=M===R&&G.id===q;ct.setState(G,M,Ie)}let me=!1;G.version===At.__version?(At.needsLights&&At.lightsStateVersion!==zn.state.version||At.outputColorSpace!==wt||W.isBatchedMesh&&At.batching===!1||!W.isBatchedMesh&&At.batching===!0||W.isBatchedMesh&&At.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&At.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&At.instancing===!1||!W.isInstancedMesh&&At.instancing===!0||W.isSkinnedMesh&&At.skinning===!1||!W.isSkinnedMesh&&At.skinning===!0||W.isInstancedMesh&&At.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&At.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&At.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&At.instancingMorph===!1&&W.morphTexture!==null||At.envMap!==Ut||G.fog===!0&&At.fog!==vt||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==ct.numPlanes||At.numIntersection!==ct.numIntersection)||At.vertexAlphas!==ee||At.vertexTangents!==le||At.morphTargets!==Lt||At.morphNormals!==ye||At.morphColors!==nn||At.toneMapping!==De||At.morphTargetsCount!==Tn||!!At.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(me=!0):(me=!0,At.__version=G.version);let Ti=At.currentProgram;me===!0&&(Ti=We(G,O,W),N&&G.isNodeMaterial&&N.onUpdateProgram(G,Ti,At));let Ki=!1,Or=!1,to=!1,Te=Ti.getUniforms(),Qe=At.uniforms;if(x.useProgram(Ti.program)&&(Ki=!0,Or=!0,to=!0),G.id!==q&&(q=G.id,Or=!0),At.needsLights){let Ie=Qs(w.state.lightProbeGridArray,W);At.lightProbeGrid!==Ie&&(At.lightProbeGrid=Ie,Or=!0)}if(Ki||R!==M){x.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Te.setValue(U,"projectionMatrix",M.projectionMatrix),Te.setValue(U,"viewMatrix",M.matrixWorldInverse);let Fr=Te.map.cameraPosition;Fr!==void 0&&Fr.setValue(U,se.setFromMatrixPosition(M.matrixWorld)),P.logarithmicDepthBuffer&&Te.setValue(U,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Te.setValue(U,"isOrthographic",M.isOrthographicCamera===!0),R!==M&&(R=M,Or=!0,to=!0)}if(At.needsLights&&(zn.state.sunShadowMap.length>0&&Te.setValue(U,"sunShadowMap",zn.state.sunShadowMap,$),zn.state.directionalShadowMap.length>0&&Te.setValue(U,"directionalShadowMap",zn.state.directionalShadowMap,$),zn.state.spotShadowMap.length>0&&Te.setValue(U,"spotShadowMap",zn.state.spotShadowMap,$),zn.state.pointShadowMap.length>0&&Te.setValue(U,"pointShadowMap",zn.state.pointShadowMap,$)),W.isSkinnedMesh){Te.setOptional(U,W,"bindMatrix"),Te.setOptional(U,W,"bindMatrixInverse");let Ie=W.skeleton;Ie&&(Ie.boneTexture===null&&Ie.computeBoneTexture(),Te.setValue(U,"boneTexture",Ie.boneTexture,$))}W.isBatchedMesh&&(Te.setOptional(U,W,"batchingTexture"),Te.setValue(U,"batchingTexture",W._matricesTexture,$),Te.setOptional(U,W,"batchingIdTexture"),Te.setValue(U,"batchingIdTexture",W._indirectTexture,$),Te.setOptional(U,W,"batchingColorTexture"),W._colorsTexture!==null&&Te.setValue(U,"batchingColorTexture",W._colorsTexture,$));let Ur=Y.morphAttributes;if((Ur.position!==void 0||Ur.normal!==void 0||Ur.color!==void 0)&&D.update(W,Y,Ti),(Or||At.receiveShadow!==W.receiveShadow)&&(At.receiveShadow=W.receiveShadow,Te.setValue(U,"receiveShadow",W.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&O.environment!==null&&(Qe.envMapIntensity.value=O.environmentIntensity),Qe.dfgLUT!==void 0&&(Qe.dfgLUT.value=V1()),Or){if(Te.setValue(U,"toneMappingExposure",C.toneMappingExposure),At.needsLights&&Ke(Qe,to),vt&&G.fog===!0&&Pt.refreshFogUniforms(Qe,vt),Pt.refreshMaterialUniforms(Qe,G,tt,J,w.state.transmissionRenderTarget[M.id]),At.needsLights&&At.lightProbeGrid){let Ie=At.lightProbeGrid;Qe.probesSH.value=Ie.texture,Qe.probesMin.value.copy(Ie.boundingBox.min),Qe.probesMax.value.copy(Ie.boundingBox.max),Qe.probesResolution.value.copy(Ie.resolution)}Ko.upload(U,cn(At),Qe,$)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ko.upload(U,cn(At),Qe,$),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Te.setValue(U,"center",W.center),Te.setValue(U,"modelViewMatrix",W.modelViewMatrix),Te.setValue(U,"normalMatrix",W.normalMatrix),Te.setValue(U,"modelMatrix",W.matrixWorld),G.uniformsGroups!==void 0){let Ie=G.uniformsGroups;for(let Fr=0,eo=Ie.length;Fr<eo;Fr++){let tp=Ie[Fr];it.update(tp,Ti),it.bind(tp,Ti)}}return Ti}function Ke(M,O){M.ambientLightColor.needsUpdate=O,M.lightProbe.needsUpdate=O,M.sunLights.needsUpdate=O,M.sunLightShadows.needsUpdate=O,M.directionalLights.needsUpdate=O,M.directionalLightShadows.needsUpdate=O,M.pointLights.needsUpdate=O,M.pointLightShadows.needsUpdate=O,M.spotLights.needsUpdate=O,M.spotLightShadows.needsUpdate=O,M.rectAreaLights.needsUpdate=O,M.hemisphereLights.needsUpdate=O}function wi(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(M,O,Y){let G=H.get(M);G.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),H.get(M.texture).__webglTexture=O,H.get(M.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Y,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,O){let Y=H.get(M);Y.__webglFramebuffer=O,Y.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(M,O=0,Y=0){K=M,X=O,k=Y;let G=null,W=!1,vt=!1;if(M){let wt=H.get(M);if(wt.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,wt.__webglFramebuffer),j.copy(M.viewport),Tt.copy(M.scissor),Et=M.scissorTest,x.viewport(j),x.scissor(Tt),x.setScissorTest(Et),q=-1;return}else if(wt.__webglFramebuffer===void 0)$.setupRenderTarget(M);else if(wt.__hasExternalTextures)$.rebindTextures(M,H.get(M.texture).__webglTexture,H.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let ee=M.depthTexture;if(wt.__boundDepthTexture!==ee){if(ee!==null&&H.has(ee)&&(M.width!==ee.image.width||M.height!==ee.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(M)}}let Nt=M.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(vt=!0);let Ut=H.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ut[O])?G=Ut[O][Y]:G=Ut[O],W=!0):M.samples>0&&$.useMultisampledRTT(M)===!1?G=H.get(M).__webglMultisampledFramebuffer:Array.isArray(Ut)?G=Ut[Y]:G=Ut,j.copy(M.viewport),Tt.copy(M.scissor),Et=M.scissorTest}else j.copy(xt).multiplyScalar(tt).floor(),Tt.copy(kt).multiplyScalar(tt).floor(),Et=Gt;if(Y!==0&&(G=z),x.bindFramebuffer(U.FRAMEBUFFER,G)&&x.drawBuffers(M,G),x.viewport(j),x.scissor(Tt),x.setScissorTest(Et),W){let wt=H.get(M.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+O,wt.__webglTexture,Y)}else if(vt){let wt=O;for(let Nt=0;Nt<M.textures.length;Nt++){let Ut=H.get(M.textures[Nt]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Nt,Ut.__webglTexture,Y,wt)}}else if(M!==null&&Y!==0){let wt=H.get(M.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,wt.__webglTexture,Y)}q=-1};function js(M){let O=H.get(M);return(O.__readFormat!==M.format||O.__readType!==M.type)&&(O.__readFormat=M.format,O.__readType=M.type,O.__formatReadable=P.textureFormatReadable(M.format),O.__typeReadable=P.textureTypeReadable(M.type)),O}this.readRenderTargetPixels=function(M,O,Y,G,W,vt,Ct,wt=0){if(!(M&&M.isWebGLRenderTarget)){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Nt=H.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ct!==void 0&&(Nt=Nt[Ct]),Nt){x.bindFramebuffer(U.FRAMEBUFFER,Nt);try{let Ut=M.textures[wt],ee=Ut.format,le=Ut.type;M.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+wt);let Lt=js(Ut);if(Lt.__formatReadable===!1){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Lt.__typeReadable===!1){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=M.width-G&&Y>=0&&Y<=M.height-W&&U.readPixels(O,Y,G,W,_t.convert(ee),_t.convert(le),vt)}finally{let Ut=K!==null?H.get(K).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Ut)}}},this.readRenderTargetPixelsAsync=async function(M,O,Y,G,W,vt,Ct,wt=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Nt=H.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Ct!==void 0&&(Nt=Nt[Ct]),Nt)if(O>=0&&O<=M.width-G&&Y>=0&&Y<=M.height-W){x.bindFramebuffer(U.FRAMEBUFFER,Nt);let Ut=M.textures[wt],ee=Ut.format,le=Ut.type;M.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+wt);let Lt=js(Ut);if(Lt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Lt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ye=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,ye),U.bufferData(U.PIXEL_PACK_BUFFER,vt.byteLength,U.STREAM_READ),U.readPixels(O,Y,G,W,_t.convert(ee),_t.convert(le),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let nn=K!==null?H.get(K).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,nn);let De=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await M_(U,De,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,ye),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,vt),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(ye),U.deleteSync(De),vt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,O=null,Y=0){let G=Math.pow(2,-Y),W=Math.floor(M.image.width*G),vt=Math.floor(M.image.height*G),Ct=O!==null?O.x:0,wt=O!==null?O.y:0;$.setTexture2D(M,0),U.copyTexSubImage2D(U.TEXTURE_2D,Y,0,0,Ct,wt,W,vt),x.unbindTexture()},this.copyTextureToTexture=function(M,O,Y=null,G=null,W=0,vt=0){let Ct,wt,Nt,Ut,ee,le,Lt,ye,nn,De=M.isCompressedTexture?M.mipmaps[vt]:M.image;if(Y!==null)Ct=Y.max.x-Y.min.x,wt=Y.max.y-Y.min.y,Nt=Y.isBox3?Y.max.z-Y.min.z:1,Ut=Y.min.x,ee=Y.min.y,le=Y.isBox3?Y.min.z:0;else{let Qe=Math.pow(2,-W);Ct=Math.floor(De.width*Qe),wt=Math.floor(De.height*Qe),M.isDataArrayTexture?Nt=De.depth:M.isData3DTexture?Nt=Math.floor(De.depth*Qe):Nt=1,Ut=0,ee=0,le=0}G!==null?(Lt=G.x,ye=G.y,nn=G.z):(Lt=0,ye=0,nn=0);let Ae=_t.convert(O.format),Tn=_t.convert(O.type),At;O.isData3DTexture?($.setTexture3D(O,0),At=U.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?($.setTexture2DArray(O,0),At=U.TEXTURE_2D_ARRAY):($.setTexture2D(O,0),At=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,O.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,O.unpackAlignment);let zn=x.getParameter(U.UNPACK_ROW_LENGTH),me=x.getParameter(U.UNPACK_IMAGE_HEIGHT),Ti=x.getParameter(U.UNPACK_SKIP_PIXELS),Ki=x.getParameter(U.UNPACK_SKIP_ROWS),Or=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,De.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,De.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,Ut),x.pixelStorei(U.UNPACK_SKIP_ROWS,ee),x.pixelStorei(U.UNPACK_SKIP_IMAGES,le);let to=M.isDataArrayTexture||M.isData3DTexture,Te=O.isDataArrayTexture||O.isData3DTexture;if(M.isDepthTexture){let Qe=H.get(M),Ur=H.get(O),Ie=H.get(Qe.__renderTarget),Fr=H.get(Ur.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,Ie.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,Fr.__webglFramebuffer);for(let eo=0;eo<Nt;eo++)to&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,H.get(M).__webglTexture,W,le+eo),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,H.get(O).__webglTexture,vt,nn+eo)),U.blitFramebuffer(Ut,ee,Ct,wt,Lt,ye,Ct,wt,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(W!==0||M.isRenderTargetTexture||H.has(M)){let Qe=H.get(M),Ur=H.get(O);x.bindFramebuffer(U.READ_FRAMEBUFFER,I),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,B);for(let Ie=0;Ie<Nt;Ie++)to?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Qe.__webglTexture,W,le+Ie):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Qe.__webglTexture,W),Te?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ur.__webglTexture,vt,nn+Ie):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ur.__webglTexture,vt),W!==0?U.blitFramebuffer(Ut,ee,Ct,wt,Lt,ye,Ct,wt,U.COLOR_BUFFER_BIT,U.NEAREST):Te?U.copyTexSubImage3D(At,vt,Lt,ye,nn+Ie,Ut,ee,Ct,wt):U.copyTexSubImage2D(At,vt,Lt,ye,Ut,ee,Ct,wt);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Te?M.isDataTexture||M.isData3DTexture?U.texSubImage3D(At,vt,Lt,ye,nn,Ct,wt,Nt,Ae,Tn,De.data):O.isCompressedArrayTexture?U.compressedTexSubImage3D(At,vt,Lt,ye,nn,Ct,wt,Nt,Ae,De.data):U.texSubImage3D(At,vt,Lt,ye,nn,Ct,wt,Nt,Ae,Tn,De):M.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,vt,Lt,ye,Ct,wt,Ae,Tn,De.data):M.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,vt,Lt,ye,De.width,De.height,Ae,De.data):U.texSubImage2D(U.TEXTURE_2D,vt,Lt,ye,Ct,wt,Ae,Tn,De);x.pixelStorei(U.UNPACK_ROW_LENGTH,zn),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,me),x.pixelStorei(U.UNPACK_SKIP_PIXELS,Ti),x.pixelStorei(U.UNPACK_SKIP_ROWS,Ki),x.pixelStorei(U.UNPACK_SKIP_IMAGES,Or),vt===0&&O.generateMipmaps&&U.generateMipmap(At),x.unbindTexture()},this.initRenderTarget=function(M){H.get(M).__webglFramebuffer===void 0&&$.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?$.setTextureCube(M,0):M.isData3DTexture?$.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?$.setTexture2DArray(M,0):$.setTexture2D(M,0),x.unbindTexture()},this.resetState=function(){X=0,k=0,K=null,x.reset(),St.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ce._getDrawingBufferColorSpace(t),e.unpackColorSpace=ce._getUnpackColorSpace()}};var cu=class r{elementRef=Oe(Qi);animationService=Oe(Li);destroyRef=Oe(no);platformId=Oe(yl);isBrowser=Tl(this.platformId);scene=null;camera=null;renderer=null;particles=null;animationFrameId=null;ngAfterViewInit(){this.isBrowser&&(this.initializeAnimations(),this.initializeWebGL())}initializeAnimations(){let t=this.elementRef.nativeElement.querySelector(".hero-headline"),e=this.elementRef.nativeElement.querySelector(".hero-subheadline"),n=this.elementRef.nativeElement.querySelectorAll(".hero-cta");this.animationService.textReveal(t,.2),this.animationService.textReveal(e,.4),this.animationService.staggerReveal(Array.from(n),.1)}initializeWebGL(){let t=this.elementRef.nativeElement.querySelector(".hero-canvas");t&&(this.scene=new Ya,this.camera=new Un(75,window.innerWidth/window.innerHeight,.1,1e3),this.camera.position.z=50,this.renderer=new ou({alpha:!0,antialias:!0,powerPreference:"high-performance"}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),t.appendChild(this.renderer.domElement),this.createParticles(),this.setupMouseInteraction(),this.animate(),window.addEventListener("resize",()=>this.onWindowResize()),this.destroyRef.onDestroy(()=>{this.cleanupWebGL()}))}createParticles(){if(!this.scene)return;let t=2e3,e=new yi,n=new Float32Array(t*3),i=new Float32Array(t*3);for(let o=0;o<t;o++){n[o*3]=(Math.random()-.5)*100,n[o*3+1]=(Math.random()-.5)*100,n[o*3+2]=(Math.random()-.5)*100;let a=Math.random();i[o*3]=.39+a*.06,i[o*3+1]=.4+a*.44,i[o*3+2]=.95-a*.35}e.setAttribute("position",new Kn(n,3)),e.setAttribute("color",new Kn(i,3));let s=new Ho({size:.5,vertexColors:!0,transparent:!0,opacity:.8,blending:al});this.particles=new ja(e,s),this.scene?.add(this.particles)}setupMouseInteraction(){let t=0,e=0;document.addEventListener("mousemove",n=>{t=n.clientX/window.innerWidth*2-1,e=-(n.clientY/window.innerHeight)*2+1}),this.mouseX=t,this.mouseY=e}animate(){if(!this.renderer||!this.scene||!this.camera||!this.particles)return;this.animationFrameId=requestAnimationFrame(()=>this.animate()),this.particles.rotation.x+=5e-4,this.particles.rotation.y+=.001;let t=this.mouseX||0,e=this.mouseY||0;this.particles.rotation.x+=e*.001,this.particles.rotation.y+=t*.001,this.renderer.render(this.scene,this.camera)}onWindowResize(){!this.camera||!this.renderer||(this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(window.innerWidth,window.innerHeight))}cleanupWebGL(){this.animationFrameId&&cancelAnimationFrame(this.animationFrameId),this.renderer&&(this.renderer.dispose(),this.renderer.domElement.remove()),this.particles&&(this.particles.geometry.dispose(),this.particles.material.dispose())}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-hero"]],decls:32,vars:0,consts:[["id","hero",1,"hero"],[1,"hero-canvas"],[1,"container"],[1,"hero-content"],[1,"hero-headline"],[1,"text-gradient"],[1,"hero-subheadline"],[1,"hero-cta"],[1,"btn","btn-primary","magnetic-btn"],[1,"btn","btn-secondary","magnetic-btn"],[1,"hero-stats"],[1,"stat-item"],[1,"stat-value"],[1,"stat-label"]],template:function(e,n){e&1&&(ut(0,"section",0),ta(1,"div",1),ut(2,"div",2)(3,"div",3)(4,"h1",4)(5,"span",5),ot(6,"Grow Your Wealth"),dt(),ta(7,"br"),ot(8," With Confidence "),dt(),ut(9,"p",6),ot(10," Premium fixed deposit solutions with guaranteed returns. Secure your future with UNO Bank's competitive rates and flexible tenures. "),dt(),ut(11,"div",7)(12,"button",8),ot(13,"Start Investing"),dt(),ut(14,"button",9),ot(15,"Calculate Returns"),dt()(),ut(16,"div",10)(17,"div",11)(18,"span",12),ot(19,"8.5%"),dt(),ut(20,"span",13),ot(21,"Max Interest Rate"),dt()(),ut(22,"div",11)(23,"span",12),ot(24,"\u20B910K"),dt(),ut(25,"span",13),ot(26,"Min Deposit"),dt()(),ut(27,"div",11)(28,"span",12),ot(29,"120"),dt(),ut(30,"span",13),ot(31,"Months Tenure"),dt()()()()()())},dependencies:[qe],styles:[".hero[_ngcontent-%COMP%]{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding-top:80px}.hero-canvas[_ngcontent-%COMP%]{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0}.hero-content[_ngcontent-%COMP%]{position:relative;z-index:1;max-width:800px}.hero-headline[_ngcontent-%COMP%]{font-size:clamp(3rem,6vw,5rem);line-height:1.1;margin-bottom:var(--%NS%spacing-lg)}.hero-headline[_ngcontent-%COMP%]   .text-gradient[_ngcontent-%COMP%]{background:linear-gradient(135deg,var(--%NS%color-primary) 0%,var(--%NS%color-accent) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.hero-subheadline[_ngcontent-%COMP%]{font-size:clamp(1.125rem,2vw,1.5rem);color:var(--%NS%color-text-secondary);margin-bottom:var(--%NS%spacing-xl);max-width:600px}.hero-cta[_ngcontent-%COMP%]{display:flex;gap:var(--%NS%spacing-md);margin-bottom:var(--%NS%spacing-3xl)}.hero-cta[_ngcontent-%COMP%]   .magnetic-btn[_ngcontent-%COMP%]{position:relative}.hero-stats[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--%NS%spacing-lg)}.hero-stats[_ngcontent-%COMP%]   .stat-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.5rem}.hero-stats[_ngcontent-%COMP%]   .stat-value[_ngcontent-%COMP%]{font-family:var(--%NS%font-display);font-size:2.5rem;font-weight:700;color:var(--%NS%color-text-primary)}.hero-stats[_ngcontent-%COMP%]   .stat-label[_ngcontent-%COMP%]{font-size:.875rem;color:var(--%NS%color-text-muted);text-transform:uppercase;letter-spacing:.05em}@media(max-width:768px){.hero-cta[_ngcontent-%COMP%]{flex-direction:column}.hero-cta[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{width:100%}.hero-stats[_ngcontent-%COMP%]{grid-template-columns:1fr;gap:var(--%NS%spacing-md)}.stat-value[_ngcontent-%COMP%]{font-size:2rem}}"]})};var H1=(r,t)=>t.title;function W1(r,t){if(r&1&&(ut(0,"div",5)(1,"div",6),ot(2),dt(),ut(3,"h3"),ot(4),dt(),ut(5,"p"),ot(6),dt()()),r&2){let e=t.$implicit;Mt(2),xe(e.icon),Mt(2),xe(e.title),Mt(2),xe(e.description)}}var hu=class r{animationService=Oe(Li);elementRef=Oe(Qi);features=[{icon:"\u{1F512}",title:"Bank-Grade Security",description:"Your investments are protected with 256-bit encryption and multi-factor authentication."},{icon:"\u{1F4C8}",title:"Competitive Rates",description:"Enjoy industry-leading interest rates up to 8.5% p.a. on your fixed deposits."},{icon:"\u26A1",title:"Instant Processing",description:"Open FD accounts and process transactions in real-time with zero delays."},{icon:"\u{1F3AF}",title:"Flexible Tenures",description:"Choose from 6 to 120 months tenure options to match your financial goals."},{icon:"\u{1F4B3}",title:"Easy Management",description:"Manage all your FDs from one intuitive dashboard with detailed analytics."},{icon:"\u{1F310}",title:"24/7 Access",description:"Access your accounts anytime, anywhere with our secure online platform."}];ngAfterViewInit(){let t=this.elementRef.nativeElement.querySelectorAll(".feature-card");this.animationService.staggerReveal(Array.from(t),.1)}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-features"]],decls:10,vars:0,consts:[["id","features",1,"features","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"features-grid"],[1,"feature-card","card"],[1,"feature-icon"]],template:function(e,n){e&1&&(ut(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"Why Choose UNO Bank?"),dt(),ut(5,"p"),ot(6,"Experience banking designed for the modern investor"),dt()(),ut(7,"div",4),rn(8,W1,7,3,"div",5,H1),dt()()()),e&2&&(Mt(8),sn(n.features))},dependencies:[qe],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary)}.features-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--%NS%spacing-lg)}.feature-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-md);text-align:center;padding:var(--%NS%spacing-xl)}.feature-card[_ngcontent-%COMP%]   .feature-icon[_ngcontent-%COMP%]{font-size:3rem;margin-bottom:var(--%NS%spacing-sm)}.feature-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:1.25rem;margin-bottom:var(--%NS%spacing-xs)}.feature-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:.9375rem;line-height:1.6}"]})};var X1=(r,t)=>t.number;function q1(r,t){if(r&1&&(ut(0,"div",5)(1,"div",6),ot(2),dt(),ut(3,"div",7)(4,"h3"),ot(5),dt(),ut(6,"p"),ot(7),dt()()()),r&2){let e=t.$implicit;Mt(2),xe(e.number),Mt(3),xe(e.title),Mt(2),xe(e.description)}}var uu=class r{animationService=Oe(Li);elementRef=Oe(Qi);steps=[{number:"01",title:"Create Account",description:"Sign up in minutes with our secure registration process. Verify your identity and you're ready to go."},{number:"02",title:"Choose Your FD",description:"Select from our range of FD products with competitive rates and flexible tenures that suit your goals."},{number:"03",title:"Deposit & Grow",description:"Make your deposit and watch your wealth grow with guaranteed returns and compound interest."}];ngAfterViewInit(){let t=this.elementRef.nativeElement.querySelectorAll(".step-card");this.animationService.staggerReveal(Array.from(t),.2)}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-how-it-works"]],decls:10,vars:0,consts:[["id","how-it-works",1,"how-it-works","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"steps-container"],[1,"step-card","card"],[1,"step-number"],[1,"step-content"]],template:function(e,n){e&1&&(ut(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"How It Works"),dt(),ut(5,"p"),ot(6,"Start your investment journey in three simple steps"),dt()(),ut(7,"div",4),rn(8,q1,8,3,"div",5,X1),dt()()()),e&2&&(Mt(8),sn(n.steps))},dependencies:[qe],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary)}.steps-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--%NS%spacing-lg)}.step-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-md);padding:var(--%NS%spacing-xl);position:relative}.step-card[_ngcontent-%COMP%]   .step-number[_ngcontent-%COMP%]{font-size:3rem;font-weight:700;color:var(--%NS%color-primary);opacity:.3;line-height:1}.step-card[_ngcontent-%COMP%]   .step-content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:1.25rem;margin-bottom:var(--%NS%spacing-sm)}.step-card[_ngcontent-%COMP%]   .step-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:.9375rem;line-height:1.6}"]})};var Y1=(r,t)=>t.productCode;function Z1(r,t){if(r&1&&(ge(0,"option",21),ot(1),fe()),r&2){let e=t.$implicit;xu("value",e.productCode),Mt(),xe(e.productName)}}function J1(r,t){r&1&&ot(0," Calculating... ")}function $1(r,t){r&1&&ot(0," Calculate Returns ")}function K1(r,t){if(r&1&&(ge(0,"div",23),ot(1),fe()),r&2){let e=En();Mt(),xe(e.error())}}function Q1(r,t){if(r&1&&(ge(0,"div",24)(1,"h3"),ot(2,"Your Returns"),fe(),ge(3,"div",25)(4,"div",26)(5,"span",27),ot(6,"Maturity Amount"),fe(),ge(7,"span",28),ot(8),fe()(),ge(9,"div",26)(10,"span",27),ot(11,"Interest Earned"),fe(),ge(12,"span",29),ot(13),fe()(),ge(14,"div",26)(15,"span",27),ot(16,"Interest Rate"),fe(),ge(17,"span",30),ot(18),fe()(),ge(19,"div",26)(20,"span",27),ot(21,"Maturity Date"),fe(),ge(22,"span",30),ot(23),fe()()(),ge(24,"div",31)(25,"div",32)(26,"span"),ot(27),fe()(),ge(28,"div",33)(29,"span"),ot(30),fe()()()()),r&2){let e=En();Mt(8),Ei("\u20B9",e.formattedMaturity()),Mt(5),Ei("\u20B9",e.formattedInterest()),Mt(5),Ei("",e.interestRate(),"% p.a."),Mt(5),xe(e.calculationResult().maturityDate),Mt(2),vu("width",e.principal()/e.calculationResult().maturityAmount*100,"%"),Mt(2),Ei("Principal: ",e.formattedPrincipal()),Mt(),vu("width",e.calculationResult().interestEarned/e.calculationResult().maturityAmount*100,"%"),Mt(2),Ei("Interest: ",e.formattedInterest())}}var du=class r{apiClient=Oe(gp);animationService=Oe(Li);elementRef=Oe(Qi);principal=ai(1e5);termMonths=ai(12);interestType=ai("COMPOUND");productCode=ai("FD001");calculationResult=ai(null);isCalculating=ai(!1);error=ai("");products=ai([]);formattedPrincipal=na(()=>this.principal().toLocaleString("en-IN"));formattedMaturity=na(()=>{let t=this.calculationResult();return t?t.maturityAmount?.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}):"0"});formattedInterest=na(()=>{let t=this.calculationResult();return t?t.interestEarned?.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}):"0"});interestRate=na(()=>{let t=this.calculationResult();return t?t.interestRate:0});ngAfterViewInit(){this.loadProducts(),this.initializeAnimations()}initializeAnimations(){let t=this.elementRef.nativeElement.querySelector(".calculator-container");this.animationService.fadeInOnScroll(t)}async loadProducts(){try{let t=await this.apiClient.getActiveProducts("FD").toPromise();this.products.set(t||[])}catch(t){console.error("Failed to load products:",t)}}async calculate(){this.isCalculating.set(!0),this.error.set(""),this.calculationResult.set(null);try{let t=await this.apiClient.calculateMaturity({productCode:this.productCode(),principal:this.principal(),termMonths:this.termMonths(),interestType:this.interestType()}).toPromise();this.calculationResult.set(t),this.animateResult()}catch(t){this.error.set(t.error?.message||"Failed to calculate. Please try again.")}finally{this.isCalculating.set(!1)}}animateResult(){let t=this.elementRef.nativeElement.querySelector(".calculator-result");t&&this.animationService.clipPathReveal(t,"up")}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-fd-calculator"]],decls:44,vars:12,consts:[["id","calculator",1,"calculator-section","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"calculator-container"],[1,"calculator-inputs","card"],[1,"input-group"],["for","principal"],["type","number","id","principal","min","10000","max","10000000","step","1000",3,"ngModelChange","ngModel"],[1,"slider-container"],["type","range","min","10000","max","1000000","step","5000",1,"slider",3,"ngModelChange","ngModel"],[1,"input-value"],["for","term"],["type","number","id","term","min","6","max","120",3,"ngModelChange","ngModel"],["type","range","min","6","max","120","step","6",1,"slider",3,"ngModelChange","ngModel"],["for","interestType"],["id","interestType",3,"ngModelChange","ngModel"],["value","COMPOUND"],["value","SIMPLE"],["for","product"],["id","product",3,"ngModelChange","ngModel"],[3,"value"],[1,"btn","btn-primary",3,"click","disabled"],[1,"error"],[1,"calculator-result","card"],[1,"result-grid"],[1,"result-item"],[1,"result-label"],[1,"result-value","text-gradient"],[1,"result-value","accent"],[1,"result-value"],[1,"result-chart"],[1,"chart-bar","principal-bar"],[1,"chart-bar","interest-bar"]],template:function(e,n){e&1&&(ge(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"FD Calculator"),fe(),ge(5,"p"),ot(6,"Calculate your returns with our interactive calculator"),fe()(),ge(7,"div",4)(8,"div",5)(9,"div",6)(10,"label",7),ot(11,"Principal Amount (\u20B9)"),fe(),ge(12,"input",8),_s(),Ss("ngModelChange",function(s){return ys(n.principal,s)||(n.principal=s),s}),fe(),ge(13,"div",9)(14,"input",10),_s(),Ss("ngModelChange",function(s){return ys(n.principal,s)||(n.principal=s),s}),fe()(),ge(15,"span",11),ot(16),fe()(),ge(17,"div",6)(18,"label",12),ot(19,"Tenure (Months)"),fe(),ge(20,"input",13),_s(),Ss("ngModelChange",function(s){return ys(n.termMonths,s)||(n.termMonths=s),s}),fe(),ge(21,"div",9)(22,"input",14),_s(),Ss("ngModelChange",function(s){return ys(n.termMonths,s)||(n.termMonths=s),s}),fe()(),ge(23,"span",11),ot(24),fe()(),ge(25,"div",6)(26,"label",15),ot(27,"Interest Type"),fe(),ge(28,"select",16),_s(),Ss("ngModelChange",function(s){return ys(n.interestType,s)||(n.interestType=s),s}),ge(29,"option",17),ot(30,"Compound Interest"),fe(),ge(31,"option",18),ot(32,"Simple Interest"),fe()()(),ge(33,"div",6)(34,"label",19),ot(35,"Product"),fe(),ge(36,"select",20),_s(),Ss("ngModelChange",function(s){return ys(n.productCode,s)||(n.productCode=s),s}),rn(37,Z1,2,2,"option",21,Y1),fe()(),ge(39,"button",22),rp("click",function(){return n.calculate()}),ji(40,J1,1,0)(41,$1,1,0),fe(),ji(42,K1,2,1,"div",23),fe(),ji(43,Q1,31,10,"div",24),fe()()()),e&2&&(Mt(12),vs("ngModel",n.principal),xs(),Mt(2),vs("ngModel",n.principal),xs(),Mt(2),xe(n.formattedPrincipal()),Mt(4),vs("ngModel",n.termMonths),xs(),Mt(2),vs("ngModel",n.termMonths),xs(),Mt(2),Ei("",n.termMonths()," months"),Mt(4),vs("ngModel",n.interestType),xs(),Mt(8),vs("ngModel",n.productCode),xs(),Mt(),sn(n.products()),Mt(2),xu("disabled",n.isCalculating()),Mt(),tr(n.isCalculating()?40:41),Mt(2),tr(n.error()?42:-1),Mt(),tr(n.calculationResult()?43:-1))},dependencies:[qe,El,pp,mp,op,up,dp,fp,cp,lp,ap,hp],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary)}.calculator-container[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:var(--%NS%spacing-2xl);align-items:start}.calculator-inputs[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-lg)}.input-group[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-sm)}.input-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{font-weight:600;color:var(--%NS%color-text-primary);font-size:.875rem}.input-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%], .input-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]{width:100%}.input-group[_ngcontent-%COMP%]   .slider-container[_ngcontent-%COMP%]{margin-top:var(--%NS%spacing-xs)}.input-group[_ngcontent-%COMP%]   .slider[_ngcontent-%COMP%]{-webkit-appearance:none;width:100%;height:6px;border-radius:var(--%NS%radius-sm);background:var(--%NS%color-border);outline:none}.input-group[_ngcontent-%COMP%]   .slider[_ngcontent-%COMP%]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:var(--%NS%color-primary);cursor:pointer;transition:background var(--%NS%transition-fast)}.input-group[_ngcontent-%COMP%]   .slider[_ngcontent-%COMP%]::-webkit-slider-thumb:hover{background:var(--%NS%color-primary-light)}.input-group[_ngcontent-%COMP%]   .slider[_ngcontent-%COMP%]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:var(--%NS%color-primary);cursor:pointer;border:none}.input-group[_ngcontent-%COMP%]   .input-value[_ngcontent-%COMP%]{font-size:.875rem;color:var(--%NS%color-text-muted)}.calculator-result[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-lg)}.calculator-result[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:1.5rem;margin-bottom:var(--%NS%spacing-sm)}.result-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:var(--%NS%spacing-md)}.result-item[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.25rem}.result-item[_ngcontent-%COMP%]   .result-label[_ngcontent-%COMP%]{font-size:.875rem;color:var(--%NS%color-text-muted);text-transform:uppercase;letter-spacing:.05em}.result-item[_ngcontent-%COMP%]   .result-value[_ngcontent-%COMP%]{font-size:1.5rem;font-weight:700;color:var(--%NS%color-text-primary)}.result-item[_ngcontent-%COMP%]   .result-value.accent[_ngcontent-%COMP%]{color:var(--%NS%color-accent)}.result-chart[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-sm);margin-top:var(--%NS%spacing-md)}.result-chart[_ngcontent-%COMP%]   .chart-bar[_ngcontent-%COMP%]{height:40px;border-radius:var(--%NS%radius-md);display:flex;align-items:center;padding:0 var(--%NS%spacing-md);font-size:.875rem;font-weight:600;color:#fff;transition:width .5s ease;overflow:hidden}.result-chart[_ngcontent-%COMP%]   .chart-bar.principal-bar[_ngcontent-%COMP%]{background:var(--%NS%color-primary)}.result-chart[_ngcontent-%COMP%]   .chart-bar.interest-bar[_ngcontent-%COMP%]{background:var(--%NS%color-accent)}@media(max-width:768px){.calculator-container[_ngcontent-%COMP%], .result-grid[_ngcontent-%COMP%]{grid-template-columns:1fr}}"]})};var j1=(r,t)=>t.name;function tw(r,t){r&1&&(ut(0,"span",7),ot(1,"\u2605"),dt())}function ew(r,t){if(r&1&&(ut(0,"div",5)(1,"div",6),rn(2,tw,2,0,"span",7,Ml),dt(),ut(4,"p",8),ot(5),dt(),ut(6,"div",9)(7,"strong"),ot(8),dt(),ut(9,"span"),ot(10),dt()()()),r&2){let e=t.$implicit,n=En();Mt(2),sn(n.getStars(e.rating)),Mt(3),xe(e.content),Mt(3),xe(e.name),Mt(2),xe(e.role)}}var fu=class r{testimonials=[{name:"Rahul Sharma",role:"Business Owner",content:"UNO Bank has transformed how I manage my investments. The competitive rates and seamless interface make it my go-to for fixed deposits.",rating:5},{name:"Priya Patel",role:"Software Engineer",content:"I love the transparency and ease of use. The FD calculator helped me plan my investments perfectly. Highly recommended!",rating:5},{name:"Amit Kumar",role:"Retired Teacher",content:"As a senior citizen, I appreciate the special rates and excellent customer service. UNO Bank truly cares about its customers.",rating:5}];getStars(t){return Array(t).fill(0)}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-testimonials"]],decls:10,vars:0,consts:[[1,"testimonials","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"testimonials-grid"],[1,"testimonial-card","card"],[1,"testimonial-rating"],[1,"star"],[1,"testimonial-content"],[1,"testimonial-author"]],template:function(e,n){e&1&&(ut(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"What Our Customers Say"),dt(),ut(5,"p"),ot(6,"Trusted by thousands of investors across India"),dt()(),ut(7,"div",4),rn(8,ew,11,3,"div",5,j1),dt()()()),e&2&&(Mt(8),sn(n.testimonials))},dependencies:[qe],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary)}.testimonials-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--%NS%spacing-lg)}.testimonial-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-md);padding:var(--%NS%spacing-xl)}.testimonial-card[_ngcontent-%COMP%]   .testimonial-rating[_ngcontent-%COMP%]{color:#fbbf24;font-size:1.25rem;letter-spacing:.1em}.testimonial-card[_ngcontent-%COMP%]   .testimonial-content[_ngcontent-%COMP%]{font-size:1rem;line-height:1.7;font-style:italic;color:var(--%NS%color-text-secondary)}.testimonial-card[_ngcontent-%COMP%]   .testimonial-author[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.25rem}.testimonial-card[_ngcontent-%COMP%]   .testimonial-author[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]{font-size:1rem;color:var(--%NS%color-text-primary)}.testimonial-card[_ngcontent-%COMP%]   .testimonial-author[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{font-size:.875rem;color:var(--%NS%color-text-muted)}"]})};var nw=(r,t)=>t.title;function iw(r,t){if(r&1&&(ut(0,"div",5)(1,"div",6),ot(2),dt(),ut(3,"h3"),ot(4),dt(),ut(5,"p"),ot(6),dt()()),r&2){let e=t.$implicit;Mt(2),xe(e.icon),Mt(2),xe(e.title),Mt(2),xe(e.description)}}var pu=class r{features=[{icon:"\u{1F510}",title:"256-bit Encryption",description:"All data is encrypted using military-grade AES-256 encryption"},{icon:"\u{1F6E1}\uFE0F",title:"Multi-Factor Auth",description:"Secure your account with 2FA and biometric authentication"},{icon:"\u{1F50D}",title:"Real-time Monitoring",description:"24/7 fraud detection and suspicious activity monitoring"},{icon:"\u{1F4F1}",title:"Secure Mobile Access",description:"Bank safely with our secure mobile application"}];static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-security"]],decls:10,vars:0,consts:[[1,"security","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"security-grid"],[1,"security-card","card"],[1,"security-icon"]],template:function(e,n){e&1&&(ut(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"Bank-Grade Security"),dt(),ut(5,"p"),ot(6,"Your money is protected with industry-leading security measures"),dt()(),ut(7,"div",4),rn(8,iw,7,3,"div",5,nw),dt()()()),e&2&&(Mt(8),sn(n.features))},dependencies:[qe],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary)}.security-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:var(--%NS%spacing-lg)}.security-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-md);text-align:center;padding:var(--%NS%spacing-xl)}.security-card[_ngcontent-%COMP%]   .security-icon[_ngcontent-%COMP%]{font-size:2.5rem;margin-bottom:var(--%NS%spacing-sm)}.security-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:1.125rem;margin-bottom:var(--%NS%spacing-xs)}.security-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:.875rem;line-height:1.6}"]})};var rw=(r,t)=>t.name;function sw(r,t){r&1&&(ut(0,"div",10),ot(1,"Most Popular"),dt())}function ow(r,t){if(r&1&&(ut(0,"li")(1,"span",16),ot(2,"\u2713"),dt(),ot(3),dt()),r&2){let e=t.$implicit;Mt(3),Ei(" ",e," ")}}function aw(r,t){if(r&1&&(ut(0,"div",9),ji(1,sw,2,0,"div",10),ut(2,"h3"),ot(3),dt(),ut(4,"div",11)(5,"span",12),ot(6),dt(),ut(7,"span",13),ot(8),dt()(),ut(9,"ul",14),rn(10,ow,4,1,"li",null,Ml),dt(),ut(12,"button",15),ot(13," Get Started "),dt()()),r&2){let e=t.$implicit,n=En();er("popular",e.popular),Mt(),tr(e.popular?1:-1),Mt(2),xe(e.name),Mt(3),Ei("\u20B9",n.getPrice(e)),Mt(2),xe(n.getPeriod()),Mt(2),sn(e.features),Mt(2),er("btn-primary",e.popular)("btn-secondary",!e.popular)}}var mu=class r{isAnnual=ai(!0);plans=[{name:"Starter",monthlyPrice:0,annualPrice:0,features:["Basic FD Calculator","Up to 3 FD Accounts","Email Support","Basic Reports"],popular:!1},{name:"Premium",monthlyPrice:199,annualPrice:1999,features:["Advanced FD Calculator","Unlimited FD Accounts","Priority Support","Detailed Analytics","Tax Reports","Investment Tips"],popular:!0},{name:"Business",monthlyPrice:499,annualPrice:4999,features:["All Premium Features","Multi-user Access","API Integration","Custom Reports","Dedicated Manager","Bulk Operations"],popular:!1}];getPrice(t){return this.isAnnual()?t.annualPrice:t.monthlyPrice}getPeriod(){return this.isAnnual()?"/year":"/month"}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-pricing"]],decls:17,vars:4,consts:[["id","pricing",1,"pricing","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"pricing-toggle"],[1,"toggle-btn",3,"click"],[1,"save-badge"],[1,"pricing-grid"],[1,"pricing-card","card",3,"popular"],[1,"pricing-card","card"],[1,"popular-badge"],[1,"price"],[1,"price-amount"],[1,"price-period"],[1,"features-list"],[1,"btn"],[1,"check"]],template:function(e,n){e&1&&(ut(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"Simple, Transparent Pricing"),dt(),ut(5,"p"),ot(6,"Choose the plan that works best for you"),dt(),ut(7,"div",4)(8,"button",5),Vn("click",function(){return n.isAnnual.set(!1)}),ot(9," Monthly "),dt(),ut(10,"button",5),Vn("click",function(){return n.isAnnual.set(!0)}),ot(11," Yearly "),ut(12,"span",6),ot(13,"Save 17%"),dt()()()(),ut(14,"div",7),rn(15,aw,14,10,"div",8,rw),dt()()()),e&2&&(Mt(8),er("active",!n.isAnnual()),Mt(2),er("active",n.isAnnual()),Mt(5),sn(n.plans))},dependencies:[qe,El],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary);margin-bottom:var(--%NS%spacing-lg)}.pricing-toggle[_ngcontent-%COMP%]{display:inline-flex;background:var(--%NS%color-bg-card);border:1px solid var(--%NS%color-border);border-radius:var(--%NS%radius-lg);padding:.25rem;gap:.25rem}.pricing-toggle[_ngcontent-%COMP%]   .toggle-btn[_ngcontent-%COMP%]{padding:.5rem 1.5rem;border-radius:var(--%NS%radius-md);background:transparent;color:var(--%NS%color-text-secondary);font-weight:500;transition:all var(--%NS%transition-fast)}.pricing-toggle[_ngcontent-%COMP%]   .toggle-btn.active[_ngcontent-%COMP%]{background:var(--%NS%color-primary);color:#fff}.pricing-toggle[_ngcontent-%COMP%]   .toggle-btn[_ngcontent-%COMP%]   .save-badge[_ngcontent-%COMP%]{font-size:.75rem;background:var(--%NS%color-accent);padding:.125rem .5rem;border-radius:var(--%NS%radius-sm);margin-left:.5rem}.pricing-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--%NS%spacing-lg)}.pricing-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-lg);padding:var(--%NS%spacing-xl);position:relative}.pricing-card.popular[_ngcontent-%COMP%]{border-color:var(--%NS%color-primary);box-shadow:0 0 0 2px var(--%NS%color-primary)}.pricing-card[_ngcontent-%COMP%]   .popular-badge[_ngcontent-%COMP%]{position:absolute;top:-12px;left:50%;transform:translate(-50%);background:var(--%NS%color-primary);color:#fff;padding:.25rem 1rem;border-radius:var(--%NS%radius-lg);font-size:.75rem;font-weight:600}.pricing-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:1.5rem;text-align:center}.pricing-card[_ngcontent-%COMP%]   .price[_ngcontent-%COMP%]{text-align:center}.pricing-card[_ngcontent-%COMP%]   .price[_ngcontent-%COMP%]   .price-amount[_ngcontent-%COMP%]{font-size:3rem;font-weight:700;color:var(--%NS%color-text-primary)}.pricing-card[_ngcontent-%COMP%]   .price[_ngcontent-%COMP%]   .price-period[_ngcontent-%COMP%]{color:var(--%NS%color-text-muted);font-size:1rem}.pricing-card[_ngcontent-%COMP%]   .features-list[_ngcontent-%COMP%]{list-style:none;display:flex;flex-direction:column;gap:var(--%NS%spacing-sm)}.pricing-card[_ngcontent-%COMP%]   .features-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{display:flex;align-items:center;gap:var(--%NS%spacing-sm);font-size:.9375rem;color:var(--%NS%color-text-secondary)}.pricing-card[_ngcontent-%COMP%]   .features-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   .check[_ngcontent-%COMP%]{color:var(--%NS%color-accent);font-weight:700}.pricing-card[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{margin-top:auto}"]})};var lw=(r,t)=>t.question;function cw(r,t){if(r&1&&(ut(0,"div",8)(1,"p"),ot(2),dt()()),r&2){let e=En().$implicit;Mt(2),xe(e.answer)}}function hw(r,t){if(r&1){let e=ea();ut(0,"div",5)(1,"button",6),Vn("click",function(){let i=ms(e).$index,s=En();return gs(s.toggle(i))}),ut(2,"span"),ot(3),dt(),ut(4,"span",7),ot(5,"+"),dt()(),ji(6,cw,3,1,"div",8),dt()}if(r&2){let e=t.$implicit,n=t.$index,i=En();Mt(3),xe(e.question),Mt(),er("expanded",i.expandedIndex()===n),Mt(2),tr(i.expandedIndex()===n?6:-1)}}var gu=class r{expandedIndex=ai(null);faqs=[{question:"What is the minimum deposit amount for an FD?",answer:"The minimum deposit amount for opening a Fixed Deposit account with UNO Bank is \u20B910,000. This applies across all our FD products."},{question:"What are the tenure options available?",answer:"We offer flexible tenure options ranging from 6 months to 120 months (10 years). You can choose the tenure that best suits your financial goals."},{question:"How is the interest calculated on my FD?",answer:"Interest is calculated based on the principal amount, tenure, and applicable interest rate. We offer both simple and compound interest options, with compound interest typically yielding higher returns."},{question:"Can I withdraw my FD before maturity?",answer:"Premature withdrawal is possible but may attract a penalty. The penalty amount depends on the tenure and how early you withdraw. Please check our terms for specific details."},{question:"Is my investment insured?",answer:"Yes, your FD investments with UNO Bank are insured up to \u20B95,00,000 per depositor as per DICGC guidelines, providing you with additional security."}];toggle(t){this.expandedIndex.set(this.expandedIndex()===t?null:t)}static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-faq"]],decls:10,vars:0,consts:[["id","faq",1,"faq","section"],[1,"container"],[1,"section-header"],[1,"text-gradient"],[1,"faq-list"],[1,"faq-item","card"],[1,"faq-question",3,"click"],[1,"icon"],[1,"faq-answer"]],template:function(e,n){e&1&&(ut(0,"section",0)(1,"div",1)(2,"div",2)(3,"h2",3),ot(4,"Frequently Asked Questions"),dt(),ut(5,"p"),ot(6,"Got questions? We've got answers"),dt()(),ut(7,"div",4),rn(8,hw,7,4,"div",5,lw),dt()()()),e&2&&(Mt(8),sn(n.faqs))},dependencies:[qe],styles:[".section-header[_ngcontent-%COMP%]{text-align:center;margin-bottom:var(--%NS%spacing-3xl)}.section-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:clamp(2rem,4vw,3rem);margin-bottom:var(--%NS%spacing-sm)}.section-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1.125rem;color:var(--%NS%color-text-secondary)}.faq-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:var(--%NS%spacing-md);max-width:800px;margin:0 auto}.faq-item[_ngcontent-%COMP%]{padding:var(--%NS%spacing-lg)}.faq-item[_ngcontent-%COMP%]   .faq-question[_ngcontent-%COMP%]{width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;color:var(--%NS%color-text-primary);font-size:1.125rem;font-weight:600;text-align:left;padding:0;cursor:pointer}.faq-item[_ngcontent-%COMP%]   .faq-question[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{font-size:1.5rem;font-weight:300;transition:transform var(--%NS%transition-normal)}.faq-item[_ngcontent-%COMP%]   .faq-question[_ngcontent-%COMP%]   .icon.expanded[_ngcontent-%COMP%]{transform:rotate(45deg)}.faq-item[_ngcontent-%COMP%]   .faq-answer[_ngcontent-%COMP%]{padding-top:var(--%NS%spacing-md);border-top:1px solid var(--%NS%color-border);margin-top:var(--%NS%spacing-md)}.faq-item[_ngcontent-%COMP%]   .faq-answer[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:1rem;line-height:1.7;color:var(--%NS%color-text-secondary)}"]})};var n0=(r,t)=>t.label,uw=(r,t)=>t.icon;function dw(r,t){if(r&1&&(ut(0,"li")(1,"a",12),ot(2),dt()()),r&2){let e=t.$implicit;Mt(),wl("href",e.href,Sl),Mt(),xe(e.label)}}function fw(r,t){if(r&1&&(ut(0,"li")(1,"a",12),ot(2),dt()()),r&2){let e=t.$implicit;Mt(),wl("href",e.href,Sl),Mt(),xe(e.label)}}function pw(r,t){if(r&1&&(ut(0,"a",10),ot(1),dt()),r&2){let e=t.$implicit;wl("href",e.href,Sl),Mt(),xe(e.icon)}}var _u=class r{currentYear=new Date().getFullYear();quickLinks=[{label:"About Us",href:"#"},{label:"Products",href:"#features"},{label:"Calculator",href:"#calculator"},{label:"Pricing",href:"#pricing"}];supportLinks=[{label:"Help Center",href:"#"},{label:"Contact Us",href:"#"},{label:"Privacy Policy",href:"#"},{label:"Terms of Service",href:"#"}];socialLinks=[{icon:"\u{1D54F}",href:"#"},{icon:"in",href:"#"},{icon:"\u{1F4D8}",href:"#"}];static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-footer"]],decls:33,vars:1,consts:[[1,"footer"],[1,"container"],[1,"footer-content"],[1,"footer-brand"],[1,"logo"],[1,"logo-text"],[1,"logo-subtitle"],[1,"footer-links"],[1,"link-group"],[1,"social-links"],[1,"social-link",3,"href"],[1,"footer-bottom"],[3,"href"]],template:function(e,n){e&1&&(ut(0,"footer",0)(1,"div",1)(2,"div",2)(3,"div",3)(4,"div",4)(5,"span",5),ot(6,"UNO"),dt(),ut(7,"span",6),ot(8,"Bank"),dt()(),ut(9,"p"),ot(10,"Premium digital banking for the modern investor. Secure, simple, and smart."),dt()(),ut(11,"div",7)(12,"div",8)(13,"h4"),ot(14,"Quick Links"),dt(),ut(15,"ul"),rn(16,dw,3,2,"li",null,n0),dt()(),ut(18,"div",8)(19,"h4"),ot(20,"Support"),dt(),ut(21,"ul"),rn(22,fw,3,2,"li",null,n0),dt()(),ut(24,"div",8)(25,"h4"),ot(26,"Connect"),dt(),ut(27,"div",9),rn(28,pw,2,2,"a",10,uw),dt()()()(),ut(30,"div",11)(31,"p"),ot(32),dt()()()()),e&2&&(Mt(16),sn(n.quickLinks),Mt(6),sn(n.supportLinks),Mt(6),sn(n.socialLinks),Mt(4),Ei("\xA9 ",n.currentYear," UNO Bank. All rights reserved."))},dependencies:[qe],styles:[".footer[_ngcontent-%COMP%]{background:var(--%NS%color-bg-card);border-top:1px solid var(--%NS%color-border);padding:var(--%NS%spacing-3xl) 0 var(--%NS%spacing-lg)}.footer-content[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 2fr;gap:var(--%NS%spacing-3xl);margin-bottom:var(--%NS%spacing-2xl)}.footer-brand[_ngcontent-%COMP%]   .logo[_ngcontent-%COMP%]{display:flex;align-items:baseline;gap:.25rem;margin-bottom:var(--%NS%spacing-md)}.footer-brand[_ngcontent-%COMP%]   .logo[_ngcontent-%COMP%]   .logo-text[_ngcontent-%COMP%]{font-family:var(--%NS%font-display);font-size:2rem;font-weight:700;color:var(--%NS%color-text-primary)}.footer-brand[_ngcontent-%COMP%]   .logo[_ngcontent-%COMP%]   .logo-subtitle[_ngcontent-%COMP%]{font-size:.875rem;font-weight:500;color:var(--%NS%color-text-secondary);text-transform:uppercase;letter-spacing:.1em}.footer-brand[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:.9375rem;color:var(--%NS%color-text-secondary);max-width:300px}.footer-links[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--%NS%spacing-xl)}.link-group[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{font-size:1rem;margin-bottom:var(--%NS%spacing-md);color:var(--%NS%color-text-primary)}.link-group[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]{list-style:none;display:flex;flex-direction:column;gap:var(--%NS%spacing-sm)}.link-group[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--%NS%color-text-secondary);font-size:.875rem;transition:color var(--%NS%transition-fast)}.link-group[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover{color:var(--%NS%color-primary)}.link-group[_ngcontent-%COMP%]   .social-links[_ngcontent-%COMP%]{display:flex;gap:var(--%NS%spacing-md)}.link-group[_ngcontent-%COMP%]   .social-links[_ngcontent-%COMP%]   .social-link[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:var(--%NS%color-bg-dark);border:1px solid var(--%NS%color-border);border-radius:var(--%NS%radius-md);font-size:1.25rem;transition:all var(--%NS%transition-normal)}.link-group[_ngcontent-%COMP%]   .social-links[_ngcontent-%COMP%]   .social-link[_ngcontent-%COMP%]:hover{border-color:var(--%NS%color-primary);color:var(--%NS%color-primary)}.footer-bottom[_ngcontent-%COMP%]{padding-top:var(--%NS%spacing-lg);border-top:1px solid var(--%NS%color-border);text-align:center}.footer-bottom[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-size:.875rem;color:var(--%NS%color-text-muted)}@media(max-width:768px){.footer-content[_ngcontent-%COMP%]{grid-template-columns:1fr;gap:var(--%NS%spacing-xl)}.footer-links[_ngcontent-%COMP%]{grid-template-columns:1fr;gap:var(--%NS%spacing-lg)}}"]})};var i0=class r{static \u0275fac=function(e){return new(e||r)};static \u0275cmp=Xe({type:r,selectors:[["app-landing"]],decls:11,vars:0,template:function(e,n){e&1&&(bl(0,"app-navbar"),ge(1,"main"),bl(2,"app-hero")(3,"app-features")(4,"app-how-it-works")(5,"app-fd-calculator")(6,"app-testimonials")(7,"app-security")(8,"app-pricing")(9,"app-faq"),fe(),bl(10,"app-footer"))},dependencies:[qe,pc,cu,hu,uu,du,fu,pu,mu,gu,_u],styles:["main[_ngcontent-%COMP%]{display:block}"]})};export{i0 as LandingComponent};
