// ========================================
// Admin JavaScript — Rich Editor with Inline Image Insertion
// ========================================

const ADMIN_USERNAME = 'catcatdo';
const ADMIN_PASSWORD = 'Dhktmfpahsh05!';
let posts = [];
let isLoggedIn = false;
let editingPostId = null;
const DRAFT_KEY = 'adminPostDraft';
const GITHUB_SAVE_ENDPOINT = 'https://catcatbuilder-admin.catcatdo-bc9.workers.dev/save-posts';

// 이미지 모달 상태
let pendingImages = []; // {src, file, type:'file'|'url', selected}
let savedSelection = null;

// ========================================
// Login
// ========================================

function checkLogin() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        isLoggedIn = true;
        showDashboard();
    }
}

document.getElementById('login-btn')?.addEventListener('click', () => {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('login-error');
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminPassword', password);
        showDashboard();
        errorDiv.textContent = '';
    } else {
        errorDiv.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
});

document.getElementById('admin-username')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('admin-password').focus();
});

document.getElementById('admin-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    isLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminPassword');
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
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
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
        if (tab === 'json') updateJSONOutput();
        if (tab === 'manage') renderPostsManagement();
    });
});

// ========================================
// Load Posts
// ========================================

async function loadPostsData() {
    try {
        const response = await fetch('posts.json?v=' + Date.now());
        const data = await response.json();
        posts = data.posts || [];
    } catch (error) {
        console.error('Failed to load posts:', error);
        posts = [];
    }
}

// ========================================
// Rich Text Editor — Toolbar Commands
// ========================================

const editorBody = document.getElementById('editor-body');

document.querySelectorAll('.toolbar-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
        editorBody.focus();
        const cmd = btn.dataset.cmd;
        const val = btn.dataset.val || null;
        document.execCommand(cmd, false, val);
        updateCharCount();
    });
});

// 링크 삽입
document.getElementById('insert-link-btn')?.addEventListener('click', () => {
    const url = prompt('링크 URL을 입력하세요:', 'https://');
    if (url) {
        document.execCommand('createLink', false, url);
    }
});

// 글자 수 카운터
function updateCharCount() {
    const text = editorBody.innerText || '';
    const count = text.trim().length;
    const el = document.getElementById('char-count');
    el.textContent = `${count.toLocaleString()}자`;
    el.className = 'char-count';
    if (count >= 2000) el.classList.add('good');
    else if (count >= 500) el.classList.add('warn');
}

editorBody?.addEventListener('input', () => {
    updateCharCount();
    updateImageGallery();
    saveDraft();
});

// ========================================
// 이미지 삽입 기능
// ========================================

function saveEditorSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedSelection = sel.getRangeAt(0).cloneRange();
    }
}

function restoreEditorSelection() {
    if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
    }
}

// 사진 삽입 버튼 클릭
document.getElementById('insert-image-btn')?.addEventListener('click', () => {
    saveEditorSelection();
    pendingImages = [];
    renderUploadPreview();
    renderUrlPreview();
    document.getElementById('image-alt').value = '';
    document.getElementById('image-modal').classList.add('active');
});

// 모달 닫기
document.getElementById('close-modal-btn')?.addEventListener('click', closeImageModal);

document.getElementById('image-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeImageModal();
});

function closeImageModal() {
    document.getElementById('image-modal').classList.remove('active');
    pendingImages = [];
}

// 모달 탭 전환
document.querySelectorAll('.modal-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.modalTab;
        document.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`modal-${tab}-tab`).classList.add('active');
    });
});

// 파일 업로드
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');

uploadZone?.addEventListener('click', () => fileInput.click());
fileInput?.addEventListener('change', (e) => { handleFiles(e.target.files); e.target.value = ''; });

uploadZone?.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone?.addEventListener('drop', (e) => { e.preventDefault(); uploadZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/') || pendingImages.length >= 20) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            pendingImages.push({ src: e.target.result, file, type: 'file', selected: true });
            renderUploadPreview();
        };
        reader.readAsDataURL(file);
    });
}

