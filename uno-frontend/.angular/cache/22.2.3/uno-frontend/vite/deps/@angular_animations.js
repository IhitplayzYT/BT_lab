import { _ as useAnimation, a as animate, c as group, d as sequence, f as stagger, g as trigger, h as transition, i as NoopAnimationPlayer, l as keyframes, m as style, n as AnimationGroupPlayer, o as animateChild, p as state, r as AnimationMetadataType, s as animation, t as AUTO_STYLE, u as query, v as ɵPRE_STYLE } from "./_private_export-chunk-B79wGh9b.js";
import { Al as ɵɵdefineInjectable, Dr as ViewEncapsulation, Fn as Injectable, Kc as RuntimeError, Pl as ɵɵinject, Pn as Inject, Wi as setClassMetadata, _c as DOCUMENT, ar as RendererFactory2, dl as inject, dr as Service, fc as ANIMATION_MODULE_TYPE, so as ɵɵdefineService } from "./core-Bfwnsk4L.js";
//#region node_modules/@angular/animations/fesm2022/animations.mjs
/**
* @license Angular v22.2.3
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
var AnimationBuilder = class AnimationBuilder {
	static ɵfac = function AnimationBuilder_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || AnimationBuilder)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineService({
		token: AnimationBuilder,
		factory: () => (() => inject(BrowserAnimationBuilder))()
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AnimationBuilder, [{
		type: Service,
		args: [{ factory: () => inject(BrowserAnimationBuilder) }]
	}], null, null);
})();
var AnimationFactory = class {};
var BrowserAnimationBuilder = class BrowserAnimationBuilder extends AnimationBuilder {
	animationModuleType = inject(ANIMATION_MODULE_TYPE, { optional: true });
	_nextAnimationId = 0;
	_renderer;
	constructor(rootRenderer, doc) {
		super();
		const typeData = {
			id: "0",
			encapsulation: ViewEncapsulation.None,
			styles: [],
			data: { animation: [] }
		};
		this._renderer = rootRenderer.createRenderer(doc.body, typeData);
		if (this.animationModuleType === null && !isAnimationRenderer(this._renderer)) throw new RuntimeError(3600, (typeof ngDevMode === "undefined" || ngDevMode) && "Angular detected that the `AnimationBuilder` was injected, but animation support was not enabled. Please make sure that you enable animations in your application by calling `provideAnimations()` or `provideAnimationsAsync()` function.");
	}
	build(animation) {
		const id = this._nextAnimationId;
		this._nextAnimationId++;
		const entry = Array.isArray(animation) ? sequence(animation) : animation;
		issueAnimationCommand(this._renderer, null, id, "register", [entry]);
		return new BrowserAnimationFactory(id, this._renderer);
	}
	static ɵfac = function BrowserAnimationBuilder_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BrowserAnimationBuilder)(ɵɵinject(RendererFactory2), ɵɵinject(DOCUMENT));
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineInjectable({
		token: BrowserAnimationBuilder,
		factory: BrowserAnimationBuilder.ɵfac,
		providedIn: "root"
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserAnimationBuilder, [{
		type: Injectable,
		args: [{ providedIn: "root" }]
	}], () => [{ type: RendererFactory2 }, {
		type: Document,
		decorators: [{
			type: Inject,
			args: [DOCUMENT]
		}]
	}], null);
})();
var BrowserAnimationFactory = class extends AnimationFactory {
	_id;
	_renderer;
	constructor(_id, _renderer) {
		super();
		this._id = _id;
		this._renderer = _renderer;
	}
	create(element, options) {
		return new RendererAnimationPlayer(this._id, element, options || {}, this._renderer);
	}
};
var RendererAnimationPlayer = class {
	id;
	element;
	_renderer;
	parentPlayer = null;
	_started = false;
	constructor(id, element, options, _renderer) {
		this.id = id;
		this.element = element;
		this._renderer = _renderer;
		this._command("create", options);
	}
	_listen(eventName, callback) {
		return this._renderer.listen(this.element, `@@${this.id}:${eventName}`, callback);
	}
	_command(command, ...args) {
		issueAnimationCommand(this._renderer, this.element, this.id, command, args);
	}
	onDone(fn) {
		this._listen("done", fn);
	}
	onStart(fn) {
		this._listen("start", fn);
	}
	onDestroy(fn) {
		this._listen("destroy", fn);
	}
	init() {
		this._command("init");
	}
	hasStarted() {
		return this._started;
	}
	play() {
		this._command("play");
		this._started = true;
	}
	pause() {
		this._command("pause");
	}
	restart() {
		this._command("restart");
	}
	finish() {
		this._command("finish");
	}
	destroy() {
		this._command("destroy");
	}
	reset() {
		this._command("reset");
		this._started = false;
	}
	setPosition(p) {
		this._command("setPosition", p);
	}
	getPosition() {
		return unwrapAnimationRenderer(this._renderer)?.engine?.players[this.id]?.getPosition() ?? 0;
	}
	totalTime = 0;
};
function issueAnimationCommand(renderer, element, id, command, args) {
	renderer.setProperty(element, `@@${id}:${command}`, args);
}
function unwrapAnimationRenderer(renderer) {
	const type = renderer.ɵtype;
	if (type === 0) return renderer;
	else if (type === 1) return renderer.animationRenderer;
	return null;
}
function isAnimationRenderer(renderer) {
	const type = renderer.ɵtype;
	return type === 0 || type === 1;
}
//#endregion
export { AUTO_STYLE, AnimationBuilder, AnimationFactory, AnimationMetadataType, NoopAnimationPlayer, animate, animateChild, animation, group, keyframes, query, sequence, stagger, state, style, transition, trigger, useAnimation, AnimationGroupPlayer as ɵAnimationGroupPlayer, BrowserAnimationBuilder as ɵBrowserAnimationBuilder, ɵPRE_STYLE };
