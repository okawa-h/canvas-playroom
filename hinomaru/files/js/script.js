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

		var gradient = _context.createLinearGradient(centerX, 0, centerX, height);
		gradient.addColorStop(0, '#EFECF5');
		gradient.addColorStop(.5, '#52F6F8');
		gradient.addColorStop(1, '#FB97F8');
		_context.fillStyle = gradient;
		_context.fillRect(0, 0, width, height);

		_context.beginPath();
		_context.arc(centerX, centerY, size, 0, Math.PI*2, false);
		_context.fillStyle = '#cd342f';
		_context.fill();

		_context.beginPath();
		_context.moveTo(0,height);
		_context.lineTo(0,height*.8);
		_context.lineTo(centerX,centerY);
		_context.lineTo(width,height*.8);
		_context.lineTo(width,height);
		_context.fillStyle = '#000';
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
