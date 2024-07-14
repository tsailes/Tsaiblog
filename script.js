document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');

    if (!username && !window.location.pathname.endsWith('login.html')) {
        alert('请登录');
        document.body.innerHTML = '<p>请登录</p>';
        document.body.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
        return;
    }

    const isAdmin = username === 'jerry';
    const sections = ['jerry', 'nju', 'recipes', 'about'];
    
    // 控制管理页面链接的显示
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.style.display = isAdmin ? 'block' : 'none';
    }


    if (window.location.pathname.endsWith('login.html')) {
        handleLogin();
    } else {
        sections.forEach(section => {
            const previewDiv = document.getElementById(`${section}-preview`);
            if (previewDiv) {
                loadPreview(section);
            }

            const contentDiv = document.getElementById(`${section}-content`);
            if (contentDiv) {
                loadContent(section, isAdmin);
            }
        });
    }

    function loadPreview(section) {
        fetch(`posts/${section}.json`)
            .then(response => response.json())
            .then(data => {
                const previewDiv = document.getElementById(`${section}-preview`);
                previewDiv.innerHTML = ''; // Clear previous content
                data.slice(0, 5).forEach(post => {
                    const postDiv = document.createElement('div');
                    postDiv.className = 'preview-post';
                    postDiv.innerHTML = `<h3>${post.title}</h3>`;
                    previewDiv.appendChild(postDiv);
                });
            })
            .catch(error => console.error('Error loading preview:', error));
    }
});

function handleLogin() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        localStorage.setItem('username', username);
        window.location.href = 'index.html';
    });
}

function loadContent(section, isAdmin) {
    fetch(`posts/${section}.json`)
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById(`${section}-content`);
            const postsPerPage = 15;
            let currentPage = 1;

            function renderPage(page) {
                contentDiv.innerHTML = '';
                const start = (page - 1) * postsPerPage;
                const end = start + postsPerPage;
                const pagePosts = data.slice(start, end);

                pagePosts.forEach((post, index) => {
                    const postDiv = document.createElement('div');
                    postDiv.className = 'post';
                    postDiv.innerHTML = `
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                        ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
                        ${isAdmin ? `<button class="delete-btn" data-index="${start + index}">删除内容</button>` : ''}
                    `;
                    contentDiv.appendChild(postDiv);

                    if (isAdmin) {
                        const deleteButton = postDiv.querySelector('.delete-btn');
                        deleteButton.addEventListener('click', () => deleteContent(section, start + index));
                    }
                });

                renderPagination(page);
            }

            function renderPagination(currentPage) {
                const totalPages = Math.ceil(data.length / postsPerPage);
                const paginationDiv = document.createElement('div');
                paginationDiv.className = 'pagination';

                for (let i = 1; i <= totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = i;
                    if (i === currentPage) {
                        pageButton.disabled = true;
                        pageButton.classList.add('disabled');
                    }
                    pageButton.addEventListener('click', () => renderPage(i));
                    paginationDiv.appendChild(pageButton);
                }

                contentDiv.appendChild(paginationDiv);
            }

            renderPage(currentPage);
        })
        .catch(error => console.error('Error loading content:', error));
}

function saveContent(section, title, content, image) {
    fetch(`posts/${section}.json`)
        .then(response => response.json())
        .then(data => {
            data.push({ title, content, image });
            return fetch(`posts/${section}.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(() => window.location.reload())
        .catch(error => console.error('Error saving content:', error));
}

function deleteContent(section, index) {
    fetch(`posts/${section}.json`)
        .then(response => response.json())
        .then(data => {
            data.splice(index, 1);
            return fetch(`posts/${section}.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(() => window.location.reload())
        .catch(error => console.error('Error deleting content:', error));
}
