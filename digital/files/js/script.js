import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_image,_effect,_textManager;

	document.addEventListener('DOMContentLoaded',initialize);

	class Effect {

		constructor() {

			this.draw   = null;
			this.filter = new Filter();

			this.setProcessing();
			this.setLife();

		}

		setLife() {

			this.life  = getRangeNumber(0,100);
			this.dying = getRangeNumber(1,10);

		}

		setProcessing() {

			const processing = [this.filter.drawTile,this.filter.drawRGBBar,this.filter.drawColorBar,this.filter.inversion,this.filter.glitch,this.filter.extendColor];
			this.draw = processing[Math.floor(Math.random() * processing.length)];

		}

		counter(context,width,height) {

			this.life--;

			this.filter.glitchSlip(context,width,height,20);
			// this.filter.drawColorBar(context,width,height,20);
			// this.filter.drawTile(context,width,height);

			if (this.life <= 0) {

				this.draw(context,width,height);

			}

			if (this.life <= -this.dying) {

				this.setProcessing();
				this.setLife();

			}

		}

	}

	class Text {

		constructor(x,y,context,text,fontsize,color) {

			this.x = x;
			this.y = y;
			this.text  = text;
			this.color = color;

			context.font = fontsize + 'px "Press Start 2P", cursive,sans-serif';
			context.textBaseline = 'top';
			this.width  = context.measureText(text).width;
			this.height = this.getOffsetHeight(text,context.font);

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

		draw(context) {

			context.fillStyle = this.color;
			context.fillText(this.text,this.x - this.width * .5, this.y - this.height * .5);

		}

	}

	class TextManager {

		constructor() {

			this.textList = [];
			this.life    = 0;

			this.colorList = ['#ff0000','#ff007f','#ff00ff','#7f00ff','#0000ff','#007fff','#00ffff','#00ff7f','#00ff00','#7fff00','#ffff00','#ff7f00'];

		}

		addText(context,text,fontsize,width,height) {

			if (20 <= this.textList.length) this.textList = [];

			const color = this.colorList[Math.floor(Math.random() * this.colorList.length)];
			const x = getRangeNumber(0,width);
			const y = getRangeNumber(0,height);
			this.textList.push(new Text(x,y,context,text,fontsize,color));

		}

		update(context,text,fontsize,width,height) {

			this.life--;

			if (this.life <= 0) {

				this.addText(context,text,fontsize,width,height);
				this.life = getRangeNumber(0,10);

			}

			return this;

		}

		draw(context) {

			for (let text of this.textList) {

				text.draw(context);

			}

		}

	}

	function initialize() {

		_setting = new Setting({
			font_size:{ value:window.innerWidth * .03,'data-reload':false },
			text     :{ value:'Hello world.','data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_effect = new Effect();

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

		_textManager = new TextManager();

	}

	function render(timestamp) {

		let text     = _setting.get('text');
		let fontsize = parseFloat(_setting.get('font_size'));
		let width  = _canvas.width;
		let height = _canvas.height;
		let x      = (width - _image.width) * .5;
		let y      = (height - _image.height) * .5;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		// _context.drawImage(_image,x,y);

		_textManager.update(_context,text,fontsize,width,height).draw(_context);

		_context.fillStyle = '#fff';
		_effect.counter(_context,width,height);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
