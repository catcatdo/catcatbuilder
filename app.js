// ========================================
// Utility Functions
// ========================================

function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('active');
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('active');
}

function showError(element, message) {
    element.innerHTML = message;
    element.className = 'result-box error';
}

function showSuccess(element, message) {
    element.innerHTML = message;
    element.className = 'result-box success';
}

function showWarning(element, message) {
    element.innerHTML = message;
    element.className = 'result-box warning';
}

async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API 요청 실패');
        return await response.json();
    } catch (error) {
        throw new Error('네트워크 오류가 발생했습니다.');
    }
}

function copyToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        return;
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
}

function getTextFromTextarea(id) {
    const el = document.getElementById(id);
    return el ? el.value || '' : '';
}

function setOutputText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function utf8ToBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function base64ToUtf8(text) {
    return decodeURIComponent(escape(atob(text)));
}

function initThemeToggle() {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    const icon = toggleButton.querySelector('.theme-icon');

    function updateThemeUI(theme) {
        const isDark = theme === 'dark';
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        toggleButton.setAttribute('aria-label', isDark ? '라이트 모드 전환' : '다크 모드 전환');
    }

    function persistTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme-preference', theme);
        } catch (error) {
            // Ignore storage errors (private mode / quota) and keep runtime theme only.
        }
    }

    let currentTheme = document.documentElement.getAttribute('data-theme');
    if (!currentTheme) {
        try {
            currentTheme = localStorage.getItem('theme-preference') || 'light';
        } catch (error) {
            currentTheme = 'light';
        }
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    updateThemeUI(currentTheme);

    toggleButton.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        persistTheme(nextTheme);
        updateThemeUI(nextTheme);
    });
}

// ========================================
// Tab Navigation
// ========================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (!tabButtons.length || !tabContents.length) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-content`).classList.add('active');

            // Update URL hash
            window.location.hash = targetTab;
        });
    });

    // Handle initial hash
    const hash = window.location.hash.substring(1);
    if (hash && ['tools', 'widgets', 'games'].includes(hash)) {
        const targetButton = document.querySelector(`[data-tab="${hash}"]`);
        if (targetButton) targetButton.click();
    }
}

// ========================================
// Tool Search
// ========================================

function initToolSearch() {
    const input = document.getElementById('tool-search');
    const count = document.getElementById('tool-search-count');
    if (!input || !count) return;

    const cards = Array.from(document.querySelectorAll('.tool-card'));

    function update(query) {
        const q = query.trim().toLowerCase();
        let visible = 0;

        cards.forEach(card => {
            const title = (card.dataset.title || '').toLowerCase();
            const keywords = (card.dataset.keywords || '').toLowerCase();
            const match = !q || title.includes(q) || keywords.includes(q);
            card.classList.toggle('is-hidden', !match);
            if (match) visible += 1;
        });

        if (q) {
            document.body.classList.add('searching');
            count.textContent = `${visible}개 결과`;
        } else {
            document.body.classList.remove('searching');
            count.textContent = '';
        }
    }

    input.addEventListener('input', () => update(input.value));
}

// ========================================
// BMI Calculator
// ========================================

function initBMICalculator() {
    const calcBtn = document.getElementById('calc-bmi');
    const resultDiv = document.getElementById('bmi-result');
    if (!calcBtn || !resultDiv) return;

    calcBtn.addEventListener('click', () => {
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);

        if (!height || !weight || height <= 0 || weight <= 0) {
            showError(resultDiv, '올바른 키와 몸무게를 입력하세요.');
            return;
        }

        const heightM = height / 100;
        const bmi = (weight / (heightM * heightM)).toFixed(1);

        let category = '';
        let className = '';

        if (bmi < 18.5) {
            category = '저체중';
            className = 'warning';
        } else if (bmi < 23) {
            category = '정상';
            className = 'success';
        } else if (bmi < 25) {
            category = '과체중';
            className = 'warning';
        } else {
            category = '비만';
            className = 'error';
        }

        resultDiv.className = `result-box ${className}`;
        resultDiv.innerHTML = `
            <div>
                <strong>BMI: ${bmi}</strong><br>
                상태: ${category}
            </div>
        `;
    });
}

// ========================================
// Currency Converter
// ========================================

let exchangeRates = null;

async function loadExchangeRates() {
    if (!exchangeRates) {
        const data = await fetchAPI('https://api.exchangerate-api.com/v4/latest/USD');
        exchangeRates = data.rates;
    }
    return exchangeRates;
}

function initCurrencyConverter() {
    const convertBtn = document.getElementById('convert-currency');
    const resultDiv = document.getElementById('currency-result');
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    if (!convertBtn || !resultDiv || !amountInput || !fromSelect || !toSelect) return;

    convertBtn.addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;

        if (!amount || amount <= 0) {
            showError(resultDiv, '올바른 금액을 입력하세요.');
            return;
        }

        showLoading();

        try {
            const rates = await loadExchangeRates();

            // Convert to USD first, then to target currency
            const amountInUSD = amount / rates[fromCurrency];
            const result = (amountInUSD * rates[toCurrency]).toFixed(2);

            hideLoading();
            showSuccess(resultDiv, `
                <div>
                    <strong>${amount} ${fromCurrency}</strong> =<br>
                    <strong style="font-size: 18px;">${result} ${toCurrency}</strong>
                </div>
            `);
        } catch (error) {
            hideLoading();
            showError(resultDiv, '환율 정보를 불러오지 못했습니다.');
        }
    });
}

// ========================================
// Todo List
// ========================================

