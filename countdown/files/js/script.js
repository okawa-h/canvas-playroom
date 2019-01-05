import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_startTime,_frame;

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;

		}

		isEqual(point) {

			return this.x === point.x && this.y === point.y;

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

	}

	class Circle {

		constructor(center,radius) {

			this.center = center;
			this.radius = radius;

			return this;

		}

		isInclude(point) {

			let x = point.x - this.center.x;
			let y = point.y - this.center.y;
			let len = Math.sqrt((x * x) + (y * y));

			return len < this.radius;

		}

		draw(context,color) {

			context.beginPath();
			context.arc(this.center.x,this.center.y,this.radius,0,Math.PI * 2,false);
			context.closePath();
			context.fillStyle = color;
			context.fill();

			return this;

		}

	}

	class Frame {

		constructor(radius,centerX,centerY) {

			this.points = [];
			this.radius = radius;

		}

		update(count,centerP) {

			if (this.count != count) {
				this.createPoints(count,centerP);
			}

			this.count = count;

			for (let i = 0; i < this.points.length; i++) {

				let point = this.points[i];
				let diffX = point.goal.x - point.x;
				let diffY = point.goal.y - point.y;

				point.velocity += .002;
				point.x = point.x + diffX * point.velocity;
				point.y = point.y + diffY * point.velocity;

				point.x += getRangeNumber(1,-1);
				point.y += getRangeNumber(1,-1);

			}

			return this;

		}

		draw(context) {

			const pointRadius = _setting.get('point_radius');
			const lineWidth   = _setting.get('line_width');

			for (let i = 0; i < this.points.length; i++) {

				let next  = this.points.length <= i + 1 ? 0 : i + 1;
				let point = this.points[i];
				let nextP = this.points[next];
				new Circle(point,pointRadius).draw(context,'#fff');

				if (lineWidth <= 0) continue;
				_context.beginPath();
				_context.strokeStyle = '#fff';
				_context.lineWidth   = lineWidth;
				_context.moveTo(point.x,point.y);
				_context.lineTo(nextP.x,nextP.y);
				_context.stroke();

			}

		}

		createPoints(count,centerP) {

			const distanse = 360 / count;
			this.points = [];

			for (let i = 0; i < count; i++) {

				let point    = this.getCircleOnPoint(this.radius,distanse * i);
				let startP   = this.getCircleOnPoint(this.radius + getRangeNumber(180,30),distanse * i);
				let circleP  = new Point(centerP.x + startP.x,centerP.y + startP.y);
				circleP.goal = new Point(centerP.x + point.x,centerP.y + point.y);
				circleP.velocity = getRangeNumber(.01,.0001);

				this.points.push(circleP);

			}

		}

		getCircleOnPoint(radius,angle) {

			let x = radius * Math.cos(angle * (Math.PI / 180));
			let y = radius * Math.sin(angle * (Math.PI / 180));
			return new Point(x,y);

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			count:{ 'value':30 },
			fontsize:{ 'value':180 },
			point_radius:{ 'value':3,'data-reload':false },
			line_width  :{ 'value':.5,step:.5,'data-reload':false }
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

		const width   = _canvas.width;
		const height  = _canvas.height;
		const centerX = width * .5;
		const centerY = height * .5;
		const fontsize = _setting.get('fontsize');

		_startTime = new Date();

		_context.font = fontsize + 'px "Rajdhani", sans-serif';
		_context.textBaseline = 'top';

		_frame = new Frame(fontsize * .6,centerX,centerY);

	}

	function render(timestamp) {

		const width   = _canvas.width;
		const height  = _canvas.height;
		const centerP = new Point(width * .5,height * .5);

		const datet = parseInt((new Date().getTime() - _startTime.getTime()) / 1000);
		const sec   = datet % 60;
		const count = _setting.get('count') - sec;

		if (count <= 0) setup();

		_context.clearRect(0,0,width,height);

		// _context.globalCompositeOperation = 'source-over';
		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		const textW  = _context.measureText(count).width;
		const textH = getFontOffsetHeight(count,_context.font);
		_context.fillStyle = '#fff';
		_context.fillText(count,centerP.x - textW * .5, centerP.y - textH * .5);

		// _context.globalCompositeOperation = 'screen';
		_frame.update(count,centerP).draw(_context);

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

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

		span.style.cssText = 'font: ' + font + ';line-height:1; white-space: nowrap; display: inline;';
		let height = span.offsetHeight - span.offsetHeight * .35;
		parent.parentNode.removeChild(parent);
		return height;

	}

})(window);
