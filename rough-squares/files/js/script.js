import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_points,_mousePoint;
	const BG_COLOR = '#fff';

	class Shape {

		constructor(size,x,y) {

			this.baseX = this.x = x;
			this.baseY = this.y = y;
			this.baseS = this.size = size;
			this.ratio = 1;
			this.life      = getRangeNumber(_setting.get('max_ratio_life'),0);
			this.lifeRatio = getRangeNumber(10,2);
			this.setRandomVelocity();

		}

		update(mousePoint,spotRadius,size) {

			this.baseS = size;

			let centerP  = { x:this.x + this.baseS * .5, y:this.y + this.baseS * .5 };
			let distance = getDistance(mousePoint,centerP);
			this.ratio   = spotRadius/distance;
			if (1 <= this.ratio) this.ratio = 1;

			this.size = this.baseS * this.ratio;

			let padding = (this.baseS - this.size) * .5;
			this.x = this.baseX + padding;
			this.y = this.baseY + padding;

			this.life--;
			if (this.life <= 0) {

				this.size = this.baseS * this.lifeRatio;

				padding = (this.baseS - this.size) * .5;
				this.x = this.baseX + padding + getRangeNumber(10,-10);
				this.y = this.baseY + padding + getRangeNumber(10,-10);

				if (this.life <= -_setting.get('die_life')) {
					this.life      = getRangeNumber(_setting.get('max_ratio_life'),0);
					this.lifeRatio = getRangeNumber(10,2);
				}

			}

			return this;

		}

		draw() {

			_context.beginPath();
			_context.strokeStyle = '#000';
			_context.strokeRect(this.x,this.y,this.size,this.size);

		}

		reset() {

			this.setRandomVelocity();

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
			size          :{ value:30,step:.5,min:0,'data-reload':false },
			spot_radius   :{ value:30,'data-reload':false },
			max_ratio_life:{ value:2000,'data-reload':false },
			die_life:{ value:10,'data-reload':false }
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
		let size    = _setting.get('size');
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
				_points.push(new Shape(size,x,y));

			}
		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;
		let size       = _setting.get('size');
		let spotRadius = _setting.get('spot_radius');

		clear(width,height);

		_context.rect(0,0,width,height);
		_context.fillStyle = BG_COLOR;
		_context.fill();

		if (_mousePoint != null) {
			for (let point of _points) {

				point.update(_mousePoint,spotRadius,size).draw();

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
