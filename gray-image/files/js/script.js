import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image,_effect;

	document.addEventListener('DOMContentLoaded',initialize);

	class GrayEffect {

		constructor(width,height) {

			this.reset(width,height);

		}

		reset(width,height) {

			this.life  = getRangeNumber(0,10);
			this.dying = getRangeNumber(10,100);

			this.width  = getRangeNumber(1,_setting.get('glitch_width'));
			this.height = getRangeNumber(1,_setting.get('glitch_height'));

			this.x = getRangeNumber(0,width - this.width);
			this.y = getRangeNumber(0,height - this.height);

		}

		update(width,height) {

			this.life--;

			if (this.life <= -this.dying) this.reset(width,height);

			return this;

		}

		draw(context,maxX,maxY) {

			if (this.life <= 0) {

				let imageData = context.getImageData(this.x,this.y,this.width,this.height);
				let data      = imageData.data;

				for (let i = 0; i < data.length; i += 4) {

					const color = (data[i] + data[i + 1] + data[i + 2]) / 3;
					data[i] = data[i + 1] = data[i + 2] = color;

				}

				let x = this.x + getRangeNumber(-maxX,maxX);
				let y = this.y + getRangeNumber(-maxY,maxY);

				context.putImageData(imageData,x,y);

			}

		}

	}

	class Effect {

		constructor(length,width,height) {

			this.list = [];

			for (let i = 0; i < length; i++) {

				this.list.push(new GrayEffect(width,height));

			}

		}

		draw(context,maxX,maxY,width,height) {

			for (const effect of this.list) {

				effect.update(width,height).draw(context,maxX,maxY);

			}

		}

	}

	function initialize() {

		_setting = new Setting({
			length  :{ value:10 },
			glitch_x:{ value:10,'data-reload':false },
			glitch_y:{ value:10,'data-reload':false },
			glitch_width :{ value:window.innerWidth * .5,'data-reload':false },
			glitch_height:{ value:window.innerHeight * .5,'data-reload':false },
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		loadImage(function(image) {

			_image = image;
			window.addEventListener('resize',onResize,false);
			window.dispatchEvent(new Event('resize'));
			window.requestAnimationFrame(render);

		},'./image.jpg');

	}

	function onResize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

		setup();

	}

	function setup() {

		_effect = new Effect(_setting.get('length'),_canvas.width,_canvas.height);

	}

	function render(timestamp) {

		let maxX   = _setting.get('glitch_x');
		let maxY   = _setting.get('glitch_y');
		let width  = _canvas.width;
		let height = _canvas.height;
		let x      = (width - _image.width) * .5;
		let y      = (height - _image.height) * .5;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#fff';
		_context.fillRect(0,0,width,height);;

		_context.drawImage(_image,x,y);

		_effect.draw(_context,maxX,maxY,width,height);

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
