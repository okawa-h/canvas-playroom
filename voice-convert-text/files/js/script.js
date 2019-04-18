import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_effect,_textManager,_recorder;

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

	class DieObject {

		constructor(x,y,number,color) {

			const direction = (number % 3) - 1;
			const delay     = Math.ceil(number / 3) - 1;

			this.x      = x;
			this.y      = y;
			this.width  = 3;
			this.height = 3;
			this.delay  = delay * 20;
			this.color  = color;
			this.velocity = { x:direction * .5 + getRangeNumber(-1,1),y:getRangeNumber(0.5,1) };

		}

		update() {

			this.delay--;

			if (this.delay <= 0) {

				this.x += this.velocity.x;
				this.y -= this.velocity.y;

			}

		}

		draw(context) {

			if (this.delay <= 0) {

				context.fillStyle = this.color;
				context.fillRect(this.x - this.width * .5,this.y - this.height * .5,this.width,this.height);

			}

		}

	}

	class Text {

		constructor(x,y,text,color,width,height) {

			this.x     = x;
			this.y     = y;
			this.text  = text;
			this.color = color;
			this.life  = 800;

			this.direction = {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

			this.setRandomVelocity();

			this.width  = width;
			this.height = height;

			this.isCollision = false;

		}

		isAlive() {

			return 0 < this.life;

		}

		isHeaven() {

			return this.life <= -100;

		}

		setRandomVelocity() {

			this.velocity = { x:getRangeNumber(1,3),y:getRangeNumber(1,3) };

		}

		update(minX,minY,maxX,maxY) {

			this.life--;

			if (!this.isAlive()) {
				this.updateDie();
				return;
			}

			maxX -= this.width;
			maxY -= this.height;

			if (maxX <= this.x) {
				this.direction.x = -1;
				this.isCollision = true;
			}

			if (this.x <= minX) {
				this.direction.x = 1;
				this.isCollision = true;
			}

			if (maxY <= this.y) {
				this.direction.y = -1;
				this.isCollision = true;
			}

			if (this.y <= minY) {
				this.direction.y = 1;
				this.isCollision = true;
			}

			if (this.isCollision) this.setRandomVelocity();

			this.x += this.velocity.x * this.direction.x;
			this.y += this.velocity.y * this.direction.y;

		}

		updateDie() {

			if (!this.dieObjects) this.initializeDieObjects();

			for (let i = 0; i < this.dieObjects.length; i++) {

				const object = this.dieObjects[i];
				object.update();

			}

		}

		initializeDieObjects() {

			this.dieObjects = [];
			for (let i = 0; i < 10; i++) {

				let object = new DieObject(this.x + this.width * .5,this.y + this.height * .5,i,this.color);
				this.dieObjects.push(object);

			}

		}

		draw(context) {

			if (this.isAlive()) {

				context.fillStyle = this.color;
				context.fillText(this.text,this.x,this.y);

			} else {

				for (let i = 0; i < this.dieObjects.length; i++) {

					const object = this.dieObjects[i];
					object.draw(context);

				}

			}

		}

	}

	class TextManager {

		constructor() {

			this.objectList = [];
			this.colorList  = ['#ff0000','#ff007f','#ff00ff','#7f00ff','#0000ff','#007fff','#00ffff','#00ff7f','#00ff00','#7fff00','#ffff00','#ff7f00'];

		}

		addText(context,text,fontsize,x,y,parentObject) {

			context.font = fontsize + 'px "Press Start 2P", cursive,sans-serif';
			context.textBaseline = 'top';

			const color      = this.colorList[Math.floor(Math.random() * this.colorList.length)];
			const textWidth  = context.measureText(text).width;
			const textHeight = this.getOffsetHeight(text,context.font);

			let object = new Text(x,y,text,color,textWidth,textHeight);
			if (parentObject) {

				object.direction.x = parentObject.direction.x;
				object.direction.y = parentObject.direction.y;

			}
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

		update(width,height) {

			let length = this.objectList.length;
			if (length <= 0) return this;

			for (let i = 0; i < length; i++) {

				let object = this.objectList[i];
				object.update(0,0,width,height);

				if (object.isHeaven()) {

					this.objectList.splice(i,1);
					if (this.objectList.length <= 0) break;
					i--;
					length--;

				}

			}

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
			font_size:{ value:window.innerWidth * .015,'data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
		startRecorder();

		_setting.setCallback(setup);

		_effect = new Effect();

		setTimeout(function() {

			window.addEventListener('resize',onResize,false);
			setCanvasSize();
			setup();
			window.requestAnimationFrame(render);

		},200);

	}

	function setCanvasSize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function startRecorder() {

		_recorder = new SpeechRecognition();
		_recorder.interimResults = true;
		_recorder.continuous     = true;
		_recorder.onresult       = onResult;

		_recorder.onsoundstart = function(event) {

		};

		_recorder.onnomatch = function(event) {
		};

		_recorder.onerror = function(event) {
			if (event.error === 'no-speech') startRecorder();
		};

		_recorder.onsoundend = function(event) {
			startRecorder();
		};

		_recorder.lang = 'en-US';
		_recorder.start();

	}

	function onResize() {

		setCanvasSize();
		setup();

	}

	function onResult(event) {

		var results = event.results;
		var target  = results[results.length - 1];
		var value   = target[0].transcript;

		let fontsize = parseFloat(_setting.get('font_size'));
		let width    = _canvas.width;
		let height   = _canvas.height;

		if (!target.isFinal) value = '.';

		_textManager.addText(_context,value,fontsize,width*.5,height*.5);

	}

	function setup() {

		let fontsize = parseFloat(_setting.get('font_size'));
		let width    = _canvas.width;
		let height   = _canvas.height;

		_textManager = new TextManager();
		_textManager.addText(_context,'Please say something.',fontsize,width*.5,height*.5);

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		_textManager.update(width,height).draw(_context);

		_effect.counter(_context,width,height);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}

})(window);
