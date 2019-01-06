import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_image,_noiseData,_frame;

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			frame_length:{ value:10,min:1 }
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

		_noiseData   = [];
		_frame       = 0;
		const frameLength = _setting.get('frame_length');
		const width  = _canvas.width;
		const height = _canvas.height;
		const x      = (width - _image.width) * .5;
		const y      = (height - _image.height) * .5;

		_context.drawImage(_image,x,y,_image.width,_image.height);

		for (let i = 0; i < frameLength; i++) {

			let data     = _context.getImageData(0,0,width,height);
			let buffer32 = new Uint32Array(data.data.buffer);
			let length   = buffer32.length;

			for (let i = 0; i < length; i++) {

				let ratio = Math.random();
				if (ratio < .8) buffer32[i] += getRangeNumber(-50,50);
				if (ratio < .5) buffer32[i] += getRangeNumber(-50,50);
				if (ratio < .3) buffer32[i] += getRangeNumber(-50,50);

			}

			_noiseData.push(data);
        }

	}

	function render(timestamp) {

		const width  = _canvas.width;
		const height = _canvas.height;

		_frame++;
		if (_noiseData.length - 1 < _frame) _frame = 0;

		_context.clearRect(0,0,width,height);

		_context.globalAlpha = .5;

		_context.putImageData(_noiseData[_frame],0,0);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}

})(window);