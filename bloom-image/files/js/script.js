import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			scale:{ value:50,min:0 },
			alpha:{ value:.6,step:.05,max:1,min:0 }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_image = new Image();
		_image.onload = function() {

			window.addEventListener('resize',onResize,false);

			setCanvasSize();
			setup();

		}
		_image.src = './image.jpg';

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

		setCanvasSize();
		let width  = _canvas.width;
		let height = _canvas.height;
		let imageW = _image.width;
		let imageH = _image.height;
		let scale  = _setting.get('scale');
		let alpha  = _setting.get('alpha');
		let x      = (width - imageW) * .5;
		let y      = (height - imageH) * .5;

		let filter    = document.createElement('canvas');
		filter.width  = imageW / scale;
		filter.height = imageH / scale;
		filter.getContext('2d').drawImage(_image, 0, 0, filter.width, filter.height);


		_context.globalCompositeOperation = 'source-over';
		clear(width,height);
		_context.drawImage(_image, x, y);
		_context.globalAlpha = alpha;
		_context.globalCompositeOperation = 'lighter';
		_context.drawImage(filter, x, y, imageW, imageH);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
