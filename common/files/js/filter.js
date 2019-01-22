export class Filter {

	constructor() {

	}

	grayScale(context,width,height) {

		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;

		for (let i = 0; i < data.length; i += 4) {

			const color = (data[i] + data[i + 1] + data[i + 2]) / 3;
			data[i] = data[i + 1] = data[i + 2] = color;

		}

		context.putImageData(imageData,0,0);

	}

	sepia(context,width,height) {

		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;

		for (let i = 0; i < data.length; i += 4) {

			data[i]     = data[i]     * 1.07;
			data[i + 1] = data[i + 1] * .74;
			data[i + 2] = data[i + 2] * .43;

		}

		context.putImageData(imageData,0,0);

	}

	inversion(context,width,height) {

		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;

		for (let i = 0; i < data.length; i += 4) {

			data[i]     = 255 - data[i];
			data[i + 1] = 255 - data[i + 1];
			data[i + 2] = 255 - data[i + 2];

		}

		context.putImageData(imageData,0,0);

	}

	threshold(context,width,height) {

		const threshold = 255 * .5;
		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;

		for (let i = 0; i < data.length; i += 4) {

			const color = threshold < (data[i] + data[i+1] + data[i+2]) / 3 ? 255 : 0;
			data[i] = data[i + 1] = data[i + 2] = color;

		}

		context.putImageData(imageData,0,0);

	}

	gammaCorrection(context,width,height) {

		const gamma = 2;
		const correctify = val => 255 * Math.pow(val / 255, 1 / gamma);
		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;

		for (let i = 0; i < data.length; i += 4) {

			data[i]     = correctify(data[i]);
			data[i + 1] = correctify(data[i + 1]);
			data[i + 2] = correctify(data[i + 2]);

		}

		context.putImageData(imageData,0,0);

	}

	blur(context,width,height) {

		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;
		let cloneData = data.slice();

		const avgColor = (color, i) => {

			const prevLine = i - (width * 4);
			const nextLine = i + (width * 4);
			const sumPrevLineColor = cloneData[prevLine-4+color] + cloneData[prevLine+color] + cloneData[prevLine+4+color];
			const sumCurrLineColor = cloneData[i       -4+color] + cloneData[i       +color] + cloneData[i       +4+color];
			const sumNextLineColor = cloneData[nextLine-4+color] + cloneData[nextLine+color] + cloneData[nextLine+4+color];
			return (sumPrevLineColor + sumCurrLineColor + sumNextLineColor) / 9;

		};


		for (let i = width * 4; i < data.length - (width * 4); i += 4) {

			if (i % (width * 4) === 0 || i % ((width * 4) + 300) === 0) {

			} else {
				data[i]     = avgColor(0, i);
				data[i + 1] = avgColor(1, i);
				data[i + 2] = avgColor(2, i);
			}
		}

		context.putImageData(imageData,0,0);

	}

	sharpen(context,width,height) {

		let imageData   = context.getImageData(0,0,width,height);
		let data        = imageData.data;
		const cloneData = data.slice();

		const sharpedColor = (color, i) => {
			const sub = -1;
			const main = 10;

			const prevLine = i - (width * 4);
			const nextLine = i + (width * 4);

			const sumPrevLineColor = (cloneData[prevLine-4+color] * sub)  +  (cloneData[prevLine+color] * sub )  +  (cloneData[prevLine+4+color] * sub);
			const sumCurrLineColor = (cloneData[i       -4+color] * sub)  +  (cloneData[i       +color] * main)  +  (cloneData[i       +4+color] * sub);
			const sumNextLineColor = (cloneData[nextLine-4+color] * sub)  +  (cloneData[nextLine+color] * sub )  +  (cloneData[nextLine+4+color] * sub);

			return (sumPrevLineColor + sumCurrLineColor + sumNextLineColor) * .5;
		};


		for (let i = width * 4; i < data.length - (width * 4); i += 4) {

			if (i % (width * 4) === 0 || i % ((width * 4) + 300) === 0) {

			} else {
				data[i]     = sharpedColor(0, i);
				data[i + 1] = sharpedColor(1, i);
				data[i + 2] = sharpedColor(2, i);
			}
		}

		context.putImageData(imageData,0,0);

	}

	median(context,width,height) {

		let imageData   = context.getImageData(0,0,width,height);
		let data        = imageData.data;
		const cloneData = data.slice();

		const getMedian = (color, i) => {

			const prevLine = i - (width * 4);
			const nextLine = i + (width * 4);

			const colors = [
				cloneData[prevLine-4+color], cloneData[prevLine+color], cloneData[prevLine+4+color],
				cloneData[i       -4+color], cloneData[i       +color], cloneData[i       +4+color],
				cloneData[nextLine-4+color], cloneData[nextLine+color], cloneData[nextLine+4+color],
			];

			colors.sort((a, b) => a - b);
			return colors[Math.floor(colors.length * .5)];
		};


		for (let i = width * 4; i < data.length - (width * 4); i += 4) {

			if (i % (width * 4) === 0 || i % ((width * 4) + 300) === 0) {

			} else {
				data[i]     = getMedian(0, i);
				data[i + 1] = getMedian(1, i);
				data[i + 2] = getMedian(2, i);
			}
		}

		context.putImageData(imageData,0,0);

	}

	emboss(context,width,height) {

		let imageData   = context.getImageData(0,0,width,height);
		let data        = imageData.data;
		const cloneData = data.slice();

		const getColor = (color, i) => {
			const prevLine = i - (width * 4);
			return ((cloneData[prevLine-4+color] * -1) + cloneData[i+color]) + (255 * .5);
		};

		for (let i = width * 4; i < data.length - (width * 4); i += 4) {

			if (i % (width * 4) === 0 || i % ((width * 4) + 300) === 0) {

			} else {
				data[i]   = getColor(0, i);
				data[i+1] = getColor(1, i);
				data[i+2] = getColor(2, i);
			}
		}

		context.putImageData(imageData,0,0);

	}

	mosic(context,width,height) {

		let imageData   = context.getImageData(0,0,width,height);
		let data        = imageData.data;
		const cloneData = data.slice();

		const avgColor = (i, j, color) => {
			const prev = (((i - 1) * width) + j) * 4;
			const curr = (( i      * width) + j) * 4;
			const next = (((i + 1) * width) + j) * 4;

			const sumPrevLineColor = cloneData[prev-4+color] + cloneData[prev+color] + cloneData[prev+4+color];
			const sumCurrLineColor = cloneData[curr-4+color] + cloneData[curr+color] + cloneData[curr+4+color];
			const sumNextLineColor = cloneData[next-4+color] + cloneData[next+color] + cloneData[next+4+color];

			return (sumPrevLineColor + sumCurrLineColor + sumNextLineColor) / 9;
		};

		for (let i = 1; i < width; i += 3) {
			for (let j = 1; j < height; j += 3) {

				const prev = (((i - 1) * width) + j) * 4;
				const curr = (( i      * width) + j) * 4;
				const next = (((i + 1) * width) + j) * 4;

				// r,g,b length == 3
				for (let color = 0; color < 3; color++) {
					data[prev-4+color] = data[prev+color] = data[prev+4+color] = avgColor(i, j, color);
					data[curr-4+color] = data[curr+color] = data[curr+4+color] = avgColor(i, j, color);
					data[next-4+color] = data[next+color] = data[next+4+color] = avgColor(i, j, color);
				}

			}
		}

		context.putImageData(imageData,0,0);

	}

	extendColor(context,width,height) {

		const data       = context.getImageData(0,0,width,height).data;
		const extendLine = Math.round(Math.random() * height);
		const startIndex = 4 * width * extendLine;

		for (let i = 0; i < width; i++) {

			const index = startIndex + i * 4;

			let r = data[index];
			let g = data[index + 1];
			let b = data[index + 2];
			let a = data[index + 3];
			if (a == 0) r = g = b = 255;

			context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
			context.fillRect(i,0,1,height);

		}

	}

	glitch(context,width,height) {

		const imageData = context.getImageData(0,0,width,height);
		const data      = imageData.data;
		const length    = width * height;
		const factor    = Math.random() * 10;

		let randR = Math.floor(Math.random() * factor);
		let randG = Math.floor(Math.random() * factor) * 3;
		let randB = Math.floor(Math.random() * factor);

		for (let i = 0; i < length; i++) {

			let r = data[(i + randR) * 4];
			let g = data[(i + randG) * 4 + 1];
			let b = data[(i + randB) * 4 + 2];
			if (r + g + b == 0) r = g = b = 255;

			data[i * 4]     = r;
			data[i * 4 + 1] = g;
			data[i * 4 + 2] = b;
			data[i * 4 + 3] = 255;

		}

		context.putImageData(imageData,0,0);

	}

	glitchWave(context,width,height,renderLineHeight,cuttingHeight) {

		var imageData = context.getImageData(0,renderLineHeight,width,cuttingHeight);
		context.putImageData(imageData,0,renderLineHeight - 10);

	}

	glitchSlip(context,width,height,waveDistance) {

		const startHeight = height * Math.random();
		const endHeight   = startHeight + 30 + (Math.random() * 40);
		for (let h = startHeight; h < endHeight; h++) {

			if (Math.random() < .1) h++;
			let imageData = context.getImageData(0, h, width, 1);
			context.putImageData(imageData, Math.random() * waveDistance - (waveDistance*.5), h);

		}

	}

	glitchColor(context,width,height,waveDistance) {

		const startHeight = height * Math.random();
		const endHeight   = startHeight + 30 + (Math.random() * 40);
		let imageData     = context.getImageData(0, startHeight, width, endHeight);
		let data          = imageData.data;
		let length        = width * height;

		let r = 0;
		let g = 0;
		let b = 0;

		for (let i = 0; i < length; i++) {

			if (i % width === 0){
				r = i + Math.floor((Math.random() -.5) * waveDistance);
				g = i + Math.floor((Math.random() -.5) * waveDistance);
				b = i + Math.floor((Math.random() -.5) * waveDistance);
			}

			data[i *4]      = data[r * 4];
			data[i * 4 + 1] = data[g * 4 + 1];
			data[i * 4 + 2] = data[b * 4 + 2];

		}

		context.putImageData(imageData, 0, startHeight);

	}

	horizontalMirror(context,width,height) {

		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;

		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {

				const off    = (i * width + j) * 4;
				const dstOff = (i * width + (width - j - 1)) * 4;
				data[dstOff]     = data[off];
				data[dstOff + 1] = data[off + 1];
				data[dstOff + 2] = data[off + 2];
				data[dstOff + 3] = data[off + 3];

			}
		}

		context.putImageData(imageData,0,0);

	}

	rGBShift(context,width,height) {

		let imageData = context.getImageData(0,0,width,height);
		let data      = imageData.data;
		let plusData  = [];
		let minusData = [];
		let isHorizontal = true;
		let radius       = '1.25%';

		if (typeof radius == 'string') {
			let radius_chars = radius.split('');
			if (radius_chars[radius_chars.length - 1] == '%') {
				radius = radius.replace('%','') / 1;
				if (isHorizontal) radius = parseInt(width * radius * .01);
					else radius = parseInt(height * radius * .01);
			}
		}

		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {

				let index      = ((width * y) + x ) * 4;
				let plusIndex  = 0;
				let minusIndex = 0;

				if (isHorizontal) {
					plusIndex  = ((width * y) + (x + radius)) * 4;
					minusIndex = ((width * y) + (x + radius * -1)) * 4;
				} else {
					plusIndex  = ((width * (y + radius)) + x) * 4;
					minusIndex = ((width * (y + radius * -1)) + x) * 4;
				}

				for (let i = 0; i <= 3; i++) {

					plusData[plusIndex   + i] = data[index + i];
					minusData[minusIndex + i] = data[index + i];

				}

			}
		}

		for(let i = 0, length = data.length; i < length; i += 4) {

			if (typeof plusData[i] != 'undefined') {
				data[i] 	= plusData[i];
				data[i + 1] = plusData[i + 1] * .5 + data[i + 1] * .5;
				data[i + 2] = plusData[i + 2];
			}

			if (typeof minusData[i] != 'undefined') {
				data[i] 	= minusData[i] * .5 + data[i] * .5;
				data[i + 1] = data[i + 1];
				data[i + 2] = minusData[i + 2];
			}

			data[i + 3] = 255;
		}

		context.putImageData(imageData,0,0);

	}

}
