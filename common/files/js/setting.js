export class Setting {

	constructor(property) {

		let html = '<ul>';
		for (var name in property) {

			property[name].name = name;
			html += this.getListHtml(property[name]);

		}
		html += '</ul>';
		html += '<p class="close"></p>';

		this.property = property;

		let parent = document.createElement('div');
		parent.id = 'setting-ui';
		document.body.appendChild(parent);

		this.parent = document.getElementById('setting-ui');
		this.parent.innerHTML = html;

		let inputs = this.parent.querySelectorAll('input');
		for (var i = 0; i < inputs.length; i++) {
			let parentClass = this;
			inputs[i].addEventListener('change',function() {

				let isReload = true;
				if (this.dataset.reload == 'false') isReload = false;
				parentClass.set(this.name,this.value,isReload);

			});
		}

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

	getListHtml(param) {

		let html  = '';
		let value = param.value;

		if (!param['type'] && typeof value == 'number') param.type = 'number';

		html += '<li>';
		html += '<label for="setting-' + param.name + '">' + param.name + '</label>';

		let attributes = [];
		for (var key in param) {
			attributes.push(key + '="' + param[key] + '"');
		}

		let elm = 'input';
		if (param['elm']) elm = param.elm;

		html += '<' + elm + ' id="setting-' + param.name + '" ' + attributes.join(' ') + '>';
		if (elm == 'button') html += value + '</button>';
		html += '</li>';
		return html;

	}

}
