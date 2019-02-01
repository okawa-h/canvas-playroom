import { Setting } from '../../../common/files/js/setting.js';
import { Filter } from '../../../common/files/js/filter.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_objectManager,_backImage,_inputImageDom,_effect;

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

			let parentClass = this;
			let element = document.createElement('div');
			element.className = 'object-guide';

			document.getElementById('all').appendChild(element);

			this.id      = object.id;
			this.element = element;
			this.object  = object;

			this.setCornerUI(this);
			this.setRotateUI(this);
			this.setDeleteUI();
			this.element.addEventListener('mousedown',function(event) {
				parentClass.onDown(event,parentClass);
			},true);

		}

		onDown(event,parent) {

			const point = new Point(event.clientX,event.clientY);

			parent.addClass('active');
			parent.addClass('grab');
			parent.removeClass('grabCorner');
			parent.removeClass('grabRotate');

			parent.object.setGrabPosition(point);

		}

		onDownCorner(event,parent) {

			parent.addClass('active');
			parent.removeClass('grab');
			parent.addClass('grabCorner');
			parent.removeClass('grabRotate');

			event.target.classList.add('active');

		}

		onDownRotate(event,parent) {

			const point = new Point(event.clientX,event.clientY);

			parent.addClass('active');
			parent.removeClass('grab');
			parent.removeClass('grabCorner');
			parent.addClass('grabRotate');

		}

		set(x,y,width,height,scale,angle) {

			this.element.style.top  = y + 'px';
			this.element.style.left = x + 'px';

			this.element.style.width  = width * scale + 'px';
			this.element.style.height = height * scale + 'px';

			this.element.style.transform = 'rotate(' + angle +'deg)';

		}

		setCornerUI(parentClass) {

			const positionList = ['left-top','right-top','right-bottom','left-bottom'];
			for (let i = 0; i < positionList.length; i++) {

				const positionName = positionList[i];
				let cornerElm = document.createElement('div');
				cornerElm.className = 'object-guide-corner ' + positionName;
				cornerElm.setAttribute('data-index',i);
				this.corner.push(cornerElm);

				this.element.appendChild(cornerElm);
				cornerElm.addEventListener('mousedown',function(event) {
					parentClass.onDownCorner(event,parentClass);
				},true);

			}

		}

		setRotateUI(parentClass) {

			let element = document.createElement('div');
			element.className = 'object-guide-ui rotate';
			this.element.appendChild(element);
			element.addEventListener('mousedown',function(event) {
				parentClass.onDownRotate(event,parentClass);
			},true);

		}

		setDeleteUI() {

			let object  = this.object;
			let element = document.createElement('div');
			element.className = 'object-guide-ui delete';
			this.element.appendChild(element);
			element.addEventListener('mousedown',function(event) {
				_objectManager.delete(object.id);
			},true);

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

		onDown(point) {

			this.guide.removeClass('active');
			this.guide.removeClass('grab');
			this.guide.removeClass('grabCorner');

			this.guide.removeCornerClass('active');

		}

		onMove(point) {

			if (this.guide.hasClass('grab')) {

				this.x = point.x + this.grab.x;
				this.y = point.y + this.grab.y;
				this.corner.points = this.getCornerPoints();

			}

			if (this.guide.hasClass('grabCorner')) {

				const index            = this.guide.getActiveCornerIndex();
				const diagonalIndex    = this.getDiagonalIndex(index);
				const originalDistance = this.corner.defaultPoints[diagonalIndex].getDistance(this.corner.defaultPoints[index]);
				const distance         = this.corner.points[diagonalIndex].getDistance(point);
				const beforeScale      = this.scale;

				this.setScale(distance/originalDistance);

				let diffX = this.width * beforeScale - this.width * this.scale;
				let diffY = this.height * beforeScale - this.height * this.scale;
				if (index == 3 || index == 0) this.x += diffX;
				if (index == 0 || index == 1) this.y += diffY;

				this.corner.points = this.getCornerPoints();

			}

			if (this.guide.hasClass('grabRotate')) {


				let center = this.getCenterPoint();

				let baX = point.x - center.x;
				let baY = point.y - center.y;
				let bc  = (center.y - 100) - center.y;

				let babc   = baY * bc;
				let ban    = (baX * baX) + (baY * baY);
				let bcn    = bc * bc;
				let radian = Math.acos(babc / (Math.sqrt(ban * bcn)));
				let angle  = radian * (180 / Math.PI);
				angle = center.x < point.x ? angle : 180 - angle + 180;

				this.angle = Math.round(angle);
				this.corner.points = this.getCornerPoints();

			}

		}

		onUp() {

			this.guide.removeClass('grab');
			this.guide.removeClass('grabCorner');
			this.guide.removeClass('grabRotate');

			this.guide.removeCornerClass('active');

		}

		setPosition(x,y) {

			this.x = x;
			this.y = y;
			this.corner.points = this.getCornerPoints();

		}

		setGrabPosition(point) {

			this.grab.x = this.x - point.x;
			this.grab.y = this.y - point.y;

		}

		setScale(scale) {

			this.scale = parseFloat(scale.toFixed(5));
			if (scale <= .1) this.scale = .1;

		}

		update() {

			this.guide.set(this.x,this.y,this.width,this.height,this.scale,this.angle);

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

		getDiagonalIndex(index) {

			let reIndex = 0;
			if (index == 0) reIndex = 2;
			if (index == 1) reIndex = 3;
			if (index == 2) reIndex = 0;
			if (index == 3) reIndex = 1;
			return reIndex;

		}

		getCornerPoints() {

			const width  = this.width * this.scale;
			const height = this.height * this.scale;

			return [
				new Point(this.x,this.y),
				new Point(this.x + width, this.y),
				new Point(this.x + width, this.y + height),
				new Point(this.x, this.y + height)
			];

		}

		getDefaultCornerPoints() {

			const width = this.width;
			const height = this.height;

			return [
				new Point(0,0),
				new Point(width,0),
				new Point(width,height),
				new Point(0,height)
			];

		}

	}

	class ObjectImage extends Object {

		constructor(id,image,width,height) {

			let ratio = width <= image.width ? width/image.width : 1;
			super(id,0,0,ratio);
			this.image = image;

			this.width  = image.width;
			this.height = image.height;

			this.corner        = {};
			this.corner.radius = 5;
			this.corner.points = this.getCornerPoints();
			this.corner.defaultPoints = this.getDefaultCornerPoints();

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

			this.corner        = {};
			this.corner.radius = 5;
			this.corner.points = this.getCornerPoints();
			this.corner.defaultPoints = this.getDefaultCornerPoints();

		}

		update() {

			this.guide.set(this.x,this.y,this.width,this.height,this.scale,this.angle);
			return this;

		}

		draw(context) {

			context.font = this.fontsize * this.scale + 'px sans-serif';

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

			span.style.cssText = 'font: ' + font + '; white-space: nowrap; display: inline;';
			let height = span.offsetHeight;
			parent.parentNode.removeChild(parent);
			return height;

		}

	}

	class ObjectManager {

		constructor() {

			this.list     = [];
			this.idConter = 0;

		}

		addImage(image,width,height) {

			this.idConter++;
			this.list.push(new ObjectImage(this.idConter,image,width,height));

		}

		addText(context,text,color,fontsize) {

			this.idConter++;
			this.list.push(new ObjectText(this.idConter,context,0,0,text,color,fontsize));

		}

		delete(id) {

			for (let i = 0; i < this.list.length; i++) {

				let object = this.list[i];
				if (object.id == id) {

					object.delete();
					this.list.splice(i,1);

				}

			}

		}

		onDown(point) {

			for (let i = 0; i < this.list.length; i++) {

				const object = this.list[i];
				object.onDown(point);

			}

		}

		onMove(point) {

			for (let i = 0; i < this.list.length; i++) {

				this.list[i].onMove(point);

			}

		}

		onUp(event) {

			for (let i = 0; i < this.list.length; i++) {

				this.list[i].onUp();

			}

		}

		render(context) {

			for (let i = 0; i < this.list.length; i++) {

				this.list[i].update().draw(context);

			}

		}

	}

	class Effect {

		constructor() {

			this.draw   = null;
			this.filter = new Filter();

			this.setProcessing();
			this.setLife();

		}

		setLife() {

			this.life  = getRangeNumber(0,100);
			this.dying = getRangeNumber(1,10);

		}

		setProcessing() {

			const processing = [this.filter.inversion,this.filter.glitch,this.filter.extendColor];
			this.draw = processing[Math.floor(Math.random() * processing.length)];

		}

		counter(context,width,height) {

			this.life--;

			this.filter.glitchSlip(context,width,height,20);

			if (this.life <= 0) {

				this.draw(context,width,height);

			}

			if (this.life <= -this.dying) {

				this.setProcessing();
				this.setLife();

			}

		}

	}

	function initialize() {

		_setting = new Setting({
			image     :{ value:'download',elm:'button',onclick:downloadImage },
			stamp     :{ value:'upload',elm:'button',onclick:uploadStamp },
			background:{ value:'upload',elm:'button',onclick:uploadBack },
			text      :{ value:'Hello world','data-reload':false },
			add_text  :{ value:'add',elm:'button',onclick:addText }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);
		setInputImage();

		_effect = new Effect();
		_objectManager = new ObjectManager();

		function onLoadedAll() {

			window.addEventListener('resize',onResize,false);
			window.addEventListener('mousedown',onDown,true);
			window.addEventListener('mousemove',onMove,false);
			window.addEventListener('mouseup',onUp,false);

			window.dispatchEvent(new Event('resize'));

			setup();

			window.requestAnimationFrame(render);

		}

		loadImage(function(backImage) {

			_backImage = backImage;

			const imageList = ['age.png','asari.png','nameko.png','toufu.png'];
			let counter = 0;

			for (let i = 0; i < imageList.length; i++) {

				const src = './files/img/' + imageList[i];

				loadImage(function(image) {

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

		function onFileLoad() {

			let image = new Image();
			image.onload = function() {

				_inputImageDom.callback(image);
				_inputImageDom.callback = null;

			};
			image.src = this.result;

		}

		_inputImageDom.addEventListener('change',function(event) {

			let files  = event.target.files;
			let reader = new FileReader();
			reader.addEventListener('load', onFileLoad, false);
			reader.readAsDataURL(files[0]);

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

		uploadImage(function(image) {

			_backImage = image;

		});

	}

	function uploadStamp() {

		uploadImage(function(image) {

			_objectManager.addImage(image,_canvas.width,_canvas.height)

		});

	}

	function addText() {

		let text = _setting.get('text');
		_objectManager.addText(_context,text,'#000',30);

	}

	function onResize() {

		_canvas.width  = window.innerWidth;
		_canvas.height = window.innerHeight;

	}

	function onDown(event) {

		const point = new Point(event.clientX,event.clientY);

		_objectManager.onDown(point);

	}

	function onMove(event) {

		const point = new Point(event.clientX,event.clientY);

		_objectManager.onMove(point);

	}

	function onUp(event) {

		_objectManager.onUp();

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

		let text = _setting.get('text');
		_objectManager.addText(_context,text,'#000',30);

	}

	function render(timestamp) {

		let width  = _canvas.width;
		let height = _canvas.height;

		_context.clearRect(0,0,width,height);

		let ratio  = width / _backImage.width;
		let imageH = _backImage.height * ratio;
		_context.drawImage(_backImage,0,height - imageH,width,imageH);

		_objectManager.render(_context);

		// _effect.counter(_context,width,height);

		window.requestAnimationFrame(render);

	}

	function getRangeNumber(min, max) {

		return Math.random() * (max - min) + min;

	}

	function loadImage(onLoad,src) {

		let image = new Image();
		image.onload = function(event) {

			onLoad(image);

		}
		image.src = src;

	}


})(window);
