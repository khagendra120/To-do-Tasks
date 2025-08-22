
        class TodoApp {
            constructor() {
                this.todos = this.loadTodos();
                this.currentFilter = 'all';
                this.editingId = null;
                
                this.initializeElements();
                this.bindEvents();
                this.render();
            }

            initializeElements() {
                this.todoInput = document.getElementById('todoInput');
                this.addBtn = document.getElementById('addBtn');
                this.todoList = document.getElementById('todoList');
                this.todoStats = document.getElementById('todoStats');
                this.clearCompleted = document.getElementById('clearCompleted');
                this.filterBtns = document.querySelectorAll('.filter-btn');
            }

            bindEvents() {
                this.addBtn.addEventListener('click', () => this.addTodo());
                this.todoInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTodo();
                });
                
                this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
                
                this.filterBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
                });
            }

            generateId() {
                return Date.now() + Math.random().toString(36).substr(2, 9);
            }

            addTodo() {
                const text = this.todoInput.value.trim();
                if (text === '') return;

                const todo = {
                    id: this.generateId(),
                    text: text,
                    status: 'todo', // 'todo', 'pending', 'completed'
                    createdAt: new Date().toISOString()
                };

                this.todos.unshift(todo);
                this.todoInput.value = '';
                this.saveTodos();
                this.render();
                
                // Add success animation
                this.todoInput.style.transform = 'scale(0.95)';
                setTimeout(() => this.todoInput.style.transform = 'scale(1)', 100);
            }

            setTaskStatus(id, status) {
                this.todos = this.todos.map(todo =>
                    todo.id === id ? { ...todo, status: status } : todo
                );
                this.saveTodos();
                this.render();
            }

            toggleTodo(id) {
                const todo = this.todos.find(t => t.id === id);
                if (todo) {
                    const newStatus = todo.status === 'completed' ? 'todo' : 'completed';
                    this.setTaskStatus(id, newStatus);
                }
            }

            deleteTodo(id) {
                this.todos = this.todos.filter(todo => todo.id !== id);
                this.saveTodos();
                this.render();
            }

            startEdit(id) {
                this.editingId = id;
                this.render();
            }

            saveEdit(id, newText) {
                const text = newText.trim();
                if (text === '') {
                    this.deleteTodo(id);
                    return;
                }

                this.todos = this.todos.map(todo =>
                    todo.id === id ? { ...todo, text: text } : todo
                );
                this.editingId = null;
                this.saveTodos();
                this.render();
            }

            cancelEdit() {
                this.editingId = null;
                this.render();
            }

            setFilter(filter) {
                this.currentFilter = filter;
                this.filterBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === filter);
                });
                this.render();
            }

            getFilteredTodos() {
                switch (this.currentFilter) {
                    case 'todo':
                        return this.todos.filter(todo => todo.status === 'todo');
                    case 'pending':
                        return this.todos.filter(todo => todo.status === 'pending');
                    case 'completed':
                        return this.todos.filter(todo => todo.status === 'completed');
                    default:
                        return this.todos;
                }
            }

            clearCompletedTodos() {
                this.todos = this.todos.filter(todo => todo.status !== 'completed');
                this.saveTodos();
                this.render();
            }

            createTodoElement(todo) {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.status}`;
                
                if (this.editingId === todo.id) {
                    li.innerHTML = `
                        <input type="text" class="edit-input" value="${todo.text}" id="editInput-${todo.id}">
                        <div class="todo-actions">
                            <button class="save-btn" onclick="app.saveEdit('${todo.id}', document.getElementById('editInput-${todo.id}').value)">Save</button>
                            <button class="cancel-btn" onclick="app.cancelEdit()">Cancel</button>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        const input = li.querySelector('.edit-input');
                        input.focus();
                        input.select();
                        input.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') {
                                this.saveEdit(todo.id, input.value);
                            } else if (e.key === 'Escape') {
                                this.cancelEdit();
                            }
                        });
                    }, 0);
                } else {
                    const statusIcon = todo.status === 'completed' ? '✓' : (todo.status === 'pending' ? '⏳' : '○');
                    li.innerHTML = `
                        <div class="todo-checkbox ${todo.status === 'completed' ? 'checked' : ''}" onclick="app.toggleTodo('${todo.id}')">${statusIcon}</div>
                        <span class="todo-text">${todo.text}</span>
                        <div class="todo-actions">
                            <button class="edit-btn" onclick="app.startEdit('${todo.id}')">Edit</button>
                            <button class="pending-btn" onclick="app.setTaskStatus('${todo.id}', 'pending')">Pending</button>
                            <button class="complete-btn" onclick="app.setTaskStatus('${todo.id}', 'completed')">Complete</button>
                            <button class="delete-btn" onclick="app.deleteTodo('${todo.id}')">Delete</button>
                        </div>
                    `;
                }
                
                return li;
            }

            updateStats() {
                const total = this.todos.length;
                const todoCount = this.todos.filter(todo => todo.status === 'todo').length;
                const pending = this.todos.filter(todo => todo.status === 'pending').length;
                const completed = this.todos.filter(todo => todo.status === 'completed').length;
                
                this.todoStats.textContent = `${total} task${total !== 1 ? 's' : ''} total • ${todoCount} to-do • ${pending} pending • ${completed} completed`;
                
                this.clearCompleted.style.display = completed > 0 ? 'block' : 'none';
            }

            render() {
                const filteredTodos = this.getFilteredTodos();
                
                this.todoList.innerHTML = '';
                
                if (filteredTodos.length === 0) {
                    const emptyState = document.createElement('div');
                    emptyState.className = 'empty-state';
                    
                    let message = '';
                    switch (this.currentFilter) {
                        case 'todo':
                            message = this.todos.length === 0 ? '🎉 No tasks yet! Add one above.' : '✅ No to-do tasks! Great job!';
                            break;
                        case 'pending':
                            message = '⏳ No pending tasks.';
                            break;
                        case 'completed':
                            message = '📝 No completed tasks yet.';
                            break;
                        default:
                            message = '🎯 Ready to be productive? Add your first task!';
                    }
                    
                    emptyState.textContent = message;
                    this.todoList.appendChild(emptyState);
                } else {
                    filteredTodos.forEach(todo => {
                        this.todoList.appendChild(this.createTodoElement(todo));
                    });
                }
                
                this.updateStats();
            }

            saveTodos() {
                // In a real app, this would save to localStorage
                // For this demo, we'll use a simple variable to persist during the session
                window.todoData = this.todos;
            }

            loadTodos() {
                // In a real app, this would load from localStorage
                // For this demo, we'll return saved data or empty array
                return window.todoData || [];
            }
        }

        // Initialize the app
        const app = new TodoApp();

        // Add some sample data if no todos exist
        if (app.todos.length === 0) {
            const sampleTodos = [
                { id: 'sample1', text: '👋 Welcome to your Todo List!', status: 'todo', createdAt: new Date().toISOString() },
                { id: 'sample2', text: '📝 Click the status icon to toggle between states', status: 'todo', createdAt: new Date().toISOString() },
                { id: 'sample3', text: '⏳ This task is in pending status', status: 'pending', createdAt: new Date().toISOString() },
                { id: 'sample4', text: '✅ This task has been completed', status: 'completed', createdAt: new Date().toISOString() }
            ];
            app.todos = sampleTodos;
            app.saveTodos();
            app.render();
        }
   