function initTodoList() {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    if (!todoInput || !addBtn || !todoList) return;

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos') || '[]');

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}">
                <span class="todo-text">${todo.text}</span>
                <button class="todo-delete" data-index="${index}">삭제</button>
            `;
            todoList.appendChild(li);
        });

        // Add event listeners
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                todos[index].completed = e.target.checked;
                saveTodos();
                renderTodos();
            });
        });

        document.querySelectorAll('.todo-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
            });
        });
    }

    addBtn.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text, completed: false });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    });

    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });

    renderTodos();
}

// ========================================
// VAT Calculator
// ========================================

function initVATCalculator() {
    const calcBtn = document.getElementById('calc-vat');
    const resultDiv = document.getElementById('vat-result');
    const amountInput = document.getElementById('vat-amount');
    const modeSelect = document.getElementById('vat-mode');
    if (!calcBtn || !resultDiv || !amountInput || !modeSelect) return;

    calcBtn.addEventListener('click', () => {
        const mode = document.getElementById('vat-mode').value;
        const amount = parseFloat(document.getElementById('vat-amount').value);

        if (!amount || amount <= 0) {
            showError(resultDiv, '금액을 입력하세요.');
            return;
        }

        let supplyPrice, vat, total;

        if (mode === 'add') {
            // 공급가액에서 부가세 추가
            supplyPrice = amount;
            vat = Math.round(amount * 0.1);
            total = supplyPrice + vat;
        } else {
            // 총액에서 공급가액과 부가세 분리
            total = amount;
            supplyPrice = Math.round(amount / 1.1);
            vat = total - supplyPrice;
        }

        showSuccess(resultDiv, `
            <div style="text-align: left; width: 100%;">
                <strong style="font-size: 16px;">계산 결과</strong><br><br>
                공급가액: <strong>${supplyPrice.toLocaleString()}원</strong><br>
                부가세 (10%): <strong>${vat.toLocaleString()}원</strong><br>
                <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
                총액: <strong style="font-size: 18px; color: #3498db;">${total.toLocaleString()}원</strong>
            </div>
        `);
    });
}

// ========================================
// IP Address Checker
// ========================================

function initIPChecker() {
    const checkBtn = document.getElementById('check-ip');
    const resultDiv = document.getElementById('ip-result');
    if (!checkBtn || !resultDiv) return;

    checkBtn.addEventListener('click', async () => {
        showLoading();

        try {
            // Using ipapi.co for more detailed information
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            hideLoading();
            showSuccess(resultDiv, `
                <div style="text-align: left; width: 100%;">
                    <strong style="font-size: 18px;">🌐 ${data.ip}</strong><br><br>
                    📍 위치: ${data.city || 'N/A'}, ${data.region || 'N/A'}<br>
                    🏴 국가: ${data.country_name || 'N/A'} (${data.country_code || 'N/A'})<br>
                    🏢 ISP: ${data.org || 'N/A'}<br>
                    ${data.timezone ? `⏰ 시간대: ${data.timezone}` : ''}
                </div>
            `);
        } catch (error) {
            hideLoading();
            // Fallback to simpler API
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                showSuccess(resultDiv, `
                    <div>
                        <strong style="font-size: 20px;">🌐 ${data.ip}</strong><br>
                        <small>외부 IP 주소</small>
                    </div>
                `);
            } catch (fallbackError) {
                showError(resultDiv, 'IP 정보를 불러오지 못했습니다.');
            }
        }
    });
}

// ========================================
// Ping Test
// ========================================

function initPingTest() {
    const startBtn = document.getElementById('start-ping');
    const resultDiv = document.getElementById('ping-result');
    const urlInput = document.getElementById('ping-url');
    if (!startBtn || !resultDiv || !urlInput) return;

    const defaultUrls = [
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'Cloudflare', url: 'https://www.cloudflare.com' },
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'Naver', url: 'https://www.naver.com' }
    ];

    async function pingUrl(name, url) {
        const start = performance.now();
        try {
            await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            const end = performance.now();
            return { name, time: Math.round(end - start), success: true };
        } catch (error) {
            return { name, time: 0, success: false };
        }
    }

    startBtn.addEventListener('click', async () => {
        const customUrl = document.getElementById('ping-url').value.trim();
        let urlsToTest = [...defaultUrls];

        if (customUrl) {
            urlsToTest.unshift({ name: 'Custom URL', url: customUrl });
        }

        showLoading();
        resultDiv.innerHTML = '<p>핑 테스트 진행 중...</p>';

        const results = await Promise.all(
            urlsToTest.map(({ name, url }) => pingUrl(name, url))
        );

        hideLoading();

        let html = '<div style="text-align: left; width: 100%;">';
        html += '<strong style="font-size: 16px;">📡 핑 테스트 결과</strong><br><br>';

        results.forEach(result => {
            const statusIcon = result.success ? '✅' : '❌';
            const timeText = result.success ? `${result.time}ms` : '실패';
            const color = result.time < 100 ? '#27ae60' : result.time < 300 ? '#f39c12' : '#e74c3c';

            html += `${statusIcon} <strong>${result.name}</strong>: `;
            html += `<span style="color: ${color};">${timeText}</span><br>`;
        });

        html += '</div>';
        resultDiv.innerHTML = html;
        resultDiv.className = 'result-box success ping-results';
    });
}

// ========================================
// Weather Widget
// ========================================

function initWeatherWidget() {
    const getWeatherBtn = document.getElementById('get-weather');
    const resultDiv = document.getElementById('weather-result');
    const cityInput = document.getElementById('city');
    if (!getWeatherBtn || !resultDiv || !cityInput) return;

    getWeatherBtn.addEventListener('click', async () => {
        const city = document.getElementById('city').value.trim();

        if (!city) {
            showError(resultDiv, '도시명을 입력하세요.');
            return;
        }

        showLoading();

        try {
            const data = await fetchAPI(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);

            const current = data.current_condition[0];
            const temp = current.temp_C;
            const desc = current.weatherDesc[0].value;
            const humidity = current.humidity;
            const windSpeed = current.windspeedKmph;

            hideLoading();
            showSuccess(resultDiv, `
                <div style="text-align: left; width: 100%;">
                    <strong style="font-size: 18px;">${city}</strong><br>
                    🌡️ 온도: ${temp}°C<br>
                    ☁️ 날씨: ${desc}<br>
                    💧 습도: ${humidity}%<br>
                    💨 풍속: ${windSpeed} km/h
                </div>
            `);
        } catch (error) {
            hideLoading();
            showError(resultDiv, '날씨 정보를 불러오지 못했습니다. 도시명을 확인하세요.');
        }
    });
}

// ========================================
// Cryptocurrency Prices
// ========================================

function initCryptoWidget() {
    const getCryptoBtn = document.getElementById('get-crypto');
    const resultDiv = document.getElementById('crypto-result');
    if (!getCryptoBtn || !resultDiv) return;

    getCryptoBtn.addEventListener('click', async () => {
        showLoading();

        try {
            const data = await fetchAPI('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,cardano,dogecoin&vs_currencies=usd');

            hideLoading();

            const cryptoNames = {
                'bitcoin': 'Bitcoin (BTC)',
                'ethereum': 'Ethereum (ETH)',
                'ripple': 'Ripple (XRP)',
                'cardano': 'Cardano (ADA)',
                'dogecoin': 'Dogecoin (DOGE)'
            };

            let html = '';
            for (const [id, info] of Object.entries(data)) {
                html += `
                    <div class="crypto-item">
                        <span class="crypto-name">${cryptoNames[id]}</span>
                        <span class="crypto-price">$${info.usd.toLocaleString()}</span>
                    </div>
                `;
            }

            resultDiv.innerHTML = html;
            resultDiv.className = 'result-box crypto-grid success';
        } catch (error) {
            hideLoading();
            showError(resultDiv, '암호화폐 시세를 불러오지 못했습니다.');
        }
    });
}

// ========================================
// Password Generator
// ========================================

function initPasswordGenerator() {
    const lengthSlider = document.getElementById('pw-length');
    const lengthVal = document.getElementById('pw-length-val');
    const generateBtn = document.getElementById('generate-pw');
    const resultDiv = document.getElementById('pw-result');
    if (!lengthSlider || !generateBtn || !resultDiv) return;

    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
    });

    generateBtn.addEventListener('click', () => {
        const length = parseInt(lengthSlider.value);
        const useUpper = document.getElementById('pw-upper').checked;
        const useLower = document.getElementById('pw-lower').checked;
        const useNumbers = document.getElementById('pw-numbers').checked;
        const useSymbols = document.getElementById('pw-symbols').checked;

        let chars = '';
        if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (useNumbers) chars += '0123456789';
        if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) {
            showError(resultDiv, '최소 하나의 문자 유형을 선택하세요.');
            return;
        }

        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }

        const strength = getPasswordStrength(password);
        resultDiv.className = 'result-box success';
        resultDiv.innerHTML = `
            <div style="word-break:break-all;font-family:monospace;font-size:16px;margin-bottom:8px;">${password}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="pw-strength ${strength.cls}">${strength.label}</span>
                <button class="btn btn-secondary btn-small" onclick="copyToClipboard('${password}');this.textContent='복사됨!';">복사</button>
            </div>
        `;
    });

    function getPasswordStrength(pw) {
        let score = 0;
        if (pw.length >= 12) score++;
        if (pw.length >= 20) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^a-zA-Z0-9]/.test(pw)) score++;
        if (score <= 2) return { label: '보통', cls: 'strength-medium' };
        if (score <= 3) return { label: '강함', cls: 'strength-strong' };
        return { label: '매우 강함', cls: 'strength-very-strong' };
    }
}

// ========================================
// QR Code Generator
// ========================================

function initQRCodeGenerator() {
    const generateBtn = document.getElementById('generate-qr');
    const textInput = document.getElementById('qr-text');
    const resultDiv = document.getElementById('qr-result');
    if (!generateBtn || !textInput || !resultDiv) return;

    generateBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            showError(resultDiv, '텍스트 또는 URL을 입력하세요.');
            return;
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        resultDiv.className = 'result-box success';
        resultDiv.innerHTML = `
            <img src="${qrUrl}" alt="QR Code" style="max-width:200px;margin:8px auto;display:block;">
            <div style="margin-top:8px;text-align:center;">
                <a href="${qrUrl}" download="qrcode.png" class="btn btn-secondary btn-small">다운로드</a>
            </div>
        `;
    });

    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateBtn.click();
    });
}

// ========================================
// D-Day Counter
// ========================================

function initDDayCounter() {
    const calcBtn = document.getElementById('calc-dday');
    const dateInput = document.getElementById('dday-date');
    const nameInput = document.getElementById('dday-name');
    const resultDiv = document.getElementById('dday-result');
    if (!calcBtn || !dateInput || !resultDiv) return;

    calcBtn.addEventListener('click', () => {
        const targetDate = dateInput.value;
        if (!targetDate) {
            showError(resultDiv, '날짜를 선택하세요.');
            return;
        }

        const target = new Date(targetDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffMs = target - today;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const eventName = nameInput.value.trim() || '목표일';

        let message;
        if (diffDays > 0) {
            message = `
                <div style="text-align:center;">
                    <div style="font-size:14px;color:var(--text-secondary);">${eventName}까지</div>
                    <div style="font-size:36px;font-weight:bold;color:var(--primary);margin:8px 0;">D-${diffDays}</div>
                    <div style="font-size:13px;color:var(--text-secondary);">${target.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
                </div>
            `;
        } else if (diffDays === 0) {
            message = `
                <div style="text-align:center;">
                    <div style="font-size:36px;font-weight:bold;color:var(--primary);margin:8px 0;">D-Day!</div>
                    <div style="font-size:14px;">오늘이 바로 ${eventName}입니다!</div>
                </div>
            `;
        } else {
            message = `
                <div style="text-align:center;">
                    <div style="font-size:14px;color:var(--text-secondary);">${eventName}로부터</div>
                    <div style="font-size:36px;font-weight:bold;color:var(--color-accent);margin:8px 0;">D+${Math.abs(diffDays)}</div>
                    <div style="font-size:13px;color:var(--text-secondary);">${target.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
                </div>
            `;
        }
        resultDiv.className = 'result-box success';
        resultDiv.innerHTML = message;
    });
}

// ========================================
// Unit Converter
// ========================================

function initUnitConverter() {
    const typeSelect = document.getElementById('unit-type');
    const fromSelect = document.getElementById('unit-from');
    const toSelect = document.getElementById('unit-to');
    const valueInput = document.getElementById('unit-value');
    const convertBtn = document.getElementById('convert-unit');
    const resultDiv = document.getElementById('unit-result');
    if (!typeSelect || !fromSelect || !toSelect || !convertBtn || !resultDiv) return;

    const units = {
        length: {
            mm: { label: '밀리미터 (mm)', factor: 0.001 },
            cm: { label: '센티미터 (cm)', factor: 0.01 },
            m: { label: '미터 (m)', factor: 1 },
            km: { label: '킬로미터 (km)', factor: 1000 },
            inch: { label: '인치 (in)', factor: 0.0254 },
            ft: { label: '피트 (ft)', factor: 0.3048 },
            mile: { label: '마일 (mi)', factor: 1609.344 }
        },
        weight: {
            mg: { label: '밀리그램 (mg)', factor: 0.001 },
            g: { label: '그램 (g)', factor: 1 },
            kg: { label: '킬로그램 (kg)', factor: 1000 },
            lb: { label: '파운드 (lb)', factor: 453.592 },
            oz: { label: '온스 (oz)', factor: 28.3495 },
            ton: { label: '톤 (t)', factor: 1000000 }
        },
        temperature: {
            celsius: { label: '섭씨 (°C)' },
            fahrenheit: { label: '화씨 (°F)' },
            kelvin: { label: '켈빈 (K)' }
        }
    };

    function populateSelects() {
        const type = typeSelect.value;
        const unitList = units[type];
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        for (const [key, val] of Object.entries(unitList)) {
            fromSelect.innerHTML += `<option value="${key}">${val.label}</option>`;
            toSelect.innerHTML += `<option value="${key}">${val.label}</option>`;
        }
        if (toSelect.options.length > 1) toSelect.selectedIndex = 1;
    }

    typeSelect.addEventListener('change', populateSelects);
    populateSelects();

    convertBtn.addEventListener('click', () => {
        const value = parseFloat(valueInput.value);
        if (isNaN(value)) {
            showError(resultDiv, '숫자를 입력하세요.');
            return;
        }

        const type = typeSelect.value;
        const from = fromSelect.value;
        const to = toSelect.value;
        let result;

        if (type === 'temperature') {
            result = convertTemperature(value, from, to);
        } else {
            const fromFactor = units[type][from].factor;
            const toFactor = units[type][to].factor;
            result = (value * fromFactor) / toFactor;
        }

        const formatted = Number.isInteger(result) ? result : result.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
        resultDiv.className = 'result-box success';
        resultDiv.innerHTML = `
            <div style="text-align:center;font-size:18px;">
                <strong>${value}</strong> ${units[type][from].label} = <strong>${formatted}</strong> ${units[type][to].label}
            </div>
        `;
    });

    function convertTemperature(val, from, to) {
        if (from === to) return val;
        let celsius;
        if (from === 'celsius') celsius = val;
        else if (from === 'fahrenheit') celsius = (val - 32) * 5 / 9;
        else celsius = val - 273.15;

        if (to === 'celsius') return celsius;
        if (to === 'fahrenheit') return celsius * 9 / 5 + 32;
        return celsius + 273.15;
    }
}

// ========================================
// Random Quote Generator
// ========================================

function initQuoteGenerator() {
    const getQuoteBtn = document.getElementById('get-quote');
    const resultDiv = document.getElementById('quote-result');
    if (!getQuoteBtn || !resultDiv) return;

    const quotes = [
        { content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { content: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
        { content: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
        { content: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
        { content: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
        { content: 'The purpose of our lives is to be happy.', author: 'Dalai Lama' },
        { content: 'Get busy living or get busy dying.', author: 'Stephen King' },
        { content: 'You only live once, but if you do it right, once is enough.', author: 'Mae West' },
        { content: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
        { content: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
        { content: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
        { content: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
        { content: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
        { content: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
        { content: 'The best error message is the one that never shows up.', author: 'Thomas Fuchs' },
        { content: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
        { content: 'Before software can be reusable it first has to be usable.', author: 'Ralph Johnson' },
        { content: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
        { content: 'Code is like humor. When you have to explain it, it\'s bad.', author: 'Cory House' },
        { content: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' }
    ];

    getQuoteBtn.addEventListener('click', () => {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        resultDiv.className = 'result-box quote-box success';
        resultDiv.innerHTML = `
            <div class="quote-text">"${quote.content}"</div>
            <div class="quote-author">— ${quote.author}</div>
        `;
    });
}

// ========================================
// Stock Widget
// ========================================

function initStockWidget() {
    const usList = document.getElementById('us-stock-list');
    const krList = document.getElementById('kr-stock-list');
    const updatedEl = document.getElementById('stock-updated');
    const refreshUs = document.getElementById('refresh-us-stocks');
    const refreshKr = document.getElementById('refresh-kr-stocks');
    const usMarketStatus = document.getElementById('us-market-status');
    const krMarketStatus = document.getElementById('kr-market-status');
    if (!usList || !krList || !updatedEl) return;

    const STOCKS_ENDPOINT = 'https://catcatbuilder-admin.catcatdo-bc9.workers.dev/most-active-stocks';

    function renderLoading(container) {
        container.innerHTML = '<div class="stock-row">불러오는 중...</div>';
    }

    function renderError(container) {
        container.innerHTML = '<div class="stock-row">가격 정보를 불러오지 못했습니다.</div>';
    }

    function renderList(container, list, quotesBySymbol) {
        container.innerHTML = list.map(item => {
            const quote = quotesBySymbol[item.symbol];
            if (!quote) {
                return `
                    <div class="stock-row">
                        <div class="stock-name">
                            <span>${item.name}</span>
                            <span class="stock-symbol">${item.symbol}</span>
                        </div>
                        <div class="stock-price">-</div>
                        <div class="stock-change">-</div>
                    </div>
                `;
            }
            const price = quote.regularMarketPrice ?? quote.postMarketPrice ?? quote.preMarketPrice;
            const change = quote.regularMarketChange ?? 0;
            const changePercent = quote.regularMarketChangePercent ?? 0;
            const changeClass = change >= 0 ? 'positive' : 'negative';
            return `
                <div class="stock-row">
                    <div class="stock-name">
                        <span>${item.name}</span>
                        <span class="stock-symbol">${item.symbol}</span>
                    </div>
                    <div class="stock-price">${price !== undefined ? price.toLocaleString() : '-'}</div>
                    <div class="stock-change ${changeClass}">
                        ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)
                    </div>
                </div>
            `;
        }).join('');
    }

    function getMarketStatus(timeZone, openMinute, closeMinute, name) {
        const dtf = new Intl.DateTimeFormat('en-US', {
            timeZone,
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const parts = dtf.formatToParts(new Date());
        const weekday = parts.find(p => p.type === 'weekday')?.value || '';
        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
        const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
        const minutes = hour * 60 + minute;
        const isWeekend = weekday === 'Sat' || weekday === 'Sun';
        const isOpen = !isWeekend && minutes >= openMinute && minutes < closeMinute;
        return `${name}: ${isOpen ? '거래 중' : '휴장'} (현지 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')})`;
    }

    async function loadStocks() {
        renderLoading(usList);
        renderLoading(krList);
        try {
            const response = await fetch(STOCKS_ENDPOINT);
            if (!response.ok) throw new Error('Stocks fetch failed');
            const data = await response.json();
            const usItems = Array.isArray(data.us) ? data.us : [];
            const krItems = Array.isArray(data.kr) ? data.kr : [];
            const map = {};
            [...usItems, ...krItems].forEach(item => {
                if (!item || !item.symbol) return;
                map[item.symbol] = {
                    regularMarketPrice: item.price,
                    regularMarketChange: item.change,
                    regularMarketChangePercent: item.changePercent
                };
            });
            renderList(usList, usItems, map);
            renderList(krList, krItems, map);
            updatedEl.textContent = `업데이트: ${new Date().toLocaleString('ko-KR')}`;
            if (usMarketStatus) {
                usMarketStatus.textContent = `${getMarketStatus('America/New_York', 9 * 60 + 30, 16 * 60, '미국 시장')} · 휴장일 미반영`;
            }
            if (krMarketStatus) {
                krMarketStatus.textContent = `${getMarketStatus('Asia/Seoul', 9 * 60, 15 * 60 + 30, '한국 시장')} · 휴장일 미반영`;
            }
        } catch (error) {
            renderError(usList);
            renderError(krList);
            updatedEl.textContent = '업데이트 실패';
        }
    }

    refreshUs?.addEventListener('click', loadStocks);
    refreshKr?.addEventListener('click', loadStocks);

    loadStocks();
    setInterval(loadStocks, 5 * 60 * 1000);
}

