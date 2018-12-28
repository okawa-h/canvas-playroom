import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_charactors;

	class Charactor {

		constructor(charactor) {

			this.charactor = charactor;
			this.reset();

		}

		reset() {

			this.fonsize  = 0;
			this.gfonsize = getRangeNumber(_setting.get('max_font_size'),10);
			_context.font = this.fonsize + 'px serif';

			this.angle = getRangeNumber(180,0);
			this.info  = { width :0,height:0 };

			this.x = getRangeNumber(0,_canvas.width);
			this.y = getRangeNumber(0,_canvas.height);

			this.velocity = { size:.1,angle:getRangeNumber(1,.1) };

		}

		update(width,height) {

			this.velocity.size += .01;
			this.angle += this.velocity.angle;

			let diffF    = this.gfonsize - this.fonsize;
			this.fonsize = this.fonsize + diffF * this.velocity.size;
			if (diffF <= 0 || this.gfonsize <= this.fonsize) this.reset();

			_context.font = this.fonsize + 'px serif';
			this.info = {
				width :_context.measureText(this.charactor).width,
				height:getFontOffsetHeight(this.charactor,_context.font)
			};

			return this;

		}

		draw() {

			let fontHW = this.info.width * .5;
			let fontHH = this.info.height * .5;

			_context.save();
			_context.beginPath();

			_context.translate(this.x + fontHW,this.y + fontHH);
			_context.rotate(this.angle * Math.PI / 180);
			_context.translate(-this.x - fontHW,-this.y - fontHH);

			_context.shadowColor = '#333';
			_context.shadowBlur  = 5;

			_context.fillStyle = '#333';
			_context.fillText(this.charactor,this.x,this.y);

			_context.restore();

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			text  :{ value:'ぽぽぽぽ' },
			length:{ value:3 },
			max_font_size:{ value:100,'data-reload':false },
			scale:{ value:20,'data-reload':false },
			alpha:{ value:.3,step:.1,max:1,min:0,'data-reload':false }
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

		let charactors = _setting.get('text').split('');
		let charLength = _setting.get('length') - 1;
		_charactors    = [];
		_context.textBaseline = 'top';

		for (let i = 0; i < charLength; i++) {

			charactors = charactors.concat(charactors);

		}

		for (let i = 0; i < charactors.length; i++) {

			_charactors.push(new Charactor(charactors[i]));

		}

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.globalAlpha = 1;
		_context.globalCompositeOperation = 'source-over';
		clear(width,height);

		_context.globalCompositeOperation = 'source';

		for (let i = 0; i < _charactors.length; i++) {

			_charactors[i].update(width,height).draw();

		}

		let scale     = _setting.get('scale');
		let filter    = document.createElement('canvas');
		filter.width  = width / scale;
		filter.height = height / scale;
		filter.getContext('2d').drawImage(_canvas,0,0,filter.width,filter.height);

		_context.globalAlpha = _setting.get('alpha');
		_context.globalCompositeOperation = 'source';
		_context.drawImage(filter,0,0,width,height);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

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