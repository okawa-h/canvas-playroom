import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_effect,_textManager;

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
			this.dying = getRangeNumber(2,15);

		}

		setProcessing() {

			const processing = [this.filter.drawTile,this.filter.extendColor,this.filter.grayScale];
			this.draw = processing[Math.floor(Math.random() * processing.length)];

		}

		counter(context,width,height) {

			this.life--;

			this.filter.glitchSlip(context,width,height,20);

			if (this.life <= 0) this.draw(context,width,height);

			if (this.life <= -this.dying) {

				this.setProcessing();
				this.setLife();

			}

		}

	}

	class Text {

		constructor(x,y,text,color,width,height) {

			this.x     = x;
			this.y     = y;
			this.position = y;
			this.text  = text;
			this.color = color;

			this.width  = width;
			this.height = height;

			this.life = getRangeNumber(0,50);

		}

		update(y) {

			this.life--;

			this.y = this.position + y;

			if (this.life <= 0) {
				this.y += getRangeNumber(-10,10);

			}

			if (this.life <= -10) {

				this.life = getRangeNumber(0,50);

			}

		}

		draw(context) {

			context.fillStyle = this.color;
			context.fillText(this.text,this.x,this.y);

		}

	}

	class TextManager {

		constructor() {

			this.y          = 0;
			this.height     = 0;
			this.margin     = 5;
			this.objectList = [];
			// this.colorList  = ['#ff0000','#ff007f','#ff00ff','#7f00ff','#0000ff','#007fff','#00ffff','#00ff7f','#00ff00','#7fff00','#ffff00','#ff7f00'];
			this.colorList  = ['#ff007f','#ff00ff','#7f00ff','#0000ff','#007fff','#00ffff'];

		}

		addText(context,text,fontsize) {

			context.font = fontsize + 'px "Press Start 2P", cursive,sans-serif';
			context.textBaseline = 'top';

			const color      = this.colorList[Math.floor(Math.random() * this.colorList.length)];
			const textWidth  = context.measureText(text).width;
			const textHeight = this.getOffsetHeight(text,context.font);

			const y = this.height + textHeight + this.margin;
			this.height = y;

			const object = new Text(0,y,text,color,textWidth,textHeight);
			this.objectList.push(object);

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

		update(context,height) {

			this.y -= 2;

			const length = this.objectList.length;
			for (let i = 0; i < length; i++) {

				let object = this.objectList[i];
				object.update(this.y);

			}

			if (this.y <= -this.height) this.y = height;

			return this;

		}

		draw(context) {

			for (let object of this.objectList) {

				object.draw(context);

			}

		}

	}

	function initialize() {

		_setting = new Setting({
			font_size:{ value:window.innerWidth * .02 }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_effect = new Effect();

		loadCode(function(data) {

			window.addEventListener('resize',onResize,false);

			setCanvasSize();
			setup(data);
			window.requestAnimationFrame(render);

		});

	}

	function setCanvasSize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function loadCode(callback) {

		let myXml = new XMLHttpRequest();

		myXml.onload = callback;
		myXml.open('GET','files/js/script.js',true);
		myXml.send(null);

	}

	function onResize() {

		setCanvasSize();
		setup();

	}

	function setup(data) {

		let fontsize = parseFloat(_setting.get('font_size'));
		let response = data.target.response;
		let textList = response.split(/\n/);

		_textManager = new TextManager();

		for (let i = 0; i < textList.length; i++) {

			let text = textList[i];
			_textManager.addText(_context,text,fontsize);

		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		_textManager.update(_context,height).draw(_context);

		_effect.counter(_context,width,height);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
