import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_points,_rows,_degree,_timer;
	const ANIMATION_TYPES = ['wave','break','wave','break','wave','lattice','break','wave','frame','wave','center'];
	const PARTICLE_COLORS = ['#f074ee','#b33ab0','#da2a6f','#66f5c9','#34b6bf','#ec9db6'];
	const BG_COLOR        = '#3C3981';
	let _typeCounter;

	class Point {

		constructor(baseX,baseY) {

			let size     = _setting.get('area_size');
			let halfSize = size * .5;
			let radius   = _setting.get('point_radius');

			this.lattice = {
				x   :baseX + halfSize,
				y   :baseY + halfSize,
				maxX:baseX + size,
				minX:baseX,
				maxY:baseY + size,
				minY:baseY
			}

			this.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
			this.x = baseX + halfSize;
			this.y = baseY + halfSize;
			this.radius = radius;
			this.setRandomDirection();
			this.setRandomVelocity();

		}

		update() {

			let radius = _setting.get('point_radius');
			this.radius = radius;

			this.velocity.x += .01;
			this.velocity.y += .01;

		}

		updateFrame(minX,minY,maxX,maxY) {

			this.update();

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

		updateWave(v) {

			this.update();

			let diffX = this.lattice.x - this.x;
			let diffY = this.lattice.y + v - this.y;
			this.x = this.x + diffX * this.velocity.x;
			this.y = this.y + diffY * this.velocity.y;
			return this;

		}

		updateLattice() {

			this.update();

			if (this.lattice.maxX <= this.x) {
				this.direction.x = -1;
				this.setRandomVelocity();
			}

			if (this.x <= this.lattice.minX) {
				this.direction.x = 1;
				this.setRandomVelocity();
			}

			if (this.lattice.maxY <= this.y) {
				this.direction.y = -1;
				this.setRandomVelocity();
			}

			if (this.y <= this.lattice.minY) {
				this.direction.y = 1;
				this.setRandomVelocity();
			}

			this.x += this.velocity.x * this.direction.x;
			this.y += this.velocity.y * this.direction.y;

			return this;

		}

		updateBreak(maxY,v) {

			this.update();

			let diffY = (maxY * .5) + v - this.y;
			this.y = this.y + diffY * this.velocity.y;
			return this;

		}

		updateCenter(centerX,centerY) {

			this.update();

			let diffX = centerX - this.x;
			let diffY = centerY - this.y;
			this.x = this.x + diffX * this.velocity.x;
			this.y = this.y + diffY * this.velocity.y;
			return this;

		}

		draw() {

			_context.beginPath();
			_context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
			_context.fillStyle = this.color;
			_context.fill();

		}

		reset() {

			this.setRandomDirection();
			this.setRandomVelocity();

		}

		setRandomDirection() {

			this.direction = {
				x:[-1,1][Math.floor(Math.random()*2)],
				y:[-1,1][Math.floor(Math.random()*2)]
			}

		}

		setRandomVelocity() {

			this.velocity = {
				x:getRangeNumber(.01,.1),
				y:getRangeNumber(.01,.1)
			}

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			area_size   :{ value:50,max:500,min:10 },
			point_radius:{ value:2,step:.5,min:0,'data-reload':false },
			amplitude   :{ value:50,min:0,'data-reload':false },
			timer       :{ value:80,min:0,'data-reload':false }
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

		_typeCounter = 0;
		_timer      = _setting.get('timer');
		_degree     = 0;
		_points     = [];
		let size    = _setting.get('area_size');
		let width   = _canvas.width;
		let height  = _canvas.height;
		let rows    = Math.floor(width/size);
		let columns = Math.floor(height/size);
		let diffX   = (width - (size * rows)) * .5;
		let diffY   = (height - (size * columns)) * .5;
		_rows = rows;

		for (let i = 0; i < columns; i++) {
			for (let l = 0; l < rows; l++) {

				let x = l * size + diffX;
				let y = i * size + diffY;
				_points.push(new Point(x,y));

			}
		}

	}

	function render(timestamp) {

		let width     = _canvas.width;
		let height    = _canvas.height;
		let amplitude = _setting.get('amplitude');

		clear(width,height);

		_context.rect(0,0,width,height);
		_context.fillStyle = BG_COLOR;
		_context.fill();

		_timer--;
		if (_timer <= 0) {
			_timer = _setting.get('timer');
			_typeCounter++;
			for (let point of _points) point.reset();
			if (ANIMATION_TYPES.length <= _typeCounter) _typeCounter = 0;
		}

		let type = ANIMATION_TYPES[_typeCounter];

		switch (type) {
			case 'frame':
				for (let point of _points) {

					point.updateFrame(0,0,width,height).draw();

				}
				break;
			case 'wave':

				_degree += .4;
				let counter = 0;
				for (let point of _points) {

					let v = -amplitude * Math.sin((2 * Math.PI / _rows) * (_degree + counter));

					point.updateWave(v).draw();
					if (_rows - 1 <= counter) counter = -1;
					counter++;

				}
				break;
			case 'lattice':
				for (let point of _points) {

					point.updateLattice().draw();

				}
				break;
			case 'break':

				_degree += .4;
				let breakCounter = 0;
				for (let point of _points) {

					let v = -amplitude * Math.sin((2 * Math.PI / _rows) * (_degree + breakCounter));
					point.updateBreak(height,v).draw();
					if (_rows - 1 <= breakCounter) breakCounter = -1;
					breakCounter++;

				}
				break;
			case 'center':
				let centerX = width * .5;
				let centerY = height * .5;
				for (let point of _points) {

					point.updateCenter(centerX,centerY).draw();

				}
				break;

			default:
				break;
		}

		_context.scale(_dpr,_dpr);
		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

	function getDistance(pointA,pointB) {

		return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));

	}

})(window);