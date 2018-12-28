import { Setting } from '../../../common/files/js/setting.js';

(function(window) {

	'use strict';

	let _canvas,_context;
	let _setting,_processingImage,_points,_velocity;
	const IMAGE_LIST = ['image01.jpg','image02.jpg','image03.jpg'];

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

	class Edge{

		constructor(start,end) {

			this.start = start;
			this.end   = end;

		}

		isEqual(edge) {

			return (
				(this.start.isEqual(edge.start) && this.end.isEqual(edge.end)) ||
				(this.start.isEqual(edge.end)   && this.end.isEqual(edge.start))
			);

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

	class Triangle {

		constructor(points) {

			this.points = points;

			return this;

		}

		getCircumscribedCircle() {

			let x1 = this.points[0].x;
			let y1 = this.points[0].y;
			let x2 = this.points[1].x;
			let y2 = this.points[1].y;
			let x3 = this.points[2].x;
			let y3 = this.points[2].y;

			let c = 2 * ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1));
			let x = ((y3 - y1) * (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1) + (y1 - y2) * (x3 * x3 - x1 * x1 + y3 * y3 - y1 * y1)) / c;
			let y = ((x1 - x3) * (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1) + (x2 - x1) * (x3 * x3 - x1 * x1 + y3 * y3 - y1 * y1)) / c;

			let centerPoint = new Point(x, y);
			let radius = this.points[0].getDistance(centerPoint);

			return new Circle(centerPoint,radius);

		}

		getEdges() {

			if (!this._edges) {
				this._edges = [];
				this._edges.push(new Edge(this.points[0],this.points[1]));
				this._edges.push(new Edge(this.points[1],this.points[2]));
				this._edges.push(new Edge(this.points[2],this.points[0]));
			}
			return this._edges;

		}

		getCenterPoint() {

			let cx = (this.points[0].x + this.points[1].x + this.points[2].x) / 3;
			let cy = (this.points[0].y + this.points[1].y + this.points[2].y) / 3;

			return new Point(cx,cy);

		}

		draw(context,color) {

			context.beginPath();
			context.moveTo(this.points[0].x,this.points[0].y);
			context.lineTo(this.points[1].x,this.points[1].y);
			context.lineTo(this.points[2].x,this.points[2].y);
			context.closePath();
			context.fillStyle   = color;
			context.strokeStyle = color;
			context.fill();
			context.stroke();

			return this;

		}

	}

	class ProcessingImage {

		constructor(srcList,width,height,onloaded) {

			this.canvas    = document.createElement('canvas');
			this.context   = this.canvas.getContext('2d');
			this.counter   = 0;
			this.imageList = [];

			let loadCounter = 0;
			for (let i = 0; i < srcList.length; i++) {

				let processingImage = this;
				let image = new Image();
				image.onload = function() {

					let colorData = processingImage.getColorData(image,width,height);
					processingImage.imageList[i] = {
						image    :image,
						colorData:colorData
					};
					loadCounter++;
					if (srcList.length <= loadCounter ) onloaded();

				};
				image.src = './' + srcList[i];

			}


		}

		counterImage() {

			this.counter++;
			if (this.imageList.length <= this.counter) this.counter = 0;

		}

		getColorData(image,width,height) {

			this.context.clearRect(0,0,width,height);
			this.canvas.width  = width;
			this.canvas.height = height;

			let imageX = (width - image.width) * .5;
			let imageY = (height - image.height) * .5;
			this.context.drawImage(image,imageX,imageY);

			return this.context.getImageData(0,0,width,height).data;

		}

		getColor(x,y) {

			x = Math.round(x);
			y = Math.round(y);

			let colorData = this.imageList[this.counter].colorData;

			// const pixel = this.context.getImageData(x,y,1,1).data;
			// const red   = pixel[0];
			// const green = pixel[1];
			// const blue  = pixel[2];
			// const alpha = pixel[3];

			const width    = this.canvas.width;
			const position = (width * y + (width - (width - x))) * 4;
			const red   = colorData[position];
			const green = colorData[position + 1];
			const blue  = colorData[position + 2];
			const alpha = colorData[position + 3];

			return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';

		}

	}

	document.addEventListener('DOMContentLoaded',initialize);

	function initialize() {

		_setting = new Setting({
			length:{ value:2000,min:10,'data-reload':false }
		});

		_canvas  = document.getElementById('canvas');
		_context = _canvas.getContext('2d');

		_setting.setCallback(setup);

		setCanvasSize();
		_processingImage = new ProcessingImage(IMAGE_LIST,_canvas.width,_canvas.height,function() {

			window.addEventListener('resize',onResize,false);

			setup();
			window.requestAnimationFrame(render);

		});

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

		_points   = 10;
		_velocity = .01;

	}

	function render() {

		let length   = _setting.get('length');
		let distanse = length - _points;
		_velocity += .1;
		_points = Math.round(_points + distanse * _velocity);

		if (length <= _points) {

			setup();
			_processingImage.counterImage();

		}

		let width  = _canvas.width;
		let height = _canvas.height;

		let trianglePoints = [];
		for (let i = 0; i < _points; i++) {

			let point = new Point(Math.random() * width,Math.random() * height);
			trianglePoints.push(point);

		}

		let radius      = Math.sqrt((width * width) + (height * height)) * .5;
		let centerPoint = new Point(width * .5,height * .5);
		let bottomPoint = new Point(centerPoint.x - Math.sqrt(3) * radius,centerPoint.y - radius);
		let rightPoint  = new Point(centerPoint.x + Math.sqrt(3) * radius,centerPoint.y - radius);
		let leftPoint   = new Point(centerPoint.x,centerPoint.y + radius * 2);
		let circumscribedTriangles = [new Triangle([bottomPoint,rightPoint,leftPoint])];
		let triangles = getDelaunayDiagram(trianglePoints,circumscribedTriangles);

		clear(width,height);

		triangles.forEach((target,i) => {

			const centerPoint = target.getCenterPoint();
			const color       = _processingImage.getColor(centerPoint.x,centerPoint.y);
			// FILLL_COLORS[Math.ceil(i % FILLL_COLORS.length)]
			target.draw(_context,color);

		});

		window.requestAnimationFrame(render);

	}

	function getDelaunayDiagram(points,baseTriangle) {

		let triangles = baseTriangle;

		points.forEach(function(point) {

			//ポイントを外接円に含む三角形を抽出、辺に分解
			let edges = [];
			triangles.forEach(function(target,i) {

				if (target.getCircumscribedCircle().isInclude(point)) {
					edges = edges.concat(target.getEdges());
					delete triangles[i];
				}

			});

			//分解した辺リストから重複する辺を削除
			for (let i = 0; i < edges.length; i++) {

				const edgeA  = edges[i];
				let isUnique = true;

				for (let l = 0; l < edges.length; l++) {

					const edgeB = edges[l];
					if (i != l && edgeA.isEqual(edgeB)) {
						isUnique = false;
						break;
					}

				}
				if (isUnique) {

					//重複しない辺リストから三角形を生成
					triangles.push(new Triangle([edgeA.start, edgeA.end, point]));

				}

			}

		});

		return triangles;

	}

	function clear(width,height) {

		_context.clearRect(0,0,width,height);

	}

	function getRangeNumber(min,max) {

		return Math.random() * (max - min) + min;

	}


})(window);
