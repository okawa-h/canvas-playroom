(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _objects;

	const LINE_COLOR = '#acd648';
	const BG_COLOR   = '#271fa7';

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');
		_objects = [];

		window.addEventListener('resize',onResize,false);

		setCanvasSize();
		setup();
		update();

	}

	function setCanvasSize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function onResize() {

		setCanvasSize();

	}

	function setup() {

		let width  = _canvas.width;
		let height = _canvas.height;

	}

	function update() {

		const width  = _canvas.width;
		const height = _canvas.height;

		clear(width,height);
		draw(width,height);
		// _animationFrame = requestAnimationFrame(update);

	}

	function draw(width,height) {

		_context.fillStyle = BG_COLOR;
		_context.rect(0,0,width,height);
		_context.fill();

		var lineWidth = 200;
		var length    = width / lineWidth;

		for (let i = 0; i < length; i++) {

			let startX = i * lineWidth * 2 - width;
			let endX   = startX + getHypotenuseFromHeAn(height,45);
			let startY = 0;
			let endY   = height;

			_context.beginPath();
			_context.moveTo(startX,startY);
			// _context.quadraticCurveTo((startX - endX) * .5 + startX,-endY * .5,endX * .5,endY * .5);
			// _context.lineTo(endX,endY);
			_context.lineTo(endX,endY);
			_context.lineTo(endX + lineWidth,endY);
			_context.lineTo(startX + lineWidth,startY);
			_context.fillStyle = LINE_COLOR;
			_context.fill();
			_context.closePath();

		}

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getHypotenuseFromHeAn(height,angle) {

		return height / Math.sin(angle);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