// ========================================
// Number Guessing Game
// ========================================

function initNumberGuessingGame() {
    let targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const restartBtn = document.getElementById('restart-guess');
    const resultDiv = document.getElementById('guess-result');
    const attemptsDiv = document.getElementById('guess-attempts');
    if (!guessInput || !guessBtn || !restartBtn || !resultDiv || !attemptsDiv) return;

    function updateAttempts() {
        attemptsDiv.textContent = `시도 횟수: ${attempts}`;
    }

    function makeGuess() {
        const guess = parseInt(guessInput.value);

        if (!guess || guess < 1 || guess > 100) {
            showError(resultDiv, '1부터 100 사이의 숫자를 입력하세요.');
            return;
        }

        attempts++;
        updateAttempts();

        if (guess === targetNumber) {
            showSuccess(resultDiv, `🎉 정답입니다! ${attempts}번 만에 맞추셨습니다!`);
            guessBtn.disabled = true;
        } else if (guess < targetNumber) {
            showWarning(resultDiv, '⬆️ 더 큰 숫자입니다!');
        } else {
            showWarning(resultDiv, '⬇️ 더 작은 숫자입니다!');
        }

        guessInput.value = '';
    }

    guessBtn.addEventListener('click', makeGuess);

    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            makeGuess();
        }
    });

    restartBtn.addEventListener('click', () => {
        targetNumber = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        guessInput.value = '';
        resultDiv.innerHTML = '';
        resultDiv.className = 'result-box';
        updateAttempts();
        guessBtn.disabled = false;
    });

    updateAttempts();
}

