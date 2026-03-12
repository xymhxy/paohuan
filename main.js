// ===== 数据定义 =====
const ITEMS = [
    { key: 'weapon60',    name: '60级武器',     icon: 'ri-sword-line',       iconBg: '#fff7ed', iconColor: '#ea580c',  btnClass: 'btn-weapon60',    dotColor: '#f97316' },
    { key: 'armor60',     name: '60级防具',     icon: 'ri-shield-line',      iconBg: '#fff7ed', iconColor: '#f97316',  btnClass: 'btn-armor60',     dotColor: '#fb923c' },
    { key: 'weapon70',    name: '70级武器',     icon: 'ri-sword-fill',       iconBg: '#eff6ff', iconColor: '#2563eb',  btnClass: 'btn-weapon70',    dotColor: '#3b82f6' },
    { key: 'armor70',     name: '70级防具',     icon: 'ri-shield-fill',      iconBg: '#eff6ff', iconColor: '#3b82f6',  btnClass: 'btn-armor70',     dotColor: '#60a5fa' },
    { key: 'weapon80',    name: '80级武器',     icon: 'ri-sword-line',       iconBg: '#f5f3ff', iconColor: '#7c3aed',  btnClass: 'btn-weapon80',    dotColor: '#8b5cf6' },
    { key: 'armor80',     name: '80级防具',     icon: 'ri-shield-line',      iconBg: '#f5f3ff', iconColor: '#8b5cf6',  btnClass: 'btn-armor80',     dotColor: '#a78bfa' },
    { key: 'variant',     name: '变异召唤兽',   icon: 'ri-bug-line',         iconBg: '#fef2f2', iconColor: '#dc2626',  btnClass: 'btn-variant',     dotColor: '#ef4444' },
    { key: 'flower',      name: '花',           icon: 'ri-flower-line',      iconBg: '#fdf2f8', iconColor: '#db2777',  btnClass: 'btn-flower',      dotColor: '#ec4899' },
    { key: 'instrument',  name: '乐器',         icon: 'ri-music-2-line',     iconBg: '#f0fdfa', iconColor: '#0d9488',  btnClass: 'btn-instrument',  dotColor: '#14b8a6' },
    { key: 'furniture1',  name: '1级家具',       icon: 'ri-home-4-line',      iconBg: '#fef9c3', iconColor: '#a16207',  btnClass: 'btn-furniture1',  dotColor: '#ca8a04' },
    { key: 'furniture2',  name: '2级家具',       icon: 'ri-home-4-fill',      iconBg: '#fef9c3', iconColor: '#854d0e',  btnClass: 'btn-furniture2',  dotColor: '#a16207' },
];

// ===== 状态管理 =====
const state = {
    prices: {},    // 各物品单价（万）
    counts: {},    // 各物品点击次数
    history: [],   // 点击历史记录
};

ITEMS.forEach(item => {
    state.prices[item.key] = 0;
    state.counts[item.key] = 0;
});

// ===== 渲染成本设置模块 =====
function renderCostSettings() {
    const container = document.getElementById('costSettings');
    container.innerHTML = ITEMS.map(item => `
        <div class="cost-input-card">
            <div class="flex items-center gap-3 mb-3">
                <div class="icon-wrap" style="background:${item.iconBg};">
                    <i class="${item.icon}" style="color:${item.iconColor};"></i>
                </div>
                <span class="font-semibold text-gray-700 text-sm">${item.name}价格</span>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" id="price_${item.key}" placeholder="请输入单价" min="0" step="0.01">
                <span class="text-gray-400 text-sm flex-shrink-0">万</span>
            </div>
        </div>
    `).join('');

    // 绑定输入事件
    ITEMS.forEach(item => {
        const input = document.getElementById(`price_${item.key}`);
        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            state.prices[item.key] = isNaN(val) ? 0 : val;
        });
    });
}

// ===== 渲染计算按钮模块 =====
function renderCalcButtons() {
    const container = document.getElementById('calcButtons');
    container.innerHTML = ITEMS.map(item => `
        <div class="calc-btn-card">
            <button class="calc-btn ${item.btnClass}" data-key="${item.key}">
                <i class="${item.icon}"></i>
                ${item.name}
            </button>
            <div class="calc-btn-count">
                已提交 <span class="count-num" id="count_${item.key}">0</span> 次
                <span class="text-gray-300 mx-1">|</span>
                小计 <span class="font-semibold text-amber-600" id="subtotal_${item.key}">0</span> 万
            </div>
        </div>
    `).join('');

    // 绑定按钮点击事件
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.calc-btn');
        if (!btn) return;
        const key = btn.dataset.key;
        handleCalcClick(key);
    });
}

