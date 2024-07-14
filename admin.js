document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-article-form');
    form.addEventListener('submit', handleAddArticle);

    loadArticles();
});

function handleAddArticle(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const type = document.getElementById('type').value;
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            mammoth.convertToHtml({ arrayBuffer: e.target.result })
                .then(displayResult)
                .catch(handleError);

            function displayResult(result) {
                const content = result.value; // The generated HTML
                saveArticle(title, type, content);
            }

            function handleError(err) {
                console.error('Error reading Word file:', err);
                alert('无法读取Word文件');
            }
        };
        reader.readAsArrayBuffer(file);
    }
}


function saveArticle(title, type, content) {
    fetch(`posts/${type}.json`)
        .then(response => response.json())
        .then(data => {
            data.push({ title, content });
            return fetch(`posts/${type}.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(() => {
            alert('文章已添加');
            loadArticles();
        })
        .catch(error => console.error('Error saving article:', error));
}

function loadArticles() {
    const types = ['jerry', 'nju', 'recipes'];
    types.forEach(type => {
        fetch(`posts/${type}.json`)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById(`${type}-articles`);
                container.innerHTML = '';
                data.forEach((article, index) => {
                    const articleDiv = document.createElement('div');
                    articleDiv.className = 'article';
                    articleDiv.innerHTML = `
                        <h3>${article.title}</h3>
                        <button onclick="editArticle('${type}', ${index})">编辑</button>
                        <button onclick="deleteArticle('${type}', ${index})">删除</button>
                    `;
                    container.appendChild(articleDiv);
                });
            })
            .catch(error => console.error('Error loading articles:', error));
    });
}

function editArticle(type, index) {
    const newTitle = prompt('请输入新的标题');
    const newContent = prompt('请输入新的内容');

    fetch(`posts/${type}.json`)
        .then(response => response.json())
        .then(data => {
            data[index].title = newTitle;
            data[index].content = newContent;
            return fetch(`posts/${type}.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(() => {
            alert('文章已更新');
            loadArticles();
        })
        .catch(error => console.error('Error updating article:', error));
}

function deleteArticle(type, index) {
    fetch(`posts/${type}.json`)
        .then(response => response.json())
        .then(data => {
            data.splice(index, 1);
            return fetch(`posts/${type}.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        })
        .then(() => {
            alert('文章已删除');
            loadArticles();
        })
        .catch(error => console.error('Error deleting article:', error));
}

