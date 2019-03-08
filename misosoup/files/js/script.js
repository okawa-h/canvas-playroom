import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	const DOWN_EVENT = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
	const MOVE_EVENT = 'ontouchmove' in window ? 'touchmove' : 'mousemove';
	const UP_EVENT   = 'ontouchend' in window ? 'touchend' : 'mouseup';

	let _canvas,_context;
	let _setting,_objectManager,_backImage,_inputImageDom,_dpr;

	document.addEventListener('DOMContentLoaded',initialize);

	class Point {

		constructor(x,y) {

			this.x = x;
			this.y = y;

		}

		getDistance(point) {

			return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));

		}

		isInclude(point,radius) {

			return this.x - radius < point.x && this.x + radius > point.x && this.y - radius < point.y && this.y + radius > point.y;

		}

		draw(context,radius) {

			context.beginPath();
			context.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
			context.fillStyle = '#fff';
			context.fill();

		}

	}

	class ObjectGuide {

		constructor(object) {

			this.corner = [];

			let element = document.createElement('div');
			element.className = 'object-guide';

			document.getElementById('all').appendChild(element);

			this.id      = object.id;
			this.element = element;
			this.object  = object;

			this.setCornerUI(this);
			this.setRotateUI(this);
			this.setDeleteUI();
			this.element.addEventListener(DOWN_EVENT,(event) => this.onDown(event),true);

		}

		onDown(event) {

			const position = getParsePosition(event);
			const point    = new Point(position.x,position.y);

			this.addClass('active');
			this.addClass('grab');
			this.removeClass('grabCorner');
			this.removeClass('grabRotate');

			this.object.setGrabPosition(point);

		}

		onDownCorner(event) {

			this.addClass('active');
			this.removeClass('grab');
			this.addClass('grabCorner');
			this.removeClass('grabRotate');

			event.target.classList.add('active');

		}

		onDownRotate(event) {

			this.addClass('active');
			this.removeClass('grab');
			this.removeClass('grabCorner');
			this.addClass('grabRotate');

		}

		set(x,y,width,height,scale,angle) {

			this.element.style.top  = y + 'px';
			this.element.style.left = x + 'px';

			this.element.style.width  = width * scale + 'px';
			this.element.style.height = height * scale + 'px';

			this.element.style.transform = 'rotate(' + angle +'deg)';

		}

		setCornerUI() {

			const positionList = ['left-top','right-top','right-bottom','left-bottom'];
			for (let i = 0; i < positionList.length; i++) {

				const positionName = positionList[i];
				let cornerElm = document.createElement('div');
				cornerElm.className = 'object-guide-corner ' + positionName;
				cornerElm.setAttribute('data-index',i);
				this.corner.push(cornerElm);

				this.element.appendChild(cornerElm);
				cornerElm.addEventListener(DOWN_EVENT,(event) => this.onDownCorner(event),true);

			}

		}

		setRotateUI() {

			let element = document.createElement('div');
			element.className = 'object-guide-ui rotate';
			this.element.appendChild(element);
			element.addEventListener(DOWN_EVENT,(event) => this.onDownRotate(event),true);

		}

		setDeleteUI() {

			let object  = this.object;
			let element = document.createElement('div');
			element.className = 'object-guide-ui delete';
			this.element.appendChild(element);
			element.addEventListener(DOWN_EVENT,(event) => _objectManager.delete(object.id),true);

		}

		getActiveCornerIndex() {

			for (let i = 0; i < this.corner.length; i++) {

				let corner = this.corner[i];
				if (corner.classList.contains('active')) return corner.dataset.index;

			}

			return null;

		}

		delete() {

			this.element.remove();

		}

		removeCornerClass(name) {

			for (let i = 0; i < this.corner.length; i++) {

				let corner = this.corner[i];
				corner.classList.remove(name);

			}

		}

		addClass(name) {

			this.element.classList.add(name);

		}

		removeClass(name) {

			this.element.classList.remove(name);

		}

		hasClass(name) {

			return this.element.classList.contains(name);

		}

	}

	class Object {

		constructor(id,x,y,scale) {

			this.id    = id;
			this.x     = x;
			this.y     = y;
			this.scale = scale;

			this.grab   = {};
			this.grab.x = 0;
			this.grab.y = 0;

			this.angle = 0;
			this.guide = new ObjectGuide(this);

		}

		setup() {

			this.guide = new ObjectGuide(this);
			this.update();

		}

		onDown(point) {

			this.guide.removeClass('active');
			this.guide.removeClass('grab');
			this.guide.removeClass('grabCorner');

			this.guide.removeCornerClass('active');

		}

		onMove(point) {

			const calcPoint = new Point(point.x * _dpr,point.y * _dpr);

			if (this.guide.hasClass('grab')) {

				this.x = calcPoint.x + this.grab.x;
				this.y = calcPoint.y + this.grab.y;

			}

			if (this.guide.hasClass('grabCorner')) {

				const originalCenter = new Point(this.width * .5,this.height * .5);
				const center = this.getCenterPoint();
				const index  = this.guide.getActiveCornerIndex();

				const originalDiagonal = originalCenter.getDistance(this.originalCornerPoints[index]);
				const newDiagonal      = center.getDistance(calcPoint);
				const beforeScale      = this.scale;

				this.setScale(newDiagonal/originalDiagonal);

				this.x += (this.width * beforeScale - this.width * this.scale) * .5;
				this.y += (this.height * beforeScale - this.height * this.scale) * .5;

			}

			if (this.guide.hasClass('grabRotate')) {

				const center = this.getCenterPoint();

				const acX = calcPoint.x - center.x;
				const acY = calcPoint.y - center.y;
				const bc  = (center.y - 100) - center.y;

				const babc   = acY * bc;
				const ban    = (acX * acX) + (acY * acY);
				const bcn    = bc * bc;
				const radian = Math.acos(babc / (Math.sqrt(ban * bcn)));

				let angle  = radian * (180 / Math.PI);
				angle = center.x < calcPoint.x ? angle : 180 - angle + 180;

				this.angle = Math.round(angle);

			}

		}

		onUp() {

			this.guide.removeClass('grab');
			this.guide.removeClass('grabCorner');
			this.guide.removeClass('grabRotate');

			this.guide.removeCornerClass('active');

		}

		move(x,y) {

			this.x += x;
			this.y += y;

		}

		setPosition(x,y) {

			this.x = x;
			this.y = y;

		}

		setGrabPosition(point) {

			this.grab.x = this.x - point.x * _dpr;
			this.grab.y = this.y - point.y * _dpr;

		}

		setScale(scale) {

			this.scale = parseFloat(scale.toFixed(5));

		}

		update() {

			this.guide.set(this.x/_dpr,this.y/_dpr,this.width/_dpr,this.height/_dpr,this.scale,this.angle);
			return this;

		}

		delete() {

			this.guide.delete();

		}

		getCenterPoint() {

			const width  = this.width * this.scale;
			const height = this.height * this.scale;
			return new Point(this.x + width * .5, this.y + height * .5);

		}

		getOriginalCornerPoints() {

			const width = this.width;
			const height = this.height;

			return [
				new Point(0,0),
				new Point(width,0),
				new Point(width,height),
				new Point(0,height)
			];

		}

		isActive() {

			return this.guide.hasClass('active');

		}

	}

	class ObjectImage extends Object {

		constructor(id,image,width,height) {

			let ratioW = width <= image.width ? width/image.width : 1;
			let ratioH = height <= image.height ? height/image.height : 1;
			let ratio  = ratioW < ratioH ? ratioW : ratioH;

			super(id,0,0,ratio);
			this.image = image;

			this.width  = image.width;
			this.height = image.height;

			this.originalCornerPoints = this.getOriginalCornerPoints();

		}

		draw(context) {

			const width  = this.width * this.scale;
			const height = this.height * this.scale;

			context.save();

			context.translate(this.x + width * .5,this.y + height * .5);
			context.rotate(this.angle * Math.PI / 180);
			context.translate(-this.x - width * .5,-this.y - height * .5);
			context.drawImage(this.image,this.x,this.y,width,height);

			context.restore();

		}

	}

	class ObjectText extends Object {

		constructor(id,context,x,y,text,color,fontsize) {

			super(id,x,y,1);

			let font = fontsize + 'px sans-serif';
			context.font = font;
			context.textBaseline = 'top';

			this.fontsize = fontsize;
			this.text  = text;
			this.color = color;

			this.width  = context.measureText(text).width;
			this.height = this.getOffsetHeight(text,font);

			this.originalCornerPoints = this.getOriginalCornerPoints();

		}

		draw(context) {

			context.font = this.fontsize * this.scale + 'px sans-serif';
			context.textBaseline = 'top';

			const width  = this.width * this.scale;
			const height = this.height * this.scale;

			context.save();

			context.translate(this.x + width * .5,this.y + height * .5);
			context.rotate(this.angle * Math.PI / 180);
			context.translate(-this.x - width * .5,-this.y - height * .5);

			context.fillStyle = this.color;
			context.fillText(this.text,this.x,this.y);

			context.restore();

		}

		getOffsetHeight(text,font) {

			let span = document.createElement('span');
			span.appendChild(document.createTextNode(text));
			let parent = document.createElement('p');
			parent.id = 'textMetrics';
			parent.appendChild(span);
			document.body.insertBefore(parent, document.body.firstChild);

			span.style.cssText = 'display: inline; font: ' + font + '; white-space: nowrap;';
			let height = span.offsetHeight;
			parent.parentNode.removeChild(parent);
			return height;

		}

	}

	class ObjectManager {

		constructor() {

			this.list     = [];
			this.idConter = 0;
			this.history  = [];

		}

		addImage(image,width,height) {

			this.addHistory();

			this.idConter++;
			this.list.push(new ObjectImage(this.idConter,image,width,height));

		}

		addText(context,text,color,fontsize) {

			this.addHistory();

			this.idConter++;
			this.list.push(new ObjectText(this.idConter,context,0,0,text,color,fontsize));

		}

		addHistory() {

			if (10 < this.history.length) this.history.pop();
			this.history.push(this.list.concat());

		}

		delete(id) {

			for (let i = 0; i < this.list.length; i++) {

				let object = this.list[i];
				if (object.id == id) {

					this.addHistory();
					object.delete();
					this.list.splice(i,1);

				}

			}

		}

		onDown(point) {

			for (let object of this.list) {

				object.onDown(point);

			}

		}

		onMove(point) {

			for (let object of this.list) {

				object.onMove(point);

			}

		}

		onUp(event) {

			for (let object of this.list) {

				object.onUp();

			}

		}

		onPrevious() {

			if (this.history.length <= 0) return;

			for (let object of this.list) {

				object.delete();

			}

			let preList = this.history[this.history.length - 1].concat();
			this.list   = preList;

			for (let object of preList) {

				object.setup();

			}
			this.history.pop();

		}

		onKeyDown(event) {

			const keyCode = event.keyCode;

			for (let i = 0; i < this.list.length; i++) {

				let object = this.list[i];
				let value  = event.shiftKey ? 10 : 1;

				if (object.isActive()) {

					switch(keyCode) {
						case 37:
							object.move(-value,0);
							break;
						case 38:
							object.move(0,-value);
							break;
						case 39:
							object.move(value,0);
							break;
						case 40:
							object.move(0,value);
							break;
					}
				}

			}

		}

		render(context) {

			for (let object of this.list) {

				object.update().draw(context);

			}

		}

	}

	function initialize() {

		_setting = new Setting({
			image     :{ value:'download',elm:'button',onclick:downloadImage },
			stamp     :{ value:'upload',elm:'button',onclick:uploadStamp },
			background:{ value:'upload',elm:'button',onclick:uploadBack },
			text      :{ value:'Hello world','data-reload':false },
			add_text  :{ value:'add',elm:'button',onclick:addText },
			previous  :{ value:'previous',elm:'button',onclick:onPrevious }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');
		_dpr     = window.devicePixelRatio;
		_context.scale(_dpr,_dpr);

		_setting.setCallback(setup);
		setInputImage();
		_objectManager = new ObjectManager();

		function onLoadedAll() {

			window.addEventListener('resize',onResize,false);
			window.addEventListener(DOWN_EVENT,onDown,true);
			window.addEventListener(MOVE_EVENT,onMove,false);
			window.addEventListener(UP_EVENT,onUp,false);
			window.addEventListener('keydown',onKeyDown,false);

			window.dispatchEvent(new Event('resize'));

			setup();

			window.requestAnimationFrame(render);

		}

		imageLoader((backImage) => {

			_backImage = backImage;

			const imageList = ['age.png','asari.png','nameko.png','toufu.png'];
			let counter = 0;

			for (let i = 0; i < imageList.length; i++) {

				const src = './files/img/' + imageList[i];

				imageLoader((image) => {

					_objectManager.addImage(image,_canvas.width,_canvas.height);

					counter++;
					if (imageList.length <= counter) onLoadedAll();

				},src);

			}

		},'./files/img/table.png');

	}

	function setInputImage() {

		_inputImageDom        = document.createElement('input');
		_inputImageDom.type   = 'file';
		_inputImageDom.accept = 'image/*';
		_inputImageDom.style.cssText = 'display: none; z-index: -1;';
		document.getElementById('all').append(_inputImageDom);

		const onFileLoad = () => {

			let image = new Image();
			image.onload = () => {

				_inputImageDom.callback(image);
				_inputImageDom.callback = null;

			};
			image.src = this.result;

		}

		_inputImageDom.addEventListener('change',(event) => {

			let file = event.target.files[0];

			if (0 <= file.type.indexOf('png')) {

				let reader = new FileReader();
				reader.addEventListener('load', onFileLoad, false);
				reader.readAsDataURL(file);

			} else {

				loadImage.parseMetaData(file,(data) => {

					let options = { canvas:true };
					if (data.exif) options.orientation = data.exif.get('Orientation');

					loadImage(file,(canvas) => {

						let image = new Image();
						image.onload = () => {

							_inputImageDom.callback(image);
							_inputImageDom.callback = null;

						}
						image.src = canvas.toDataURL(file.type);

					}, options);

				});

			}

		},false);

	}

	function downloadImage() {

		let element      = document.createElement('a');
		element.href     = _canvas.toDataURL('image/png');
		element.download = 'image.png';
		element.click();

	}

	function uploadImage(callback) {

		_inputImageDom.callback = callback;
		_inputImageDom.click();

	}

	function uploadBack() {

		uploadImage((image) => _backImage = image);

	}

	function uploadStamp() {

		uploadImage((image) => _objectManager.addImage(image,_canvas.width,_canvas.height));

	}

	function addText() {

		const text = _setting.get('text');
		_objectManager.addText(_context,text,'#000',_canvas.width * .08);

	}

	function onResize() {

		const width  = window.innerWidth;
		const height = window.innerHeight;

		canvas.style.width  = width  + 'px';
		canvas.style.height = height + 'px';

		_canvas.width  = width  * _dpr;
		_canvas.height = height * _dpr;

	}

	function onDown(event) {

		const position = getParsePosition(event);
		const point    = new Point(position.x,position.y);

		_objectManager.onDown(point);

	}

	function onMove(event) {

		const position = getParsePosition(event);
		const point    = new Point(position.x,position.y);
		_objectManager.onMove(point);
		window.requestAnimationFrame(render);

	}

	function onUp(event) {

		_objectManager.onUp();

	}

	function onPrevious(event) {

		_objectManager.onPrevious();

	}

	function onKeyDown(event) {

		_objectManager.onKeyDown(event);

	}

	function setup() {

		const width  = _canvas.width;
		const height = _canvas.height;
		const objectList = _objectManager.list;
		const area       = width / objectList.length;

		for (let i = 0; i < objectList.length; i++) {

			let object = objectList[i];
			let diffX  = object.width < area ? area - object.width : 0;
			let x = i * area + diffX * .5;
			let y = height * .8 - object.height;
			object.setPosition(x,y);

		}

		addText();

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.clearRect(0,0,width,height);

		let ratio  = width / _backImage.width;
		let imageH = _backImage.height * ratio;
		_context.drawImage(_backImage,0,height - imageH,width,imageH);

		_objectManager.render(_context);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}

	function imageLoader(onLoad,src) {

		let image = new Image();
		image.onload = (event) => onLoad(image);
		image.src = src;

	}

	function getParsePosition(event) {

		let clientX = event.clientX;
		let clientY = event.clientY;
		if (event.type === 'touchstart' || event.type === 'touchmove' || event.type === 'touchup') {

			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;

		}
		return { x:clientX,y:clientY };

	}

})(window);
