import { Setting } from '../../../common/files/js/setting.js';

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

		constructor(image) {

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

				const index     = this.grabCornerIndex;
				const reIndex   = this.getReverseIndex(index);
				const dDistance = this.corner.defaultPoints[reIndex].getDistance(this.corner.defaultPoints[index]);
				const distance  = this.corner.points[reIndex].getDistance(point);

				this.setScale(distance/dDistance);

				let translateX = this.image.width - (this.image.width * this.scale);
				let translateY = this.image.height - (this.image.height * this.scale);
				if (index == 3 || index == 0) this.x = this.grabCornerPoint.x + translateX;
				if (index == 0 || index == 1) this.y = this.grabCornerPoint.y + translateY;

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

			this.scale = scale;
			if (scale <= .1) this.scale = .1;

		}

		getCornerPoints() {

			return [
				new Point(this.x,this.y),
				new Point(this.x + this.image.width * this.scale, this.y),
				new Point(this.x + this.image.width * this.scale, this.y + this.image.height * this.scale),
				new Point(this.x, this.y + this.image.height * this.scale)
			];

		}

		getReverseIndex(index) {

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

		isIncludeCorner(targetPoint) {

			for (let i = 0; i < this.corner.points.length; i++) {

				const point = this.corner.points[i];
				const isInclude = point.isInclude(targetPoint,this.corner.radius);
				if (isInclude) {

					this.grabCornerIndex = i;
					this.grabCornerPoint = targetPoint;

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

			this.draw = null;

			this.setProcessing();
			this.setLife();

		}

		setLife() {

			this.life  = getRangeNumber(0,100);
			this.dying = getRangeNumber(1,10);

		}

		setProcessing() {

			// const processing = [this.drawReverse,this.drawThreshold,this.drawRound,this.drawYLine];
			const processing = [this.drawReverse,this.drawGlitch,this.drawYLine];
			// const processing = [this.drawReverse,this.drawThreshold,this.drawRound];
			this.draw = processing[Math.floor(Math.random() * processing.length)];

		}

		counter(context,width,height) {

			this.life--;

			if (this.life <= 0) {

				// this.drawGlitch(context,width,height);
				// this.drawReverse(context,width,height);
				// this.drawYLine(context,width,height);
				this.drawGlitchWave(context,width,height,this.life * -40,20);
				this.drawGlitchSlip(context,width,height,20);
				this.drawGlitchColor(context,width,height,20);
				this.draw(context,width,height);

			}

			if (this.life <= -this.dying) {

				this.setProcessing();
				this.setLife();

			}

		}

		drawReverse(context,width,height) {

			this.imageDataCounter(context,width,height,function(units,index) {

				units[index]     = 255 - units[index];
				units[index + 1] = 255 - units[index + 1];
				units[index + 2] = 255 - units[index + 2];

			});

		}

		drawRound(context,width,height) {

			this.imageDataCounter(context,width,height,function(units,index) {

				const round = Math.round((units[index] + units[index + 1] + units[index + 2]) / 3);
				units[index] = units[index + 1] = units[index + 2] = round;

			});

		}

		drawThreshold(context,width,height) {

			this.imageDataCounter(context,width,height,function(units,index) {

				let v = units[index]*.298912 + units[index+1]*.586611 + units[index+2]*.114478;
				units[index] = units[index + 1] = units[index + 2] = v > 0x88 ? 255 : 0;

			});

		}

		drawYLine(context,width,height) {

			const extendLine = Math.round(getRangeNumber(0,height));
			const units      = context.getImageData(0,0,width,height).data;
			const startIndex = 4 * width * extendLine;

			for (let i = 0; i < width; i++) {

				let index = startIndex + i * 4;

				let r = units[index];
				let g = units[index + 1];
				let b = units[index + 2];
				let a = units[index + 3];
				if (a == 0) r = g = b = 255;

				context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
				context.fillRect(i,0,1,height);

			}
		}

		drawRGBShift(context,width,height) {

			let original     = context.getImageData(0,0,width,height);
			let originalData = original.data;
			let plusData     = [];
			let minusData    = [];
			let options      = {
				mode  : 'horizontal',
				radius: '1.25%'
			};

			if (typeof options.radius == 'string') {
				let radius_chars = options.radius.split('');
				if (radius_chars[radius_chars.length - 1] == '%') {
					options.radius = options.radius.replace('%','') / 1;
					if (options.mode == 'horizental') options.radius = parseInt(width * options.radius / 100);
						else options.radius = parseInt(height * options.radius / 100);
				}
			}

			for(let y = 0; y < height; y++) {
				for(let x = 0; x < width; x++) {

					let index      = ((width * y) + x ) * 4;
					let plusIndex  = 0;
					let minusIndex = 0;

					if (options.mode == 'horizontal') {
						plusIndex  = ((width * y) + (x + options.radius)) * 4;
						minusIndex = ((width * y) + (x + options.radius * -1)) * 4;
					} else {
						plusIndex  = ((width * (y + options.radius)    ) + x) * 4;
						minusIndex = ((width * (y+ options.radius * -1)) + x) * 4;
					}

					plusData[plusIndex]     = originalData[index];
					plusData[plusIndex + 1]	= originalData[index + 1];
					plusData[plusIndex + 2]	= originalData[index + 2];
					plusData[plusIndex + 3]	= originalData[index + 3];

					minusData[minusIndex]     = originalData[index];
					minusData[minusIndex + 1] = originalData[index + 1];
					minusData[minusIndex + 2] = originalData[index + 2];
					minusData[minusIndex + 3] = originalData[index + 3];

				}
			}

			for(let i = 0, n = originalData.length; i < n; i += 4) {
				if (typeof plusData[i] != 'undefined') {
					originalData[i] 	= plusData[i];
					originalData[i + 1] = plusData[i + 1] * 0.5 + originalData[i + 1] * 0.5;
					originalData[i + 2] = plusData[i + 2];
				}

				if (typeof minusData[i] != 'undefined') {
					originalData[i] 	= minusData[i] * 0.5 + originalData[i] * 0.5;
					originalData[i + 1] = originalData[i + 1];
					originalData[i + 2] = minusData[i + 2];
				}

				originalData[i + 3] = 255;
			}

			context.putImageData(original,0,0);

		}

		drawGlitch(context,width,height) {

			const imageData = context.getImageData(0,0,width,height);
			const data      = imageData.data;
			const length    = width * height;
			const factor    = Math.random() * 10;

			let randR = Math.floor(Math.random() * factor);
			let randG = Math.floor(Math.random() * factor) * 3;
			let randB = Math.floor(Math.random() * factor);

			for (let i = 0; i < length; i++) {

				let r = data[(i + randR) * 4 + 0];
				let g = data[(i + randG) * 4 + 1];
				let b = data[(i + randB) * 4 + 2];
				if (r + g + b == 0) r = g = b = 255;

				data[i * 4 + 0] = r;
				data[i * 4 + 1] = g;
				data[i * 4 + 2] = b;
				data[i * 4 + 3] = 255;

			}

			context.putImageData(imageData,0,0);

		}

		drawGlitchWave(context,width,height,renderLineHeight,cuttingHeight) {

			var image = context.getImageData(0,renderLineHeight,width,cuttingHeight);
			context.putImageData(image,0,renderLineHeight - 10);

		}

		drawGlitchSlip(context,width,height,waveDistance) {

			let startHeight = height * Math.random();
			let endHeight   = startHeight + 30 + (Math.random() * 40);
			for (let h = startHeight; h < endHeight; h++) {

				if (Math.random() < .1) h++;
				let image = context.getImageData(0, h, width, 1);
				context.putImageData(image, Math.random() * waveDistance - (waveDistance*.5), h);

			}

		}

		drawGlitchColor(context,width,height,waveDistance) {

			let startHeight = height * Math.random();
			let endHeight   = startHeight + 30 + (Math.random() * 40);
			let imageData   = context.getImageData(0, startHeight, width, endHeight);
			let data        = imageData.data;
			let length      = width * height;
			let r = 0;
			let g = 0;
			let b = 0;

			for (let i = 0; i < length; i++) {

				if (i % width == 0){
					r = i + Math.floor((Math.random() -.5) * waveDistance);
					g = i + Math.floor((Math.random() -.5) * waveDistance);
					b = i + Math.floor((Math.random() -.5) * waveDistance);
				}

				data[i*4 + 0] = data[r*4];
				data[i*4 + 1] = data[g*4 + 1];
				data[i*4 + 2] = data[b*4 + 2];

			}
			context.putImageData(imageData, 0, startHeight);

		}

		imageDataCounter(context,width,height,process) {

			let imageData = context.getImageData(0,0,width,height);
			let units     = imageData.data;
			let index     = 0;
			let length    = Math.floor(units.length * .25);
			for (let i = 0; i < length; i++) {
				process(units,index,context,width,height);
				index += 4;
			}
			context.putImageData(imageData,0,0);

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

					_objects.push(new ImageObject(image));

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

		let width  = _canvas.width;
		let height = _canvas.height;

		for (let i = 0; i < _objects.length; i++) {

			let object = _objects[i];
			let x = getRangeNumber(0,width - object.image.width);
			let y = getRangeNumber(0,height - object.image.height);
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
