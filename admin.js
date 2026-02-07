// ========================================
// Admin JavaScript
// ========================================

const ADMIN_PASSWORD = 'Dhktmfpahsh05!'; // 비밀번호를 변경하세요!
let posts = [];
let isLoggedIn = false;
const DRAFT_KEY = 'adminPostDraft';
const GITHUB_SAVE_ENDPOINT = 'https://catcatbuilder-admin.catcatdo-bc9.workers.dev/save-posts';

// ========================================
// Login
// ========================================

function checkLogin() {
    const savedLogin = sessionStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
        isLoggedIn = true;
        showDashboard();
    }
}

document.getElementById('login-btn')?.addEventListener('click', () => {
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');

    if (password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminPassword', password);
        showDashboard();
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = '비밀번호가 올바르지 않습니다.';
    }
});

document.getElementById('admin-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('login-btn').click();
    }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    isLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminPassword');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-password').value = '';
});

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadPostsData();
}

// ========================================
// Tab Navigation
// ========================================

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update active button
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active content
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');

        // Update JSON output if switching to JSON tab
        if (tab === 'json') {
            updateJSONOutput();
        }

        // Update posts management if switching to manage tab
        if (tab === 'manage') {
            renderPostsManagement();
        }
    });
});

// ========================================
// Load Posts Data
// ========================================

async function loadPostsData() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        posts = data.posts || [];
    } catch (error) {
        console.error('Failed to load posts:', error);
        posts = [];
    }
}

// ========================================
// Create Post
// ========================================

document.getElementById('post-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const image = document.getElementById('post-image').value.trim();
    const excerpt = document.getElementById('post-excerpt').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const tagsInput = document.getElementById('post-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    const newPost = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        title,
        category,
        date: new Date().toISOString().split('T')[0],
        image,
        excerpt,
        content,
        tags
    };

    posts.unshift(newPost);
    clearDraft();

    alert('✅ 게시글이 생성되었습니다!\n\n"JSON 내보내기" 탭으로 이동하여 JSON을 복사하고 GitHub에 업로드하세요.');

    // Switch to JSON tab
    document.querySelector('.admin-tab-btn[data-tab="json"]').click();

    // Clear form
    document.getElementById('post-form').reset();
});

document.getElementById('clear-form')?.addEventListener('click', () => {
    if (confirm('작성 중인 내용을 모두 지우시겠습니까?')) {
        document.getElementById('post-form').reset();
        clearDraft();
    }
});

// ========================================
// Posts Management
// ========================================

function renderPostsManagement() {
    const container = document.getElementById('posts-management');

    if (posts.length === 0) {
        container.innerHTML = '<p>게시글이 없습니다.</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="manage-post-item">
            <h4>${post.title}</h4>
            <p>
                <strong>카테고리:</strong> ${getCategoryName(post.category)} |
                <strong>날짜:</strong> ${post.date} |
                <strong>태그:</strong> ${post.tags ? post.tags.join(', ') : '없음'}
            </p>
            <div class="manage-post-actions">
                <button class="btn btn-secondary edit-post" data-id="${post.id}">수정</button>
                <button class="btn btn-secondary delete-post" data-id="${post.id}">삭제</button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = parseInt(btn.dataset.id);
            editPost(postId);
        });
    });

    container.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = parseInt(btn.dataset.id);
            deletePost(postId);
        });
    });
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (confirm('이 게시글을 수정하시겠습니까? 작성 폼으로 내용이 로드됩니다.')) {
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-image').value = post.image || '';
        document.getElementById('post-excerpt').value = post.excerpt || '';
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';

        // Remove the old post
        posts = posts.filter(p => p.id !== postId);

        // Switch to write tab
        document.querySelector('.admin-tab-btn[data-tab="write"]').click();

        alert('게시글 내용이 로드되었습니다. 수정 후 "게시글 생성"을 클릭하세요.');
    }
}

function deletePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (confirm(`"${post.title}" 게시글을 삭제하시겠습니까?`)) {
        posts = posts.filter(p => p.id !== postId);
        renderPostsManagement();
        alert('게시글이 삭제되었습니다. JSON 내보내기 탭에서 변경사항을 확인하세요.');
    }
}

// ========================================
// JSON Export
// ========================================

