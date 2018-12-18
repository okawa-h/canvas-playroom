export class Setting {

	constructor(property) {

		let html = '<ul>';
		for (var name in property) {

			let value = property[name].value;
			let type  = 'string';
			if (typeof value == 'number') type = 'number';

			property[name].name = name;
			property[name].type = type;

			html += '<li>';
			html += '<label for="setting-' + name + '">' + name + '</label>';

			let attributes = [];
			for (var key in property[name]) {
				attributes.push(key + '="' + property[name][key] + '"');
			}

			html += '<input id="setting-' + name + '" ' + attributes.join(' ') + '>';
			html += '</li>';

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

}
