import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_circle;

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;

		}

		isEqual(point) {

			return this.x === point.x && this.y === point.y;

		}

		round(point) {

			return new Point((this.x + point.x)*.5,(this.y + point.y)*.5);

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

	}

	class Circle {

		constructor(radius,centerX,centerY) {

			this.points   = [];
			this.radius   = radius;
			this.length   = radius * 2;
			this.distanse = 360 / this.length;
			this.center   = new Point(centerX,centerY);

			for (let i = 0; i < this.length; i++) {

				let onPoint = this.getCircleOnPoint(this.radius,this.distanse * i);
				let point   = new Point(this.center.x + onPoint.x,this.center.y + onPoint.y);
				point.angle = this.distanse * i;

				this.points.push(point);

			}

		}

		update(time) {

			for (let i = 0; i < this.points.length; i++) {

				let point = this.points[i];
				const px = i / (50 + i);
				const py = (i / 50 + time);
				const y  = this.radius * noise.perlin2(px,py);

				let radius  = this.radius + Math.sin( Math.PI / 180) * y * 10;
				let onPoint = this.getCircleOnPoint(radius,point.angle);

				point.x = this.center.x + onPoint.x;
				point.y = this.center.y + onPoint.y;

			}

			return this;

		}

		draw(context) {

			context.beginPath();

			for (let i = 1; i < this.points.length - 2; i++) {

				let point = this.points[i];
				if (i === 0) context.moveTo(point.x,point.y);
					else context.lineTo(point.x,point.y);

			}

			const lastPoint  = this.points[this.points.length - 1];
			const midPoint   = lastPoint.round(this.points[0]);
			const startPoint = this.points[1];
			context.quadraticCurveTo(midPoint.x,midPoint.y,startPoint.x,startPoint.y);

			context.closePath();
			context.fillStyle = '#f2b42a';
			context.fill();

		}

		getCircleOnPoint(radius,angle) {

			const x = radius * Math.cos(angle * (Math.PI / 180));
			const y = radius * Math.sin(angle * (Math.PI / 180));
			return new Point(x,y);

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			radius:{ 'value':window.innerWidth * .2 }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');
		noise.seed(Math.random());

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

		let radius  = _setting.get('radius');
		let width   = _canvas.width;
		let height  = _canvas.height;
		let centerX = width * .5;
		let centerY = height * .5;

		_circle = new Circle(radius,centerX,centerY);

	}

	function render(timestamp) {

		const time = Date.now() / 4000;

		let width   = _canvas.width;
		let height  = _canvas.height;
		let centerX = width * .5;
		let centerY = height * .5;

		_context.clearRect(0,0,width,height);

		_context.rect(0,0,width,height);
		_context.fillStyle = '#fff';
		_context.fill();

		_circle.update(time).draw(_context);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}

})(window);
