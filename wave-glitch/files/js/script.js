import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	const Wave = (function() {

		const generator = new PerlinNoise();

		function noise(x, y, z) {
			const octaves = 4;
			const fallout = 4.5;
			let k      = 1;
			let effect = 1;
			let sum    = 0;

			for (let i=0; i < octaves; ++i) {
				effect *= fallout;
				switch (arguments.length) {
					case 1:
						sum += effect * (1 + generator.noise1d(k*x))/2;
						break;
					case 2:
						sum += effect * (1 + generator.noise2d(k*x, k*y))/2;
						break;
					case 3:
						sum += effect * (1 + generator.noise3d(k*x, k*y, k*z))/2;
						break;
				}
				k *= 2;
			}
			return sum;
		}

		function glitch(canvas_node) {

			this.canvas = canvas_node;
			this.ctx = this.canvas.getContext('2d');

			this.image_data = this.ctx.getImageData(0,0,canvas_node.width, canvas_node.height);
			this.width  = this.image_data.width;
			this.height = this.image_data.height;

			this.yoffset = 0;
			this.time = 0;

			const that = this;

			const horizonNoise = function(r, g, b, a, x, y, w, h) {
				const iy  = ((y+that.yoffset)|0) % that.height;
				const ix  = (x+(noise(y/that.height, that.time)|0)) % that.width;
				const idx = (iy * that.width + ix) * 4;
				const px  = that.image_data.data;
				return {
					r: px[idx + 0],
					g: px[idx + 1],
					b: px[idx + 2],
					a: px[idx + 3]
				}
			}

			const colorNoise = function(r, g, b, a, x, y, w, h) {
				const v = (Math.random()*32) | 0;
				return {
					r: (r + v),
					g: (g + v),
					b: (b + v),
					a: a
				}
			}

			this.apply = function(shader) {

				const width  = this.width;
				const height = this.height;

				const context   = this.canvas.getContext('2d');
				const imageData = context.getImageData(0, 0, width, height);

				for (let i = 0, k = 0, l = imageData.data.length; i < l; i += 4, k++) {

					const x = k % width;
					const y = (k / width) | 0;

					const r = imageData.data[i + 0];
					const g = imageData.data[i + 1];
					const b = imageData.data[i + 2];
					const a = imageData.data[i + 3];

					const pixel = shader(r, g, b, a, x, y, width, height);

					imageData.data[i ]    = pixel.r;
					imageData.data[i + 1] = pixel.g;
					imageData.data[i + 2] = pixel.b;
					imageData.data[i + 3] = pixel.a;

				}

				context.putImageData(imageData, 0, 0);

			};

			this.update = function(elapsed) {

				const diffTimestamp = elapsed/1000;
				this.time += diffTimestamp;
				this.yoffset += diffTimestamp * 50;

			}

			this.render = function() {

				this.apply(horizonNoise);
				this.apply(colorNoise);

			}

		}

		return glitch;

	})();

	let _canvas,_context;
	let _setting,_image,_effect,_timestamp;

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			speed:{ value:0,min:0,'data-reload':false }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');
		_setting.setCallback(setup);

		_image = new Image();
		_image.onload = function() {

			window.addEventListener('resize',onResize,false);

			setup();
			window.requestAnimationFrame(render);

		}
		_image.src = './image.jpg';

	}

	function onResize() {

		setup();

	}

	function setup() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

		const width  = _canvas.width;
		const height = _canvas.height;
		const imageW = _image.width;
		const imageH = _image.height;
		const x      = (width - imageW) * .5;
		const y      = (height - imageH) * .5;

		_context.clearRect(0,0,width,height);
		_context.drawImage(_image, x, y);

		_effect = new Wave(_canvas);
		_timestamp = now();

	}

	function render(timestamp) {

		const width   = _canvas.width;
		const height  = _canvas.height;
		const speed   = _setting.get('speed');

		_context.clearRect(0,0,width,height);

		const newTimestamp  = now();
		const diffTimestamp = newTimestamp - _timestamp;
		_timestamp = newTimestamp;

		_effect.update(diffTimestamp + speed);
		_effect.render();

		window.requestAnimationFrame(render);

	}

	function now() {

		return (new Date()).getTime();

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}

})(window);
