// ========================================
// Blog JavaScript
// ========================================

let allPosts = [];
let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 6;

// ========================================
// Load Posts from JSON
// ========================================

async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        allPosts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderPosts();
        renderRecentPosts();
        renderTagsCloud();
    } catch (error) {
        console.error('Failed to load posts:', error);
        document.getElementById('posts-container').innerHTML =
            '<div class="no-posts-message">게시글을 불러올 수 없습니다.</div>';
    }
}

// ========================================
// Render Posts
// ========================================

function renderPosts() {
    const container = document.getElementById('posts-container');

    // Filter posts by category
    let filteredPosts = currentCategory === 'all'
        ? allPosts
        : allPosts.filter(post => post.category === currentCategory);

    if (filteredPosts.length === 0) {
        container.innerHTML = '<div class="no-posts-message">게시글이 없습니다.</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // Pagination
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    // Render posts
    container.innerHTML = postsToShow.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            ${post.image ? `<div class="post-card-image" style="background-image: url('${post.image}')"></div>` : ''}
            <div class="post-card-content">
                <h2 class="post-card-title">${post.title}</h2>
                <div class="post-card-meta">
                    <span>📅 ${formatDate(post.date)}</span>
                    <span>📁 ${getCategoryName(post.category)}</span>
                </div>
                ${post.excerpt ? `<p class="post-card-excerpt">${post.excerpt}</p>` : ''}
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-card-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Add click events
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => {
            const postId = parseInt(card.dataset.postId);
            showPostDetail(postId);
        });
    });

    // Render pagination
    renderPagination(totalPages);
}

// ========================================
// Show Post Detail
// ========================================

function showPostDetail(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Hide posts list, show detail
    document.getElementById('posts-list').style.display = 'none';
    document.getElementById('post-detail').style.display = 'block';

    // Populate detail view
    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-date').textContent = '📅 ' + formatDate(post.date);
    document.getElementById('detail-category').textContent = '📁 ' + getCategoryName(post.category);

    const imageContainer = document.getElementById('detail-image');
    if (post.image) {
        imageContainer.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
    } else {
        imageContainer.innerHTML = '';
    }

    document.getElementById('detail-content').innerHTML = post.content;

    const tagsContainer = document.getElementById('detail-tags');
    if (post.tags && post.tags.length > 0) {
        tagsContainer.innerHTML = post.tags.map(tag =>
            `<span class="post-tag">${tag}</span>`
        ).join('');
    } else {
        tagsContainer.innerHTML = '';
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Update URL hash
    window.location.hash = `post-${postId}`;
}

// ========================================
// Back to List
// ========================================

document.getElementById('back-to-list')?.addEventListener('click', () => {
    document.getElementById('post-detail').style.display = 'none';
    document.getElementById('posts-list').style.display = 'block';
    window.location.hash = '';
    window.scrollTo(0, 0);
});

// ========================================
// Pagination
// ========================================

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">이전</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span>...</span>';
        }
    }

    // Next button
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">다음</button>`;

    container.innerHTML = html;

    // Add click events
    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.disabled) {
                currentPage = parseInt(btn.dataset.page);
                renderPosts();
                window.scrollTo(0, 0);
            }
        });
    });
}

// ========================================
// Category Filter
// ========================================

document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        currentPage = 1;
        renderPosts();
    });
});

// Category links in sidebar
document.querySelectorAll('.widget-list a[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        const btn = document.querySelector(`.category-btn[data-category="${category}"]`);
        if (btn) btn.click();
        window.scrollTo(0, 0);
    });
});

// ========================================
// Render Recent Posts (Sidebar)
// ========================================

function renderRecentPosts() {
    const container = document.getElementById('recent-posts');
    const recentPosts = allPosts.slice(0, 5);

    if (recentPosts.length === 0) {
        container.innerHTML = '<li>게시글이 없습니다</li>';
        return;
    }

    container.innerHTML = recentPosts.map(post => `
        <li>
            <a href="#" data-post-id="${post.id}">${post.title}</a>
        </li>
    `).join('');

    // Add click events
    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = parseInt(link.dataset.postId);
            showPostDetail(postId);
        });
    });
}

// ========================================
// Render Tags Cloud
// ========================================

function renderTagsCloud() {
    const container = document.getElementById('tags-cloud');
    const tagsCount = {};

    allPosts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => {
                tagsCount[tag] = (tagsCount[tag] || 0) + 1;
            });
        }
    });

    const tags = Object.entries(tagsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (tags.length === 0) {
        container.innerHTML = '<p style="font-size: 14px; color: #7f8c8d;">태그가 없습니다</p>';
        return;
    }

    container.innerHTML = tags.map(([tag, count]) =>
        `<span class="tag-item">${tag} (${count})</span>`
    ).join('');
}

// ========================================
// Utility Functions
// ========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryName(category) {
    const categories = {
        'tech': '기술',
        'dev': '개발',
        'life': '일상'
    };
    return categories[category] || category;
}

// ========================================
// Handle URL Hash on Load
// ========================================

function handleInitialHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#post-')) {
        const postId = parseInt(hash.replace('#post-', ''));
        if (!isNaN(postId)) {
            setTimeout(() => showPostDetail(postId), 100);
        }
    }
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadPosts().then(() => {
        handleInitialHash();
    });
});