// ========================================
// Rock Paper Scissors Game
// ========================================

function initRockPaperScissors() {
    let score = { player: 0, computer: 0, draws: 0 };
    const choices = ['rock', 'paper', 'scissors'];
    const choiceEmoji = { rock: '✊', paper: '✋', scissors: '✌️' };
    const choiceName = { rock: '바위', paper: '보', scissors: '가위' };

    const buttons = document.querySelectorAll('.rps-buttons .btn-game');
    const resultDiv = document.getElementById('rps-result');
    const scoreDiv = document.getElementById('rps-score');
    if (!buttons.length || !resultDiv || !scoreDiv) return;

    function updateScore() {
        scoreDiv.textContent = `승: ${score.player} | 무: ${score.draws} | 패: ${score.computer}`;
    }

    function getWinner(player, computer) {
        if (player === computer) return 'draw';
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'player';
        }
        return 'computer';
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const playerChoice = button.dataset.choice;
            const computerChoice = choices[Math.floor(Math.random() * 3)];
            const winner = getWinner(playerChoice, computerChoice);

            let message = `
                당신: ${choiceEmoji[playerChoice]} ${choiceName[playerChoice]}<br>
                컴퓨터: ${choiceEmoji[computerChoice]} ${choiceName[computerChoice]}<br><br>
            `;

            if (winner === 'draw') {
                message += '🤝 무승부!';
                score.draws++;
                showWarning(resultDiv, message);
            } else if (winner === 'player') {
                message += '🎉 승리!';
                score.player++;
                showSuccess(resultDiv, message);
            } else {
                message += '😢 패배!';
                score.computer++;
                showError(resultDiv, message);
            }

            updateScore();
        });
    });

    updateScore();
}

