(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _colorPositions;

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		window.addEventListener('resize',onResize,false);

		setCanvasSize();
		setup();
		run();

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

		let value = 'Hello world🔥';
		let size  = 48;

		_context.font = size + 'px meiryo sans-serif';
		_context.textBaseline = 'top';
		let text = _context.measureText(value);
		let x    = width * .5 - text.width * .5;
		let y    = height * .5 - size * .5;

		_context.fillStyle = 'rgb(255,255,255)';
		_context.fillText(value,x,y);
		// _context.strokeStyle = 'rgb(255,255,255)';
		// _context.strokeText(value,x,y);

		let imageData   = _context.getImageData(0,0,width,height);
		_colorPositions = {
			x:new Int32Array(width * height),
			y:new Int32Array(width * height),
			counter:0
		};

		for (let h = 0; h < height; h++) {
			for (let w = 0; w < width; w++) {

				let r = (w + h * width) * 4;
				let g = r + 1;
				let b = r + 2;
				let a = r + 3;

				if (imageData.data[r] != 0 && imageData.data[g] != 0 && imageData.data[b] != 0) {
					_colorPositions.x[_colorPositions.counter] = w;
					_colorPositions.y[_colorPositions.counter] = h;
					_colorPositions.counter++;
				}
			}
		}

	}

	function run(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.fillStyle = '#020930';
		_context.fillRect(0,0,width,height);

		_context.beginPath();
		_context.fillStyle = '#f52f87';
		// '#f52f87'

		for (let i = 0; i < _colorPositions.counter; i++) {

			let rx = getRangeNumber(0.1,1);
			let ry = getRangeNumber(0.1,1);
			_context.fillRect(_colorPositions.x[i] + rx, _colorPositions.y[i] + ry, 1, 1);
			_context.closePath();

		}

		_context.fill();
		_context.scale(_dpr,_dpr);
		// window.requestAnimationFrame(run);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

})(window);