// ===== 处理按钮点击 =====
function handleCalcClick(key) {
    const item = ITEMS.find(i => i.key === key);
    const price = state.prices[key];

    // 即使价格为0也允许点击，只是不累加成本
    state.counts[key]++;
    state.history.push({ key, name: item.name, price, dotColor: item.dotColor });

    // 更新次数显示（带动画）
    const countEl = document.getElementById(`count_${key}`);
    countEl.textContent = state.counts[key];
    countEl.classList.remove('animate-pop');
    void countEl.offsetWidth; // 强制reflow
    countEl.classList.add('animate-pop');

    // 更新小计
    const subtotalEl = document.getElementById(`subtotal_${key}`);
    const subtotal = (state.counts[key] * price).toFixed(2);
    subtotalEl.textContent = subtotal;

    // 更新汇总
    updateSummary();

    // 更新撤回按钮状态
    updateUndoBtn();

    // 显示Toast
    if (price > 0) {
        showToast(`+${price} 万（${item.name}）`);
    } else {
        showToast(`${item.name}：未设置价格`, true);
    }
}

// ===== 更新汇总区 =====
function updateSummary() {
    // 计算总成本
    let total = 0;
    ITEMS.forEach(item => {
        total += state.counts[item.key] * state.prices[item.key];
    });

    const totalEl = document.getElementById('totalCost');
    totalEl.textContent = total.toFixed(2);

    // 更新明细列表
    const detailEl = document.getElementById('detailList');
    const activeItems = ITEMS.filter(item => state.counts[item.key] > 0);

    if (activeItems.length === 0) {
        detailEl.innerHTML = '<span class="text-gray-300 italic">暂无记录，请点击上方按钮开始计算</span>';
        return;
    }

    detailEl.innerHTML = activeItems.map(item => {
        const count = state.counts[item.key];
        const price = state.prices[item.key];
        const sub = (count * price).toFixed(2);
        return `
            <div class="detail-item">
                <span class="dot" style="background:${item.dotColor};"></span>
                <span>${item.name}</span>
                <span class="text-gray-400">×</span>
                <span class="font-semibold text-gray-800">${count}</span>
                <span class="text-gray-400">（${price}万/个）</span>
                <span class="text-gray-400">=</span>
                <span class="font-bold text-amber-600">${sub} 万</span>
            </div>
        `;
    }).join('');
}

// ===== 重置 =====
function initReset() {
    document.getElementById('resetBtn').addEventListener('click', () => {
        ITEMS.forEach(item => {
            state.counts[item.key] = 0;
            document.getElementById(`count_${item.key}`).textContent = '0';
            document.getElementById(`subtotal_${item.key}`).textContent = '0';
        });
        state.history = [];
        updateSummary();
        updateUndoBtn();
        showToast('已重置全部计算', false);
    });
}

// ===== 撤回操作 =====
function handleUndo() {
    if (state.history.length === 0) return;

    const last = state.history.pop();
    const key = last.key;

    // 恢复计数
    state.counts[key]--;

    // 更新次数显示
    const countEl = document.getElementById(`count_${key}`);
    countEl.textContent = state.counts[key];
    countEl.classList.remove('animate-pop');
    void countEl.offsetWidth;
    countEl.classList.add('animate-pop');

    // 更新小计
    const subtotalEl = document.getElementById(`subtotal_${key}`);
    const subtotal = (state.counts[key] * state.prices[key]).toFixed(2);
    subtotalEl.textContent = subtotal;

    // 更新汇总
    updateSummary();

    // 更新撤回按钮状态
    updateUndoBtn();

    showToast(`已撤回：${last.name}`, false);
}

function updateUndoBtn() {
    const btn = document.getElementById('undoBtn');
    btn.disabled = state.history.length === 0;
}

// ===== Toast提示 =====
function showToast(msg, isWarning = false) {
    const toast = document.createElement('div');
    toast.className = 'cost-toast';
    if (isWarning) {
        toast.style.color = '#fb923c';
    }
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1300);
}

// ===== 初始化 =====
function init() {
    renderCostSettings();
    renderCalcButtons();
    initReset();

    // 绑定撤回按钮
    document.getElementById('undoBtn').addEventListener('click', handleUndo);
}

init();
