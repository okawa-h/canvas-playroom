(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _mask,_whitePixels,_pointLength,_pointList;

	document.addEventListener('DOMContentLoaded',initialize,false);

	class Point {

		constructor(x,y,vx,vy) {

			this.x  = x;
			this.y  = y;
			this.vx = vx;
			this.vy = vy;

		}

		draw(context) {

			context.beginPath();
			context.fillStyle = '#f52f87';
			context.arc(this.x,this.y,1,0,2 * Math.PI);
			context.fill();
			context.closePath();

		}

		update(canvas,context,mask) {

			this.draw(context);

			if (this.x + this.vx >= canvas.width || this.x + this.vx < 0 || mask.data[coordsToI(this.x + this.vx, this.y, mask.width)] != 255) {
				this.vx *= -1;
				this.x  += this.vx * 2;
			}

			if (this.y + this.vy >= canvas.height || this.y+this.vy < 0 || mask.data[coordsToI(this.x, this.y + this.vy, mask.width)] != 255) {
				this.vy *= -1;
				this.y  += this.vy * 2;
			}

			for (var i = 0, m = _pointList.length; i<m; i++) {

				if (_pointList[i] === this) continue;

				var d = Math.sqrt(Math.pow(this.x-_pointList[i].x,2)+Math.pow(this.y-_pointList[i].y,2));
				if (d < 5) {
					context.lineWidth = .2;
					context.strokeStyle = '#f52f87';
					context.beginPath();
					context.moveTo(this.x,this.y);
					context.lineTo(_pointList[i].x,_pointList[i].y);
					context.stroke();
				}
				if (d < 20) {
					context.lineWidth = .1;
					context.strokeStyle = '#f52f87';
					context.beginPath();
					context.moveTo(this.x,this.y);
					context.lineTo(_pointList[i].x,_pointList[i].y);
					context.stroke();
				}
			}

			this.x += this.vx;
			this.y += this.vy;

		}

	}

	function initialize() {

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_pointList   = [];
		_whitePixels = [];
		_pointLength = 500;

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

		_context.fillStyle = 'rgb(0, 0, 0)';
		_context.fillRect(0,0,width,height);

		let value = 'Hello.';
		let size  = 128;

		_context.font = 'bold ' + size + 'px meiryo sans-serif';
		_context.textBaseline = 'top';
		let text = _context.measureText(value);
		let x    = width * .5 - text.width * .5;
		let y    = height * .5 - size * .5;

		_context.fillStyle = 'rgb(255,255,255)';
		_context.fillText(value,x,y);
		// _context.strokeStyle = 'rgb(255,255,255)';
		// _context.strokeText(value,x,y);

		_mask = _context.getImageData(0,0,width,height);

		clear(width,height);

		for (let i = 0; i < _mask.data.length; i += 4) {
			if (_mask.data[i] == 255 && _mask.data[i+1] == 255 && _mask.data[i+2] == 255 && _mask.data[i+3] == 255) {
				_whitePixels.push([indexToX(i,_mask.width),indexToY(i,_mask.width)]);
			}
		}

		for (let i = 0; i < _pointLength; i++) {

			const position = _whitePixels[Math.floor(Math.random()*_whitePixels.length)];
			const ppoint   = new Point(position[0],position[1], Math.floor(Math.random()*2-1), Math.floor(Math.random()*2-1));
			_pointList.push(ppoint);

		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		clear(width,height);

		_context.fillStyle = '#020930';
		_context.fillRect(0,0,width,height);

		for (let i = 0; i < _pointList.length; i++) {

			_pointList[i].update(_canvas,_context,_mask);

		}

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

	function indexToX(i,w) {

		return (i%(4*w))/4;

	}

	function indexToY(i,w) {

		return Math.floor(i/(4*w));

	}

	function coordsToI(x,y,w) {

		return ((_mask.width*y)+x)*4;

	}

})(window);