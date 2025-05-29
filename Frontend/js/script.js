document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.querySelector('.auth-links');

    // Function to update auth links based on login status
    function updateAuthLinks() {
        const token = localStorage.getItem('token');
        if (token) {
            // User is logged in, show Logout button
            authLinks.innerHTML = `
                <a href="#" class="auth-btn auth-btn-outline logout-btn">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </a>
            `;
        } else {
            // User is not logged in, show Login and Sign Up buttons
            authLinks.innerHTML = `
                <a href="loginform.html" class="auth-btn auth-btn-outline">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                </a>
                <a href="signupform.html" class="auth-btn auth-btn-primary">
                    <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Sign Up
                </a>
            `;
        }
    }

    // Function to handle logout
    function handleLogout() {
        localStorage.removeItem('token');
        updateAuthLinks();
        window.location.href = 'index.html'; // Redirect to homepage
    }

    // Initial update of auth links
    updateAuthLinks();

    // Add event listener for logout button (using event delegation)
    authLinks.addEventListener('click', (e) => {
        if (e.target.closest('.logout-btn')) {
            e.preventDefault();
            handleLogout();
        }
    });

    // Existing code for browseBtn, uploadBtn, themeToggle, form, etc.
    const browseBtn = document.querySelector('.btn-primary');
    const uploadBtn = document.querySelector('.btn-secondary');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');

    if (themeToggle && themeIcon) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fas fa-moon';
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', newTheme);
        });
    }

    if (browseBtn) {
        browseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Browse Notes clicked');
        });
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Upload Your Notes clicked');
        });
    }

    const form = document.getElementById('note-upload-form');
    const toast = document.getElementById('toast');

    if (form && toast) {
        function validateForm(data) {
            const errors = {};

            if (!data.title || data.title.length < 3) {
                errors.title = 'Title must be at least 3 characters.';
            } else if (data.title.length > 100) {
                errors.title = 'Title must be at most 100 characters.';
            }

            if (!data.subject) {
                errors.subject = 'Please select a subject.';
            }

            if (!data.content || data.content.length < 20) {
                errors.content = 'Note content must be at least 20 characters.';
            }

            return errors;
        }

        function showToast() {
            toast.className = 'toast show';
            setTimeout(() => {
                toast.className = 'toast';
            }, 3000);
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

            const formData = {
                title: form.querySelector('#title').value.trim(),
                subject: form.querySelector('#subject').value,
                content: form.querySelector('#content').value.trim(),
                tags: form.querySelector('#tags').value.trim(),
                file: form.querySelector('#file').files[0] || null,
            };

            const errors = validateForm(formData);

            if (Object.keys(errors).length > 0) {
                Object.keys(errors).forEach(key => {
                    document.getElementById(`${key}-error`).textContent = errors[key];
                });
                return;
            }

            console.log('Form data:', formData);
            showToast();
            form.reset();
            form.querySelector('#subject').value = '';
        });
    }

    // Existing code for fetching and rendering notes
    async function fetchNotesFromGoogleSheet() {
        const spreadsheetId = '1ZkqlgQFpUB4r1Mt5tPeqc3BM7EZgZhDt6ckIsuFHKhE';
        const apiKey = 'AIzaSyAR63kp7iOovTEguO4D3763_tQY-wbdIiw';
        const range = 'notes!A1:H';

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error('Failed to fetch data from Google Sheets');
            }
            const data = await response.json();
            
            if (!data.values || !Array.isArray(data.values)) {
                console.error('No data or invalid data format returned from API');
                return [];
            }

            const rows = data.values.slice(1);
            const notes = rows.map((row, index) => ({
                id: parseInt(row[0]) || index + 1,
                subject: row[1] || '',
                title: row[2] || '',
                description: row[3] || '',
                author: row[4] || '',
                uploadDate: row[5] || '',
                image: row[6] || 'https://via.placeholder.com/400x200',
                pdfLink: row[7] || '#'
            }));

            return notes;
        } catch (error) {
            console.error('Error fetching notes:', error);
            return [];
        }
    }

    function createNoteCard(note) {
        return `
            <div class="note-card">
                <div class="note-card-image">
                    <img src="${note.image}" alt="${note.title}" class="card-image" />
                </div>
                <div class="note-card-content">
                    <span class="note-badge">${note.subject}</span>
                    <h3 class="note-card-title">
                        <a href="${note.pdfLink}" target="_blank">${note.title}</a>
                    </h3>
                    <p class="note-card-description">
                        ${note.description}
                    </p>
                </div>
                <div class="note-card-footer">
                    <div class="note-card-meta">
                        <div class="meta-item">
                            <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>${note.author}</span>
                        </div>
                        <div class="meta-item">
                            <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Uploaded: ${note.uploadDate}</span>
                        </div>
                    </div>
                    <a href="${note.pdfLink}" class="view-button" target="_blank">
                        View Note
                        <svg class="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        `;
    }

    function renderNoteCards(filteredNotes) {
        const noteCardsGrid = document.getElementById('noteCardsGrid');
        if (noteCardsGrid) {
            noteCardsGrid.innerHTML = '';
            if (filteredNotes.length === 0) {
                noteCardsGrid.innerHTML = '<p class="empty-message">No notes found matching your criteria.</p>';
            } else {
                filteredNotes.forEach(note => {
                    noteCardsGrid.innerHTML += createNoteCard(note);
                });
            }
        }
    }

    async function initNotes() {
        const searchForm = document.querySelector('.search-filter-form');
        const searchInput = document.querySelector('#search');
        const subjectFilter = document.querySelector('#subject');
        const noteCardsGrid = document.getElementById('noteCardsGrid');

        if (noteCardsGrid) {
            noteCardsGrid.innerHTML = '<p>Loading notes...</p>';
        }

        const notes = await fetchNotesFromGoogleSheet();

        const validSubjects = [...new Set(notes.map(note => note.subject))].sort();

        if (subjectFilter) {
            subjectFilter.innerHTML = '<option value="All">All</option>';
            validSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectFilter.appendChild(option);
            });
        }

        function filterNotes(searchQuery, selectedSubject) {
            return notes.filter(note => {
                let searchMatch = true;

                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const isSubjectMatch = validSubjects.some(subject => subject.toLowerCase() === query);
                    if (isSubjectMatch) {
                        searchMatch = note.subject.toLowerCase() === query;
                    } else {
                        searchMatch = note.title.toLowerCase().includes(query) ||
                                      note.description.toLowerCase().includes(query);
                    }
                }

                const subjectMatch = selectedSubject === 'All' || note.subject === selectedSubject;
                return searchMatch && subjectMatch;
            });
        }

        if (searchForm && searchInput && subjectFilter && noteCardsGrid) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchQuery = searchInput.value.trim();
                const selectedSubject = subjectFilter.value;

                const filteredNotes = filterNotes(searchQuery, selectedSubject);
                renderNoteCards(filteredNotes);
            });

            const clearButton = document.querySelector('.clear-button');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    searchInput.value = '';
                    subjectFilter.value = 'All';
                    renderNoteCards(notes);
                });
            }
        }

        renderNoteCards(notes);
    }

    initNotes();
});