// ========================================
// Blog JavaScript
// ========================================

let allPosts = [];
let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 6;

// ========================================
// Markdown Renderer
// ========================================
function renderMarkdown(md) {
    if (!md) return '';

    // Escape HTML helper
    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 1. Extract code blocks first (protect from other processing)
    const codeBlocks = [];
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
        codeBlocks.push('<pre><code' + (lang ? ' class="lang-' + esc(lang) + '"' : '') + '>' + esc(code.replace(/\n$/, '')) + '</code></pre>');
        return '\x00CB' + (codeBlocks.length - 1) + '\x00';
    });

    // 2. Extract inline code
    const inlineCodes = [];
    md = md.replace(/`([^`\n]+)`/g, function(_, code) {
        inlineCodes.push('<code>' + esc(code) + '</code>');
        return '\x00IC' + (inlineCodes.length - 1) + '\x00';
    });

    // 3. Process line by line
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let inTable = false;
    let tableHeader = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code block placeholder
        const cbMatch = line.match(/^\x00CB(\d+)\x00$/);
        if (cbMatch) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inTable) { html += '</tbody></table>'; inTable = false; }
            html += codeBlocks[parseInt(cbMatch[1])];
            continue;
        }

        // Heading
        if (line.match(/^### /)) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inTable) { html += '</tbody></table>'; inTable = false; }
            html += '<h3>' + applyInline(line.slice(4)) + '</h3>';
            continue;
        }
        if (line.match(/^## /)) {
            if (inList) { html += '</ul>'; inList = false; }
            if (inTable) { html += '</tbody></table>'; inTable = false; }
            html += '<h2>' + applyInline(line.slice(3)) + '</h2>';
            continue;
        }

        // Table
        if (line.match(/^\|.+\|$/)) {
            if (inList) { html += '</ul>'; inList = false; }
            const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
            // Check if separator row
            if (cells.every(c => /^[-:]+$/.test(c))) {
                tableHeader = false;
                continue;
            }
            if (!inTable) {
                inTable = true;
                tableHeader = true;
                html += '<table><thead><tr>' + cells.map(c => '<th>' + applyInline(c) + '</th>').join('') + '</tr></thead><tbody>';
                continue;
            }
            html += '<tr>' + cells.map(c => '<td>' + applyInline(c) + '</td>').join('') + '</tr>';
            continue;
        } else if (inTable) {
            html += '</tbody></table>';
            inTable = false;
        }

        // Unordered list
        if (line.match(/^[-*] /)) {
            if (!inList) { inList = true; html += '<ul>'; }
            html += '<li>' + applyInline(line.slice(2)) + '</li>';
            continue;
        } else if (inList && line.trim() === '') {
            html += '</ul>';
            inList = false;
        }

        // Ordered list
        if (line.match(/^\d+\. /)) {
            const text = line.replace(/^\d+\. /, '');
            if (!inList) { inList = true; html += '<ul>'; }
            html += '<li>' + applyInline(text) + '</li>';
            continue;
        }

        // Checkbox
        if (line.match(/^- \[[ x]\] /)) {
            if (!inList) { inList = true; html += '<ul>'; }
            const checked = line.charAt(3) === 'x';
            const text = line.slice(6);
            html += '<li>' + (checked ? '☑ ' : '☐ ') + applyInline(text) + '</li>';
            continue;
        }

        // Empty line = paragraph break
        if (line.trim() === '') {
            if (inList) { html += '</ul>'; inList = false; }
            continue;
        }

        // Regular paragraph
        if (inList) { html += '</ul>'; inList = false; }
        html += '<p>' + applyInline(line) + '</p>';
    }

    if (inList) html += '</ul>';
    if (inTable) html += '</tbody></table>';

    // Restore inline code placeholders
    html = html.replace(/\x00IC(\d+)\x00/g, function(_, idx) {
        return inlineCodes[parseInt(idx)];
    });
    // Restore code block placeholders (in case they appeared inline)
    html = html.replace(/\x00CB(\d+)\x00/g, function(_, idx) {
        return codeBlocks[parseInt(idx)];
    });

    return html;
}

function applyInline(text) {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return text;
}

const siteName = '릴황';
const blogListMeta = {
    title: '릴황 블로그 | 개발, 기술, 일상 이야기',
    description: '릴황의 개발, 기술, 일상 이야기를 담은 블로그입니다.',
    image: 'https://lilhwang.com/images/og-default.jpg',
    url: 'https://lilhwang.com/blog.html',
    type: 'website'
};

function setMetaTag(selector, attr, value) {
    let tag = document.head.querySelector(selector);
    if (!tag) {
        tag = document.createElement('meta');
        if (attr === 'property') {
            tag.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
        } else {
            tag.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
        }
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', value);
}

function updateBlogMeta(meta) {
    document.title = meta.title;

    setMetaTag('meta[name="description"]', 'name', meta.description);
    setMetaTag('meta[property="og:title"]', 'property', meta.title);
    setMetaTag('meta[property="og:description"]', 'property', meta.description);
    setMetaTag('meta[property="og:image"]', 'property', meta.image);
    setMetaTag('meta[property="og:url"]', 'property', meta.url);
    setMetaTag('meta[property="og:type"]', 'property', meta.type);
    setMetaTag('meta[property="og:site_name"]', 'property', siteName);

    setMetaTag('meta[name="twitter:title"]', 'name', meta.title);
    setMetaTag('meta[name="twitter:description"]', 'name', meta.description);
    setMetaTag('meta[name="twitter:image"]', 'name', meta.image);
    setMetaTag('meta[name="twitter:card"]', 'name', 'summary_large_image');
}

function getPostMeta(post, postId) {
    const description = post.excerpt && post.excerpt.trim()
        ? post.excerpt.trim()
        : `${post.title} - 릴황 블로그 글입니다.`;

    const imageUrl = post.image && post.image.trim()
        ? new URL(post.image, window.location.origin + '/').href
        : blogListMeta.image;

    return {
        title: `${post.title} | 릴황 블로그`,
        description,
        image: imageUrl,
        url: `https://lilhwang.com/blog.html#post-${postId}`,
        type: 'article'
    };
}


