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

    function escapeXml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function truncateText(value, maxLength) {
        var str = String(value || '').trim();
        if (str.length <= maxLength) {
            return str;
        }
        return str.slice(0, Math.max(0, maxLength - 1)) + '…';
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

    function extractKeywordsFromVisualSuggestion(value) {
        var text = String(value || '').trim();
        if (!text) {
            return '';
        }

        var match = text.match(/무료\s*스톡\s*키워드\s*:\s*([^.\n]+)/i);
        if (!match || !match[1]) {
            return '';
        }

        return match[1]
            .split(',')
            .map(function (keyword) { return keyword.trim(); })
            .filter(function (keyword) { return keyword.length > 0; })
            .slice(0, 4)
            .join(',');
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

    function buildStockImageUrl(seedBase, salt) {
        var seed = simpleHash(String(seedBase || '') + '|' + String(salt || '')) % 1000000;
        return 'https://picsum.photos/seed/issue-' + seed + '/1280/720';
    }

    function buildInlineFallbackImage(issue) {
        var title = truncateText(resolveCatchyTitle(issue) || 'Issue Brief', 56);
        var insight = truncateText(resolveCuratorInsight(issue) || resolveBody(issue) || '핵심 이슈를 정리한 브리프', 88);
        var tags = Array.isArray(issue.tags) ? issue.tags : [];
        var chip = tags.length ? ('#' + String(tags[0] || '').trim()) : '#ISSUE';
        var dateText = String(issue.published_at || '').slice(0, 10) || 'TODAY';
        var svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Issue cover">' +
                '<defs>' +
                    '<linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">' +
                        '<stop offset="0%" stop-color="#0f172a" />' +
                        '<stop offset="55%" stop-color="#1e3a8a" />' +
                        '<stop offset="100%" stop-color="#0b3b6a" />' +
                    '</linearGradient>' +
                '</defs>' +
                '<rect width="1280" height="720" fill="url(#g1)" />' +
                '<rect x="54" y="54" width="1172" height="612" rx="22" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />' +
                '<text x="96" y="130" fill="#bfdbfe" font-size="30" font-family="Arial, sans-serif">ISSUE BRIEF</text>' +
                '<text x="96" y="198" fill="#ffffff" font-size="54" font-weight="700" font-family="Arial, sans-serif">' + escapeXml(title) + '</text>' +
                '<text x="96" y="258" fill="#dbeafe" font-size="28" font-family="Arial, sans-serif">' + escapeXml(insight) + '</text>' +
                '<rect x="96" y="584" width="260" height="58" rx="29" fill="rgba(255,255,255,0.16)" />' +
                '<text x="130" y="621" fill="#ffffff" font-size="30" font-family="Arial, sans-serif">' + escapeXml(chip) + '</text>' +
                '<text x="1030" y="621" fill="#bfdbfe" font-size="28" font-family="Arial, sans-serif">' + escapeXml(dateText) + '</text>' +
            '</svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    function uniqueNonEmpty(list) {
        var result = [];
        var seen = {};
        (list || []).forEach(function (item) {
            var value = String(item || '').trim();
            if (!value || seen[value]) {
                return;
            }
            seen[value] = true;
            result.push(value);
        });
        return result;
    }

    function resolveImageCandidates(issue) {
        var seedBase = (issue.id || '') + '|' + (resolveCatchyTitle(issue) || issue.title || '');
        var visualSuggestion = resolveVisualSuggestion(issue);
        var prompt = extractPromptFromVisualSuggestion(visualSuggestion);
        var keywordQuery = extractKeywordsFromVisualSuggestion(visualSuggestion) || prompt;
        var directImage = normalizeImageUrl(issue.image);

        var candidates = [];
        if (directImage) {
            candidates.push(directImage);
        }

        if (prompt) {
            candidates.push(buildGeneratedImageUrl(prompt, seedBase));
        }

        if (keywordQuery) {
            candidates.push(buildStockImageUrl(seedBase + '|' + keywordQuery, 'a'));
            candidates.push(buildStockImageUrl(seedBase + '|' + keywordQuery, 'b'));
        } else {
            candidates.push(buildStockImageUrl(seedBase, 'a'));
        }

        candidates.push(buildInlineFallbackImage(issue));
        return uniqueNonEmpty(candidates);
    }

    function hideImage(img) {
        if (!img) {
            return;
        }
        img.style.display = 'none';
        if (img.parentElement) {
            img.parentElement.style.display = 'none';
        }
    }

    function getImageCandidatesFromElement(img) {
        var raw = img.getAttribute('data-candidates') || '';
        if (!raw) {
            return [];
        }
        try {
            var parsed = JSON.parse(decodeURIComponent(raw));
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function advanceImageCandidate(img) {
        var candidates = getImageCandidatesFromElement(img);
        if (!candidates.length) {
            hideImage(img);
            return;
        }

        var currentIndex = parseInt(img.getAttribute('data-candidate-index') || '0', 10);
        if (isNaN(currentIndex)) {
            currentIndex = 0;
        }

        var nextIndex = currentIndex + 1;
        if (nextIndex >= candidates.length) {
            hideImage(img);
            return;
        }

        img.setAttribute('data-candidate-index', String(nextIndex));
        img.src = candidates[nextIndex];
    }

    function registerImageFallbackHandler() {
        window.__issueImageFallback = function (img) {
            advanceImageCandidate(img);
        };
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

        var imageCandidates = resolveImageCandidates(issue);
        var firstImage = imageCandidates.length ? imageCandidates[0] : '';
        var encodedCandidates = imageCandidates.length
            ? encodeURIComponent(JSON.stringify(imageCandidates))
            : '';

        var imageHtml = firstImage
            ? '<div class="issue-image"><img src="' + escapeHtml(firstImage) + '" alt="' + escapeHtml(catchyTitle || '이슈 이미지') + '" loading="lazy" decoding="async" data-candidates="' + escapeHtml(encodedCandidates) + '" data-candidate-index="0" onerror="window.__issueImageFallback && window.__issueImageFallback(this)"></div>'
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

    registerImageFallbackHandler();
    document.addEventListener('DOMContentLoaded', renderIssues);
})();
