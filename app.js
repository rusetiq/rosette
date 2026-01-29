class CherryPlanner {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('cherry-tasks')) || [];
        this.events = JSON.parse(localStorage.getItem('cherry-events')) || [];
        this.notes = localStorage.getItem('cherry-notes') || '';
        this.quotes = [
            { text: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "Small steps every day lead to big results.", author: "Unknown" },
            { text: "Bloom where you are planted.", author: "Mary Engelbreit" },
            { text: "Progress, not perfection.", author: "Unknown" },
            { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
            { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
            { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
            { text: "You are capable of amazing things.", author: "Unknown" },
            { text: "Make each day your masterpiece.", author: "John Wooden" }
        ];

        this.initElements();
        this.initEventListeners();
        this.renderDate();
        this.renderTasks();
        this.renderEvents();
        this.loadNotes();
        this.updateProgress();
        this.initFloatingPetals();
        this.showRandomQuote();
    }

    initElements() {
        this.dayNameEl = document.getElementById('day-name');
        this.fullDateEl = document.getElementById('full-date');
        this.taskListEl = document.getElementById('task-list');
        this.taskFormEl = document.getElementById('task-form');
        this.taskInputEl = document.getElementById('task-input');
        this.taskPriorityEl = document.getElementById('task-priority');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.cancelTaskBtn = document.getElementById('cancel-task');
        this.emptyTasksEl = document.getElementById('empty-tasks');
        this.notesAreaEl = document.getElementById('notes-area');
        this.timelineEl = document.getElementById('timeline');
        this.eventFormEl = document.getElementById('event-form');
        this.eventInputEl = document.getElementById('event-input');
        this.eventTimeEl = document.getElementById('event-time');
        this.addEventBtn = document.getElementById('add-event-btn');
        this.cancelEventBtn = document.getElementById('cancel-event');
        this.emptyEventsEl = document.getElementById('empty-events');
        this.progressRingEl = document.getElementById('progress-ring');
        this.progressPercentEl = document.getElementById('progress-percent');
        this.completedCountEl = document.getElementById('completed-count');
        this.remainingCountEl = document.getElementById('remaining-count');
        this.petalsContainer = document.getElementById('petals-container');
        this.quoteTextEl = document.getElementById('quote-text');
        this.quoteAuthorEl = document.getElementById('quote-author');
        this.newQuoteBtn = document.getElementById('new-quote');
    }

    initEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.toggleTaskForm());
        this.cancelTaskBtn.addEventListener('click', () => this.toggleTaskForm(false));
        this.taskFormEl.addEventListener('submit', (e) => this.handleAddTask(e));

        this.addEventBtn.addEventListener('click', () => this.toggleEventForm());
        this.cancelEventBtn.addEventListener('click', () => this.toggleEventForm(false));
        this.eventFormEl.addEventListener('submit', (e) => this.handleAddEvent(e));

        this.notesAreaEl.addEventListener('input', () => this.saveNotes());
        this.newQuoteBtn.addEventListener('click', () => this.showRandomQuote());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleTaskForm(false);
                this.toggleEventForm(false);
            }
        });
    }

    renderDate() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        this.dayNameEl.textContent = days[now.getDay()];
        this.fullDateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }

    toggleTaskForm(show = true) {
        if (show) {
            this.taskFormEl.classList.remove('hidden');
            this.taskInputEl.focus();
        } else {
            this.taskFormEl.classList.add('hidden');
            this.taskInputEl.value = '';
            this.taskPriorityEl.value = 'medium';
        }
    }

    toggleEventForm(show = true) {
        if (show) {
            this.eventFormEl.classList.remove('hidden');
            this.eventInputEl.focus();
        } else {
            this.eventFormEl.classList.add('hidden');
            this.eventInputEl.value = '';
            this.eventTimeEl.value = '';
        }
    }

    handleAddTask(e) {
        e.preventDefault();
        const text = this.taskInputEl.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            priority: this.taskPriorityEl.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
        this.toggleTaskForm(false);
    }

    handleAddEvent(e) {
        e.preventDefault();
        const name = this.eventInputEl.value.trim();
        const time = this.eventTimeEl.value;
        if (!name || !time) return;

        const event = {
            id: Date.now(),
            name: name,
            time: time
        };

        this.events.push(event);
        this.events.sort((a, b) => a.time.localeCompare(b.time));
        this.saveEvents();
        this.renderEvents();
        this.toggleEventForm(false);
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();
    }

    deleteEvent(id) {
        this.events = this.events.filter(e => e.id !== id);
        this.saveEvents();
        this.renderEvents();
    }

    renderTasks() {
        this.taskListEl.innerHTML = '';

        if (this.tasks.length === 0) {
            this.emptyTasksEl.classList.remove('hidden');
            return;
        }

        this.emptyTasksEl.classList.add('hidden');

        this.tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
            li.style.animationDelay = `${index * 0.04}s`;
            li.innerHTML = `
                <label class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-delete" aria-label="Delete task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            `;

            const checkbox = li.querySelector('input');
            checkbox.addEventListener('change', () => this.toggleTaskComplete(task.id));

            const deleteBtn = li.querySelector('.task-delete');
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            this.taskListEl.appendChild(li);
        });
    }

    renderEvents() {
        this.timelineEl.innerHTML = '';

        if (this.events.length === 0) {
            this.emptyEventsEl.classList.remove('hidden');
            return;
        }

        this.emptyEventsEl.classList.add('hidden');

        this.events.forEach((event, index) => {
            const div = document.createElement('div');
            div.className = 'event-item';
            div.style.animationDelay = `${index * 0.04}s`;
            div.innerHTML = `
                <span class="event-time">${this.formatTime(event.time)}</span>
                <span class="event-name">${this.escapeHtml(event.name)}</span>
                <button class="event-delete" aria-label="Delete event">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            `;

            const deleteBtn = div.querySelector('.event-delete');
            deleteBtn.addEventListener('click', () => this.deleteEvent(event.id));

            this.timelineEl.appendChild(div);
        });
    }

    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    loadNotes() {
        this.notesAreaEl.value = this.notes;
    }

    saveNotes() {
        this.notes = this.notesAreaEl.value;
        localStorage.setItem('cherry-notes', this.notes);
    }

    saveTasks() {
        localStorage.setItem('cherry-tasks', JSON.stringify(this.tasks));
    }

    saveEvents() {
        localStorage.setItem('cherry-events', JSON.stringify(this.events));
    }

    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const remaining = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        const circumference = 2 * Math.PI * 42;
        const offset = circumference - (percentage / 100) * circumference;

        this.progressRingEl.style.strokeDashoffset = offset;
        this.progressPercentEl.textContent = `${percentage}%`;
        this.completedCountEl.textContent = completed;
        this.remainingCountEl.textContent = remaining;
    }

    showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = this.quotes[randomIndex];
        this.quoteTextEl.textContent = quote.text;
        this.quoteAuthorEl.textContent = `— ${quote.author}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initFloatingPetals() {
        const createPetal = () => {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.style.left = `${Math.random() * 100}%`;
            petal.style.animationDuration = `${10 + Math.random() * 8}s`;
            petal.style.animationDelay = `${Math.random() * 3}s`;

            const size = 8 + Math.random() * 10;
            petal.style.width = `${size}px`;
            petal.style.height = `${size * 1.4}px`;

            this.petalsContainer.appendChild(petal);

            petal.addEventListener('animationend', () => {
                petal.remove();
            });
        };

        for (let i = 0; i < 4; i++) {
            setTimeout(() => createPetal(), i * 800);
        }

        setInterval(createPetal, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CherryPlanner();
});
