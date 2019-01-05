import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_image,_velocity,_radius;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			min_radius:{ value:50,'data-reload':false },
			max_radius:{ value:70,'data-reload':false }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

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

	}

	function setup() {

		_velocity = 1;
		_radius   = _setting.get('min_radius');

	}

	function render() {

		const width   = _canvas.width;
		const height  = _canvas.height;
		const centerX = width * .5;
		const centerY = height * .5;
		let minRadius = _setting.get('min_radius');
		let maxRadius = _setting.get('max_radius');

		if (_velocity <= -1) {
			_velocity -= 3;
		} else {
			_velocity *= 1.3;
		}
		
		_radius += _velocity;
		if (maxRadius <= _radius) _velocity = -1;
		if (_radius <= minRadius) _velocity = 1;

		clear(width,height);

		var bgGradient = _context.createLinearGradient(centerX, 0, centerX, height);
		bgGradient.addColorStop(0,'#efecf5');
		bgGradient.addColorStop(.5,'#52f6f8');
		bgGradient.addColorStop(1,'#fb97f8');
		_context.fillStyle = bgGradient;
		_context.fillRect(0, 0, width, height);

		let x = (width - _image.width) * .5;
		let y = (height - _image.height) * .5;
		_context.drawImage(_image,x,y,_image.width,_image.height);

		_context.fillStyle   = '#df8b80';
		_context.globalAlpha = .2;
		_context.fillRect(x,y,_image.width,_image.height);

		_context.globalAlpha = 1;
		_context.beginPath();
		var arcGradient = _context.createLinearGradient(centerX,centerY - _radius,centerX,centerY + _radius);
		arcGradient.addColorStop(0,'#df8b80');
		arcGradient.addColorStop(1,'#d97789');
		_context.fillStyle = arcGradient;
		_context.arc(centerX, centerY, _radius, 0, Math.PI*2, false);
		_context.fillStyle = arcGradient;
		_context.fill();

		window.requestAnimationFrame(render);

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}


})(window);
