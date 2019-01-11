import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_frameWhite,_frameBlack;

	class Frame {

		constructor(radius,x,width,height,length,pointColor,bgColor) {

			this.points     = [];
			this.radius     = radius;
			this.x          = x;
			this.width      = width;
			this.height     = height;
			this.bgColor    = bgColor;

			let centerX = this.x + this.width * .5;
			let centerY = this.height * .5;

			for (let i = 0; i < length; i++) {

				this.points.push(new Point(radius,centerX,centerY,pointColor));

			}

		}

		draw(diff) {

			let centerX = this.x + this.width * .5;
			let centerY = this.height * .5;

			_context.rect(this.x,0,this.width,this.height);
			_context.fillStyle = this.bgColor;
			_context.fill();

			for (const point of this.points) {

				point.update(centerX,centerY);
				point.draw();

			}

		}

	}

	class Point {

		constructor(radius,centerX,centerY,pointColor) {

			let angle        = Math.random() * 360;
			let randomRadius = radius + (Math.random() * Math.random() * 50);
			let point        = this.getCircleOnPoint(randomRadius,angle);

			this.x          = point.x + centerX;
			this.y          = point.y + centerY;
			this.radius     = randomRadius;
			this.angle      = angle;
			this.pointColor = pointColor;
			this.reset();

		}

		reset() {

			this.velocity  = 0;
			this.timer     = getRangeNumber(1000,10);
			this.goalAngle = this.angle + getRangeNumber(5,1);

		}

		update(centerX,centerY) {

			if (0 < this.timer) this.timer--;

			if (this.timer <= 0) {

				this.velocity += .01;

				let diffR     = this.goalAngle - this.angle * this.velocity;
				let goalPoint = this.getCircleOnPoint(this.radius,diffR);
				this.angle    = diffR;

				this.x = centerX + goalPoint.x;
				this.y = centerY + goalPoint.y;

				if (this.goalAngle <= this.angle) this.reset();

			}

		}

		draw() {

			_context.beginPath();
			_context.arc(this.x,this.y,_setting.get('point_size'),0,Math.PI*2,true);
			_context.fillStyle = this.pointColor;
			_context.fill();

		}

		getCircleOnPoint(radius,angle) {

			let x = radius * Math.cos(angle * (Math.PI / 180));
			let y = radius * Math.sin(angle * (Math.PI / 180));
			return { x:x,y:y };

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			length    :{ value:1000 },
			radius    :{ value:150 },
			point_size:{ value:.5,step:.1,min:0,'data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
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
		setup();

	}

	function setup() {

		let width  = _canvas.width;
		let height = _canvas.height;
		let halfW  = width * .5;
		let radius = _setting.get('radius');
		let length = _setting.get('length');

		_frameWhite = new Frame(radius,0,halfW,height,length,'#fff','#000');
		_frameBlack = new Frame(radius,halfW,halfW,height,length,'#000','#fff');

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		clear(0,0,width,height);

		_frameWhite.draw();
		_frameBlack.draw();

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

})(window);
