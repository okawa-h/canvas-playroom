import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _image,_effect;

	document.addEventListener('DOMContentLoaded',initialize);

	class Effect {

		constructor() {

			this.life = 10;

		}

		setUp(context) {

			this.life = getRangeNumber(10,100);

		}

		update() {

			this.life--;

		}

		draw(context,x,y,width,height) {

			let original = context.getImageData(x,y,width,height).data;
			let flip     = new ImageData(width,height);
			let Npel     = original.length * .25;

			for (let kPel = 0; kPel < Npel; kPel++) {

				let kFlip      = this.getFlipIndex(kPel,width);
				let offset     = 4 * kPel;
				let offsetFlip = 4 * kFlip;

				flip.data[offsetFlip + 0] = original[offset + 0];
				flip.data[offsetFlip + 1] = original[offset + 1];
				flip.data[offsetFlip + 2] = original[offset + 2];
				flip.data[offsetFlip + 3] = original[offset + 3];

			}

			context.putImageData(flip,0,0);

		}

		getFlipIndex(kPel,width) {

			let i     = Math.floor(kPel/width);
			let j     = kPel % width;
			let jFlip = width - j - 1;
			let kFlip = i * width + jFlip;
			return kFlip ;

		}

	}

	function initialize() {

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		loadImage(function(image) {

			_image  = image;
			window.addEventListener('resize',onResize,false);
			window.dispatchEvent(new Event('resize'));

			setup();

			window.requestAnimationFrame(render);

		},'./image.jpg');

	}

	function onResize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function setup() {

		_effect = new Effect();

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;
		let x      = (width - _image.width) * .5;
		let y      = (height - _image.height) * .5;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#fff';
		_context.fillRect(0,0,width,height);;

		_context.drawImage(_image,x,y);

		let flipWidth  = Math.round(width * .5);
		let flipHeight = height;
		let flipX      = flipWidth;
		let flipY      = 0;
		_effect.draw(_context,flipX,flipY,flipWidth,flipHeight);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}

	function loadImage(onLoad,src) {

		let image = new Image();
		image.onload = function(event) {

			onLoad(image);

		}
		image.src = src;

	}

})(window);
