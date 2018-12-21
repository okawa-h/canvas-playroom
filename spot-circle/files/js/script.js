import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_direction;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			size:{ value:100,'data-reload':false }
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

		_direction = {
			x:0,
			d:1
		}

	}

	function render() {

		const width   = _canvas.width;
		const height  = _canvas.height;
		const centerX = width * .5;
		const centerY = height * .5;
		const size    = _setting.get('size');

		clear(width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.rect(0,0,width,height);
		_context.fillStyle = '#0f124f';
		_context.fill();

		_context.globalCompositeOperation = 'screen';
		_context.beginPath();
		_context.shadowBlur  = 100;
		_context.shadowColor = '#fff';
		_context.arc(centerX, centerY, size, 0, Math.PI*2, false);
		_context.fillStyle = '#fff';
		_context.fill();

		_direction.x += .1 * _direction.d;
		if (3 <= _direction.x) _direction.d = -1;
		if (_direction.x <= -3) _direction.d = 1;

		_context.beginPath();
		_context.shadowBlur  = 100;
		_context.shadowColor = '#f53a8a';
		_context.arc(centerX + _direction.x, centerY, size + 10, 0, Math.PI*2, false);
		_context.fillStyle = '#f53a8a';
		_context.fill();

		_context.beginPath();
		_context.shadowBlur  = 100;
		_context.shadowColor = '#3c1bbc';
		_context.arc(centerX + _direction.x * -1, centerY, size + 10, 0, Math.PI*2, false);
		_context.fillStyle = '#3c1bbc';
		_context.fill();

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
