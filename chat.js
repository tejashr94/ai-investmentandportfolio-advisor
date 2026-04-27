// chat.js — Groq API Integration
// Set your GROQ_API_KEY in Vercel environment variables

const GROQ_API_KEY = (typeof process !== 'undefined' && process.env)
    ? process.env.GROQ_API_KEY
    : 'YOUR_API_KEY_HERE'; // DO NOT commit your real API key to GitHub!

// ─── Client-Side Topic Guard ───────────────────────────────────────────────────
// Only these finance-related keywords are allowed through to the API.
// Everything else is blocked immediately without spending an API call.

const ALLOWED_KEYWORDS = [
    // Core finance
    'invest', 'investment', 'portfolio', 'stock', 'stocks', 'share', 'shares', 'equity',
    'bond', 'bonds', 'fund', 'funds', 'mutual fund', 'etf', 'index fund',
    'crypto', 'bitcoin', 'ethereum', 'cryptocurrency', 'token',
    'real estate', 'reit', 'property',
    'diversif', 'asset', 'allocation', 'rebalance', 'rebalancing',
    'risk', 'return', 'yield', 'dividend', 'interest', 'compound',
    'market', 'bull', 'bear', 'volatility', 'hedge', 'hedging',
    'sip', 'lump sum', 'systematic', 'nifty', 'sensex', 'nasdaq', 'dow',
    'financial', 'finance', 'wealth', 'money', 'savings', 'save',
    'retirement', 'pension', 'ira', 'roth', '401k', 'ppf', 'nps', 'elss',
    'profit', 'loss', 'capital gain', 'tax', 'inflation', 'liquidity',
    'commodity', 'gold', 'silver', 'oil',
    'brokerage', 'broker', 'demat', 'exchange', 'trading', 'trade',
    'sector', 'large cap', 'mid cap', 'small cap', 'growth', 'value',
    'expense ratio', 'nav', 'aum', 'annuity', 'insurance'
];

function isFinanceRelated(message) {
    const lower = message.toLowerCase();
    return ALLOWED_KEYWORDS.some(keyword => lower.includes(keyword));
}

const OFF_TOPIC_REPLY =
    "I'm AI Horizon, your dedicated Investment & Portfolio Advisor. " +
    "I can only help with topics like stocks, mutual funds, bonds, crypto, " +
    "portfolio diversification, risk management, and wealth planning.<br><br>" +
    "Feel free to ask me something like:<br>" +
    "• How should I diversify my portfolio?<br>" +
    "• What is the difference between stocks and mutual funds?<br>" +
    "• How much should I invest in crypto?";

// ─── Main Message Processor ────────────────────────────────────────────────────

async function processMessage(userMessage) {

    // 1. Client-side guard — block immediately, no API call wasted
    if (!isFinanceRelated(userMessage)) {
        setTimeout(() => {
            if (typeof addMessage === 'function') {
                addMessage(OFF_TOPIC_REPLY, 'bot');
            }
        }, 400);
        return;
    }

    // 2. Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message-bubble flex justify-start';
    typingDiv.innerHTML = `
        <div class="bot-bubble flex items-center gap-3">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
            <span style="color:var(--text-secondary);font-size:0.9rem;">AI is analyzing your portfolio...</span>
        </div>
    `;
    document.getElementById('messages').appendChild(typingDiv);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `You are AI Horizon — a strict, specialist Investment & Portfolio Advisor chatbot built by Tejash Rai, Kapil Gupta, and Devansh Sharma for INT428 AI Essentials.

YOUR ONLY PURPOSE: Answer questions about investing, portfolios, stocks, mutual funds, bonds, ETFs, crypto, real estate, asset allocation, diversification, risk management, SIPs, retirement planning, and related financial topics.

ABSOLUTE RULES — NEVER BREAK THESE:
1. SCOPE: You ONLY discuss investment and personal finance topics. This is non-negotiable.
2. OFF-TOPIC REFUSAL: If the question is about ANYTHING other than investing or finance (e.g. AI, technology, science, history, sports, cooking, weather, health, entertainment, general knowledge, coding, etc.) — you MUST respond with EXACTLY this message and nothing else:
   "I'm AI Horizon, your dedicated Investment & Portfolio Advisor. I'm not able to answer questions outside of investing and finance. Try asking me about stocks, mutual funds, diversification, or portfolio analysis!"
3. DO NOT try to connect off-topic questions to finance. DO NOT say "that's an interesting question, but...". Just give the refusal message above.
4. NO MARKDOWN: Never use #, *, **, _, backticks, or bullet symbols. Plain text only.
5. LANGUAGE: Reply in the same language the user writes in.
6. FORMATTING: Separate paragraphs with double line breaks.
7. PORTFOLIO DATA: ${JSON.stringify(window.currentPortfolioData || {})}
8. SIMPLIFY: If user says "simplify", "short", "summary", or "I didn't understand" → give 3-5 plain text points.
9. FOLLOW-UP: End every valid finance answer with 1-2 relevant follow-up questions such as "What is your risk tolerance?" or "Would you like a full portfolio breakdown?"

You are not a general-purpose assistant. You have no knowledge of anything outside finance and investing.`
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
                max_tokens: 1500,
                stream: false
            })
        });

        // Remove typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        let botResponse = data.choices[0]?.message?.content || "Sorry, I couldn't process that.";

        // Clean text — strip any markdown leakage
        botResponse = botResponse
            .replace(/[#*_`~]/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        setTimeout(() => {
            if (typeof addMessage === 'function') {
                addMessage(botResponse, 'bot');
            }
        }, 300);

    } catch (error) {
        console.error('Chat API Error:', error);

        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();

        setTimeout(() => {
            if (typeof addMessage === 'function') {
                addMessage(
                    "Sorry, I'm having trouble connecting. Please check your internet or try again!<br><br>Pro Tip: Share your portfolio details for personalized advice!",
                    'bot'
                );
            }
        }, 500);
    }
}

window.processMessage = processMessage;

document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ AI Horizon — Smart Investment & Portfolio Analyzer loaded!');
    console.log('🔑 Add GROQ_API_KEY to your Vercel environment variables.');
});