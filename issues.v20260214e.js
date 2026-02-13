(function () {
    var IMAGE_PROXY_ENDPOINT = 'https://catcatbuilder-admin.catcatdo-bc9.workers.dev/image-proxy?url=';
    var ISSUE_FALLBACK_IMAGE = 'images/issue-fallback.svg';

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

    function decodeHtmlEntities(value) {
        var raw = String(value || '');
        if (!raw) {
            return '';
        }
        var textarea = document.createElement('textarea');
        textarea.innerHTML = raw;
        return textarea.value;
    }

    function normalizeReadableText(value) {
        return decodeHtmlEntities(value)
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function resolveBody(issue) {
        if (issue.rewritten_body && String(issue.rewritten_body).trim()) {
            return normalizeReadableText(issue.rewritten_body);
        }
        if (issue.excerpt && String(issue.excerpt).trim()) {
            return normalizeReadableText(issue.excerpt);
        }
        if (issue.content) {
            var text = normalizeReadableText(stripHtml(issue.content));
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
            return normalizeReadableText(issue.curator_insight);
        }
        return '';
    }

    function resolveVisualSuggestion(issue) {
        if (isNonEmptyString(issue.visual_suggestion)) {
            return normalizeReadableText(issue.visual_suggestion);
        }
        return '';
    }

    function resolveCatchyTitle(issue) {
        if (isNonEmptyString(issue.catchy_title)) {
            return normalizeReadableText(issue.catchy_title);
        }
        return normalizeReadableText(issue.title || '제목 없음');
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

    function getIssueImageVariants(issue) {
        if (!Array.isArray(issue.image_variants)) {
            return [];
        }
        return issue.image_variants
            .map(function (path) { return normalizeImageUrl(path); })
            .filter(function (path) { return path.length > 0; })
            .slice(0, 3);
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

    function normalizeKeywordTokens(value) {
        return String(value || '')
            .split(/[,\n/|]+/)
            .map(function (part) { return part.trim().toLowerCase(); })
            .filter(function (part) { return part.length > 0; })
            .map(function (part) {
                return part.replace(/[^a-z0-9\- ]/g, '').replace(/\s+/g, '-');
            })
            .filter(function (part) { return part.length > 0; })
            .slice(0, 5);
    }

    function buildAutoPrompt(issue, keywordQuery) {
        var promptParts = [];
        var title = resolveCatchyTitle(issue);
        var summaryLines = resolveSummaryLines(issue);
        var tags = Array.isArray(issue.tags) ? issue.tags : [];

        if (keywordQuery) {
            promptParts.push(keywordQuery.replace(/,/g, ', '));
        }
        if (title) {
            promptParts.push(title);
        }
        if (summaryLines.length) {
            promptParts.push(summaryLines[0]);
        }
        if (tags.length) {
            promptParts.push(tags.slice(0, 3).join(', '));
        }

        if (!promptParts.length) {
            return '';
        }

        return 'editorial news photo, documentary style, realistic lighting, no logo, no watermark, no visible text, ' +
            promptParts.join(', ');
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
            '?model=flux&width=1280&height=720&nologo=true&enhance=true&seed=' + seed;
    }

    function buildKeywordStockImageUrl(keywordQuery, seedBase, salt) {
        var tokens = normalizeKeywordTokens(keywordQuery);
        if (!tokens.length) {
            tokens = ['news', 'editorial', 'analysis'];
        }

        var keywordPath = tokens.map(function (token) {
            return encodeURIComponent(token);
        }).join(',');

        var lock = simpleHash(String(seedBase || '') + '|' + String(salt || '')) % 1000000;
        return 'https://loremflickr.com/1280/720/' + keywordPath + '?lock=' + lock;
    }

    function buildInlineFallbackImage(issue) {
        return ISSUE_FALLBACK_IMAGE;
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

    function resolveImageCandidates(issue, slotIndex) {
        var slot = Math.max(0, Number(slotIndex) || 0);
        var directImage = normalizeImageUrl(issue.image);
        var variants = getIssueImageVariants(issue);
        var slotVariant = variants.length ? variants[slot % variants.length] : '';

        var candidates = [];
        if (slot > 0) {
            if (slotVariant) {
                candidates.push(slotVariant);
            }
            variants.forEach(function (variant) {
                candidates.push(variant);
            });
            if (directImage) {
                candidates.push(directImage);
            }
        } else {
            if (directImage) {
                candidates.push(directImage);
            }
            if (slotVariant) {
                candidates.push(slotVariant);
            }
            variants.forEach(function (variant) {
                candidates.push(variant);
            });
        }

        candidates.push(buildInlineFallbackImage(issue));

        return uniqueNonEmpty(candidates);
    }

    function renderIssueInlineImages(issue) {
        var body = resolveBody(issue);
        var summary = resolveSummaryLines(issue);
        var insight = resolveCuratorInsight(issue);
        var contentLength = body.length + insight.length + summary.join(' ').length;
        var imageCount = contentLength > 680 ? 3 : 2;

        var blocks = [];
        for (var i = 1; i <= imageCount; i += 1) {
            var candidates = resolveImageCandidates(issue, i);
            if (!candidates.length) {
                continue;
            }
            var firstImage = candidates[0];
            var encoded = encodeURIComponent(JSON.stringify(candidates));
            blocks.push(
                '<div class="issue-inline-image">' +
                    '<img src="' + escapeHtml(firstImage) + '" alt="' + escapeHtml(resolveCatchyTitle(issue) || '이슈 이미지') + ' ' + i + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-candidates="' + escapeHtml(encoded) + '" onerror="this.onerror=null;this.src=\'' + ISSUE_FALLBACK_IMAGE + '\';">' +
                '</div>'
            );
        }

        if (!blocks.length) {
            return '';
        }
        return '<div class="issue-inline-gallery">' + blocks.join('') + '</div>';
    }

    function decodeCandidates(raw) {
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

    function blobToDataUrl(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('blob->dataURL failed')); };
            reader.readAsDataURL(blob);
        });
    }

    async function fetchRemoteImageAsDataUrl(url) {
        var target = normalizeImageUrl(url);
        if (!/^https?:\/\//i.test(target)) {
            throw new Error('not remote url');
        }

        async function fetchBlob(fetchUrl) {
            var response = await fetch(fetchUrl, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) {
                throw new Error('http ' + response.status);
            }
            var blob = await response.blob();
            if (!blob || !blob.type || blob.type.indexOf('image/') !== 0) {
                throw new Error('not image response');
            }
            return blob;
        }

        try {
            var directBlob = await fetchBlob(target);
            return await blobToDataUrl(directBlob);
        } catch (directError) {
            var proxyUrl = IMAGE_PROXY_ENDPOINT + encodeURIComponent(target);
            var proxiedBlob = await fetchBlob(proxyUrl);
            return await blobToDataUrl(proxiedBlob);
        }
    }

    function canUseLocalImage(url) {
        var target = String(url || '').trim();
        if (!target) {
            return Promise.reject(new Error('empty'));
        }
        return new Promise(function (resolve, reject) {
            var tester = new Image();
            tester.loading = 'eager';
            tester.decoding = 'async';
            tester.onload = function () { resolve(target); };
            tester.onerror = function () { reject(new Error('local not loadable')); };
            tester.src = target;
        });
    }

    async function enhanceIssueImages(container) {
        if (!container) {
            return;
        }

        var images = container.querySelectorAll('img[data-candidates]');
        for (var i = 0; i < images.length; i += 1) {
            var img = images[i];
            var candidates = decodeCandidates(img.getAttribute('data-candidates'));
            if (!candidates.length) {
                continue;
            }

            for (var j = 0; j < candidates.length; j += 1) {
                var candidate = String(candidates[j] || '').trim();
                if (!candidate) {
                    continue;
                }
                try {
                    await canUseLocalImage(candidate);
                    img.src = candidate;
                    break;
                } catch (error) {
                    // Try next candidate.
                }
            }
        }
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
            catchy_title: post.catchy_title || post.title || '제목 없음',
            summary_lines: Array.isArray(post.summary_lines) ? post.summary_lines : [],
            curator_insight: post.curator_insight || '',
            visual_suggestion: post.visual_suggestion || '',
            rewritten_body: resolveBody(post),
            tags: Array.isArray(post.tags) ? post.tags : [],
            comments: Array.isArray(post.comments) ? post.comments : [],
            image: post.image || '',
            image_variants: Array.isArray(post.image_variants) ? post.image_variants : []
        };
    }

    async function loadAdminIssues() {
        try {
            var response = await fetch('posts.json?v=' + Date.now(), { cache: 'no-store' });
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
            image: issue.image || '',
            image_variants: getIssueImageVariants(issue)
        };
    }

    function renderIssue(issue) {
        var catchyTitle = resolveCatchyTitle(issue);
        var summaryLines = resolveSummaryLines(issue);
        var curatorInsight = resolveCuratorInsight(issue);
        var rewrittenBody = resolveBody(issue);
        var tags = Array.isArray(issue.tags) ? issue.tags : [];
        var comments = Array.isArray(issue.comments) ? issue.comments : [];

        var imageCandidates = resolveImageCandidates(issue, 0);
        var encodedCandidates = imageCandidates.length
            ? encodeURIComponent(JSON.stringify(imageCandidates))
            : '';
        var firstImage = imageCandidates.length ? imageCandidates[0] : '';

        var imageHtml = firstImage
            ? '<div class="issue-image"><img src="' + escapeHtml(firstImage) + '" alt="' + escapeHtml(catchyTitle || '이슈 이미지') + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-candidates="' + escapeHtml(encodedCandidates) + '" onerror="this.onerror=null;this.src=\'' + ISSUE_FALLBACK_IMAGE + '\';"></div>'
            : '';

        var tagsHtml = tags.length
            ? '<div class="tag-row">' + tags.map(function (tag) {
                return '<span class="tag-pill">#' + escapeHtml(tag) + '</span>';
            }).join('') + '</div>'
            : '';

        var summaryHtml = summaryLines.length
            ? '<div class="curation-block">' +
                '<h3 class="subsection-title" style="margin-top:0;">세줄요약</h3>' +
                '<ol class="summary-list">' + summaryLines.map(function (line) {
                    return '<li>' + escapeHtml(line) + '</li>';
                }).join('') + '</ol>' +
              '</div>'
            : '';

        var insightHtml = curatorInsight
            ? '<div class="curation-block">' +
                '<h3 class="subsection-title" style="margin-top:0;">릴황생각</h3>' +
                '<p class="issue-summary issue-block-text">' + escapeHtml(curatorInsight) + '</p>' +
              '</div>'
            : '';

        var bodyHtml = rewrittenBody
            ? '<div class="issue-summary">' + escapeHtml(rewrittenBody) + '</div>'
            : '';
        var inlineImageHtml = renderIssueInlineImages(issue);

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
                inlineImageHtml +
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
        enhanceIssueImages(container);
    }

    document.addEventListener('DOMContentLoaded', renderIssues);
})();