// ========================================
// Load Posts from JSON
// ========================================

async function loadPosts() {
    try {
        const response = await fetch('posts.json?v=' + Date.now());
        const data = await response.json();
        // 블로그에서는 일기(diary) 제외하고 로드
        allPosts = data.posts
            .filter(post => post.category !== 'diary')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
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
        <article class="post-card" data-post-id="${post.id}">
            ${post.image ? `<div class="post-card-image"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>` : ''}
            <div class="post-card-content">
                <h2 class="post-card-title">${post.title}</h2>
                <div class="post-card-meta">
                    <span class="meta-author">릴황</span>
                    <span class="meta-date">${formatDate(post.date)}</span>
                    <span class="meta-category">${getCategoryName(post.category)}</span>
                </div>
                ${post.excerpt ? `<p class="post-card-excerpt">${post.excerpt}</p>` : ''}
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-card-tags">
                        ${post.tags.slice(0, 4).map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </article>
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

function injectJsonLd(data) {
    let el = document.getElementById('json-ld-schema');
    if (!el) {
        el = document.createElement('script');
        el.type = 'application/ld+json';
        el.id = 'json-ld-schema';
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
}

function setBlogPostSchema(post, postId) {
    const url = `https://lilhwang.com/blog.html#post-${postId}`;
    const imageUrl = post.image && post.image.trim()
        ? new URL(post.image, window.location.origin + '/').href
        : 'https://lilhwang.com/images/og-default.jpg';

    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt || post.title,
        "image": imageUrl,
        "datePublished": post.date,
        "dateModified": post.date,
        "url": url,
        "mainEntityOfPage": { "@type": "WebPage", "@id": url },
        "author": {
            "@type": "Person",
            "name": "릴황 (lilhwang)",
            "url": "https://lilhwang.com/about.html",
            "jobTitle": "웹 개발자 & IoT 엔지니어"
        },
        "publisher": {
            "@type": "Organization",
            "name": "lilhwang.com",
            "url": "https://lilhwang.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://lilhwang.com/images/og-default.jpg"
            }
        },
        "inLanguage": "ko-KR",
        "keywords": (post.tags || []).join(', ')
    };

    // Breadcrumb schema
    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://lilhwang.com/" },
            { "@type": "ListItem", "position": 2, "name": "블로그", "item": "https://lilhwang.com/blog.html" },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": url }
        ]
    };

    injectJsonLd([schema, breadcrumb]);
}

function removeBlogPostSchema() {
    const el = document.getElementById('json-ld-schema');
    if (el) el.remove();
}

function showPostDetail(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Hide posts list, show detail
    document.getElementById('posts-list').style.display = 'none';
    document.getElementById('post-detail').style.display = 'block';

    // Populate detail view
    document.getElementById('detail-title').textContent = post.title;
    document.getElementById('detail-date').textContent = formatDate(post.date);
    document.getElementById('detail-category').textContent = getCategoryName(post.category);

    // Author info
    const authorEl = document.getElementById('detail-author');
    if (authorEl) authorEl.textContent = '릴황 (lilhwang)';

    // Breadcrumb
    const breadcrumbEl = document.getElementById('detail-breadcrumb');
    if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `<a href="index.html">홈</a> &rsaquo; <a href="blog.html">블로그</a> &rsaquo; <span>${post.title}</span>`;
    }

    const imageContainer = document.getElementById('detail-image');
    if (post.image) {
        imageContainer.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
    } else {
        imageContainer.innerHTML = '';
    }

    document.getElementById('detail-content').innerHTML = renderMarkdown(post.content);

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

    // Update meta tags for sharing
    updateBlogMeta(getPostMeta(post, postId));

    // Inject structured data (BlogPosting + Breadcrumb)
    setBlogPostSchema(post, postId);
}

// ========================================
// Back to List
// ========================================

document.getElementById('back-to-list')?.addEventListener('click', () => {
    document.getElementById('post-detail').style.display = 'none';
    document.getElementById('posts-list').style.display = 'block';
    window.location.hash = '';
    updateBlogMeta(blogListMeta);
    removeBlogPostSchema();
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
    updateBlogMeta(blogListMeta);

    loadPosts().then(() => {
        handleInitialHash();
    });
});
