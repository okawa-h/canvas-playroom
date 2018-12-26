import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_image,_filter;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			alpha:{ value:.6,step:.05,max:1,min:0,'data-reload':false },
			image_alpha:{ value:100,max:255,min:0 }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_image = new Image();
		_image.onload = function() {

			window.addEventListener('resize',onResize,false);

			setCanvasSize();
			setup();
			window.requestAnimationFrame(render);

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

		_filter        = {};
		let alpha      = _setting.get('alpha');
		let imageAlpha = _setting.get('image_alpha');
		let width  = _canvas.width;
		let height = _canvas.height;
		let imageW = _image.width;
		let imageH = _image.height;
		let x      = (width - imageW) * .5;
		let y      = (height - imageH) * .5;

		// if (imageW < width) imageW = width;
		// if (imageH < height) imageH = height;

		_context.globalCompositeOperation = 'source-over';
		clear(width,height);
		_context.drawImage(_image,x,y);
		_context.globalAlpha = alpha;
		_context.globalCompositeOperation = 'lighter';

		_filter.canvas  = document.createElement('canvas');
		_filter.context = _filter.canvas.getContext('2d');
		_filter.canvas.width  = width;
		_filter.canvas.height = height;
		_filter.context.globalAlpha = 0.2;
		_filter.red   = _filter.context.createImageData(width,height);
		_filter.green = _filter.context.createImageData(width,height);
		_filter.blue  = _filter.context.createImageData(width,height);

		let colorData = _context.getImageData(0,0,width,height);
		for (let i = 0; i < width * height * 4; i += 4) {

			const red   = colorData.data[i];
			const green = colorData.data[i + 1];
			const blue  = colorData.data[i + 2];
			const al    = colorData.data[i + 3];

			_filter.red.data[i]     = red;
			_filter.red.data[i + 1] = 0;
			_filter.red.data[i + 2] = 0;
			_filter.red.data[i + 3] = imageAlpha;

			_filter.green.data[i]     = 0;
			_filter.green.data[i + 1] = green;
			_filter.green.data[i + 2] = 0;
			_filter.green.data[i + 3] = imageAlpha;

			_filter.blue.data[i]     = 0;
			_filter.blue.data[i + 1] = 0;
			_filter.blue.data[i + 2] = blue;
			_filter.blue.data[i + 3] = imageAlpha;

		}

	}

	function render(timestamp) {

		let alpha  = _setting.get('alpha');
		let width  = _canvas.width;
		let height = _canvas.height;
		let imageW = _image.width;
		let imageH = _image.height;
		let x      = (width - imageW) * .5;
		let y      = (height - imageH) * .5;

		clear(0,0,width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.rect(0,0,width,height);
		_context.fillStyle = '#fff';
		_context.fill();

		_context.drawImage(_image,x,y);
		_context.globalAlpha = alpha;
		_context.globalCompositeOperation = 'lighter';

		_filter.context.putImageData(_filter.red,0,0);
		_context.drawImage(_filter.canvas,Math.random() * 10,getRangeNumber(1,-1));

		_filter.context.putImageData(_filter.blue,0,0);
		_context.drawImage(_filter.canvas,Math.random() * -10,getRangeNumber(1,-1));

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
