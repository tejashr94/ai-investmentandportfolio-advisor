// Global variables
let portfolioChart = null;
let currentPortfolioData = {};

// DOM Elements
const elements = {
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    messages: document.getElementById('messages'),
    portfolioBtn: document.getElementById('portfolioBtn'),
    portfolioForm: document.getElementById('portfolioForm'),
    clearBtn: document.getElementById('clearBtn'),
    summarizeBtn: document.getElementById('summarizeBtn'),
    graphBtn: document.getElementById('graphBtn'),
    themeToggle: document.getElementById('themeToggle'),
    graphModal: document.getElementById('graphModal')
};

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    initEventListeners();
    initTheme();
    loadChatHistory();
});

function initEventListeners() {
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    elements.portfolioBtn.addEventListener('click', showPortfolioForm);
    elements.clearBtn.addEventListener('click', clearChat);
    elements.summarizeBtn.addEventListener('click', summarizeChat);
    elements.graphBtn.addEventListener('click', showGraphModal);
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// ─── Theme ────────────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        elements.themeToggle.querySelector('i').className = 'fas fa-sun text-xl';
    } else {
        elements.themeToggle.querySelector('i').className = 'fas fa-moon text-xl';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    document.documentElement.classList.toggle('dark', isDark);
    const icon = elements.themeToggle.querySelector('i');
    icon.className = isDark ? 'fas fa-sun text-xl' : 'fas fa-moon text-xl';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ─── Portfolio ────────────────────────────────────────────
function showPortfolioForm() {
    elements.portfolioForm.classList.remove('hidden');
    elements.portfolioForm.scrollIntoView({ behavior: 'smooth' });
}

function hidePortfolioForm() {
    elements.portfolioForm.classList.add('hidden');
}

window.submitPortfolio = function () {
    const portfolio = {
        stocks:     parseFloat(document.getElementById('stocksAmount').value)     || 0,
        bonds:      parseFloat(document.getElementById('bondsAmount').value)      || 0,
        crypto:     parseFloat(document.getElementById('cryptoAmount').value)     || 0,
        realEstate: parseFloat(document.getElementById('realEstateAmount').value) || 0
    };

    const total = portfolio.stocks + portfolio.bonds + portfolio.crypto + portfolio.realEstate;
    if (total === 0) {
        showNotification('Please enter your portfolio amounts', 'warning');
        return;
    }

    currentPortfolioData = { ...portfolio, total };
    window.currentPortfolioData = currentPortfolioData;

    const prompt = `User portfolio: Stocks $${portfolio.stocks.toLocaleString()}, Bonds $${portfolio.bonds.toLocaleString()}, Crypto $${portfolio.crypto.toLocaleString()}, Real Estate $${portfolio.realEstate.toLocaleString()}. Total: $${total.toLocaleString()}. Provide analysis and diversification suggestions.`;

    sendMessage(prompt, true);
    hidePortfolioForm();
    clearPortfolioInputs();
};

function clearPortfolioInputs() {
    document.querySelectorAll('#portfolioForm input').forEach(i => i.value = '');
}

// ─── Chat ─────────────────────────────────────────────────
function sendMessage(customMessage = null, isPortfolio = false) {
    const message = customMessage || elements.messageInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    elements.messageInput.value = '';

    if (typeof processMessage === 'function') {
        processMessage(message);
    }
}

function addMessage(text, sender) {
    // Remove welcome screen if present
    const welcome = elements.messages.querySelector('.text-center.py-16');
    if (welcome) welcome.remove();

    const wrapper = document.createElement('div');
    wrapper.className = `message-bubble flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');

    if (sender === 'user') {
        bubble.className = 'user-bubble';
        bubble.innerHTML = `<div style="color:#fff !important;">${text}</div>`;
    } else {
        bubble.className = 'bot-bubble';
        bubble.innerHTML = `
            <i class="fas fa-robot bot-icon"></i>
            <div>${text}</div>
        `;
    }

    wrapper.appendChild(bubble);
    elements.messages.appendChild(wrapper);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    saveChatHistory();
}

window.addMessage = addMessage;

function addTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'message-bubble flex justify-start';
    div.innerHTML = `
        <div class="bot-bubble flex items-center gap-3">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
            <span style="color:var(--text-secondary);font-size:0.9rem;">AI is analyzing...</span>
        </div>
    `;
    elements.messages.appendChild(div);
    elements.messages.scrollTop = elements.messages.scrollHeight;
}

function removeTypingIndicator() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
}

// ─── UI Actions ───────────────────────────────────────────
function clearChat() {
    elements.messages.innerHTML = `
        <div class="text-center py-16">
            <div class="welcome-icon mx-auto mb-6">
                <i class="fas fa-brain text-4xl text-indigo-500"></i>
            </div>
            <h2 class="welcome-title mb-4">Smart Investment Guide</h2>
            <p class="welcome-sub max-w-xl mx-auto leading-relaxed">
                Ask about portfolio diversification, risk management, or share your investments for personalized strategies
            </p>
            <div class="flex gap-4 mt-10 justify-center">
                <button id="portfolioBtn" class="btn-primary flex items-center gap-3">
                    <i class="fas fa-briefcase"></i>
                    Add Portfolio
                </button>
            </div>
        </div>
    `;
    // Rebind the portfolio button
    document.getElementById('portfolioBtn').addEventListener('click', showPortfolioForm);
    localStorage.removeItem('chatHistory');
}

function summarizeChat() {
    addTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        addMessage(
            '📋 Quick Summary:<br><br>' +
            '✅ Keep diversified across 4+ asset classes<br>' +
            '✅ Rebalance your portfolio every 3 months<br>' +
            '✅ Max 10% exposure in any single investment<br>' +
            '✅ Match your allocation to your risk tolerance<br><br>' +
            '💡 Want a deeper analysis? Share your portfolio!',
            'bot'
        );
    }, 1800);
}

function showGraphModal() {
    if (!currentPortfolioData.total) {
        showNotification('Please add your portfolio first!', 'warning');
        return;
    }
    document.getElementById('graphModal').classList.remove('hidden');
    renderPortfolioChart();
}

window.closeGraphModal = function () {
    document.getElementById('graphModal').classList.add('hidden');
};

function renderPortfolioChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (portfolioChart) portfolioChart.destroy();

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#a8b3cf' : '#4b5563';

    portfolioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Stocks', 'Bonds', 'Crypto', 'Real Estate'],
            datasets: [{
                data: [
                    currentPortfolioData.stocks,
                    currentPortfolioData.bonds,
                    currentPortfolioData.crypto,
                    currentPortfolioData.realEstate
                ],
                backgroundColor: ['#5b4cf5', '#3b82f6', '#10b981', '#f59e0b'],
                borderWidth: 3,
                borderColor: isDark ? '#161b27' : '#ffffff',
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 24,
                        font: { size: 14, weight: '600' },
                        color: textColor,
                        usePointStyle: true,
                        pointStyleWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.parsed;
                            const total = currentPortfolioData.total;
                            const pct = ((val / total) * 100).toFixed(1);
                            return ` $${val.toLocaleString()} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    const bg = type === 'warning' ? '#ef4444' : '#5b4cf5';
    toast.style.cssText = `
        position:fixed; top:80px; right:20px;
        padding:14px 20px; border-radius:14px;
        background:${bg}; color:white;
        font-weight:600; font-size:0.9rem;
        z-index:9999; box-shadow:0 6px 20px rgba(0,0,0,0.2);
        transform:translateX(120%); transition:transform 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.transform = 'translateX(0)', 50);
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── Storage ──────────────────────────────────────────────
function saveChatHistory() {
    const bubbles = Array.from(elements.messages.querySelectorAll('.message-bubble'));
    const history = bubbles.map(el => ({
        text: el.querySelector('div').innerHTML,
        sender: el.classList.contains('justify-end') ? 'user' : 'bot'
    }));
    localStorage.setItem('chatHistory', JSON.stringify(history.slice(-20)));
}

function loadChatHistory() {
    try {
        const raw = localStorage.getItem('chatHistory');
        if (!raw) return;
        const history = JSON.parse(raw);
        if (history.length === 0) return;
        history.slice(-8).forEach((item, i) => {
            setTimeout(() => addMessage(item.text, item.sender), i * 150);
        });
    } catch (e) {
        localStorage.removeItem('chatHistory');
    }
}
