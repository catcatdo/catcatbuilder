// ========================================
// Utility Functions
// ========================================

function showLoading() {
    document.getElementById('loading-spinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-spinner').classList.remove('active');
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

// ========================================
// Tab Navigation
// ========================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

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
// Random Quote Generator
// ========================================

function initQuoteGenerator() {
    const getQuoteBtn = document.getElementById('get-quote');
    const resultDiv = document.getElementById('quote-result');
    if (!getQuoteBtn || !resultDiv) return;

    getQuoteBtn.addEventListener('click', async () => {
        showLoading();

        try {
            const data = await fetchAPI('https://api.quotable.io/random');

            hideLoading();
            resultDiv.className = 'result-box quote-box success';
            resultDiv.innerHTML = `
                <div class="quote-text">"${data.content}"</div>
                <div class="quote-author">— ${data.author}</div>
            `;
        } catch (error) {
            hideLoading();
            showError(resultDiv, '명언을 불러오지 못했습니다.');
        }
    });
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
// Initialize All Features
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initBMICalculator();
    initCurrencyConverter();
    initTodoList();
    initVATCalculator();
    initIPChecker();
    initPingTest();
    initWeatherWidget();
    initCryptoWidget();
    initQuoteGenerator();
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
});
