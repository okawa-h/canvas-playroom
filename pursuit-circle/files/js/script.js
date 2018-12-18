import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_mousePoint;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			ratio:{ value:1,step:.1 }
		});
		_mousePoint = null;

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		window.addEventListener('resize',onResize,false);
		window.addEventListener('mousemove',onMousemove,false);

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

	function onMousemove(event) {

		if (_mousePoint != null) {

			let diffX = Math.abs(event.clientX - _mousePoint.x);
			let diffY = Math.abs(event.clientY - _mousePoint.y);
			_mousePoint.diff = Math.round((diffX + diffY) * _setting.get('ratio'));

		}

		if (_mousePoint == null) _mousePoint = {};
		_mousePoint.x = event.clientX;
		_mousePoint.y = event.clientY;

	}

	function setup() {

		let width  = _canvas.width;
		let height = _canvas.height;

	}

	function render() {

		const width  = _canvas.width;
		const height = _canvas.height;

		clear(width,height);

		_context.rect(0,0,width,height);
		_context.fillStyle = '#000';
		_context.fill();

		if (_mousePoint != null) {

			_context.beginPath();
			_context.shadowBlur  = 100;
			_context.shadowColor = '#fff';
			_context.arc(_mousePoint.x, _mousePoint.y, _mousePoint.diff, 0, Math.PI*2, false);
			_context.fillStyle = '#fff';
			_context.fill();

		}

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
