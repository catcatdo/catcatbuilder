(function () {
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderIssue(issue) {
        var tags = Array.isArray(issue.tags) ? issue.tags : [];
        var points = Array.isArray(issue.action_points) ? issue.action_points : [];
        var comments = Array.isArray(issue.comments) ? issue.comments : [];

        var sourceLink = issue.source_url
            ? '<a href="' + escapeHtml(issue.source_url) + '" target="_blank" rel="noopener">원문 링크</a>'
            : '원문 링크 없음';

        var pointsHtml = points.length
            ? '<ol class="tool-list">' + points.map(function (point) {
                return '<li>' + escapeHtml(point) + '</li>';
            }).join('') + '</ol>'
            : '<p class="small-note">실행 항목이 아직 없습니다.</p>';

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
            : '<div class="small-note">댓글 데이터가 아직 없습니다.</div>';

        return '' +
            '<article class="issue-card" id="issue-' + escapeHtml(issue.id || '') + '">' +
                '<div class="issue-meta">' +
                    '<span>출처: ' + escapeHtml(issue.source_name || '미상') + '</span>' +
                    '<span>작성일: ' + escapeHtml(issue.published_at || '') + '</span>' +
                    '<span>' + sourceLink + '</span>' +
                '</div>' +
                '<h2 class="issue-title">' + escapeHtml(issue.title || '제목 없음') + '</h2>' +
                '<div class="issue-summary">' + escapeHtml(issue.rewritten_body || '') + '</div>' +
                '<div>' +
                    '<h3 class="subsection-title" style="margin-top:0;">문제 해결 포인트</h3>' +
                    pointsHtml +
                '</div>' +
                tagsHtml +
                '<div class="issue-note">저작권 안전 운영: 원문을 직접 재게시하지 않고 핵심 쟁점을 재서술합니다.</div>' +
                '<div>' +
                    '<h3 class="subsection-title" style="margin-top:0;">댓글 흐름 (iMessage UI)</h3>' +
                    '<div class="imessage-wrap">' + commentsHtml + '</div>' +
                '</div>' +
            '</article>';
    }

    function renderIssues() {
        var container = document.getElementById('issues-container');
        if (!container) {
            return;
        }

        var issues = window.ISSUE_THREADS || [];
        if (!Array.isArray(issues) || !issues.length) {
            container.innerHTML = '<div class="empty-issues">이슈 데이터가 아직 없습니다. 커뮤니티 원문/댓글을 보내주시면 즉시 반영할 수 있습니다.</div>';
            return;
        }

        container.innerHTML = issues.map(renderIssue).join('');
    }

    document.addEventListener('DOMContentLoaded', renderIssues);
})();
