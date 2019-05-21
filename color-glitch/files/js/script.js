import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image,_filter;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			glitch:{ value:5,min:0,'data-reload':false },
			frequency:{ value:50,max:100,min:0,step:10,'data-reload':false }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_image = new Image();
		_image.onload = function() {

			window.addEventListener('resize',onResize,false);

			setup();
			window.requestAnimationFrame(render);

		}
		_image.src = './image.jpg';

	}

	function onResize() {

		setup();

	}

	function setup() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;
		_filter        = { r:{},g:{},b:{} };

		const width  = _canvas.width;
		const height = _canvas.height;
		const imageW = _image.width;
		const imageH = _image.height;
		const x      = (width - imageW) * .5;
		const y      = (height - imageH) * .5;
		const colorList = ['r','g','b'];

		_context.clearRect(0,0,width,height);
		_context.drawImage(_image, x, y);

		const imageData = _context.getImageData(x,y,imageW,imageH).data;
		for (let i = 0; i < colorList.length; i++) {
			_filter[colorList[i]].imageData = _context.getImageData(x,y,imageW,imageH);
		}

		for (let i = 0; i < imageData.length; i += 4) {

			// _filter.r.data[i];
			_filter.r.imageData.data[i + 1] = 0;
			_filter.r.imageData.data[i + 2] = 0;
			// _filter.r.imageData.data[i + 3] = 255;

			_filter.g.imageData.data[i] = 0;
			// _filter.g.push(imageData[i+1]);
			_filter.g.imageData.data[i + 2] = 0;
			// _filter.g.imageData.data[i + 3] = 255;

			_filter.b.imageData.data[i] = 0;
			_filter.b.imageData.data[i + 1] = 0;
			// _filter.b.push(imageData[i+2]);
			// _filter.b.imageData.data[i + 3] = 255;

		}

		for (let i = 0; i < colorList.length; i++) {

			const color   = colorList[i];
			const canvas  = document.createElement('canvas');
			canvas.width  = imageW;
			canvas.height = imageH;
			canvas.getContext('2d').putImageData(_filter[color].imageData,0,0);
			_filter[color].image     = new Image();
			_filter[color].image.src = canvas.toDataURL('image/jpg');

		}

	}

	function render(timestamp) {

		const width   = _canvas.width;
		const height  = _canvas.height;
		const x       = (width - _image.width) * .5;
		const y       = (height - _image.height) * .5;
		const glitchX   = _setting.get('glitch');
		const frequency = _setting.get('frequency') / 100;

		if (frequency < Math.random()) {
			window.requestAnimationFrame(render);
			return;
		}

		_context.clearRect(0,0,width,height);
		_context.globalCompositeOperation = 'lighter';
		_context.drawImage(_filter.r.image, x + getRangeNumber(-glitchX,glitchX), y);
		_context.drawImage(_filter.g.image, x + getRangeNumber(-glitchX,glitchX), y);
		_context.drawImage(_filter.b.image, x + getRangeNumber(-glitchX,glitchX), y);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
