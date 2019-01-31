import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_points;

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;
			this.setRandomDirection();
			this.setRandomVelocity();

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

		update(minX,minY,maxX,maxY) {

			if (maxX <= this.x) {
				this.direction.x = -1;
				this.setRandomVelocity();
			}

			if (this.x <= minX) {
				this.direction.x = 1;
				this.setRandomVelocity();
			}

			if (maxY <= this.y) {
				this.direction.y = -1;
				this.setRandomVelocity();
			}

			if (this.y <= minY) {
				this.direction.y = 1;
				this.setRandomVelocity();
			}

			this.x += this.velocity.x * this.direction.x;
			this.y += this.velocity.y * this.direction.y;

			return this;

		}

		draw(context,radius) {

			context.beginPath();
			context.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
			context.fillStyle = '#fff';
			context.fill();

		}

		setRandomDirection() {

			this.direction = {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

		}

		setRandomVelocity() {

			this.velocity = {
				x:getRangeNumber(.1,5),
				y:getRangeNumber(.1,5)
			}

		}

	}

	document.addEventListener('DOMContentLoaded',initialize,false);

	function initialize() {

		_setting = new Setting({
			line_width  :{ value:1,step:.5,min:0,'data-reload':false },
			point_length:{ value:10 },
			point_radius:{ value:2,step:.5,min:0,'data-reload':false }
		});

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

	}

	function setup() {

		_points      = [];
		const length = _setting.get('point_length');
		const width  = _canvas.width;
		const height = _canvas.height;

		for (let i = 0; i < length; i++) {

			const x = getRangeNumber(0,width);
			const y = getRangeNumber(0,height);
			_points.push(new Point(x,y));

		}

	}

	function render(timestamp) {

		const lineWidth = _setting.get('line_width');
		const radius = _setting.get('point_radius');
		const width  = _canvas.width;
		const height = _canvas.height;

		_context.clearRect(0,0,width,height);

		_context.fillStyle = '#000';
		_context.fillRect(0,0,width,height);

		let minY = height;
		let minPointIndex = 0;

		for (let i = 0; i < _points.length; i++) {

			let point = _points[i];
			point.update(0,0,width,height).draw(_context,radius);

			if (point.y <= minY) {
				minY = point.y;
				minPointIndex = i;
			}

		}

		let indexList = getFrameIndexList(_points,minPointIndex);
		let startLinePoint = _points[indexList[0]];
		_context.beginPath();
		_context.lineWidth   = lineWidth;
		_context.strokeStyle = '#fff';
		_context.moveTo(startLinePoint.x,startLinePoint.y);
		for (let i = 0; i < indexList.length; i++) {

			let index = indexList[i];
			let point = _points[index];
			_context.lineTo(point.x,point.y);

		}

		_context.closePath();
		_context.stroke();

		window.requestAnimationFrame(render);

	}

	function getFrameIndexList(pointList,minPointIndex) {

		let indexList   = [minPointIndex];
		let startIndex  = minPointIndex;
		let beforeAngle = 0;

		for (let i = 0; i < pointList.length; i++) {

			startIndex = indexList[indexList.length - 1];
			let next = getMinAnglePointIndex(pointList,startIndex,beforeAngle);
			indexList.push(next.index);
			beforeAngle = next.angle;

			if (minPointIndex == next.index) break;

		}
		return indexList;

	}

	function getMinAnglePointIndex(points,startIndex,beforeAngle) {

		let index      = 0
		let minAngle   = null;
		let startPoint = points[startIndex];

		for (let i = 0; i < points.length; i++) {

			let point = points[i];
			if (point == startPoint) continue;

			let angle = Math.atan2(point.y - startPoint.y,point.x - startPoint.x);
			angle = angle * 180 / Math.PI;

			if (angle <= 0) angle += 360;
			if (angle < beforeAngle) continue;
			if (minAngle == null || angle < minAngle) {
				minAngle = angle;
				index = i;
			}

		}

		return { 'index':index,'angle':minAngle };

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}

})(window);