// ========================================
// Color Palette Generator
// ========================================

function initColorPaletteGenerator() {
    const generateBtn = document.getElementById('generate-palette');
    const paletteDiv = document.getElementById('color-palette');
    if (!generateBtn || !paletteDiv) return;

    function generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    function generatePalette() {
        paletteDiv.innerHTML = '';

        for (let i = 0; i < 5; i++) {
            const color = generateRandomColor();
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color;
            colorBox.innerHTML = `<div class="color-code">${color}</div>`;

            colorBox.addEventListener('click', () => {
                navigator.clipboard.writeText(color).then(() => {
                    const originalText = colorBox.querySelector('.color-code').textContent;
                    colorBox.querySelector('.color-code').textContent = '복사됨!';
                    setTimeout(() => {
                        colorBox.querySelector('.color-code').textContent = originalText;
                    }, 1000);
                });
            });

            paletteDiv.appendChild(colorBox);
        }
    }

    generateBtn.addEventListener('click', generatePalette);

    // Generate initial palette
    generatePalette();
}

// ========================================
// JSON Formatter
// ========================================

function initJSONFormatter() {
    const formatBtn = document.getElementById('json-format');
    const minifyBtn = document.getElementById('json-minify');
    const copyBtn = document.getElementById('json-copy');

    if (!formatBtn || !minifyBtn || !copyBtn) return;

    const render = (value) => {
        setOutputText('json-output', value);
    };

    formatBtn.addEventListener('click', () => {
        try {
            const input = getTextFromTextarea('json-input');
            const parsed = JSON.parse(input);
            render(JSON.stringify(parsed, null, 2));
        } catch (error) {
            render('올바른 JSON이 아닙니다.');
        }
    });

    minifyBtn.addEventListener('click', () => {
        try {
            const input = getTextFromTextarea('json-input');
            const parsed = JSON.parse(input);
            render(JSON.stringify(parsed));
        } catch (error) {
            render('올바른 JSON이 아닙니다.');
        }
    });

    copyBtn.addEventListener('click', () => {
        copyToClipboard(document.getElementById('json-output')?.textContent || '');
    });
}

// ========================================
// Base64 Encoder / Decoder
// ========================================

function initBase64Tool() {
    const encodeBtn = document.getElementById('base64-encode');
    const decodeBtn = document.getElementById('base64-decode');
    const copyBtn = document.getElementById('base64-copy');

    if (!encodeBtn || !decodeBtn || !copyBtn) return;

    encodeBtn.addEventListener('click', () => {
        try {
            const input = getTextFromTextarea('base64-input');
            setOutputText('base64-output', utf8ToBase64(input));
        } catch (error) {
            setOutputText('base64-output', '인코딩 실패');
        }
    });

    decodeBtn.addEventListener('click', () => {
        try {
            const input = getTextFromTextarea('base64-input');
            setOutputText('base64-output', base64ToUtf8(input));
        } catch (error) {
            setOutputText('base64-output', '디코딩 실패');
        }
    });

    copyBtn.addEventListener('click', () => {
        copyToClipboard(document.getElementById('base64-output')?.textContent || '');
    });
}

// ========================================
// Hash Generator
// ========================================

function initHashGenerator() {
    const generateBtn = document.getElementById('hash-generate');
    if (!generateBtn) return;

    generateBtn.addEventListener('click', async () => {
        const algo = document.getElementById('hash-algo')?.value || 'SHA-256';
        const input = getTextFromTextarea('hash-input');
        if (!input) {
            setOutputText('hash-output', '텍스트를 입력하세요.');
            return;
        }
        try {
            const data = new TextEncoder().encode(input);
            const digest = await crypto.subtle.digest(algo, data);
            const hashArray = Array.from(new Uint8Array(digest));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setOutputText('hash-output', hashHex);
        } catch (error) {
            setOutputText('hash-output', '해시 생성 실패');
        }
    });
}

// ========================================
// Timezone Converter
// ========================================

