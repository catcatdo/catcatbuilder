// ========================================
// Blog JavaScript
// ========================================

let allPosts = [];
let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 6;
const IMAGE_PROXY_ENDPOINT = 'https://catcatbuilder-admin.catcatdo-bc9.workers.dev/image-proxy?url=';

// ========================================
// Markdown Renderer
// ========================================
function renderMarkdown(md) {
    if (!md) return '';

    // Escape HTML helper
    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // 0. Preserve HTML img tags from admin editor
    const imgTags = [];
    md = md.replace(/<img\s+[^>]*src=["'][^"']+["'][^>]*\/?>/gi, function(match) {
        imgTags.push(match);
        return '\x00IT' + (imgTags.length - 1) + '\x00';
    });

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
    let paraLines = [];

    function flushParagraph() {
        if (paraLines.length > 0) {
            html += '<p>' + paraLines.join('<br>') + '</p>';
            paraLines = [];
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Code block placeholder
        const cbMatch = line.match(/^\x00CB(\d+)\x00$/);
        if (cbMatch) {
            flushParagraph();
            if (inList) { html += '</ul>'; inList = false; }
            if (inTable) { html += '</tbody></table>'; inTable = false; }
            html += codeBlocks[parseInt(cbMatch[1])];
            continue;
        }

        // Heading
        if (line.match(/^### /)) {
            flushParagraph();
            if (inList) { html += '</ul>'; inList = false; }
            if (inTable) { html += '</tbody></table>'; inTable = false; }
            html += '<h3>' + applyInline(line.slice(4)) + '</h3>';
            continue;
        }
        if (line.match(/^## /)) {
            flushParagraph();
            if (inList) { html += '</ul>'; inList = false; }
            if (inTable) { html += '</tbody></table>'; inTable = false; }
            html += '<h2>' + applyInline(line.slice(3)) + '</h2>';
            continue;
        }

        // Table
        if (line.match(/^\|.+\|$/)) {
            flushParagraph();
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
            flushParagraph();
            if (!inList) { inList = true; html += '<ul>'; }
            html += '<li>' + applyInline(line.slice(2)) + '</li>';
            continue;
        } else if (inList && line.trim() === '') {
            html += '</ul>';
            inList = false;
        }

        // Ordered list
        if (line.match(/^\d+\. /)) {
            flushParagraph();
            const text = line.replace(/^\d+\. /, '');
            if (!inList) { inList = true; html += '<ul>'; }
            html += '<li>' + applyInline(text) + '</li>';
            continue;
        }

        // Checkbox
        if (line.match(/^- \[[ x]\] /)) {
            flushParagraph();
            if (!inList) { inList = true; html += '<ul>'; }
            const checked = line.charAt(3) === 'x';
            const text = line.slice(6);
            html += '<li>' + (checked ? '☑ ' : '☐ ') + applyInline(text) + '</li>';
            continue;
        }

        // Empty line = paragraph break
        if (line.trim() === '') {
            flushParagraph();
            if (inList) { html += '</ul>'; inList = false; }
            continue;
        }

        // Regular text — collect into paragraph buffer
        if (inList) { html += '</ul>'; inList = false; }
        paraLines.push(applyInline(line));
    }

    flushParagraph();
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
    // Restore preserved img tags from admin editor
    html = html.replace(/\x00IT(\d+)\x00/g, function(_, idx) {
        return imgTags[parseInt(idx)];
    });

    return html;
}

function applyInline(text) {
    // Images ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return text;
}

function uniqueNonEmpty(list) {
    const seen = new Set();
    const out = [];
    (list || []).forEach(item => {
        const value = String(item || '').trim();
        if (!value || seen.has(value)) return;
        seen.add(value);
        out.push(value);
    });
    return out;
}

function truncateText(value, maxLength) {
    const s = String(value || '').trim();
    if (s.length <= maxLength) return s;
    return s.slice(0, Math.max(0, maxLength - 1)) + '…';
}

function simpleHash(input) {
    const str = String(input || '');
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function escapeXml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function normalizeKeywordTokens(value) {
    return String(value || '')
        .split(/[,\n/|]+/)
        .map(part => part.trim().toLowerCase())
        .filter(Boolean)
        .map(part => part.replace(/[^a-z0-9\- ]/g, '').replace(/\s+/g, '-'))
        .filter(Boolean)
        .slice(0, 6);
}

function getCategoryKeywordFallback(category) {
    const map = {
        tech: ['technology', 'workspace', 'digital'],
        dev: ['developer', 'coding', 'software'],
        life: ['lifestyle', 'daily', 'journal'],
        template: ['design', 'mockup', 'ui']
    };
    return map[category] || ['editorial', 'article', 'news'];
}

function buildPostKeywordQuery(post) {
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const title = String(post.title || '');
    const tokens = uniqueNonEmpty(
        normalizeKeywordTokens(tags.join(',')) // 우선 태그 반영
            .concat(normalizeKeywordTokens(title))
            .concat(getCategoryKeywordFallback(post.category))
    );
    return tokens.slice(0, 5).join(',');
}

function buildPostAutoPrompt(post, bodyText, slotIndex) {
    const title = String(post.title || '');
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const keywords = buildPostKeywordQuery(post).replace(/,/g, ', ');
    const excerpt = String(post.excerpt || '').trim();
    const snippet = truncateText(excerpt || bodyText || '', 120);

    return [
        'editorial article cover photo',
        'documentary style',
        'realistic lighting',
        'no logo',
        'no watermark',
        'no visible text',
        keywords,
        title,
        tags.slice(0, 3).join(', '),
        snippet,
        `composition variant ${slotIndex + 1}`
    ].filter(Boolean).join(', ');
}

function buildGeneratedImageUrl(prompt, seedBase) {
    const cleanPrompt = String(prompt || '').trim();
    if (!cleanPrompt) return '';
    const seed = simpleHash(seedBase || cleanPrompt) % 1000000;
    return 'https://image.pollinations.ai/prompt/' +
        encodeURIComponent(cleanPrompt) +
        '?model=flux&width=1280&height=720&nologo=true&enhance=true&seed=' + seed;
}

function buildKeywordStockImageUrl(keywordQuery, seedBase, salt) {
    let tokens = normalizeKeywordTokens(keywordQuery);
    if (!tokens.length) tokens = ['editorial', 'news', 'analysis'];
    const keywordPath = tokens.map(token => encodeURIComponent(token)).join(',');
    const lock = simpleHash(String(seedBase || '') + '|' + String(salt || '')) % 1000000;
    return 'https://loremflickr.com/1280/720/' + keywordPath + '?lock=' + lock;
}

function buildInlineFallbackImage(post, slotIndex, bodyText) {
    const title = truncateText(post.title || 'Blog Brief', 44);
    const subtitle = truncateText((post.excerpt || '').trim() || bodyText || '핵심 내용을 빠르게 읽는 브리프', 78);
    const keywords = buildPostKeywordQuery(post)
        .split(',')
        .filter(Boolean)
        .slice(0, 3)
        .map(k => `#${k.toUpperCase()}`);
    const keywordLine = keywords.length ? keywords.join(' ') : '#BLOG #ARTICLE';
    const palette = [
        ['#111827', '#1d4ed8', '#1e40af'],
        ['#0f172a', '#065f46', '#0f766e'],
        ['#1f2937', '#7c2d12', '#b45309'],
        ['#1e1b4b', '#4c1d95', '#6d28d9']
    ][simpleHash(`${post.id || ''}|${post.title || ''}|${slotIndex}`) % 4];
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">' +
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
                `<stop offset="0%" stop-color="${palette[0]}"/>` +
                `<stop offset="55%" stop-color="${palette[1]}"/>` +
                `<stop offset="100%" stop-color="${palette[2]}"/>` +
            '</linearGradient></defs>' +
            '<rect width="1280" height="720" fill="url(#g)"/>' +
            '<rect x="56" y="56" width="1168" height="608" rx="20" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/>' +
            `<text x="98" y="132" fill="#bfdbfe" font-size="30" font-family="Arial, sans-serif">ARTICLE IMAGE ${escapeXml(String(slotIndex + 1))}</text>` +
            `<text x="98" y="206" fill="#fff" font-size="50" font-family="Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>` +
            `<text x="98" y="266" fill="#dbeafe" font-size="28" font-family="Arial, sans-serif">${escapeXml(subtitle)}</text>` +
            '<rect x="98" y="586" width="1084" height="58" rx="29" fill="rgba(255,255,255,0.14)"/>' +
            `<text x="126" y="624" fill="#fff" font-size="28" font-family="Arial, sans-serif">${escapeXml(keywordLine)}</text>` +
        '</svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function buildPostImageCandidates(post, bodyText, slotIndex) {
    const seedBase = String(post.id || '') + '|' + String(post.title || '') + '|slot-' + String(slotIndex);
    const keywordQuery = buildPostKeywordQuery(post);
    const prompt = buildPostAutoPrompt(post, bodyText, slotIndex);

    return uniqueNonEmpty([
        buildInlineFallbackImage(post, slotIndex, bodyText),
        buildGeneratedImageUrl(prompt, seedBase + '|ai'),
        buildKeywordStockImageUrl(keywordQuery, seedBase, 'a'),
        buildKeywordStockImageUrl(keywordQuery, seedBase, 'b')
    ]);
}

function createAutoImageFigure(post, bodyText, slotIndex) {
    const candidates = buildPostImageCandidates(post, bodyText, slotIndex);
    if (!candidates.length) return '';
    const firstImage = candidates[0];
    const encoded = encodeURIComponent(JSON.stringify(candidates));
    const alt = `${post.title || '블로그'} 관련 이미지 ${slotIndex + 1}`;
    return '' +
        '<figure class="auto-post-image" data-auto-image="true">' +
            '<img src="' + firstImage + '" alt="' + alt.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async" data-candidates="' + encoded + '">' +
        '</figure>';
}

function decodeCandidates(raw) {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('blob->dataURL failed'));
        reader.readAsDataURL(blob);
    });
}

async function fetchRemoteImageAsDataUrl(url) {
    const target = String(url || '').trim();
    if (!/^https?:\/\//i.test(target)) throw new Error('not remote');

    async function fetchBlob(fetchUrl) {
        const response = await fetch(fetchUrl, { mode: 'cors', credentials: 'omit' });
        if (!response.ok) throw new Error(`http ${response.status}`);
        const blob = await response.blob();
        if (!blob || !blob.type || !blob.type.startsWith('image/')) {
            throw new Error('not image');
        }
        return blob;
    }

    try {
        const directBlob = await fetchBlob(target);
        return await blobToDataUrl(directBlob);
    } catch (directError) {
        const proxyUrl = IMAGE_PROXY_ENDPOINT + encodeURIComponent(target);
        const proxiedBlob = await fetchBlob(proxyUrl);
        return await blobToDataUrl(proxiedBlob);
    }
}

async function enhanceAutoPostImages(root) {
    if (!root) return;
    const images = root.querySelectorAll('img[data-candidates]');
    for (let i = 0; i < images.length; i += 1) {
        const img = images[i];
        const candidates = decodeCandidates(img.getAttribute('data-candidates'));
        if (!candidates.length) continue;

        for (let j = 1; j < candidates.length; j += 1) {
            try {
                const dataUrl = await fetchRemoteImageAsDataUrl(candidates[j]);
                if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
                    img.src = dataUrl;
                    break;
                }
            } catch (error) {
                // Try next candidate.
            }
        }
    }
}

function injectAutoImagesIntoPost(html, post) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html || '';

    const existingImages = wrapper.querySelectorAll('img').length;
    const textLength = (wrapper.textContent || '').replace(/\s+/g, ' ').trim().length;
    const targetImages = textLength > 2800 ? 3 : 2;
    const addCount = Math.max(0, targetImages - existingImages);
    if (addCount <= 0) return wrapper.innerHTML;

    const bodyText = (wrapper.textContent || '').replace(/\s+/g, ' ').trim();
    const blocks = Array.from(wrapper.children).filter(el =>
        ['P', 'H2', 'H3', 'UL', 'OL', 'BLOCKQUOTE', 'PRE', 'TABLE'].includes(el.tagName)
    );

    if (!blocks.length) {
        for (let i = 0; i < addCount; i += 1) {
            wrapper.insertAdjacentHTML('beforeend', createAutoImageFigure(post, bodyText, i));
        }
        return wrapper.innerHTML;
    }

    const usedIndexes = new Set();
    for (let i = 0; i < addCount; i += 1) {
        let idx = Math.floor(((i + 1) * blocks.length) / (addCount + 1)) - 1;
        if (idx < 0) idx = 0;
        if (idx >= blocks.length) idx = blocks.length - 1;
        while (usedIndexes.has(idx) && idx < blocks.length - 1) idx += 1;
        usedIndexes.add(idx);
        blocks[idx].insertAdjacentHTML('afterend', createAutoImageFigure(post, bodyText, i));
    }

    return wrapper.innerHTML;
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
        // 모드에 따라 필터링
        if (window.BLOG_MODE === 'template') {
            allPosts = data.posts
                .filter(post => post.category === 'template')
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            allPosts = data.posts
                .filter(post => post.category !== 'diary' && post.category !== 'template' && post.category !== 'issue')
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
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
        if (window.BLOG_MODE === 'template') {
            breadcrumbEl.innerHTML = `<a href="index.html">홈</a> &rsaquo; <a href="templates.html">템플릿</a> &rsaquo; <span>${post.title}</span>`;
        } else {
            breadcrumbEl.innerHTML = `<a href="index.html">홈</a> &rsaquo; <a href="blog.html">블로그</a> &rsaquo; <span>${post.title}</span>`;
        }
    }

    const imageContainer = document.getElementById('detail-image');
    if (post.image) {
        imageContainer.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
    } else {
        imageContainer.innerHTML = '';
    }

    const renderedHtml = renderMarkdown(post.content);
    const detailContent = document.getElementById('detail-content');
    detailContent.innerHTML = injectAutoImagesIntoPost(renderedHtml, post);
    enhanceAutoPostImages(detailContent);

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
        'life': '일상',
        'issue': '이슈',
        'template': '템플릿'
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
