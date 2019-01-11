import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_areas;

	class Area {

		constructor(x,y) {

			let size    = _setting.get('area_size');
			let padding = _setting.get('area_padding');
			let length  = _setting.get('point_length');

			this.maxX   = x + size - padding;
			this.minX   = x + padding;
			this.maxY   = y + size - padding;
			this.minY   = y + padding;
			this.points = [];

			for (let i = 0; i < length; i++) {

				this.points.push(new Point(this.minX,this.minY,this.maxX,this.maxY));

			}

		}

		update() {

			for (var i = 0; i < this.points.length; i++) {

				let point = this.points[i];

				if (this.maxX <= point.x) {
					point.direction.x = -1;
					point.setRandomVelocity();
				}

				if (point.x <= this.minX) {
					point.direction.x = 1;
					point.setRandomVelocity();
				}

				if (this.maxY <= point.y) {
					point.direction.y = -1;
					point.setRandomVelocity();
				}

				if (point.y <= this.minY) {
					point.direction.y = 1;
					point.setRandomVelocity();
				}

				point.x += point.velocity.x * point.direction.x;
				point.y += point.velocity.y * point.direction.y;

				this.points[i] = point;

			}

			return this;

		}

		draw() {

			let size    = _setting.get('area_size');
			let padding = _setting.get('area_padding');
			let radius  = _setting.get('point_radius');

			for (var i = 0; i < this.points.length; i++) {

				let nextIndex = (this.points.length - 1 <= i) ? 0 : i + 1;
				let point     = this.points[i];
				let nextPoint = this.points[nextIndex];

				let distance = getDistance(point,nextPoint);
				let aresize  = size - padding * 2;
				let percent  = 1 - (distance*100)/aresize*.01;
				if (percent <= 0.1) percent = .1;

				_context.beginPath();
				_context.lineWidth   = .5;
				_context.strokeStyle = 'rgba(0,0,0,' + percent + ')';
				_context.moveTo(point.x,point.y);
				_context.lineTo(nextPoint.x,nextPoint.y);
				_context.closePath();
				_context.stroke();

				_context.beginPath();
				_context.arc(point.x, point.y, radius, 0, Math.PI*2, true);
				_context.fillStyle = 'rgba(0,0,0,1)';
				_context.fill();

			}

			// this.drawHelper();

		}

		drawTrapezoid() {

			_context.beginPath();
			_context.moveTo(this.points[0].x,this.points[0].y);
			for (var i = 1; i < this.points.length; i++) {

				_context.lineTo(this.points[i].x,this.points[i].y);

			}

			_context.fillStyle = 'rgba(0,0,0,1)';
			_context.fill();
			_context.closePath();

		}

		drawHelper() {

			_context.beginPath();
			_context.lineWidth   = .5;
			_context.strokeStyle = 'rgba(0,0,0,1)';
			_context.moveTo(this.minX,this.minY);
			_context.lineTo(this.minX,this.maxY);
			_context.lineTo(this.maxX,this.maxY);
			_context.lineTo(this.maxX,this.minY);
			_context.closePath();
			_context.stroke();

		}

	}

	class Point {

		constructor(minX,minY,maxX,maxY) {

			this.x  = getRangeNumber(minX,maxX);
			this.y  = getRangeNumber(minY,maxY);
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
				x:getRangeNumber(.01,1),
				y:getRangeNumber(.01,1)
			}

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			area_size   :{ value:100,max:500,min:10 },
			area_padding:{ value:20,max:100 },
			point_radius:{ value:2,step:.5,min:0,'data-reload':false },
			point_length:{ value:4 }
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

		_areas      = [];
		let size    = _setting.get('area_size');
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
				_areas.push(new Area(x,y));

			}

		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		clear(width,height);

		for (let area of _areas) {

			area.update().draw();

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
