import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_objects,_backImage,_effect;

	document.addEventListener('DOMContentLoaded',initialize);

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

		isInclude(point,radius) {

			return this.x - radius < point.x && this.x + radius > point.x && this.y - radius < point.y && this.y + radius > point.y;

		}

		draw(context,radius) {

			context.beginPath();
			context.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
			context.fillStyle = '#fff';
			context.fill();

		}

	}

	class ImageObject {

		constructor(id,image) {

			this.id    = id;
			this.image = image;
			this.x     = 0;
			this.y     = 0;
			this.scale = 1;

			this.isActive = false;
			this.isGrab   = false;
			this.isGrabCorner = false;

			this.grab   = {};
			this.grab.x = 0;
			this.grab.y = 0;

			this.corner        = {};
			this.corner.radius = 5;
			this.corner.points = this.getCornerPoints();
			this.corner.defaultPoints = this.getCornerPoints();

		}

		onDown(point) {

			this.isActive     = false;
			this.isGrab       = false;
			this.isGrabCorner = false;

			if (this.isInclude(point)) {

				this.grab.x = this.x - point.x;
				this.grab.y = this.y - point.y;

				this.isActive = true;
				this.isGrab   = true;

			}

			if (this.isIncludeCorner(point)) {

				this.isActive     = true;
				this.isGrab       = false;
				this.isGrabCorner = true;

			}

		}

		onMove(point) {

			if (this.isGrab) {

				this.x = point.x + this.grab.x;
				this.y = point.y + this.grab.y;
				this.corner.points = this.getCornerPoints();

			}

			if (this.isGrabCorner) {

				const index            = this.grabCornerIndex;
				const diagonalIndex    = this.getDiagonalIndex(index);
				const originalDistance = this.corner.defaultPoints[diagonalIndex].getDistance(this.corner.defaultPoints[index]);
				const distance         = this.corner.points[diagonalIndex].getDistance(point);
				const beforeScale      = this.scale;

				this.setScale(distance/originalDistance);

				let diffX = this.image.width * beforeScale - this.image.width * this.scale;
				let diffY = this.image.height * beforeScale - this.image.height * this.scale;
				if (index == 3 || index == 0) this.x += diffX;
				if (index == 0 || index == 1) this.y += diffY;

				this.corner.points = this.getCornerPoints();

			}

		}

		onUp() {

			this.isGrab       = false;
			this.isGrabCorner = false;

		}

		setPosition(x,y) {

			this.x = x;
			this.y = y;
			this.corner.points = this.getCornerPoints();

		}

		setScale(scale) {

			this.scale = parseFloat(scale.toFixed(5));
			if (scale <= .1) this.scale = .1;

		}

		getCornerPoints() {

			const imageW = this.image.width * this.scale;
			const imageH = this.image.height * this.scale;

			return [
				new Point(this.x,this.y),
				new Point(this.x + imageW, this.y),
				new Point(this.x + imageW, this.y + imageH),
				new Point(this.x, this.y + imageH)
			];

		}

		getDiagonalIndex(index) {

			let reIndex = 0;
			if (index == 0) reIndex = 2;
			if (index == 1) reIndex = 3;
			if (index == 2) reIndex = 0;
			if (index == 3) reIndex = 1;
			return reIndex;

		}

		isInclude(point) {

			return (
				this.x < point.x &&
				this.x + this.image.width * this.scale > point.x &&
				this.y < point.y &&
				this.y + this.image.height * this.scale > point.y
			);

		}

		isIncludeCorner(point) {

			for (let i = 0; i < this.corner.points.length; i++) {

				const cornerPoint = this.corner.points[i];
				const isInclude   = cornerPoint.isInclude(point,this.corner.radius);
				if (isInclude) {

					this.grabCornerIndex = i;
					return true;

				}

			}

			return false;

		}

		draw(context) {

			context.drawImage(this.image,this.x,this.y,this.image.width * this.scale,this.image.height * this.scale);

			if (this.isActive) {

				let color = '#f00';
				this.drawFrame(context,color);
				this.drawCornerPoint(context,color);

			}

		}

		drawFrame(context,color) {

			context.beginPath();
			for (let i = 0; i < this.corner.points.length; i++) {

				const point = this.corner.points[i];
				if (i == 0) context.moveTo(point.x, point.y);
					else context.lineTo(point.x, point.y);

			}
			context.closePath();
			context.lineWidth = 2;
			context.strokeStyle = color;
			context.stroke();

		}

		drawCornerPoint(context,color) {

			for (let i = 0; i < this.corner.points.length; i++) {

				const point = this.corner.points[i];
				context.beginPath();
				context.arc(point.x, point.y, this.corner.radius, 0, Math.PI*2, true);
				context.closePath();
				context.fillStyle = color;
				context.fill();

			}

		}

	}

	class Effect {

		constructor() {

			this.draw   = null;
			this.filter = new Filter();

			this.setProcessing();
			this.setLife();

		}

		setLife() {

			this.life  = getRangeNumber(0,100);
			this.dying = getRangeNumber(1,10);

		}

		setProcessing() {

			const processing = [this.filter.inversion,this.filter.glitch,this.filter.extendColor];
			this.draw = processing[Math.floor(Math.random() * processing.length)];

		}

		counter(context,width,height) {

			this.life--;

			this.filter.glitchSlip(context,width,height,20);

			if (this.life <= 0) {

				this.draw(context,width,height);

			}

			if (this.life <= -this.dying) {

				this.setProcessing();
				this.setLife();

			}

		}

	}

	function initialize() {

		_setting = new Setting({
			scale:{ value:50,min:0 }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_effect = new Effect();

		_backImage = new Image();
		_backImage.onload = function() {

			_objects = [];
			const imageList = ['age.png','asari.png','nameko.png','toufu.png'];
			let counter = 0;

			for (let i = 0; i < imageList.length; i++) {

				let image = new Image();
				image.onload = function() {

					_objects.push(new ImageObject(i,image));

					counter++;
					if (imageList.length <= counter) {

						window.addEventListener('resize',onResize,false);
						setup();

						_canvas.addEventListener('mousedown',onDown,false);
						_canvas.addEventListener('mousemove',onMove,false);
						_canvas.addEventListener('mouseup',onUp,false);

						window.requestAnimationFrame(render);

					}

				}
				image.src = './files/img/' + imageList[i];

			}

		}
		_backImage.src = './files/img/table.png';

	}

	function setCanvasSize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function onResize() {

		setCanvasSize();

	}

	function onDown(event) {

		const offsetX = _canvas.getBoundingClientRect().left;
		const offsetY = _canvas.getBoundingClientRect().top;
		const point   = new Point(event.clientX - offsetX,event.clientY - offsetY);

		for (let i = 0; i < _objects.length; i++) {

			const object = _objects[i];
			object.onDown(point);

		}

	}

	function onMove(event) {

		const offsetX = _canvas.getBoundingClientRect().left;
		const offsetY = _canvas.getBoundingClientRect().top;
		const point   = new Point(event.clientX - offsetX,event.clientY - offsetY);

		for (let i = 0; i < _objects.length; i++) {

			_objects[i].onMove(point);

		}

	}

	function onUp(event) {

		for (let i = 0; i < _objects.length; i++) {

			_objects[i].onUp();

		}

	}

	function setup() {

		setCanvasSize();

		const width  = _canvas.width;
		const height = _canvas.height;
		const area   = width / _objects.length;

		for (let i = 0; i < _objects.length; i++) {

			let object = _objects[i];
			let diffX  = object.image.width < area ? area - object.image.width : 0;
			let x = i * area + diffX * .5;
			let y = height * .8 - object.image.height;
			object.setPosition(x,y);

		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.clearRect(0,0,width,height);

		let ratio  = width / _backImage.width;
		let imageH = _backImage.height * ratio;
		_context.drawImage(_backImage,0,height - imageH,width,imageH);

		for (let i = 0; i < _objects.length; i++) {

			_objects[i].draw(_context);

		}

		_effect.counter(_context,width,height);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
