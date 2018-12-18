import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_radius,_frame,_microorganism;

	const BG_COLOR     = '#f67c99';
	const STROKE_COLOR = '#e9c3cb';

	class Frame {

		constructor(radius,centerX,centerY,distanse) {

			this.lines = [];

			let radiusPosition = 0;
			while (radiusPosition < 360) {

				let line = {};

				line.start = getOnCircleRandomPoint(radius,radiusPosition + distanse,radiusPosition);
				radiusPosition = line.start.r;
				line.end   = getOnCircleRandomPoint(radius,radiusPosition + distanse,radiusPosition);
				radiusPosition = line.end.r;

				line.start.x += centerX;
				line.start.y += centerY;
				line.end.x   += centerX;
				line.end.y   += centerY;
				this.lines.push(line);

			}

		}

		draw(diff) {

			for (const line of this.lines) {

				let startX = line.start.x + getRangeNumber(diff,-diff);
				let startY = line.start.y + getRangeNumber(diff,-diff);
				let endX   = line.end.x + getRangeNumber(diff,-diff);
				let endY   = line.end.y + getRangeNumber(diff,-diff);

				let diffX = getRangeNumber(startX,endX);
				let diffY = getRangeNumber(startY,endY);

				_context.beginPath();
				_context.strokeStyle = STROKE_COLOR;
				_context.lineCap     = 'round';
				_context.lineWidth   = 3;
				_context.moveTo(startX,startY);
				_context.quadraticCurveTo(diffX,diffY,endX,endY);
				_context.stroke();

			}

		}

	}

	class Microorganism {

		constructor() {

			this.children = [];

		}

		grow(centerX,centerY,radius,distanse) {

			if (radius < this.children.length) {

				this.children = [];

			} else {

				let startAngle = Math.random() * 360;
				let startHypotenuse = Math.random() * (radius - distanse + 1);
				let start = {
					x:centerX + startHypotenuse * Math.cos(startAngle),
					y:centerY + startHypotenuse * Math.sin(startAngle)
				};

				let endAngle = Math.random() * 360;
				let endHypotenuse = getRangeNumber(distanse,distanse * .5);
				let end = {
					x:start.x + endHypotenuse * Math.cos(endAngle),
					y:start.y + endHypotenuse * Math.sin(endAngle)
				};

				this.children.push({ start:start,end:end });


			}

		}

		draw(diff) {

			for (const child of this.children) {

				let startX = child.start.x + getRangeNumber(diff,-diff);
				let startY = child.start.y + getRangeNumber(diff,-diff);
				let endX   = child.end.x   + getRangeNumber(diff,-diff);
				let endY   = child.end.y   + getRangeNumber(diff,-diff);

				let diffX = getRangeNumber(startX,endX);
				let diffY = getRangeNumber(startY,endY);

				_context.beginPath();
				_context.strokeStyle = STROKE_COLOR;
				_context.lineCap     = 'round';
				_context.lineWidth   = 3;
				_context.moveTo(startX,startY);
				_context.quadraticCurveTo(diffX,diffY,endX,endY);
				_context.stroke();

			}

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			distanse:{ 'value':5,'data-reload':false },
			shake   :{ 'value':2,'data-reload':false }
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

		let width     = _canvas.width;
		let height    = _canvas.height;
		let centerX   = width * .5;
		let centerY   = height * .5;
		let distanse  = _setting.get('distanse');

		_microorganism = 0;
		_radius = centerX <= centerY ? centerX : centerY;
		_radius -= _setting.get('distanse');

		_frame = new Frame(_radius,centerX,centerY,distanse);
		_microorganism = new Microorganism();

	}

	function render(timestamp) {

		let distanse = _setting.get('distanse');
		let width    = _canvas.width;
		let height   = _canvas.height;
		let centerX  = width * .5;
		let centerY  = height * .5;
		let shake    = _setting.get('shake');

		clear(0,0,width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.rect(0,0,width,height);
		_context.fillStyle = BG_COLOR;
		_context.fill();

		_context.globalCompositeOperation = 'screen';
		_frame.draw(shake);

		_microorganism.grow(centerX,centerY,_radius,distanse);
		_microorganism.draw(shake);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getOnCircleRandomPoint(radius,maxAngle,minAngle) {

		let r = Math.random() * (maxAngle - minAngle) + minAngle;
		let x = radius * Math.cos(r * (Math.PI / 180));
		let y = radius * Math.sin(r * (Math.PI / 180));
		return { x:x,y:y,r:r };

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

})(window);
