const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

let todos = [
	{ text: 'sört venni', id: 1, inProgress: true },
	{ text: 'megetetni a kutyát', id: 2, inProgress: true },
	{ text: 'házit befejezni', id: 3, inProgress: true }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/todos', (req, res) => {
	res.json(todos);
});

app.post('/todo', (req, res) => {
	const newTodo = {
		id: Math.floor(Math.random() * 100 + 1),
		inProgress: true,
		text: req.body.text
	};
	todos.push(newTodo);
	res.status(200).json(newTodo);
});

app.get('/todo/:id', (req, res) => {
	const doneTodo = todos.find((todo) => todo.id === +req.params.id);
	doneTodo.inProgress = false;
	res.sendStatus(200);
});

app.post('/todo/mod/:id', (req, res) => {
	const todoToModify = todos.find((todo) => todo.id === +req.params.id);
	todoToModify.text = req.body.text;
	res.status(200).json(todoToModify);
});

app.get('/todo/del/:id', (req, res) => {
	const id = req.params.id;
	todos = todos.filter((todo) => todo.id !== +id);
	res.sendStatus(200);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
