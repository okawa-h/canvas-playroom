import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_processingImage,_shapes;

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

		constructor(center,radius) {

			this.center = center;
			this.radius = radius;

			return this;

		}

		isInclude(point) {

			let x = point.x - this.center.x;
			let y = point.y - this.center.y;
			let len = Math.sqrt((x * x) + (y * y));

			return len < this.radius;

		}

		draw(context,color) {

			context.beginPath();
			context.arc(this.center.x,this.center.y,this.radius,0,Math.PI * 2,false);
			context.closePath();
			context.fillStyle = color;
			context.fill();

			return this;

		}

	}

	class Shape {

		constructor(x,y,width,height) {

			this.centerPoint = new Point(x,y);
			this.angle = getRangeNumber(0,360);

			this.vx = getRangeNumber(1,10);
			this.vy = getRangeNumber(1,10);

			let dVal = [-1,1];
			this.dx = dVal[Math.floor(Math.random() * dVal.length)];
			this.dy = dVal[Math.floor(Math.random() * dVal.length)];

			this.width  = width;
			this.height = height;
			this.speedAngle = getRangeNumber(1,5);

			return this;

		}

		getCenterPoint() {

			return this.centerPoint;

		}

		setVelocity() {

			this.vx = getRangeNumber(1,10);
			this.vy = getRangeNumber(1,10);

		}

		update(width,height) {

			let centerPoint = this.centerPoint;
			width -= this.width * .5;
			height -= this.height * .5;

			this.vx += .01;
			this.vy += .01;
			this.speedAngle += .1;

			if (width <= centerPoint.x) {
				this.setVelocity();
				this.dx = -1;
				this.speedAngle = getRangeNumber(1,5);
			}

			if (centerPoint.x <= 0) {
				this.setVelocity();
				this.dx = 1;
				this.speedAngle = getRangeNumber(1,5);
			}

			if (height <= centerPoint.y) {
				this.setVelocity();
				this.dy = -1;
				this.speedAngle = getRangeNumber(1,5);
			}

			if (centerPoint.y <= 0) {
				this.setVelocity();
				this.dy = 1;
				this.speedAngle = getRangeNumber(1,5);
			}

			this.angle += this.speedAngle;
			this.centerPoint.x += this.vx * this.dx;
			this.centerPoint.y += this.vy * this.dy;

			return this;

		}

		draw(context,color) {

			if (color == 'rgba(0,0,0,255)') return;

			let x = this.centerPoint.x - (this.width * .5);
			let y = this.centerPoint.y - (this.height * .5);

			context.save();

			context.beginPath();

			context.translate(x + this.width * .5,y + this.height * .5);
			context.rotate(this.angle * Math.PI / 180);
			context.translate(-x - this.width * .5,-y - this.height * .5);

			context.fillStyle = color;
			context.rect(x,y,this.width,this.height);
			context.closePath();
			context.fill();
			_context.restore();

			return this;

		}

	}

	class ProcessingImage {

		constructor(src,width,height,onloaded) {

			this.canvas    = document.createElement('canvas');
			this.context   = this.canvas.getContext('2d');
			this.counter   = 0;

			let processingImage = this;
			let image = new Image();
			image.onload = function() {

				let colorData = processingImage.getColorData(image,width,height);
				processingImage.imageData = { image:image, colorData:colorData };
				onloaded();

			};
			image.src = './' + src;

		}

		getColorData(image,width,height) {

			this.context.clearRect(0,0,width,height);
			this.canvas.width  = width;
			this.canvas.height = height;

			let imageX = (width - image.width) * .5;
			let imageY = (height - image.height) * .5;
			this.context.fillRect(0,0,width,height);
			this.context.drawImage(image,imageX,imageY);

			return this.context.getImageData(0,0,width,height).data;

		}

		getColor(x,y) {

			x = Math.round(x);
			y = Math.round(y);

			const colorData = this.imageData.colorData;
			const width     = this.canvas.width;
			const position  = (width * y + (width - (width - x))) * 4;
			const red   = colorData[position];
			const green = colorData[position + 1];
			const blue  = colorData[position + 2];
			const alpha = colorData[position + 3];

			return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';

		}

	}

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			length:{ value:1500,min:1 },
			max_width :{ value:80,min:1 },
			min_width :{ value:1,min:1 },
			max_height:{ value:80,min:1 },
			min_height:{ value:1,min:1 }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		setCanvasSize();
		_processingImage = new ProcessingImage('image.jpg',_canvas.width,_canvas.height,function() {

			window.addEventListener('resize',onResize,false);

			setup();
			window.requestAnimationFrame(render);

		});

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

		let length = _setting.get('length');
		let width  = _canvas.width;
		let height = _canvas.height;

		let maxW = _setting.get('max_width');
		let minW = _setting.get('min_width');
		let maxH = _setting.get('max_height');
		let minH = _setting.get('min_height');

		_shapes = [];
		for (let i = 0; i < length; i++) {

			let shapeW = getRangeNumber(minW,maxW);
			let shapeH = getRangeNumber(minH,maxH);
			let shape  = new Shape(Math.random() * width,Math.random() * height,shapeW,shapeH);
			_shapes.push(shape);

		}

	}

	function render() {

		const width  = _canvas.width;
		const height = _canvas.height;

		_context.globalCompositeOperation = 'source-over';

		clear(width,height);
		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		_context.globalCompositeOperation = 'screen';

		for (let i = 0; i < _shapes.length; i++) {

			const shape       = _shapes[i];
			const centerPoint = shape.getCenterPoint();
			const color       = _processingImage.getColor(centerPoint.x,centerPoint.y);
			shape.update(width,height).draw(_context,color);

		}

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}


})(window);
