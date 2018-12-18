import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_shadows,_textInfo;

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			font_size:{ value:62,'data-reload':false },
			text     :{ value:'Hello world.','data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		window.addEventListener('resize',onResize,false);

		setCanvasSize();
		setup();
		window.requestAnimationFrame(run);

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

		let text      = _setting.get('text');
		_textInfo     = {};
		_context.font = _setting.get('font_size') + 'px "Poiret One", cursive,sans-serif';
		_context.textBaseline = 'top';
		_textInfo.width  = _context.measureText(text).width;
		_textInfo.height = getFontOffsetHeight(text,_context.font);

		_shadows = [];
		let shadows = [
			'0 0 10 #fff',
			'0 0 20 #fff',
			'0 0 30 #fff',
			'0 0 40 #ff00de',
			'0 0 70 #ff00de',
			'0 0 80 #ff00de',
			'0 0 100 #ff00de',
			'0 0 150 #ff00de'
		];

		for (let i = 0; i < shadows.length; i++) {

			let props = shadows[i].split(' ');
			let x     = parseFloat(props[0]);
			let y     = parseFloat(props[1]);
			_shadows.push(new Shadow(x,y,parseFloat(props[2]),props[3]));

		}

	}

	class Shadow {

		constructor(x,y,blur,color) {

			this.x     = x;
			this.y     = y;
			this.blur  = blur;
			this.color = color;
			this.counter   = 0;
			this.direction = 1;
			this.velocity  = 0.1;

		}

		draw(text,textWidth,textHeight,centerX,centerY) {

			if (this.counter % 20 == 0) {
				this.direction *= -1;
				this.velocity = 0.1;
			}

			this.velocity += 0.1;
			this.blur += this.velocity * this.direction;

			let totalW = textWidth  + this.blur * 2;
			let totalH = textHeight + this.blur * 2;
			let x      = centerX - totalW * .5;
			let y      = centerY - totalH * .5;

			_context.save();
			_context.beginPath();

			_context.rect(x, y, x + totalW, y + totalH);
			_context.clip();

			_context.shadowColor   = this.color;
			_context.shadowOffsetX = this.x + totalW;
			_context.shadowOffsetY = this.y;
			_context.shadowBlur    = this.blur;
			_context.fillText(text,centerX - totalW - textWidth * .5, centerY - textHeight * .5);
			_context.restore();

			this.counter++;

		}

	}

	function run(timestamp) {

		let text    = _setting.get('text');
		let width   = _canvas.width;
		let height  = _canvas.height;
		let centerX = width * .5;
		let centerY = height * .5;

		_context.globalCompositeOperation = 'source-over';
		_context.fillStyle = '#03072b';
		_context.fillRect(0,0,width,height);

		_context.globalCompositeOperation = 'screen';

		for (let i = 0; i < _shadows.length; i++) {

			_shadows[i].draw(text,_textInfo.width,_textInfo.height,centerX,centerY);

		}

		_context.fillStyle = '#fff';
		_context.fillText(text,centerX - _textInfo.width * .5, centerY - _textInfo.height * .5);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(run);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

	function getFontOffsetHeight(text,font) {

		let span = document.createElement('span');
		span.appendChild(document.createTextNode(text));
		let parent = document.createElement('p');
		parent.id = 'textMetrics';
		parent.appendChild(span);
		document.body.insertBefore(parent, document.body.firstChild);

		span.style.cssText = 'font: ' + font + '; white-space: nowrap; display: inline;';
		let height = span.offsetHeight;
		parent.parentNode.removeChild(parent);
		return height;

	}

})(window);