function initTimezoneConverter() {
    const convertBtn = document.getElementById('tz-convert');
    if (!convertBtn) return;

    convertBtn.addEventListener('click', () => {
        const input = document.getElementById('tz-input')?.value;
        const tz = document.getElementById('tz-target')?.value || 'UTC';
        const result = document.getElementById('tz-result');
        if (!input) {
            showWarning(result, '날짜/시간을 입력하세요.');
            return;
        }
        const localDate = new Date(input);
        if (isNaN(localDate)) {
            showError(result, '올바른 날짜/시간이 아닙니다.');
            return;
        }
        const formatter = new Intl.DateTimeFormat('ko-KR', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        showSuccess(result, formatter.format(localDate));
    });
}

// ========================================
// Writing Helper
// ========================================

function initWritingHelper() {
    const generateBtn = document.getElementById('generate-titles');
    const summaryBtn = document.getElementById('generate-summary');
    if (!generateBtn || !summaryBtn) return;

    generateBtn.addEventListener('click', () => {
        const raw = document.getElementById('title-keywords')?.value || '';
        const keywords = raw.split(',').map(k => k.trim()).filter(Boolean);
        const main = keywords[0] || '기술';
        const secondary = keywords[1] || '실전';
        const templates = [
            `${main} 실전 가이드: ${secondary}까지 한 번에`,
            `현업에서 쓰는 ${main} 베스트 프랙티스`,
            `${main} 성능 최적화 체크리스트`,
            `초보를 위한 ${main} 핵심 정리`,
            `2026 ${main} 업데이트 요약`
        ];
        const list = document.getElementById('title-suggestions');
        if (!list) return;
        list.innerHTML = templates.map(title => `<li>${title}</li>`).join('');
    });

    summaryBtn.addEventListener('click', () => {
        const input = document.getElementById('summary-input')?.value || '';
        if (!input.trim()) {
            setOutputText('summary-output', '요약할 내용을 입력하세요.');
            return;
        }
        const sentences = input
            .split(/[.!?。]\s+|\n+/)
            .map(s => s.trim())
            .filter(Boolean);
        const summary = sentences.slice(0, 3).join(' ');
        setOutputText('summary-output', summary || input.trim());
    });
}

// ========================================
// Image Tool
// ========================================

function initImageTool() {
    const processBtn = document.getElementById('process-image');
    if (!processBtn) return;

    processBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('image-input');
        const widthInput = document.getElementById('image-width');
        const formatSelect = document.getElementById('image-format');
        const qualityInput = document.getElementById('image-quality');
        const result = document.getElementById('image-result');

        const file = fileInput?.files?.[0];
        if (!file) {
            showWarning(result, '이미지 파일을 선택하세요.');
            return;
        }

        const targetWidth = parseInt(widthInput?.value, 10);
        const format = formatSelect?.value || 'image/jpeg';
        const quality = Math.min(0.95, Math.max(0.5, parseFloat(qualityInput?.value || '0.85')));

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const width = targetWidth && targetWidth > 0 ? targetWidth : img.width;
                const height = Math.round((img.height * width) / img.width);
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL(format, format === 'image/png' ? 1 : quality);
                const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
                result.className = 'result-box image-result success';
                result.innerHTML = `
                    <img src="${dataUrl}" alt="변환 이미지">
                    <div>크기: ${width}x${height}px / 약 ${sizeKB}KB</div>
                    <a class="btn btn-secondary" href="${dataUrl}" download="image.${format.split('/')[1]}">다운로드</a>
                `;
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

// ========================================
// Cheat Sheet
// ========================================

function initCheatSheet() {
    const listEl = document.getElementById('cheatsheet-list');
    const searchEl = document.getElementById('cheatsheet-search');
    const countEl = document.getElementById('cheatsheet-count');
    if (!listEl || !searchEl || !countEl) return;

    const items = [
        { label: 'Git: 되돌리기', value: 'git reset --hard <hash>' },
        { label: 'Git: 마지막 커밋 수정', value: 'git commit --amend' },
        { label: 'Git: 브랜치 보기', value: 'git branch -a' },
        { label: 'VSCode: 빠른 파일 열기', value: 'Ctrl/Cmd + P' },
        { label: 'VSCode: 전체 검색', value: 'Ctrl/Cmd + Shift + F' },
        { label: 'Chrome: 개발자 도구', value: 'F12 / Ctrl+Shift+I' },
        { label: 'Terminal: 이전 명령', value: '↑ / Ctrl+R' },
        { label: 'Linux: 포트 사용 확인', value: 'lsof -i :PORT' },
        { label: 'Node: 패키지 업데이트', value: 'npm outdated' },
        { label: 'curl: 헤더 보기', value: 'curl -I URL' }
    ];

    function render(filter) {
        const filtered = items.filter(item => {
            const text = `${item.label} ${item.value}`.toLowerCase();
            return text.includes(filter);
        });
        countEl.textContent = `${filtered.length}개 항목`;
        listEl.innerHTML = filtered.map(item => `<li><strong>${item.label}</strong><br>${item.value}</li>`).join('');
    }

    searchEl.addEventListener('input', () => {
        render(searchEl.value.trim().toLowerCase());
    });

    render('');
}

// ========================================
// Coding Quiz Game
// ========================================

function initCodingQuiz() {
    const startBtn = document.getElementById('quiz-start');
    const timerEl = document.getElementById('quiz-timer');
    const questionEl = document.getElementById('quiz-question');
    const choicesEl = document.getElementById('quiz-choices');
    const resultEl = document.getElementById('quiz-result');
    const scoreEl = document.getElementById('quiz-score');
    const rankingEl = document.getElementById('quiz-ranking');
    if (!startBtn || !timerEl || !questionEl || !choicesEl || !resultEl || !scoreEl || !rankingEl) return;

    const questions = [
        {
            q: 'JavaScript에서 배열 길이를 반환하는 속성은?',
            choices: ['size', 'length', 'count', 'total'],
            a: 1
        },
        {
            q: 'HTTP 상태 코드 404는 무엇을 의미할까?',
            choices: ['권한 없음', '서버 오류', '찾을 수 없음', '요청 성공'],
            a: 2
        },
        {
            q: 'CSS에서 텍스트를 굵게 만드는 속성은?',
            choices: ['font-weight', 'font-style', 'text-style', 'font-size'],
            a: 0
        },
        {
            q: 'Git에서 원격 저장소 변경 사항을 가져오는 명령은?',
            choices: ['git pull', 'git push', 'git add', 'git reset'],
            a: 0
        },
        {
            q: 'JavaScript에서 객체를 JSON 문자열로 변환하는 메서드는?',
            choices: ['JSON.parse', 'JSON.stringify', 'toJSON', 'stringifyJSON'],
            a: 1
        },
        {
            q: 'HTML에서 링크를 만드는 태그는?',
            choices: ['<link>', '<a>', '<href>', '<url>'],
            a: 1
        }
    ];

    let timeLeft = 60;
    let score = 0;
    let total = 0;
    let timerId = null;
    const rankingKey = 'quizRanking';

    function loadRanking() {
        try {
            const raw = localStorage.getItem(rankingKey);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    }

    function saveRanking(list) {
        localStorage.setItem(rankingKey, JSON.stringify(list));
    }

    function renderRanking(list) {
        rankingEl.innerHTML = list
            .map((item, index) => `<li>${index + 1}. ${item.score}/${item.total} (${item.date})</li>`)
            .join('');
    }

    function setQuestion() {
        const item = questions[Math.floor(Math.random() * questions.length)];
        questionEl.textContent = item.q;
        choicesEl.innerHTML = '';
        item.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.textContent = choice;
            btn.addEventListener('click', () => {
                total += 1;
                if (index === item.a) {
                    score += 1;
                    showSuccess(resultEl, '정답!');
                } else {
                    showError(resultEl, '오답!');
                }
                scoreEl.textContent = `점수: ${score}/${total}`;
                setQuestion();
            });
            choicesEl.appendChild(btn);
        });
    }

    function stopGame() {
        clearInterval(timerId);
        timerId = null;
        choicesEl.innerHTML = '';
        showWarning(resultEl, '시간 종료!');
        if (total > 0) {
            const list = loadRanking();
            list.push({
                score,
                total,
                date: new Date().toLocaleDateString('ko-KR')
            });
            list.sort((a, b) => b.score - a.score || b.total - a.total);
            const trimmed = list.slice(0, 5);
            saveRanking(trimmed);
            renderRanking(trimmed);
        }
    }

    startBtn.addEventListener('click', () => {
        timeLeft = 60;
        score = 0;
        total = 0;
        timerEl.textContent = '남은 시간: 60s';
        scoreEl.textContent = '점수: 0/0';
        showSuccess(resultEl, '시작!');
        setQuestion();
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            timeLeft -= 1;
            timerEl.textContent = `남은 시간: ${timeLeft}s`;
            if (timeLeft <= 0) {
                stopGame();
            }
        }, 1000);
    });

    renderRanking(loadRanking());
}

