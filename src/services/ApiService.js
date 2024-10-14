import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/todo'; // Base URL for the Todo API

// Fetch all todos
const fetchTodos = async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
};

// Create a new todo
const createTodo = async (todo) => {
    const response = await axios.post(API_BASE_URL, todo);
    return response.data;
};

// Update an existing todo
const updateTodo = async (id, todo) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, todo);
    return response.data;
};

// Delete a specific todo by ID
const deleteTodo = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
};

// Delete all todos
const deleteAllTodos = async () => {
    await axios.delete(API_BASE_URL);
};

export default {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    deleteAllTodos,
};

export default ApiService;