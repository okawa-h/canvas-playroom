import { Setting } from '../../../common/files/js/setting.js';

(function() {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_pixels,_image;

	const BG_COLOR = '#03072b';

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			pixel_size:{ value:25 },
			show_length:{ value:15 }
		});

		_dpr = window.devicePixelRatio || 1;
		_canvas = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_image = new Image();
		_image.onload = function() {

			window.addEventListener('resize',onResize,false);

			setCanvasSize();
			setup();

		}
		_image.src = './image.jpg';

		// window.addEventListener('resize', onResize, false);

		// setCanvasSize();
		// setup();

	}

	function setCanvasSize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function onResize() {

		setCanvasSize();

	}

	function setup() {

		_pixels = [];
		const size = _setting.get('pixel_size');
		const width = _canvas.width;
		const height = _canvas.height;
		const rows = Math.ceil(width/size);
		const columns = Math.ceil(height/size);

		for (let i = 0; i < columns; i++) {
			for (let l = 0; l < rows; l++) {

				_pixels.push({
					x: l * size,
					y: i * size
				});

			}
		}

		_pixels = shuffle(_pixels);

		_context.fillStyle = BG_COLOR;
		_context.rect(0,0,width,height);
		_context.fill();

		let imageW = _image.width;
		let imageH = _image.height;
		let x = (width - imageW) * .5;
		let y = (height - imageH) * .5;
		_context.drawImage(_image, x, y);

		window.requestAnimationFrame(render);

	}

	function render(timestamp) {

		const size = _setting.get('pixel_size');
		let showLength = _setting.get('show_length');
		if (showLength > _pixels.length) showLength = _pixels.length;

		for (let i = 0; i < showLength; i++) {
			const area = _pixels.pop();
			_context.clearRect(area.x, area.y, size, size);
		}

		if (_pixels.length > 0) {
			window.requestAnimationFrame(render);
		} else {
			setTimeout(setup,400);
		}

	}

	function shuffle(array) {

		for(let i = array.length - 1; i > 0; i--) {

			const r = Math.floor(Math.random() * (i + 1));
			const tmp = array[i];
			array[i] = array[r];
			array[r] = tmp;

		}
		return array;

	}

})();
