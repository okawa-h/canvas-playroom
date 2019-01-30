export class Setting {

	constructor(property) {

		this.property = property;

		let html = '<ul>';
		for (let name in this.property) {

			html += this.getListHtml(name);

		}
		html += '</ul>';
		html += '<p class="close"></p>';

		let parent = document.createElement('div');
		parent.id = 'setting-ui';
		document.body.appendChild(parent);

		this.parent = document.getElementById('setting-ui');
		this.parent.innerHTML = html;

		this.setEvent();

		this.parent.querySelector('.close').addEventListener('click',function() {

			parent.classList.toggle('open');

		});

	}

	get(name) {

		let object = this.property[name];
		let value  = object.value;
		if (object.type == 'number') value = parseFloat(value);
		return value;

	}

	set(name,value,isReload) {

		this.property[name].value = value;
		if (isReload && this.callback) this.callback();

	}

	setCallback(callback) {

		this.callback = callback;

	}

	setEvent() {

		let parentClass = this;

		for (let name in this.property) {

			let param  = this.property[name];
			let target = document.getElementById(`setting-${name}`);

			if (param.elm == 'input') {
				target.addEventListener('change',function() {

					let isReload = this.dataset.reload != 'false';
					parentClass.set(name,this.value,isReload);

				});
			}

			if (param.elm == 'button') {

				target.addEventListener('click',param['onclick']);

			}

		}

	}

	getListHtml(name) {

		let html  = '';
		let param = this.property[name];
		let value = param.value;
		let attributes = [];

		html += '<li>';
		html += `<label for="setting-${name}">${name}</label>`;

		if (!param['elm']) param.elm = 'input';
		if (!param['type'] && typeof value == 'number') param.type = 'number';

		for (let key in param) {
			if (key == 'onclick' || key == 'elm') continue;
			attributes.push(`${key}="${param[key]}"`);
		}

		html += `<${param.elm} id="setting-${name}" ${attributes.join(' ')}>`;
		if (param.elm == 'button') html += value + '</button>';
		html += '</li>';
		return html;

	}

}
