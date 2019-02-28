import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

		draw(context,radius) {

			context.beginPath();
			context.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
			context.fillStyle = '#fff';
			context.fill();

		}

	}

	class Triangle {

		constructor(radius,x,y,color) {

			this.radius     = radius;
			this.color      = color;
			this.center     = new Point(x,y);
			this.vertexs    = this.createVertexs(3);

			this.angle      = getRangeNumber(0,360);
			this.speedAngle = getRangeNumber(0.1,3);

			this.velocity   = this.getRandomVelocity();
			this.direction  = this.getRandomDirection();

		}

		update(minX,minY,maxX,maxY) {

			if (maxX <= this.center.x + this.radius) {
				this.direction.x = -1;
				this.velocity = this.getRandomVelocity();
			}

			if (this.center.x - this.radius <= minX) {
				this.direction.x = 1;
				this.velocity = this.getRandomVelocity();
			}

			if (maxY <= this.center.y + this.radius) {
				this.direction.y = -1;
				this.velocity = this.getRandomVelocity();
			}

			if (this.center.y - this.radius <= minY) {
				this.direction.y = 1;
				this.velocity = this.getRandomVelocity();
			}

			this.velocity.x *= 1.05;
			this.velocity.y *= 1.05;

			this.angle += this.speedAngle;

			this.center.x += this.velocity.x * this.direction.x;
			this.center.y += this.velocity.y * this.direction.y;

			if (360 <= this.angle) this.angle = 0;

		}

		draw(context) {

			const startPoint = this.vertexs[0];

			context.save();

			context.translate(this.center.x,this.center.y);
			context.rotate(this.angle * Math.PI / 180);
			context.translate(-this.center.x,-this.center.y);

			context.beginPath();
			context.moveTo(this.center.x + startPoint.x,this.center.y + startPoint.y);
			for (let i = 0; i < this.vertexs.length; i++) {

				let point = this.vertexs[i];
				context.lineTo(this.center.x + point.x,this.center.y + point.y);

			}
			context.closePath();
			context.fillStyle = this.color;
			context.fill();

			context.restore();

		}

		createVertexs(length) {

			const ratioSize = this.radius * .3;
			const distanse  = 360 / length;
			let points = [];

			for (let i = 0; i < length; i++) {

				const randomDistanse = distanse + getRangeNumber(-ratioSize,ratioSize);
				const point = this.getCircleOnPoint(this.radius,randomDistanse * i);
				points.push(point);

			}

			return points;

		}

		getCircleOnPoint(radius,angle) {

			const x = radius * Math.cos(angle * (Math.PI / 180));
			const y = radius * Math.sin(angle * (Math.PI / 180));
			return new Point(x,y);

		}

		getRandomDirection() {

			return {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

		}

		getRandomVelocity() {

			return {
				x:getRangeNumber(.1,5),
				y:getRangeNumber(.1,5)
			}

		}

	}

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
			size              :{ value:window.innerWidth * .05,'data-reload':false }
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
		const width  = _canvas.width;
		const height = _canvas.height;
		const size   = _setting.get('size');

		for (let i = 0; i < _setting.get('length'); i++) {

			const color  = getRandomColor();
			const radius = getRangeNumber(size - size * .9,size + size * .9);
			_objects.push(new Triangle(radius,width*.5,height*.5,color));

		}

	}

	function render() {

		const width  = _canvas.width;
		const height = _canvas.height;

		_context.clearRect(0,0,width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.fillStyle = COLOR_MAP.bg;
		_context.fillRect(0,0,width,height);

		_context.globalCompositeOperation = 'screen';

		for (let i = 0; i < _objects.length; i++) {

			let object = _objects[i];

			object.update(0,0,width,height);
			object.draw(_context);

		}

		requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}

	function getRandomColor() {

		let length = COLOR_MAP.shape.length;
		return COLOR_MAP.shape[Math.floor(Math.random() * length)];

	}


})(window);