// ========================================
// Typing Game
// ========================================

function initTypingGame() {
    const startBtn = document.getElementById('typing-start');
    const resetBtn = document.getElementById('typing-reset');
    const targetEl = document.getElementById('typing-target');
    const inputEl = document.getElementById('typing-input');
    const statsEl = document.getElementById('typing-stats');
    const rankingEl = document.getElementById('typing-ranking');
    if (!startBtn || !resetBtn || !targetEl || !inputEl || !statsEl || !rankingEl) return;

    const snippets = [
        'const sum = (a, b) => a + b;',
        'fetch(url).then(res => res.json()).then(data => console.log(data));',
        'for (let i = 0; i < items.length; i++) { console.log(items[i]); }',
        'function debounce(fn, delay) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; }'
    ];

    let startTime = null;
    let targetText = '';
    const rankingKey = 'typingRanking';

    function loadRanking() {
        try {
            const raw = localStorage.getItem(rankingKey);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    }

    function saveRanking(list) {
        localStorage.setItem(rankingKey, JSON.stringify(list));
    }

    function renderRanking(list) {
        rankingEl.innerHTML = list
            .map((item, index) => `<li>${index + 1}. ${item.wpm} WPM (${item.date})</li>`)
            .join('');
    }

    function reset() {
        inputEl.value = '';
        statsEl.textContent = '';
        startTime = null;
    }

    startBtn.addEventListener('click', () => {
        targetText = snippets[Math.floor(Math.random() * snippets.length)];
        targetEl.textContent = targetText;
        reset();
        inputEl.focus();
    });

    resetBtn.addEventListener('click', () => {
        reset();
        targetEl.textContent = '시작 버튼을 눌러 코드를 불러오세요.';
    });

    inputEl.addEventListener('input', () => {
        if (!targetText) return;
        if (!startTime) startTime = Date.now();

        const typed = inputEl.value;
        let correct = 0;
        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === targetText[i]) correct += 1;
        }

        const elapsedMin = (Date.now() - startTime) / 60000;
        const wpm = elapsedMin > 0 ? Math.round((correct / 5) / elapsedMin) : 0;
        const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0;
        statsEl.textContent = `속도: ${wpm} WPM | 정확도: ${accuracy}%`;

        if (typed.length >= targetText.length) {
            statsEl.textContent += ' | 완료!';
            const list = loadRanking();
            list.push({ wpm, date: new Date().toLocaleDateString('ko-KR') });
            list.sort((a, b) => b.wpm - a.wpm);
            const trimmed = list.slice(0, 5);
            saveRanking(trimmed);
            renderRanking(trimmed);
            targetText = '';
        }
    });

    renderRanking(loadRanking());
}

// ========================================
// Order Puzzle
// ========================================

function initOrderPuzzle() {
    const gridEl = document.getElementById('order-grid');
    const statusEl = document.getElementById('order-status');
    const restartBtn = document.getElementById('order-restart');
    if (!gridEl || !statusEl || !restartBtn) return;

    let current = 1;
    let startTime = null;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderGrid() {
        gridEl.innerHTML = '';
        const numbers = shuffle(Array.from({ length: 9 }, (_, i) => i + 1));
        numbers.forEach(num => {
            const btn = document.createElement('button');
            btn.textContent = num;
            btn.addEventListener('click', () => {
                if (num !== current) {
                    statusEl.textContent = `다음 숫자: ${current}`;
                    return;
                }
                if (!startTime) startTime = Date.now();
                btn.disabled = true;
                btn.style.opacity = '0.5';
                current += 1;
                if (current === 10) {
                    const seconds = ((Date.now() - startTime) / 1000).toFixed(1);
                    statusEl.textContent = `완료! ${seconds}초`;
                } else {
                    statusEl.textContent = `다음 숫자: ${current}`;
                }
            });
            gridEl.appendChild(btn);
        });
        current = 1;
        startTime = null;
        statusEl.textContent = '다음 숫자: 1';
    }

    restartBtn.addEventListener('click', renderGrid);
    renderGrid();
}

// ========================================
// Navigation Links
// ========================================

function initNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav a, .widget-list a');
    if (!navLinks.length) return;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (hash && hash.startsWith('#')) {
                const tab = hash.substring(1);
                if (['tools', 'widgets', 'games'].includes(tab)) {
                    e.preventDefault();
                    const tabButton = document.querySelector(`[data-tab="${tab}"]`);
                    if (tabButton) {
                        tabButton.click();
                    }
                }
            }
        });
    });
}

// ========================================
// Related Blog Posts
// ========================================

function stripHtml(value) {
    return value.replace(/<[^>]*>/g, ' ');
}

function parseKeywords(value) {
    return value
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(Boolean);
}

function getKeywordStorageKey() {
    return `relatedKeywords:${window.location.pathname}`;
}

