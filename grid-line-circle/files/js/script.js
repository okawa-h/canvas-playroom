import { Setting } from '../../../common/files/js/setting.js';

(function() {

	'use strict';

	let _dpr,_canvas,_context;
	let _setting,_areas,_counter,_randomArray;

	const BG_COLOR     = '#03072b';
	const STROKE_COLOR = '#2b7ffc';
	const HELPER_COLOR = '#e5e9f2';

	class Area {

		constructor(number,x,y) {

			this.number = number;
			this.x = x;
			this.y = y;

		}

		draw() {

			let size   = _setting.get('area_size');
			let radius = _setting.get('radius');

			for (let i = 0; i < this.number; i++) {

				let centerX    = this.x + size * .5;
				let centerY    = this.y + size * .5;
				let startPoint = Area.getOnCircleRandomPoint(radius);
				let endPoint   = Area.getOnCircleRandomPoint(radius);

				_context.beginPath();
				_context.strokeStyle = STROKE_COLOR;
				_context.lineWidth   = _setting.get('line_width');
				_context.moveTo(centerX + startPoint.x,centerY + startPoint.y);
				_context.lineTo(centerX + endPoint.x,centerY + endPoint.y);
				_context.stroke();

			}

		}

		drawHelper() {

			let size   = _setting.get('area_size');
			let radius = _setting.get('radius');

			let centerX = this.x + size * .5;
			let centerY = this.y + size * .5;

			_context.beginPath();
			_context.strokeStyle = HELPER_COLOR;
			_context.lineWidth   = 1;
			_context.arc(centerX,centerY,radius,0,Math.PI*2,false);
			_context.stroke();
			_context.closePath();
			return this;

		}

		static getOnCircleRandomPoint(radius) {

			let r = Math.floor(Math.random() * 361);
			let x = radius * Math.cos(r * (Math.PI / 180));
			let y = radius * Math.sin(r * (Math.PI / 180));
			return { x:x,y:y};

		}

	}

	document.addEventListener('DOMContentLoaded',init,false);

	function init() {

		_setting = new Setting({
			area_size :{ value:100 },
			radius    :{ value:40,'data-reload':false },
			line_width:{ value:1,step:.1,'data-reload':false }
		});

		_dpr     = window.devicePixelRatio || 1;
		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		window.addEventListener('resize',onResize,false);

		setCanvasSize();
		setup();
		window.requestAnimationFrame(run);

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

		let size   = _setting.get('area_size');

		_counter    = 0;
		_areas      = [];
		let width   = _canvas.width;
		let height  = _canvas.height;
		let rows    = Math.floor(width/size);
		let columns = Math.floor(height/size);
		let diffX   = (width - (size * rows)) * .5;
		let diffY   = (height - (size * columns)) * .5;

		for (let i = 0; i < columns; i++) {
			for (let l = 0; l < rows; l++) {

				let x = l * size + diffX;
				let y = i * size + diffY;
				_areas.push(new Area(_areas.length + 1,x,y));

			}

		}

		_randomArray= getRandomNumberArray(_areas.length);

	}

	function run(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		clear(0,0,width,height);

		_context.globalCompositeOperation = 'source-over';
		_context.fillStyle = BG_COLOR;
		_context.rect(0,0,width,height);
		_context.fill();

		_context.globalCompositeOperation = 'screen';
		for (let i = 0; i < _counter; i++) {

			let number = _randomArray[i];
			_areas[number].draw();

		}

		_counter++;
		if (_areas.length < _counter) {
			_counter = 0;
			_randomArray= getRandomNumberArray(_areas.length);
		}

		window.requestAnimationFrame(run);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(max,min) {

		return Math.random() * (max - min) + min;

	}

	function getRandomNumberArray(length) {

		let array = [];
		for (let i = 0; i < length; i++) {
			array[i] = i;
		}

		for(let i = array.length - 1; i > 0; i--){
			let r = Math.floor(Math.random() * (i + 1));
			let tmp = array[i];
			array[i] = array[r];
			array[r] = tmp;
		}

		return array;

	}

})();
