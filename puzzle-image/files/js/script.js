import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image,_effect;

	document.addEventListener('DOMContentLoaded',initialize);

	class tile {

		constructor(context,x,y,width,height) {

			this.x      = x;
			this.y      = y;
			this.width  = width;
			this.height = height;

			this.image = context.getImageData(this.x,this.y,this.width,this.height);

		}

		setPosition(x,y) {

			this.x = x;
			this.y = y;

		}

		draw(context) {

			const glitch = 1;
			let x = this.x + getRangeNumber(-glitch,glitch);
			let y = this.y + getRangeNumber(-glitch,glitch);

			context.putImageData(this.image,x,y);
			// context.putImageData(this.image,this.x,this.y);

		}

	}

	class Effect {

		constructor() {

			this.list = [];
			this.life = 10;

		}

		setup(canvas,context,row,column) {

			this.list = [];
			this.life = getRangeNumber(10,100);

			row = Math.round(getRangeNumber(1,row));
			column = Math.round(getRangeNumber(1,column));

			const width  = Math.ceil(canvas.width/column);
			const height = Math.ceil(canvas.height/row);

			let pointList = [];

			for (let i = 0; i < row; i++) {
				for (let l = 0; l < column; l++) {

					const x = l * width;
					const y = i * height;
					this.list.push(new tile(context,x,y,width,height));
					pointList.push({ x:x,y:y });

				}
			}

			this.list = this.shuffle(this.list);

			for (let i = 0; i < this.list.length; i++) {

				let point = pointList[i];
				this.list[i].setPosition(point.x,point.y);

			}

		}

		update() {

			this.life--;

		}

		isDie() {

			return this.life <= 0;

		}

		shuffle(array) {

			var n = array.length, t, i;

			while (n) {
				i = Math.floor(Math.random() * n--);
				t = array[n];
				array[n] = array[i];
				array[i] = t;
			}

			return array;

		}

		draw(context) {

			for (let i = 0; i < this.list.length; i++) {

				this.list[i].draw(context);

			}

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

			_effect = new Effect();

			window.requestAnimationFrame(render);

		},'./image.jpg');

	}

	function onResize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

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

		_effect.update();
		if (_effect.isDie()) _effect.setup(_canvas,_context,maxRow,maxColumn);
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