function renderUploadPreview() {
    const container = document.getElementById('upload-preview');
    const fileImages = pendingImages.filter(img => img.type === 'file');
    document.getElementById('upload-count').textContent = fileImages.length > 0 ? `${fileImages.length}장 선택됨` : '';

    container.innerHTML = fileImages.map((img) => {
        const idx = pendingImages.indexOf(img);
        return `<div class="upload-preview-item ${img.selected ? 'selected' : ''}" data-index="${idx}">
            <img src="${img.src}" alt="미리보기">
            <button class="remove-btn" data-index="${idx}">&times;</button>
        </div>`;
    }).join('');

    bindPreviewEvents(container);
}

// URL 입력
document.getElementById('add-url-btn')?.addEventListener('click', addUrlImage);
document.getElementById('image-url-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addUrlImage(); }
});

function addUrlImage() {
    const input = document.getElementById('image-url-input');
    const url = input.value.trim();
    if (!url) return;
    pendingImages.push({ src: url, type: 'url', selected: true });
    input.value = '';
    renderUrlPreview();
}

function renderUrlPreview() {
    const container = document.getElementById('url-preview');
    const urlImages = pendingImages.filter(img => img.type === 'url');
    document.getElementById('url-count').textContent = urlImages.length > 0 ? `${urlImages.length}장 추가됨` : '';

    container.innerHTML = urlImages.map((img) => {
        const idx = pendingImages.indexOf(img);
        return `<div class="upload-preview-item ${img.selected ? 'selected' : ''}" data-index="${idx}">
            <img src="${img.src}" alt="미리보기" onerror="this.parentElement.style.background='#fee'">
            <button class="remove-btn" data-index="${idx}">&times;</button>
        </div>`;
    }).join('');

    bindPreviewEvents(container);
}

function bindPreviewEvents(container) {
    container.querySelectorAll('.upload-preview-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            const idx = parseInt(item.dataset.index);
            pendingImages[idx].selected = !pendingImages[idx].selected;
            renderUploadPreview();
            renderUrlPreview();
        });
    });
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            pendingImages.splice(parseInt(btn.dataset.index), 1);
            renderUploadPreview();
            renderUrlPreview();
        });
    });
}

// 이미지 삽입 실행
document.getElementById('insert-images-btn')?.addEventListener('click', () => {
    const selected = pendingImages.filter(img => img.selected);
    if (selected.length === 0) { alert('삽입할 이미지를 선택하세요.'); return; }

    const altText = document.getElementById('image-alt').value.trim() || '블로그 이미지';

    editorBody.focus();
    restoreEditorSelection();

    selected.forEach((img, i) => {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = altText;

        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.collapse(false);
            range.insertNode(imgEl);
            const br = document.createElement('br');
            imgEl.after(br);
            range.setStartAfter(br);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            editorBody.appendChild(imgEl);
            editorBody.appendChild(document.createElement('br'));
        }
    });

    closeImageModal();
    updateCharCount();
    updateImageGallery();
    saveDraft();
});

// 이미지 갤러리 바
function updateImageGallery() {
    const images = editorBody.querySelectorAll('img');
    const bar = document.getElementById('image-gallery-bar');
    const thumbs = document.getElementById('image-gallery-thumbs');
    const countEl = document.getElementById('image-count');

    if (images.length === 0) { bar.style.display = 'none'; return; }

    bar.style.display = 'block';
    countEl.textContent = images.length;
    thumbs.innerHTML = '';

    images.forEach((img, i) => {
        const thumb = document.createElement('img');
        thumb.src = img.src;
        thumb.alt = `이미지 ${i + 1}`;
        thumb.title = `이미지 ${i + 1} (클릭하여 이동)`;
        thumb.addEventListener('click', () => {
            img.scrollIntoView({ behavior: 'smooth', block: 'center' });
            images.forEach(im => im.classList.remove('selected'));
            img.classList.add('selected');
            setTimeout(() => img.classList.remove('selected'), 2000);
        });
        thumbs.appendChild(thumb);
    });
}

// 에디터 내 이미지 클릭 → 삭제 확인
editorBody?.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        if (confirm('이 이미지를 삭제하시겠습니까?')) {
            e.target.remove();
            updateImageGallery();
            saveDraft();
        }
    }
});

