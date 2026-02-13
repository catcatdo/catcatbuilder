(function () {
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function stripHtml(value) {
        return String(value || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function resolveBody(issue) {
        if (issue.rewritten_body && String(issue.rewritten_body).trim()) {
            return String(issue.rewritten_body).trim();
        }
        if (issue.excerpt && String(issue.excerpt).trim()) {
            return String(issue.excerpt).trim();
        }
        if (issue.content) {
            var text = stripHtml(issue.content);
            return text.length > 520 ? text.slice(0, 520) + '...' : text;
        }
        return '';
    }

    function parseDateValue(value) {
        var t = Date.parse(value || '');
        return isNaN(t) ? 0 : t;
    }

    function toIssueFromPost(post) {
        return {
            id: 'post-' + String(post.id || ''),
            title: post.title || '제목 없음',
            source_name: '관리자 작성',
            source_url: '',
            published_at: post.date || '',
            rewritten_body: resolveBody(post),
            tags: Array.isArray(post.tags) ? post.tags : [],
            comments: [],
            image: post.image || ''
        };
    }

    async function loadAdminIssues() {
        try {
            var response = await fetch('posts.json?v=' + Date.now());
            if (!response.ok) {
                return [];
            }
            var data = await response.json();
            var posts = Array.isArray(data.posts) ? data.posts : [];
            return posts
                .filter(function (post) { return post.category === 'issue'; })
                .map(toIssueFromPost);
        } catch (error) {
            console.warn('Failed to load issue posts from posts.json:', error);
            return [];
        }
    }

    function normalizeIssue(issue) {
        return {
            id: issue.id || '',
            title: issue.title || '제목 없음',
            source_name: issue.source_name || '미상',
            source_url: issue.source_url || '',
            published_at: issue.published_at || '',
            rewritten_body: resolveBody(issue),
            tags: Array.isArray(issue.tags) ? issue.tags : [],
            comments: Array.isArray(issue.comments) ? issue.comments : [],
            image: issue.image || ''
        };
    }

    function renderIssue(issue) {
        var tags = Array.isArray(issue.tags) ? issue.tags : [];
        var comments = Array.isArray(issue.comments) ? issue.comments : [];

        var sourceLink = issue.source_url
            ? '<a href="' + escapeHtml(issue.source_url) + '" target="_blank" rel="noopener">원문 링크</a>'
            : '원문 링크 없음';

        var imageHtml = issue.image
            ? '<div class="issue-image"><img src="' + escapeHtml(issue.image) + '" alt="' + escapeHtml(issue.title || '이슈 이미지') + '" loading="lazy"></div>'
            : '';

        var tagsHtml = tags.length
            ? '<div class="tag-row">' + tags.map(function (tag) {
                return '<span class="tag-pill">#' + escapeHtml(tag) + '</span>';
            }).join('') + '</div>'
            : '';

        var commentsHtml = comments.length
            ? comments.map(function (comment) {
                var side = comment.side === 'right' ? 'right' : 'left';
                return '' +
                    '<div class="bubble-row ' + side + '">' +
                        '<div class="bubble ' + side + '">' +
                            '<div>' + escapeHtml(comment.text || '') + '</div>' +
                            '<div class="bubble-meta">' +
                                escapeHtml(comment.author || '익명') + ' · ' +
                                escapeHtml(comment.time || '') +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }).join('')
            : '<div class="small-note">커뮤 반응이 아직 없습니다.</div>';

        return '' +
            '<article class="issue-card" id="issue-' + escapeHtml(issue.id || '') + '">' +
                '<div class="issue-meta">' +
                    '<span>출처: ' + escapeHtml(issue.source_name || '미상') + '</span>' +
                    '<span>작성일: ' + escapeHtml(issue.published_at || '') + '</span>' +
                    '<span>' + sourceLink + '</span>' +
                '</div>' +
                '<h2 class="issue-title">' + escapeHtml(issue.title || '제목 없음') + '</h2>' +
                imageHtml +
                '<div class="issue-summary">' + escapeHtml(issue.rewritten_body || '') + '</div>' +
                tagsHtml +
                '<div class="issue-note">저작권 안전 운영: 원문을 직접 재게시하지 않고 핵심 쟁점을 재서술합니다.</div>' +
                '<div>' +
                    '<h3 class="subsection-title" style="margin-top:0;">커뮤 반응</h3>' +
                    '<div class="reaction-wrap">' + commentsHtml + '</div>' +
                '</div>' +
            '</article>';
    }

    async function renderIssues() {
        var container = document.getElementById('issues-container');
        if (!container) {
            return;
        }

        var staticIssues = Array.isArray(window.ISSUE_THREADS) ? window.ISSUE_THREADS : [];
        var adminIssues = await loadAdminIssues();
        var issues = adminIssues
            .concat(staticIssues)
            .map(normalizeIssue)
            .sort(function (a, b) {
                return parseDateValue(b.published_at) - parseDateValue(a.published_at);
            });

        if (!issues.length) {
            container.innerHTML = '<div class="empty-issues">이슈 데이터가 아직 없습니다. 커뮤니티 원문/댓글을 보내주시면 즉시 반영할 수 있습니다.</div>';
            return;
        }

        container.innerHTML = issues.map(renderIssue).join('');
    }

    document.addEventListener('DOMContentLoaded', renderIssues);
})();
