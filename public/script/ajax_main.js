const url = 'http://localhost:3000';
const todoForm = document.querySelector('.todo-form');
const todoList = document.querySelector('.todo-list');

// MODEL

function getTodos(url) {
	return fetch(`${url}/todos`).then((response) => response.json());
}

function addTodo(todo, url) {
	return fetch(`${url}/todo`, {
		method: 'POST',
		headers: {
			'Content-Type': 'Application/json'
		},
		body: JSON.stringify(todo)
	}).then((response) => {
		if (response.status === 200) return response.json();
	});
}

function modifyTodo(todoId, todoText, url) {
	return fetch(`${url}/todo/mod/${todoId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'Application/json'
		},
		body: JSON.stringify({ text: todoText })
	}).then((response) => {
		if (response.status === 200) return response.json();
	});
}

// VIEW
document.addEventListener('DOMContentLoaded', () => {
	getTodos(url).then((data) => createList(data));
});

function createTodoElement(element, parent, properties) {
	const domElement = document.createElement(element);

	for (const property in properties) {
		if (property === 'attribute') {
			for (attr in properties[property]) {
				domElement.setAttribute(attr, properties[property][attr]);
			}
		}
		if (property === 'class') {
			properties[property].forEach((prop) => domElement.classList.add(prop));
		}
		if (property === 'text') domElement.textContent = properties[property];
	}

	document.querySelector(parent).appendChild(domElement);
}

function attachEventHandler(element, event, handlerFunc) {
	document.querySelector(element).addEventListener(event, handlerFunc);
}

function checkForDone(todo) {
	if (!todo.inProgress) {
		document.querySelector(`li[data-id="${todo.id}"] .done`).setAttribute('disabled', true);
		document.querySelector(`li[data-id="${todo.id}"] .done`).previousElementSibling.style.color = 'red';
		document.querySelector(`li[data-id="${todo.id}"] .done`).previousElementSibling.style.textDecoration =
			'line-through';
	}
}

function createList(data) {
	data.forEach((todo) => {
		createTodoElement('LI', '.todo-list', { attribute: { 'data-id': todo.id } });
		createTodoElement('P', `li[data-id="${todo.id}"]`, { text: `${todo.text}` });

		createTodoElement('button', `li[data-id="${todo.id}"]`, {
			attribute: { 'data-id': todo.id },
			text: 'Done',
			class: [ 'done' ]
		});
		createTodoElement('button', `li[data-id="${todo.id}"]`, {
			attribute: { 'data-id': todo.id },
			text: 'Delete',
			class: [ 'del' ]
		});

		attachEventHandler(`li[data-id="${todo.id}"]`, 'dblclick', handledblclick);
		attachEventHandler(`li[data-id="${todo.id}"] .done`, 'click', handleDone);
		attachEventHandler(`li[data-id="${todo.id}"] .del`, 'click', handleDelete);

		checkForDone(todo);
	});
}

function handledblclick(event) {
	if (event.target.tagName === 'P' && event.target.style.textDecoration !== 'line-through') {
		const li = event.target.parentElement;
		const text = li.firstElementChild.textContent;

		Array.from(li.children).forEach((child) => li.removeChild(child));

		createTodoElement('input', `li[data-id="${li.dataset.id}"]`, { attribute: { value: text } });
		createTodoElement('button', `li[data-id="${li.dataset.id}"]`, {
			attribute: { 'data-id': li.dataset.id },
			text: 'Edit'
		});

		attachEventHandler(`button[data-id="${li.dataset.id}"]`, 'click', handleEdit);
	}
}

// CONTROLLERS

function handleDone(event) {
	const id = event.target.dataset.id;
	event.target.setAttribute('disabled', true);
	fetch(`${url}/todo/${id}`).then((response) => {
		if (response.status === 200) {
			event.target.previousElementSibling.style.textDecoration = 'line-through';
			event.target.previousElementSibling.style.color = 'red';
		}
	});
}

function handleDelete(event) {
	const id = event.target.dataset.id;
	fetch(`${url}/todo/del/${id}`).then((response) => {
		if (response.status === 200) {
			todoList.removeChild(document.querySelector(`li[data-id="${id}"]`));
		}
	});
}

function handleEdit(event) {
	const parent = document.querySelector(`li[data-id="${event.target.dataset.id}"]`);
	const text = parent.firstElementChild.value;
	modifyTodo(event.target.dataset.id, text, url).then((todo) => {
		Array.from(parent.children).forEach((child) => parent.removeChild(child));

		createTodoElement('P', `li[data-id="${parent.dataset.id}"]`, { text: `${text}` });

		createTodoElement('button', `li[data-id="${parent.dataset.id}"]`, {
			attribute: { 'data-id': parent.dataset.id },
			text: 'Done',
			class: [ 'done' ]
		});
		createTodoElement('button', `li[data-id="${parent.dataset.id}"]`, {
			attribute: { 'data-id': parent.dataset.id },
			text: 'Delete',
			class: [ 'del' ]
		});

		attachEventHandler(`li[data-id="${parent.dataset.id}"] .done`, 'click', handleDone);
		attachEventHandler(`li[data-id="${parent.dataset.id}"] .del`, 'click', handleDelete);
		checkForDone(todo);
	});
}

todoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const textField = document.querySelector('#todo_text');
	const newTodo = {
		text: textField.value
	};

	addTodo(newTodo, url).then((todoData) => {
		textField.value = '';
		createList([ todoData ]);
	});
});
