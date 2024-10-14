import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../App.css';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const nodeRefs = useRef([]);  // Create a single ref array for all todos

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/todo/todos');
      setTodos(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos. Please try again.');
      console.error('Error fetching todos:', err);
    }
    setLoading(false);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/todo/todos', { title, description, completed: false });
      setTodos(prevTodos => [...prevTodos, response.data]);
      setTitle('');
      setDescription('');
      setError(null);
    } catch (err) {
      setError('Failed to add todo. Please try again.');
      console.error('Error adding todo:', err);
    }
    setLoading(false);
  };

  const updateTodo = async (id, updates) => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:8080/todo/todos/${id}`, updates);
      setTodos(prevTodos => prevTodos.map(todo => todo.id === id ? response.data : todo));
      setEditingTodo(null);
      setError(null);
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error('Error updating todo:', err);
    }
    setLoading(false);
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/todo/todos/${id}`);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error('Error deleting todo:', err);
    }
    setLoading(false);
  };

  const deleteAllTodos = async () => {
    setLoading(true);
    try {
      await axios.delete('http://localhost:8080/todo/todos');
      setTodos([]);
      setShowDeleteAllModal(false);
      setError(null);
    } catch (err) {
      setError('Failed to delete all todos. Please try again.');
      console.error('Error deleting all todos:', err);
    }
    setLoading(false);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="todo-app">
      <h1 className="app-title">Todo List</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details (optional)"
          className="todo-textarea"
        />
        <button type="submit" className="add-button" disabled={loading}>
          {loading ? <div className="spinner"></div> : <><FaPlus /> Add Todo</>}
        </button>
      </form>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>Active</button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
      </div>

      <TransitionGroup key={filter} className="todo-list">
        {filteredTodos.map((todo, index) => {
          nodeRefs.current[index] = React.createRef(); // Assign a unique ref for each todo
          return (
            <CSSTransition key={todo.id} nodeRef={nodeRefs.current[index]} timeout={300} classNames="todo">
              <div ref={nodeRefs.current[index]} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingTodo && editingTodo.id === todo.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateTodo(todo.id, editingTodo);
                  }} className="edit-form">
                    <input
                      type="text"
                      value={editingTodo.title}
                      onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                      className="edit-input"
                    />
                    <textarea
                      value={editingTodo.description}
                      onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                      className="edit-textarea"
                    />
                    <button type="submit" className="save-button"><FaCheck /></button>
                    <button onClick={() => setEditingTodo(null)} className="cancel-button"><FaTimes /></button>
                  </form>
                ) : (
                  <>
                    <div className="todo-content">
                      <h3 className="todo-title">{todo.title}</h3>
                      <p className="todo-description">{todo.description}</p>
                      <p className="todo-date">Created: {new Date(todo.createAt).toLocaleString()}</p>
                      <p className="todo-completed">Completed: {todo.completed ? 'true' : 'false'}</p> {/* Explicitly display true/false */}
                    </div>
                    <div className="todo-actions">
                      <button onClick={() => updateTodo(todo.id, { ...todo, completed: !todo.completed })} className="complete-button">
                        <FaCheck style={{ color: todo.completed ? 'var(--color-success)' : 'var(--color-text-light)' }} />
                      </button>
                      <button onClick={() => setEditingTodo(todo)} className="edit-button"><FaEdit /></button>
                      <button onClick={() => deleteTodo(todo.id)} className="delete-button"><FaTrash /></button>
                    </div>
                  </>
                )}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>

      {todos.length > 0 && (
        <button onClick={() => setShowDeleteAllModal(true)} className="delete-all-button">
          Delete All Todos
        </button>
      )}

      {showDeleteAllModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete All Todos</h2>
            <p>Are you sure you want to delete all todos? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={deleteAllTodos} className="confirm-delete-button" disabled={loading}>
                {loading ? <div className="spinner"></div> : 'Yes, delete all'}
              </button>
              <button onClick={() => setShowDeleteAllModal(false)} className="cancel-delete-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;
