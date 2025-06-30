const form = document.getElementById('postForm');
const postsDiv = document.getElementById('posts');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  const post = { title, content, id: Date.now() };
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts.unshift(post);
  localStorage.setItem('posts', JSON.stringify(posts));
  renderPosts();
  form.reset();
});

function renderPosts() {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  postsDiv.innerHTML = posts.map(post => `
    <div>
      <h2>${post.title}</h2>
      <p>${post.content}</p>
    </div>
  `).join('');
}

renderPosts();