import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_points,_mousePoint;
	const BG_COLOR = '#000';

	class Point {

		constructor(x,y) {

			let radius  = _setting.get('point_radius');
			let padding = _setting.get('padding');

			this.x = x + radius + padding;
			this.y = y + radius + padding;
			this.color   = '#fff';
			this.radius  = radius;
			this.opacity = 0;
			this.setRandomDirection();
			this.setRandomVelocity();

		}

		update(mousePoint,radius) {

			this.radius = _setting.get('point_radius');

			let distance = getDistance(mousePoint,this);
			this.opacity = radius/distance;
			if (1 <= this.opacity) this.opacity = 1;

			return this;

		}

		draw() {

			_context.beginPath();
			_context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
			_context.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
			_context.fill();

		}

		reset() {

			this.setRandomDirection();
			this.setRandomVelocity();

		}

		setRandomDirection() {

			this.direction = {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

		}

		setRandomVelocity() {

			this.velocity = {
				x:getRangeNumber(.01,.1),
				y:getRangeNumber(.01,.1)
			}

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			point_radius:{ value:5,step:.5,min:0,'data-reload':false },
			padding     :{ value:2,step:.5,min:0 },
			spot_radius :{ value:30,'data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');
		_mousePoint = null;

		_setting.setCallback(setup);

		window.addEventListener('resize',onResize,false);
		window.addEventListener('mousemove',onMousemove,false);

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
		setup();

	}

	function onMousemove(event) {

		if (_mousePoint == null) _mousePoint = {};
		_mousePoint.x = event.clientX;
		_mousePoint.y = event.clientY;

	}

	function setup() {

		_points     = [];
		let radius  = _setting.get('point_radius');
		let padding = _setting.get('padding');
		let size    = radius * 2 + padding * 2;
		let width   = _canvas.width;
		let height  = _canvas.height;
		let rows    = Math.floor(width/size);
		let columns = Math.floor(height/size);
		let diffX   = (width - (size * rows)) * .5;
		let diffY   = (height - (size * columns)) * .5;

		for (let i = 0; i < columns; i++) {
			for (let l = 0; l < rows; l++) {

				let x = l * size + diffX;
				let y = i * size + diffY;
				_points.push(new Point(x,y));

			}
		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;
		let spotRadius = _setting.get('spot_radius');

		clear(width,height);

		_context.rect(0,0,width,height);
		_context.fillStyle = BG_COLOR;
		_context.fill();

		if (_mousePoint != null) {
			for (let point of _points) {

				point.update(_mousePoint,spotRadius).draw();

			}
		}

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

	function getDistance(pointA,pointB) {

		return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));

	}

})(window);
