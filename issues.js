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

    function isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
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

    function resolveSummaryLines(issue) {
        if (Array.isArray(issue.summary_lines)) {
            return issue.summary_lines
                .map(function (line) { return String(line || '').trim(); })
                .filter(function (line) { return line.length > 0; })
                .slice(0, 3);
        }

        var body = resolveBody(issue);
        if (!body) {
            return [];
        }

        var normalized = body.replace(/\s+/g, ' ').trim();
        var chunks = normalized
            .split(/\.\s+|\!\s+|\?\s+|\n+/)
            .map(function (chunk) { return chunk.trim(); })
            .filter(function (chunk) { return chunk.length > 0; });

        return chunks.slice(0, 3);
    }

    function resolveCuratorInsight(issue) {
        if (isNonEmptyString(issue.curator_insight)) {
            return issue.curator_insight.trim();
        }
        return '';
    }

    function resolveVisualSuggestion(issue) {
        if (isNonEmptyString(issue.visual_suggestion)) {
            return issue.visual_suggestion.trim();
        }
        return '';
    }

    function resolveCatchyTitle(issue) {
        if (isNonEmptyString(issue.catchy_title)) {
            return issue.catchy_title.trim();
        }
        return issue.title || '제목 없음';
    }

    function normalizeImageUrl(value) {
        var url = String(value || '').trim();
        if (!url) {
            return '';
        }
        if (url.indexOf('http://') === 0) {
            return 'https://' + url.slice(7);
        }
        return url;
    }

    function extractPromptFromVisualSuggestion(value) {
        var text = String(value || '').trim();
        if (!text) {
            return '';
        }

        var match = text.match(/생성형\s*프롬프트\s*:\s*["“]?([^"”\n]+)["”]?/i);
        if (match && match[1]) {
            return match[1].trim();
        }

        return text;
    }

    function simpleHash(input) {
        var str = String(input || '');
        var hash = 0;
        for (var i = 0; i < str.length; i += 1) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        return Math.abs(hash);
    }

    function buildGeneratedImageUrl(prompt, seedBase) {
        var cleanPrompt = String(prompt || '').trim();
        if (!cleanPrompt) {
            return '';
        }

        var seed = simpleHash(seedBase || cleanPrompt) % 1000000;
        return 'https://image.pollinations.ai/prompt/' +
            encodeURIComponent(cleanPrompt) +
            '?model=flux&width=1280&height=720&nologo=true&seed=' + seed;
    }

    function resolveDisplayImage(issue) {
        var directImage = normalizeImageUrl(issue.image);
        if (directImage) {
            return directImage;
        }

        var prompt = extractPromptFromVisualSuggestion(resolveVisualSuggestion(issue));
        if (!prompt) {
            return '';
        }

        return buildGeneratedImageUrl(prompt, (issue.id || '') + '|' + (issue.title || ''));
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
            catchy_title: post.title || '제목 없음',
            summary_lines: [],
            curator_insight: '',
            visual_suggestion: '',
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
            catchy_title: resolveCatchyTitle(issue),
            summary_lines: resolveSummaryLines(issue),
            curator_insight: resolveCuratorInsight(issue),
            visual_suggestion: resolveVisualSuggestion(issue),
            rewritten_body: resolveBody(issue),
            tags: Array.isArray(issue.tags) ? issue.tags : [],
            comments: Array.isArray(issue.comments) ? issue.comments : [],
            image: issue.image || ''
        };
    }

    function renderIssue(issue) {
        var catchyTitle = resolveCatchyTitle(issue);
        var summaryLines = resolveSummaryLines(issue);
        var curatorInsight = resolveCuratorInsight(issue);
        var rewrittenBody = resolveBody(issue);
        var tags = Array.isArray(issue.tags) ? issue.tags : [];
        var comments = Array.isArray(issue.comments) ? issue.comments : [];

        var safeImageUrl = resolveDisplayImage(issue);
        var imageHtml = safeImageUrl
            ? '<div class="issue-image"><img src="' + escapeHtml(safeImageUrl) + '" alt="' + escapeHtml(catchyTitle || '이슈 이미지') + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.style.display=&quot;none&quot;;if(this.parentElement){this.parentElement.style.display=&quot;none&quot;;}"></div>'
            : '';

        var tagsHtml = tags.length
            ? '<div class="tag-row">' + tags.map(function (tag) {
                return '<span class="tag-pill">#' + escapeHtml(tag) + '</span>';
            }).join('') + '</div>'
            : '';

        var summaryHtml = summaryLines.length
            ? '<div class="curation-block">' +
                '<h3 class="subsection-title" style="margin-top:0;">[3-Line Summary]</h3>' +
                '<ol class="summary-list">' + summaryLines.map(function (line) {
                    return '<li>' + escapeHtml(line) + '</li>';
                }).join('') + '</ol>' +
              '</div>'
            : '';

        var insightHtml = curatorInsight
            ? '<div class="curation-block">' +
                '<h3 class="subsection-title" style="margin-top:0;">[Curator\'s Insight]</h3>' +
                '<p class="issue-summary issue-block-text">' + escapeHtml(curatorInsight) + '</p>' +
              '</div>'
            : '';

        var bodyHtml = rewrittenBody
            ? '<div class="issue-summary">' + escapeHtml(rewrittenBody) + '</div>'
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
                    '<span>작성일: ' + escapeHtml(issue.published_at || '') + '</span>' +
                '</div>' +
                '<h2 class="issue-title">' + escapeHtml(catchyTitle) + '</h2>' +
                imageHtml +
                bodyHtml +
                summaryHtml +
                insightHtml +
                tagsHtml +
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