// ========================================
// 게시글 저장
// ========================================

document.getElementById('save-post-btn')?.addEventListener('click', () => {
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const excerpt = document.getElementById('post-excerpt').value.trim();
    const tagsInput = document.getElementById('post-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    const content = editorBody.innerHTML.trim();

    if (!title) { alert('제목을 입력하세요.'); return; }
    if (!content || content === '<br>') { alert('본문을 작성하세요.'); return; }

    const firstImg = editorBody.querySelector('img');
    const image = firstImg ? firstImg.src : '';

    if (editingPostId !== null) {
        const idx = posts.findIndex(p => p.id === editingPostId);
        if (idx !== -1) posts[idx] = { ...posts[idx], title, category, image, excerpt, content, tags };
        editingPostId = null;
        document.getElementById('editor-heading').textContent = '새 게시글 작성';
    } else {
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        posts.unshift({ id: newId, title, category, date: new Date().toISOString().split('T')[0], image, excerpt, content, tags });
    }

    clearDraft();
    clearForm();
    alert('게시글이 저장되었습니다! "JSON 내보내기" 탭에서 GitHub에 저장하세요.');
    document.querySelector('.admin-tab-btn[data-tab="json"]').click();
});

// 미리보기
document.getElementById('preview-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('preview-panel');
    document.getElementById('preview-title').textContent = document.getElementById('post-title').value || '(제목 없음)';
    document.getElementById('preview-meta').textContent = `릴황 · ${getCategoryName(document.getElementById('post-category').value)} · ${new Date().toLocaleDateString('ko-KR')}`;
    document.getElementById('preview-content').innerHTML = editorBody.innerHTML;
    panel.classList.add('active');
    panel.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('close-preview')?.addEventListener('click', () => {
    document.getElementById('preview-panel').classList.remove('active');
});

function clearForm() {
    document.getElementById('post-title').value = '';
    document.getElementById('post-category').value = 'tech';
    document.getElementById('post-tags').value = '';
    document.getElementById('post-excerpt').value = '';
    editorBody.innerHTML = '';
    editingPostId = null;
    document.getElementById('editor-heading').textContent = '새 게시글 작성';
    updateCharCount();
    updateImageGallery();
    document.getElementById('preview-panel').classList.remove('active');
}

document.getElementById('clear-form')?.addEventListener('click', () => {
    if (confirm('작성 중인 내용을 모두 지우시겠습니까?')) { clearForm(); clearDraft(); }
});

// ========================================
// 글 관리
// ========================================

function renderPostsManagement() {
    const container = document.getElementById('posts-management');
    const searchTerm = (document.getElementById('search-posts')?.value || '').toLowerCase();
    document.getElementById('total-posts-count').textContent = posts.length;

    const filtered = searchTerm
        ? posts.filter(p => p.title.toLowerCase().includes(searchTerm) || (p.tags || []).join(',').toLowerCase().includes(searchTerm))
        : posts;

    if (filtered.length === 0) { container.innerHTML = '<p>게시글이 없습니다.</p>'; return; }

    container.innerHTML = filtered.map(post => {
        const textLen = (post.content || '').replace(/<[^>]*>/g, '').length;
        const imgCount = ((post.content || '').match(/<img /g) || []).length;
        return `<div class="manage-post-item">
            <h4>${post.title}</h4>
            <p><strong>ID:</strong> ${post.id} | <strong>카테고리:</strong> ${getCategoryName(post.category)} | <strong>날짜:</strong> ${post.date} | <strong>글자수:</strong> ${textLen}자 | <strong>이미지:</strong> ${imgCount}장</p>
            <div class="manage-post-actions">
                <button class="btn btn-secondary edit-post" data-id="${post.id}">수정</button>
                <button class="btn btn-secondary delete-post" data-id="${post.id}">삭제</button>
            </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.edit-post').forEach(btn => {
        btn.addEventListener('click', () => editPost(parseInt(btn.dataset.id)));
    });
    container.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', () => deletePost(parseInt(btn.dataset.id)));
    });
}

document.getElementById('search-posts')?.addEventListener('input', renderPostsManagement);

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    editingPostId = postId;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-category').value = post.category;
    document.getElementById('post-excerpt').value = post.excerpt || '';
    document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
    editorBody.innerHTML = post.content || '';
    document.getElementById('editor-heading').textContent = `수정 중: ${post.title}`;
    document.querySelector('.admin-tab-btn[data-tab="write"]').click();
    window.scrollTo(0, 0);
    updateCharCount();
    updateImageGallery();
}

function deletePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (confirm(`"${post.title}" 삭제?`)) {
        posts = posts.filter(p => p.id !== postId);
        renderPostsManagement();
    }
}

// ========================================
// JSON Export
// ========================================

function updateJSONOutput() {
    document.getElementById('json-output').textContent = JSON.stringify({ posts }, null, 2);
}

document.getElementById('copy-json')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('json-output').textContent)
        .then(() => alert('JSON 복사 완료!'))
        .catch(() => alert('복사 실패.'));
});

document.getElementById('download-json')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ posts }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'posts.json';
    a.click();
    URL.revokeObjectURL(a.href);
});

function setGithubStatus(msg, isError = false, link) {
    const el = document.getElementById('github-status');
    if (!el) return;
    el.textContent = '';
    el.appendChild(document.createTextNode(msg));
    if (link) {
        el.appendChild(document.createTextNode(' '));
        const a = document.createElement('a');
        a.href = link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '커밋 보기';
        el.appendChild(a);
    }
    el.style.color = isError ? '#e74c3c' : '#2c3e50';
}

document.getElementById('save-to-github')?.addEventListener('click', async () => {
    const password = sessionStorage.getItem('adminPassword') || prompt('비밀번호:');
    if (!password) return;
    setGithubStatus('저장 중...');
    try {
        const res = await fetch(GITHUB_SAVE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
            body: JSON.stringify({ posts })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.message || '실패');
        setGithubStatus(result.commit ? `완료: ${result.commit}` : '완료', false, result.commitUrl);
    } catch (e) {
        setGithubStatus(`실패: ${e.message}`, true);
    }
});

document.getElementById('import-json')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.posts)) throw new Error();
        posts = data.posts;
        updateJSONOutput();
        renderPostsManagement();
        alert('불러오기 완료.');
    } catch { alert('올바른 JSON이 아닙니다.'); }
    e.target.value = '';
});

// ========================================
// Draft
// ========================================

function saveDraft() {
    const draft = {
        title: document.getElementById('post-title').value,
        category: document.getElementById('post-category').value,
        excerpt: document.getElementById('post-excerpt').value,
        tags: document.getElementById('post-tags').value,
        content: editorBody.innerHTML,
        editingPostId
    };
    if (!draft.title && !draft.content.replace(/<br\s*\/?>/g, '').trim()) { clearDraft(); return; }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    showDraftNotice(true);
}

function restoreDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    document.getElementById('post-title').value = d.title || '';
    document.getElementById('post-category').value = d.category || 'tech';
    document.getElementById('post-excerpt').value = d.excerpt || '';
    document.getElementById('post-tags').value = d.tags || '';
    editorBody.innerHTML = d.content || '';
    editingPostId = d.editingPostId || null;
    if (editingPostId) document.getElementById('editor-heading').textContent = '수정 중 (복원됨)';
    updateCharCount();
    updateImageGallery();
}

function clearDraft() { localStorage.removeItem(DRAFT_KEY); showDraftNotice(false); }
function showDraftNotice(v) { const el = document.getElementById('draft-notice'); if (el) el.style.display = v ? 'flex' : 'none'; }

document.getElementById('restore-draft')?.addEventListener('click', restoreDraft);
document.getElementById('discard-draft')?.addEventListener('click', () => { if (confirm('삭제?')) clearDraft(); });
['post-title', 'post-category', 'post-excerpt', 'post-tags'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', saveDraft);
});

// ========================================
// Utility
// ========================================

function getCategoryName(c) { return { tech: '기술', dev: '개발', life: '일상', issue: '이슈' }[c] || c; }

// ========================================
// Init
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    if (localStorage.getItem(DRAFT_KEY)) showDraftNotice(true);
});
