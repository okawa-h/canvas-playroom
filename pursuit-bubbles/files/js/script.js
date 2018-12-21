import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_mousePoint,_afterimages;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			ratio   :{ value:1,step:.1 },
			min_size:{ value:10 }
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

		let diffX = Math.abs(event.clientX - _mousePoint.x);
		let diffY = Math.abs(event.clientY - _mousePoint.y);
		let diff  = Math.round((diffX + diffY) * _setting.get('ratio'));
		let minSize = _setting.get('min_size');
		_mousePoint.diff = diff < minSize ? minSize : diff;

		_afterimages.push({
			x   :_mousePoint.x,
			y   :_mousePoint.y,
			size:_mousePoint.diff,
			velocity:1
		});

		_mousePoint.x = event.clientX;
		_mousePoint.y = event.clientY;

	}

	function setup() {

		_afterimages = [];
		_mousePoint  = {};

	}

	function render() {

		const width  = _canvas.width;
		const height = _canvas.height;

		clear(width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.rect(0,0,width,height);
		_context.fillStyle = '#0f124f';
		_context.fill();

		_context.globalCompositeOperation = 'screen';
		for (let i = 0; i < _afterimages.length; i++) {

			let afterObj = _afterimages[i];
			afterObj.velocity += .1;
			afterObj.size -= afterObj.velocity;

			if (0 < afterObj.size) {

				_context.beginPath();
				_context.shadowBlur  = afterObj.size;
				_context.shadowColor = '#9816f4';

				let x = getRangeNumber(afterObj.x - 5,afterObj.x + 5);
				let y = getRangeNumber(afterObj.y - 5,afterObj.y + 5);
				_context.arc(x, y, afterObj.size, 0, Math.PI*2, false);
				_context.fillStyle = '#9816f4';
				_context.fill();

			}

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
