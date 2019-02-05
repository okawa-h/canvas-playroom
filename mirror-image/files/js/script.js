import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image,_effect;

	document.addEventListener('DOMContentLoaded',initialize);

	class Mirror {

		constructor(canvas,context) {

			this.canvas  = canvas;
			this.context = context;
			this.width  = Math.ceil(canvas.width * .5);
			this.height = canvas.height;
			this.x      = 0;
			this.y      = 0;

			// this.image = context.getImageData(0,0,this.width,this.height);
			this.image = context.getImageData(0,0,this.canvas.width,this.canvas.height);

		}

		draw(context) {

			context.fillStyle="blue";
			context.fillRect(60,10,50,50);

			// const glitch = 1;
			// let x = this.x + getRangeNumber(-glitch,glitch);
			// let y = this.y + getRangeNumber(-glitch,glitch);
			// context.save();
			// // context.transform(1, 0, 0, -1, 0, 0);
			// context.scale(0.8,1.5);
			// // this.context.drawImage(this.canvas, 100, 0);
			// context.putImageData(this.image,0,0);
			// context.scale(1,1);
			// context.restore();

			// let image = new Image();
			// image.onload = function(){

				// context.clearRect(0,0,canvas.width,canvas.height);
				context.save();
				context.scale(-2,2);
				context.drawImage(this.image,0,0);
				context.restore();

				context.fillStyle="red";
				context.fillRect(10,10,50,50);

			// }

			// image.src = this.canvas.toDataURL();

		}

	}

	class Effect {

		constructor(canvas,context) {

			this.film = new Mirror(canvas,context);
			this.life = 10;

		}

		setUp(canvas,context) {

			this.life = getRangeNumber(10,100);
			this.film = new Mirror(canvas,context);

		}

		isDie() {

			return this.life <= 0;

		}

		update() {

			this.life--;

		}

		draw(context) {

			this.film.draw(context);

		}

	}

	function initialize() {

		_setting = new Setting({
			max_row   :{ value:10,'data-reload':false },
			max_column:{ value:10,'data-reload':false },
		});

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

		let width  = _canvas.width;
		let height = _canvas.height;
		let x      = (width - _image.width) * .5;
		let y      = (height - _image.height) * .5;

		_context.fillStyle = '#fff';
		_context.fillRect(0,0,width,height);;

		_context.drawImage(_image,x,y);

		_effect = new Effect(_canvas,_context);

	}

	function render(timestamp) {

		let maxRow    = _setting.get('max_row');
		let maxColumn = _setting.get('max_column');
		let width  = _canvas.width;
		let height = _canvas.height;
		let x      = (width - _image.width) * .5;
		let y      = (height - _image.height) * .5;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#fff';
		_context.fillRect(0,0,width,height);;

		_context.drawImage(_image,x,y);

		// _effect.update();
		// if (_effect.isDie()) _effect.setUp(_canvas,_context);
		_effect.draw(_context);

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
