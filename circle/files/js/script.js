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

				point.angle    = this.distanse * i;
				point.degree   = 0;
				point.velocity = getRangeNumber(1,10);

				this.points.push(point);

			}

		}

		update() {

			for (let i = 0; i < this.points.length; i++) {

				let point = this.points[i];
				point.degree += point.velocity;
				let radius  = this.radius + Math.sin(point.degree * Math.PI / 180) * 1.5;
				let onPoint = this.getCircleOnPoint(radius,point.angle);
				let pointPosi = new Point(this.center.x + onPoint.x,this.center.y + onPoint.y);

				point.x = pointPosi.x;
				point.y = pointPosi.y;

			}

			return this;

		}

		draw(context) {

			for (let i = 0; i < this.points.length; i++) {

				let next  = this.points.length <= i + 1 ? 0 : i + 1;
				let point = this.points[i];
				let nextP = this.points[next];

				// context.beginPath();
				// context.arc(point.x,point.y,1,0,Math.PI * 2,false);
				// context.closePath();
				// context.fillStyle = '#fff';
				// context.fill();

				context.beginPath();
				context.strokeStyle = '#fff';
				context.lineWidth   = 1;
				context.moveTo(point.x,point.y);
				context.lineTo(nextP.x,nextP.y);
				context.stroke();

			}

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
			radius:{ 'value':100 }
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

		let radius  = _setting.get('radius');
		let width   = _canvas.width;
		let height  = _canvas.height;
		let centerX = width * .5;
		let centerY = height * .5;

		_circle = new Circle(radius,centerX,centerY);

	}

	function render(timestamp) {

		let width    = _canvas.width;
		let height   = _canvas.height;
		let centerX  = width * .5;
		let centerY  = height * .5;

		_context.clearRect(0,0,width,height);

		_context.rect(0,0,width,height);
		_context.fillStyle = '#000';
		_context.fill();

		_circle.update().draw(_context);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}

})(window);
