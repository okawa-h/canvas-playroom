import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image,_mask;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			max_speed:{ value:5,step:.1 },
			min_speed:{ value:.5,step:.1 }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_image = new Image();
		_image.onload = function() {

			_mask = new Image();
			_mask.onload = function() {

				window.addEventListener('resize',onResize,false);

				setCanvasSize();
				setup();
				window.requestAnimationFrame(render);

			};
			_mask.src = './mask.png';

		};
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

		let max = _setting.get('max_speed');
		let min = _setting.get('min_speed');

		_mask.degreeX = 0;
		_mask.vx     = getRangeNumber(min,max);

		_mask.degreeY = 0;
		_mask.vy     = getRangeNumber(min,max);

	}

	function render() {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.globalCompositeOperation = 'source-over';
		_context.clearRect(0,0,width,height);

		let imageX = (width - _image.width) * .5;
		let imageY = (height - _image.height) * .5;
		_context.drawImage(_image,imageX,imageY);

		let maskX  = (width - _mask.width) * .5;
		let maskY  = (height - _mask.height) * .5;

		_mask.degreeX += _mask.vx;
		let radiusX = _mask.degreeX * Math.PI / 180;
		let valX    = Math.sin(radiusX);

		_mask.degreeY += _mask.vy;
		let radiusY = _mask.degreeY * Math.PI / 180;
		let valY    = Math.sin(radiusY);

		_context.globalCompositeOperation = 'destination-in';

		_context.save();

		_context.translate(maskX + _mask.width * .5,maskY + _mask.height * .5);
		_context.transform(1, valX, valY, 1, 0, 0);
		_context.translate(-maskX - _mask.width * .5,-maskY - _mask.height * .5);

		_context.drawImage(_mask,maskX,maskY);
		_context.restore();

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
