import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_objects;
	const COLOR_MAP = {
		'bg'   :'#020725',
		'shape':['#ed2394','#e720c5','#d91ff3','#a61Bef','#9816f4','#1dabd3','#50eff1']
	}

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			length            :{ value:30 },
			width             :{ value:100,'data-reload':false },
			height            :{ value:20,'data-reload':false },
			max_velocity_x    :{ value:5,step:.5,'data-reload':false },
			min_velocity_x    :{ value:.5,step:.5,'data-reload':false },
			max_velocity_angle:{ value:2,step:.5,'data-reload':false },
			min_velocity_angle:{ value:.1,step:.5,'data-reload':false }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		window.addEventListener('resize',onResize,false);

		setCanvasSize();
		setup();
		window.requestAnimationFrame(render);

	}

	function setCanvasSize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function onResize() {

		setCanvasSize();

	}

	function setup() {

		_objects = [];
		let width  = _canvas.width;
		let height = _canvas.height;

		for (let i = 0; i < _setting.get('length'); i++) {

			_objects.push(new Shape(height));

		}

	}

	class Shape {

		constructor(height) {

			let objW = _setting.get('width');
			let objH = _setting.get('height');
			let x    = objH < objW ? objW : objH;
			let maxVX = _setting.get('max_velocity_x');
			let minVX = _setting.get('min_velocity_x');
			let maxVA = _setting.get('max_velocity_angle');
			let minVA = _setting.get('min_velocity_angle');

			this.color      = this.getRandomObjectColor();
			this.x          = -x;
			this.y          = getRangeNumber(0,height);
			this.w          = objW;
			this.h          = objH;
			this.velocity   = getRangeNumber(minVX,maxVX);
			this.angle      = getRangeNumber(0,360);
			this.speedAngle = getRangeNumber(minVA,maxVA);

		}

		update() {

			this.velocity *= 1.01;

			this.angle += this.speedAngle;
			this.x     += this.velocity;
			if (360 <= this.angle) this.angle = 0;

		}

		getRandomObjectColor() {

			let length = COLOR_MAP.shape.length;
			return COLOR_MAP.shape[Math.floor(Math.random() * length)];

		}

	}

	function render() {

		const width  = _canvas.width;
		const height = _canvas.height;

		clear(width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.rect(0,0,width,height);
		_context.fillStyle = COLOR_MAP.bg;
		_context.fill();

		_context.globalCompositeOperation = 'screen';
		draw(width,height);
		requestAnimationFrame(render);

	}

	function draw(width,height) {

		for (let i = 0; i < _objects.length; i++) {

			let object = _objects[i];

			object.update();
			if (width <= object.x) object = new Shape(height);

			_context.save();

			_context.beginPath();

			_context.translate(object.x + object.w * .5,object.y + object.h * .5);
			_context.rotate(object.angle * Math.PI / 180);
			_context.translate(-object.x - object.w * .5,-object.y - object.h * .5);

			_context.fillStyle = object.color;
			_context.fillRect(object.x,object.y,object.w,object.h);

			_context.restore();

			_objects[i] = object;

		}

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
