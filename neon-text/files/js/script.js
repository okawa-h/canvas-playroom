import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_text;

	document.addEventListener('DOMContentLoaded',initialize,false);

	class Text {

		constructor(context,text,fontsize) {

			this.text = text;
			this.shadowList = [];

			context.font = fontsize + 'px "Poiret One", cursive,sans-serif';
			context.textBaseline = 'top';
			this.width  = context.measureText(text).width;
			this.height = this.getOffsetHeight(text,context.font);

			this.setupShadow();

		}

		setupShadow() {

			const shadows = [
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
				this.shadowList.push(new Shadow(x,y,parseFloat(props[2]),props[3]));

			}

		}

		getOffsetHeight(text,font) {

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

		draw(context,centerX,centerY) {

			for (let i = 0; i < this.shadowList.length; i++) {

				this.shadowList[i].draw(context,this.text,this.width,this.height,centerX,centerY);

			}

			context.fillStyle = '#fff';
			context.fillText(this.text,centerX - this.width * .5, centerY - this.height * .5);

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

		draw(context,text,textWidth,textHeight,centerX,centerY) {

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

			context.save();
			context.beginPath();

			context.rect(x, y, x + totalW, y + totalH);
			context.clip();

			context.shadowColor   = this.color;
			context.shadowOffsetX = this.x + totalW;
			context.shadowOffsetY = this.y;
			context.shadowBlur    = this.blur;
			context.fillText(text,centerX - totalW - textWidth * .5, centerY - textHeight * .5);
			context.restore();

			this.counter++;

		}

	}

	function initialize() {

		_setting = new Setting({
			font_size:{ value:62 },
			text     :{ value:'Hello world.' }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		window.addEventListener('resize',onResize,false);

		setCanvasSize();
		setup();
		window.requestAnimationFrame(render);

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

		let text     = _setting.get('text');
		let fontsize = _setting.get('font_size');
		_text = new Text(_context,text,fontsize);

	}

	function render(timestamp) {

		let width   = _canvas.width;
		let height  = _canvas.height;
		let centerX = width * .5;
		let centerY = height * .5;

		_context.clearRect(0,0,width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.fillStyle = '#03072b';
		_context.fillRect(0,0,width,height);

		_context.globalCompositeOperation = 'screen';
		_text.draw(_context,centerX,centerY);

		window.requestAnimationFrame(render);

	}

})(window);
