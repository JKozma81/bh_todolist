const url = 'http://localhost:3000';
const todoForm = document.querySelector('.todo-form');
const todoList = document.querySelector('.todo-list');

// MODEL

function getTodos(url) {
	return fetch(`${url}/todos`).then((response) => response.json());
}

function addTodo(todo, url) {
	fetch(`${url}/todo`, {
		method: 'POST',
		headers: {
			'Content-Type': 'Application/json'
		},
		body: JSON.stringify(todo)
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
	if (event.target.tagName == 'P') {
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
		}
	});
}

function handleDelete(event) {
	console.log(event.target);
	const id = event.target.dataset.id;
	fetch(`${url}/todo/del/${id}`).then((response) => {
		if (response.status === 200) {
			todoList.innerHTML = '';
			getTodos(url).then((data) => createList(data));
		}
	});
}

function handleEdit(event) {}

todoForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const textField = document.querySelector('#todo_text');
	const newTodo = {
		text: textField.value,
		id: Math.floor(Math.random() * 100 + 1),
		inProgress: true
	};
	addTodo(newTodo, url);
	textField.value = '';
	todoList.innerHTML = '';
	getTodos(url).then((data) => createList(data));
});
