(function () {
    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderUpdateList(container, updates) {
        if (!container) {
            return;
        }

        if (!Array.isArray(updates) || updates.length === 0) {
            container.innerHTML = '<li class="updates-empty">업데이트 항목이 아직 없습니다.</li>';
            return;
        }

        var limit = parseInt(container.getAttribute('data-updates-limit') || '6', 10);
        var safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 6;

        container.innerHTML = updates.slice(0, safeLimit).map(function (item) {
            var date = escapeHtml(item.date || '날짜 미정');
            var title = escapeHtml(item.title || '업데이트 항목');
            var url = escapeHtml(item.url || 'index.html');
            var category = escapeHtml(item.category || '업데이트');

            return '<li><a href="' + url + '"><strong>[' + category + ']</strong> ' + title + ' <span class="small-note">(' + date + ')</span></a></li>';
        }).join('');
    }

    function loadUpdates() {
        var targets = document.querySelectorAll('[data-updates-feed]');
        if (!targets.length) {
            return;
        }

        fetch('updates.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load updates');
                }
                return response.json();
            })
            .then(function (updates) {
                targets.forEach(function (target) {
                    renderUpdateList(target, updates);
                });
            })
            .catch(function () {
                targets.forEach(function (target) {
                    target.innerHTML = '<li class="updates-empty">업데이트를 불러오지 못했습니다.</li>';
                });
            });
    }

    document.addEventListener('DOMContentLoaded', loadUpdates);
})();
