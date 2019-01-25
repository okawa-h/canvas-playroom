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
			this.text  = text;
			this.color = color;

			this.direction = {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

			this.setRandomVelocity();

			this.width  = width;
			this.height = height;

			this.isCollision = false;

		}

		setRandomVelocity() {

			this.velocity = { x:getRangeNumber(.5,3),y:getRangeNumber(.5,3) };

		}

		update(minX,minY,maxX,maxY) {

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

		draw(context) {

			context.fillStyle = this.color;
			context.fillText(this.text,this.x,this.y);

		}

	}

	class TextManager {

		constructor() {

			this.isSaturation = false;
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

		update(context,text,fontsize,width,height) {

			if (!this.isSaturation && 300 <= this.objectList.length) this.isSaturation = true;

			if (this.isSaturation) {

				if (this.objectList.length <= 1) this.isSaturation = false;
				this.objectList.pop();

			}

			if (this.objectList.length <= 0) this.addText(context,text,fontsize,width * .5,height * .5);

			const length = this.objectList.length;
			for (let i = 0; i < length; i++) {

				let object = this.objectList[i];
				object.update(0,0,width,height);

				if (object.isCollision && .95 < Math.random() && !this.isSaturation) {

					object.isCollision = false;
					this.addText(context,text,fontsize,object.x,object.y,object);

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
			font_size:{ value:window.innerWidth * .01,'data-reload':false },
			text     :{ value:'Hello world.','data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		_effect = new Effect();

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

		_textManager = new TextManager();

	}

	function render(timestamp) {

		let text     = _setting.get('text');
		let fontsize = parseFloat(_setting.get('font_size'));
		let width  = _canvas.width;
		let height = _canvas.height;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		_textManager.update(_context,text,fontsize,width,height).draw(_context);

		_effect.counter(_context,width,height);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
