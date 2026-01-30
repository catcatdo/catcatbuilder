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

    const buttons = document.querySelectorAll('.btn-game');
    const resultDiv = document.getElementById('rps-result');
    const scoreDiv = document.getElementById('rps-score');

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
// Navigation Links
// ========================================

function initNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav a, .widget-list a');

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
    initNavigationLinks();
});