function updateJSONOutput() {
    const jsonData = {
        posts: posts
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    document.getElementById('json-output').textContent = jsonString;
}

document.getElementById('copy-json')?.addEventListener('click', () => {
    const jsonOutput = document.getElementById('json-output').textContent;

    navigator.clipboard.writeText(jsonOutput).then(() => {
        alert('✅ JSON이 클립보드에 복사되었습니다!\n\nGitHub에서 posts.json 파일을 수정하여 붙여넣으세요.');
    }).catch(() => {
        alert('❌ 복사에 실패했습니다. 수동으로 복사해주세요.');
    });
});

document.getElementById('download-json')?.addEventListener('click', () => {
    const jsonData = {
        posts: posts
    };

    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'posts.json';
    a.click();

    URL.revokeObjectURL(url);
});

// ========================================
// Save to GitHub (Cloudflare Worker)
// ========================================

function setGithubStatus(message, isError = false) {
    const status = document.getElementById('github-status');
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? '#e74c3c' : '#2c3e50';
}

async function getAdminPassword() {
    let password = sessionStorage.getItem('adminPassword');
    if (!password) {
        password = prompt('관리자 비밀번호를 입력하세요.');
        if (password) {
            sessionStorage.setItem('adminPassword', password);
        }
    }
    return password;
}

document.getElementById('save-to-github')?.addEventListener('click', async () => {
    if (!GITHUB_SAVE_ENDPOINT.includes('workers.dev')) {
        setGithubStatus('❌ 먼저 GITHUB_SAVE_ENDPOINT를 실제 Worker URL로 설정하세요.', true);
        return;
    }

    const password = await getAdminPassword();
    if (!password) {
        setGithubStatus('❌ 비밀번호가 필요합니다.', true);
        return;
    }

    setGithubStatus('⏳ GitHub에 저장 중...');

    try {
        const response = await fetch(GITHUB_SAVE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': password
            },
            body: JSON.stringify({ posts })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result?.message || '저장 실패');
        }

        setGithubStatus(`✅ 저장 완료: ${result.commit || '커밋 완료'}`);
    } catch (error) {
        console.error('GitHub save failed:', error);
        setGithubStatus(`❌ 저장 실패: ${error.message}`, true);
    }
});

// ========================================
// JSON Import
// ========================================

document.getElementById('import-json')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || !Array.isArray(data.posts)) {
            throw new Error('Invalid JSON structure');
        }
        posts = data.posts;
        updateJSONOutput();
        renderPostsManagement();
        alert('✅ posts.json을 불러왔습니다. 이제 수정 후 JSON을 내보내세요.');
    } catch (error) {
        console.error('Failed to import JSON:', error);
        alert('❌ 올바른 posts.json 파일이 아닙니다.');
    } finally {
        event.target.value = '';
    }
});

// ========================================
// Draft Handling
// ========================================

function getDraftFromForm() {
    return {
        title: document.getElementById('post-title').value,
        category: document.getElementById('post-category').value,
        image: document.getElementById('post-image').value,
        excerpt: document.getElementById('post-excerpt').value,
        content: document.getElementById('post-content').value,
        tags: document.getElementById('post-tags').value
    };
}

function saveDraft() {
    const draft = getDraftFromForm();
    const hasContent = Object.values(draft).some(value => value && value.trim());
    if (!hasContent) {
        clearDraft();
        return;
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    showDraftNotice(true);
}

function restoreDraft() {
    const draftRaw = localStorage.getItem(DRAFT_KEY);
    if (!draftRaw) return;
    const draft = JSON.parse(draftRaw);
    document.getElementById('post-title').value = draft.title || '';
    document.getElementById('post-category').value = draft.category || 'tech';
    document.getElementById('post-image').value = draft.image || '';
    document.getElementById('post-excerpt').value = draft.excerpt || '';
    document.getElementById('post-content').value = draft.content || '';
    document.getElementById('post-tags').value = draft.tags || '';
    showDraftNotice(true);
}

function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    showDraftNotice(false);
}

function showDraftNotice(visible) {
    const notice = document.getElementById('draft-notice');
    if (!notice) return;
    notice.style.display = visible ? 'flex' : 'none';
}

function initDraftHandlers() {
    const draftRaw = localStorage.getItem(DRAFT_KEY);
    if (draftRaw) {
        showDraftNotice(true);
    }

    document.getElementById('restore-draft')?.addEventListener('click', () => {
        restoreDraft();
    });

    document.getElementById('discard-draft')?.addEventListener('click', () => {
        if (confirm('임시저장 내용을 삭제할까요?')) {
            clearDraft();
        }
    });

    const fields = [
        'post-title',
        'post-category',
        'post-image',
        'post-excerpt',
        'post-content',
        'post-tags'
    ];

    fields.forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            saveDraft();
        });
    });
}

// ========================================
// Utility Functions
// ========================================

function getCategoryName(category) {
    const categories = {
        'tech': '기술',
        'dev': '개발',
        'life': '일상'
    };
    return categories[category] || category;
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    initDraftHandlers();
});