function getRelatedKeywordElements() {
    const input = document.getElementById('related-keywords-input');
    const saveBtn = document.getElementById('related-keywords-save');
    const clearBtn = document.getElementById('related-keywords-clear');
    const status = document.getElementById('related-keywords-status');
    const suggest = document.getElementById('related-keywords-suggest');
    return { input, saveBtn, clearBtn, status, suggest };
}

function initRelatedKeywordControls(defaultKeywords) {
    const { input, saveBtn, clearBtn, status, suggest } = getRelatedKeywordElements();
    if (!input || !saveBtn || !clearBtn) {
        return {
            keywords: defaultKeywords,
            input: null,
            suggest: null,
            saveBtn: null,
            clearBtn: null,
            setStatus: null
        };
    }

    const stored = localStorage.getItem(getKeywordStorageKey());
    if (stored) {
        input.value = stored;
    } else {
        input.value = defaultKeywords.join(', ');
    }

    function setStatus(message) {
        if (!status) return;
        status.textContent = message;
    }

    saveBtn.addEventListener('click', () => {
        localStorage.setItem(getKeywordStorageKey(), input.value.trim());
        setStatus('저장되었습니다.');
    });

    clearBtn.addEventListener('click', () => {
        localStorage.removeItem(getKeywordStorageKey());
        input.value = defaultKeywords.join(', ');
        setStatus('기본 키워드로 복원되었습니다.');
    });

    return {
        keywords: parseKeywords(input.value || defaultKeywords.join(', ')),
        input,
        suggest,
        saveBtn,
        clearBtn,
        setStatus
    };
}

function buildKeywordSuggestions(posts, baseKeywords) {
    const freq = new Map();
    baseKeywords.forEach(keyword => {
        if (keyword) freq.set(keyword, (freq.get(keyword) || 0) + 3);
    });

    posts.forEach(post => {
        const tags = Array.isArray(post.tags) ? post.tags : [];
        tags.forEach(tag => {
            const clean = String(tag).trim().toLowerCase();
            if (!clean) return;
            freq.set(clean, (freq.get(clean) || 0) + 2);
        });

        const titleWords = (post.title || '')
            .split(/\s+/)
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length >= 2 && !/^\d+$/.test(word));
        titleWords.forEach(word => {
            freq.set(word, (freq.get(word) || 0) + 1);
        });
    });

    return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([keyword]) => keyword)
        .slice(0, 10);
}

function renderKeywordSuggestions(suggestEl, keywords, input, onSelect) {
    if (!suggestEl || !keywords.length) return;
    suggestEl.innerHTML = keywords
        .map(keyword => `<button type="button" class="keyword-chip" data-keyword="${keyword}">${keyword}</button>`)
        .join('');

    suggestEl.querySelectorAll('button[data-keyword]').forEach(button => {
        button.addEventListener('click', () => {
            if (!input) return;
            const current = parseKeywords(input.value || '');
            const selected = button.dataset.keyword;
            if (!current.includes(selected)) {
                current.push(selected);
                input.value = current.join(', ');
            }
            if (onSelect) onSelect();
        });
    });
}

async function initRelatedPosts() {
    const container = document.getElementById('related-posts');
    if (!container) return;

    const keywordRaw = document.body.dataset.keywords || '';
    const defaultKeywords = parseKeywords(keywordRaw);
    const {
        keywords,
        input,
        suggest,
        saveBtn,
        clearBtn,
        setStatus
    } = initRelatedKeywordControls(defaultKeywords);
    const preferredCategory = (document.body.dataset.category || '').toLowerCase();

    if (keywords.length === 0) {
        container.innerHTML = '<li>관련 글이 없습니다.</li>';
        return;
    }

    try {
        const response = await fetch(`posts.json?v=${Date.now()}`);
        const data = await response.json();
        const posts = Array.isArray(data.posts) ? data.posts : [];

        const suggestions = buildKeywordSuggestions(posts, defaultKeywords);

        function renderRelated(currentKeywords) {
            const scored = posts.map(post => {
                const title = (post.title || '').toLowerCase();
                const tagsArray = (post.tags || []).map(tag => String(tag).toLowerCase());
                const tags = tagsArray.join(' ');
                const excerpt = (post.excerpt || '').toLowerCase();
                const content = stripHtml(post.content || '').toLowerCase();
                let score = 0;
                if (preferredCategory && (post.category || '').toLowerCase() === preferredCategory) {
                    score += 3;
                }
                currentKeywords.forEach(keyword => {
                    if (title.includes(keyword)) score += 4;
                    if (tagsArray.includes(keyword)) score += 4;
                    if (tags.includes(keyword)) score += 2;
                    if (excerpt.includes(keyword)) score += 1;
                    if (content.includes(keyword)) score += 1;
                });
                return { post, score };
            });

            const top = scored
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map(item => item.post);

            if (!top.length) {
                const fallback = posts
                    .sort((a, b) => {
                        const dateDiff = new Date(b.date || 0) - new Date(a.date || 0);
                        if (dateDiff !== 0) {
                            return dateDiff;
                        }
                        return Number(b.id || 0) - Number(a.id || 0);
                    })
                    .slice(0, 3);
                container.innerHTML = fallback.length
                    ? fallback.map(post => `<li><a href="blog.html#post-${post.id}">${post.title}</a></li>`).join('')
                    : '<li>관련 글이 없습니다.</li>';
                return;
            }

            container.innerHTML = top.map(post =>
                `<li><a href=\"blog.html#post-${post.id}\">${post.title}</a></li>`
            ).join('');
        }

        function updateFromInput() {
            const current = input ? parseKeywords(input.value || '') : keywords;
            renderRelated(current);
        }

        renderKeywordSuggestions(suggest, suggestions, input, updateFromInput);
        renderRelated(keywords);

        if (input) {
            let debounceId = null;
            input.addEventListener('input', () => {
                if (debounceId) clearTimeout(debounceId);
                debounceId = setTimeout(() => {
                    updateFromInput();
                    if (setStatus) setStatus('');
                }, 250);
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', updateFromInput);
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', updateFromInput);
        }
    } catch (error) {
        container.innerHTML = '<li>관련 글을 불러오지 못했습니다.</li>';
    }
}

// ========================================
// Initialize All Features
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initTabs();
    initToolSearch();
    initBMICalculator();
    initCurrencyConverter();
    initTodoList();
    initVATCalculator();
    initIPChecker();
    initPingTest();
    initPasswordGenerator();
    initQRCodeGenerator();
    initDDayCounter();
    initUnitConverter();
    initWeatherWidget();
    initCryptoWidget();
    initQuoteGenerator();
    initStockWidget();
    initNumberGuessingGame();
    initRockPaperScissors();
    initColorPaletteGenerator();
    initJSONFormatter();
    initBase64Tool();
    initHashGenerator();
    initTimezoneConverter();
    initWritingHelper();
    initImageTool();
    initCheatSheet();
    initCodingQuiz();
    initTypingGame();
    initOrderPuzzle();
    initNavigationLinks();
    initRelatedPosts();
});
