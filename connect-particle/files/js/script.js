import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_points;

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;
			this.setRandomDirection();
			this.setRandomVelocity();

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

		update(minX,minY,maxX,maxY) {

			if (maxX <= this.x) {
				this.direction.x = -1;
				this.setRandomVelocity();
			}

			if (this.x <= minX) {
				this.direction.x = 1;
				this.setRandomVelocity();
			}

			if (maxY <= this.y) {
				this.direction.y = -1;
				this.setRandomVelocity();
			}

			if (this.y <= minY) {
				this.direction.y = 1;
				this.setRandomVelocity();
			}

			this.x += this.velocity.x * this.direction.x;
			this.y += this.velocity.y * this.direction.y;

			return this;

		}

		draw(context,radius) {

			context.beginPath();
			context.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
			context.fillStyle = '#fff';
			context.fill();

		}

		setRandomDirection() {

			this.direction = {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

		}

		setRandomVelocity() {

			this.velocity = {
				x:getRangeNumber(.1,5),
				y:getRangeNumber(.1,5)
			}

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			connect_distance:{ value:100,'data-reload':false },
			point_length:{ value:100 },
			point_radius:{ value:2,step:.5,min:0,'data-reload':false },
			filter_scale:{ value:5,'data-reload':false }
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

	}

	function setup() {

		_points      = [];
		const length = _setting.get('point_length');
		const width  = _canvas.width;
		const height = _canvas.height;

		for (let i = 0; i < length; i++) {

			const x = getRangeNumber(0,width);
			const y = getRangeNumber(0,height);
			_points.push(new Point(x,y));

		}

	}

	function render(timestamp) {

		const connectDistance = _setting.get('connect_distance');
		const scale  = _setting.get('filter_scale');
		const radius = _setting.get('point_radius');
		const width  = _canvas.width;
		const height = _canvas.height;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		_context.globalAlpha = 1;
		_context.globalCompositeOperation = 'source-over';

		for (let point of _points) {

			point.update(0,0,width,height);

		}

		for (let point of _points) {

			for (let another of _points) {

				const distance = point.getDistance(another);
				const percent  = 1 - (distance / connectDistance);

				if (distance < connectDistance) {

					_context.beginPath();
					_context.lineWidth   = .5;
					_context.strokeStyle = 'rgba(255,255,255,' + percent + ')';
					_context.moveTo(point.x,point.y);
					_context.lineTo(another.x,another.y);
					_context.closePath();
					_context.stroke();

				}

			}

			point.draw(_context,radius);

		}


		let filter    = document.createElement('canvas');
		filter.width  = width / scale;
		filter.height = height / scale;
		filter.getContext('2d').drawImage(_canvas, 0, 0, filter.width, filter.height);
		_context.globalAlpha = .9;
		_context.globalCompositeOperation = 'lighter';
		_context.drawImage(filter, 0, 0, width, height);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}

})(window);