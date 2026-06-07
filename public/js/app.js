document.addEventListener('DOMContentLoaded', async() => {
    const token = localStorage.getItem('token');
    if (!token) { renderAuth(); return; }
    try {
        await API.me();
        renderFeed();
    } catch (e) { renderAuth(); }
});

function renderAuth() {
    document.body.innerHTML = `
  <main style="padding:24px">
    <h1>Sign In</h1>
    <form id="loginForm">
      <input name="identifier" placeholder="Username or email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button>Login</button>
    </form>
    <p>Or <a id="showSignup" href="#">Sign up</a></p>
  </main>`;
    document.getElementById('showSignup').addEventListener('click', (e) => { e.preventDefault();
        renderSignup(); });
    document.getElementById('loginForm').addEventListener('submit', async(e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd);
        const res = await API.login(data);
        if (res.token) { localStorage.setItem('token', res.token);
            location.reload(); } else alert(res.msg || 'Login failed');
    });
}

function renderSignup() {
    document.body.innerHTML = `
  <main style="padding:24px">
    <h1>Sign Up</h1>
    <form id="signupForm">
      <input name="email" placeholder="Email" required />
      <input name="name" placeholder="Full name" />
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button>Sign Up</button>
    </form>
    <p>Already have an account? <a id="showLogin" href="#">Sign in</a></p>
  </main>`;
    document.getElementById('showLogin').addEventListener('click', (e) => { e.preventDefault();
        renderAuth(); });
    document.getElementById('signupForm').addEventListener('submit', async(e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd);
        const res = await API.signup(data);
        if (res.token) { localStorage.setItem('token', res.token);
            location.reload(); } else alert(res.msg || JSON.stringify(res));
    });
}

async function renderFeed() {
    document.body.innerHTML = document.querySelector('html').outerHTML; // reload static template
    const feedEl = document.getElementById('feed');
    const storiesEl = document.getElementById('stories-tray');
    const [posts, stories] = await Promise.all([API.feed(), API.stories()]);
    storiesEl.innerHTML = stories.map(s => `<div class="story unseen"><img src="${s.user.avatarUrl||s.user.avatarUrl}" alt="${s.user.username}"></div>`).join('');
    feedEl.innerHTML = posts.map(p => `
    <article class="post">
      <div class="meta"><strong>${p.user.username}</strong></div>
      <img src="${p.imageUrl}" alt="post">
      <div style="padding:8px"><button data-id="${p._id}" class="like">♡</button> <span class="likes" data-id="${p._id}">0</span>
      <p>${escapeHtml(p.caption||'')}</p>
      <form data-id="${p._id}" class="comment-form"><input name="text" placeholder="Add a comment"><button>Post</button></form></div>
    </article>`).join('');
    document.querySelectorAll('.like').forEach(btn => btn.addEventListener('click', async(e) => {
        const id = e.target.dataset.id;
        const res = await API.like(id);
        e.target.textContent = res.liked ? '♥' : '♡';
    }));
    document.querySelectorAll('.comment-form').forEach(f => f.addEventListener('submit', async(e) => {
        e.preventDefault();
        const id = f.dataset.id;
        const text = f.querySelector('input').value;
        const r = await API.comment(id, text);
        alert('Comment posted');
    }));
}

function escapeHtml(s) { return s ? s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) : '' }