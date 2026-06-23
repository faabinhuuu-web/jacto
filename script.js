(function checkAccess() {
    const ACCESS_KEY = 'dashboard_access_granted';
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage !== 'login.html') {
        const hasAccess = localStorage.getItem(ACCESS_KEY);
        if (!hasAccess) {
            window.location.href = 'login.html';
        }
    } else {
        const hasAccess = localStorage.getItem(ACCESS_KEY);
        if (hasAccess) {
            window.location.href = 'index.html';
        }
    }
})();

const CORRECT_HASH = '2035233689';
const ACCESS_KEY = 'dashboard_access_granted';

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return hash.toString();
}

function handleLogin() {
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const errorAlert = document.getElementById('errorAlert');

    if (!passwordInput || !loginButton) return;

    loginButton.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    function attemptLogin() {
        const enteredPassword = passwordInput.value;
        const enteredHash = simpleHash(enteredPassword);

        if (enteredHash === CORRECT_HASH) {
            localStorage.setItem(ACCESS_KEY, 'true');
            window.location.href = 'index.html';
        } else {
            errorAlert.style.display = 'block';
            passwordInput.value = '';
        }
    }
}

if (window.location.pathname.split('/').pop() === 'login.html') {
    document.addEventListener('DOMContentLoaded', handleLogin);
}

let charts = {};
let globalProcessedData = null;
let activeFilters = {
    categoria: null,
    material: null,
    fornecedor: null,
    monthly: null,
    comprador: null
};

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#64748B';
Chart.defaults.scale.grid.color = '#F1F5F9'; 
Chart.defaults.scale.grid.borderColor = 'transparent';

function createGradient(ctx, colorStart, colorEnd) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
}

const formatCurrencyNoDecimal = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

const formatNumberThousand = (value) => {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
};

const doughnutCenterText = {
    id: 'doughnutCenterText',
    beforeDraw(chart) {
        if (chart.config.type !== 'doughnut') return;
        const { ctx, chartArea: { top, bottom, left, right } } = chart;
        
        ctx.save();
        const totalSpend = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;

        ctx.font = '500 12px Inter';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Total', centerX, centerY - 12);

        ctx.font = '700 16px Inter';
        ctx.fillStyle = '#1E293B';
        ctx.fillText(formatCurrencyNoDecimal(totalSpend), centerX, centerY + 10);
        ctx.restore();
    }
};
Chart.register(ChartDataLabels, doughnutCenterText);

const colors = {
    blue:   { start: '#3B82F6', end: '#2563EB' },
    indigo: { start: '#6366F1', end: '#4F46E5' },
    emerald:{ start: '#10B981', end: '#059669' },
    amber:  { start: '#F59E0B', end: '#D97706' },
    rose:   { start: '#F43F5E', end: '#E11D48' },
    cyan:   { start: '#06B6D4', end: '#0891B2' },
    violet: { start: '#8B5CF6', end: '#7C3AED' },
};
const mainPalette = [colors.blue, colors.emerald, colors.indigo, colors.amber, colors.rose, colors.cyan, colors.violet];

const countryMap = { "Thailand": "Thailand", "Brasil": "Brazil", "Italy": "Italy", "China": "China", "Canada": "Canada", "India": "India", "Taiwan": "Taiwan", "Hong Kong": "Hong Kong", "France": "France", "USA": "United States", "EUA": "United States", "Switzerland": "Switzerland", "Germany": "Germany", "Japan": "Japan", "Colombia": "Colombia", "South Africa": "South Africa", "Sweden": "Sweden", "Kenya": "Kenya", "United Kingdom": "United Kingdom", "Argentina": "Argentina", "South Korea": "South Korea" };

function excelDateToJSDate(excelDate) {
    if (typeof excelDate === 'number') return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return new Date(excelDate);
}

function formatDateToInput(date) {
    return date.toISOString().split('T')[0];
}

async function loadDefaultFile() {
    try {
        const response = await fetch('spend_categoria.xlsx');
        if (!response.ok) throw new Error("Erro arquivo");
        const ab = await response.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(ab), { type: 'array' });
        processWorkbook(wb);
    } catch (e) { console.error(e); }
}

function processWorkbook(workbook) {
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const headers = json[0].map(h => h.toLowerCase().replace(/ /g, '_'));
    const data = json.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
            let val = row[i];
            if (h === 'spend' && typeof val === 'string') val = parseFloat(val.replace(/\./g, '').replace(',', '.'));
            if (h === 'data') obj[h] = excelDateToJSDate(val);
            else obj[h] = val;
        });
        return obj;
    });

    globalProcessedData = { compras: data };
    setupDashboard();
}

function updateDropdownOptions(selectId, dataSubset, dataKey, defaultOptionText) {
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;

    const currentSelectedValue = selectEl.value;
    const uniqueValues = [...new Set(dataSubset.map(item => item[dataKey]))].filter(Boolean).sort();

    selectEl.innerHTML = `<option value="all">${defaultOptionText}</option>`;
    uniqueValues.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        selectEl.appendChild(opt);
    });

    if (uniqueValues.includes(currentSelectedValue)) {
        selectEl.value = currentSelectedValue;
    } else {
        selectEl.value = 'all';
    }
}

function setupDashboard() {
    ['categoria-filter', 'startDateFilter', 'endDateFilter', 'compradorFilter', 'classifFilter', 'topMaterialFilter', 'forn_pais_filter'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', renderDashboard);
    });

    document.querySelectorAll('.pmp-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.value === 'all') document.querySelectorAll('.pmp-checkbox').forEach(c => c.checked = e.target.checked);
            updatePmpDropdownText();
            renderDashboard();
        });
    });

    const dates = globalProcessedData.compras.map(r => r.data).filter(d => d instanceof Date);
    if (dates.length) {
        document.getElementById('endDateFilter').value = formatDateToInput(new Date());
        document.getElementById('startDateFilter').value = formatDateToInput(new Date(new Date().getFullYear(), 0, 1));
    }

    const uniqueCategories = [...new Set(globalProcessedData.compras.map(i => i.categoria))].filter(Boolean).sort();
    const fornSelect = document.getElementById('fornecedor-categoria-filtro');
    if (fornSelect) {
        fornSelect.innerHTML = '<option value="all">Todas</option>';
        uniqueCategories.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; fornSelect.appendChild(o); });
        fornSelect.addEventListener('change', renderDashboard);
    }

    updatePmpDropdownText();
    renderDashboard();
}

function updatePmpDropdownText() {
    const btn = document.getElementById('pmpDropdown');
    const checked = document.querySelectorAll('.pmp-checkbox:not(#pmpAll):checked');
    btn.textContent = document.getElementById('pmpAll').checked ? 'Todos' : (checked.length ? `${checked.length} Selecionados` : 'Nenhum');
}

function renderDashboard() {
    const startDateVal = document.getElementById('startDateFilter').value;
    const endDateVal = document.getElementById('endDateFilter').value;

    const dateFilters = {
        start: startDateVal ? new Date(startDateVal) : new Date(0),
        end: endDateVal ? new Date(endDateVal) : new Date()
    };
    dateFilters.end.setHours(23, 59, 59);

    const dataSubsetByDate = globalProcessedData.compras.filter(r => {
        const d = r.data;
        return !(d < dateFilters.start || d > dateFilters.end);
    });

    updateDropdownOptions('compradorFilter', dataSubsetByDate, 'p1_comprador', 'Todos os Compradores');
    updateDropdownOptions('classifFilter', dataSubsetByDate, 'classif', 'Todas as Classificações');

    const filters = {
        cat: document.getElementById('categoria-filter').value,
        fornCat: document.getElementById('fornecedor-categoria-filtro').value,
        comp: document.getElementById('compradorFilter').value,
        classif: document.getElementById('classifFilter').value,
        pais: document.getElementById('forn_pais_filter').value,
        matCount: document.getElementById('topMaterialFilter').value,
        start: dateFilters.start,
        end: dateFilters.end
    };

    const pmpRanges = Array.from(document.querySelectorAll('.pmp-checkbox:not(#pmpAll):checked')).map(c => c.value);

    const filtered = dataSubsetByDate.filter(r => {
        if(filters.comp !== 'all' && r.p1_comprador !== filters.comp) return false;
        if(filters.classif !== 'all' && r.classif !== filters.classif) return false;
        if(filters.pais !== 'all' && r.forn_pais !== filters.pais) return false;
        
        if(pmpRanges.length) {
            const match = pmpRanges.some(rng => {
                const p = r.pmp;
                if(rng.includes('+')) return p >= parseInt(rng);
                const [min, max] = rng.split('-').map(Number);
                return p >= min && p <= max;
            });
            if(!match) return false;
        }

        if(activeFilters.categoria && r.categoria !== activeFilters.categoria) return false;
        if(activeFilters.fornecedor && r.fornecedor !== activeFilters.fornecedor) return false;
        if(activeFilters.material && (r.descricao_material || r.cod_material) !== activeFilters.material) return false;
        if(activeFilters.comprador && r.p1_comprador !== activeFilters.comprador) return false;
        if(activeFilters.monthly && r.data.toLocaleString('default', { month: 'short', year: '2-digit' }) !== activeFilters.monthly) return false;

        return true;
    });

    updateKPIs(filtered);
    const dataCharts = processChartsData(filtered, filters);
    
    const geo = processGeo(filtered);
    if(document.getElementById('regions_div')) {
        google.charts.load('current', {'packages':['geochart']});
        google.charts.setOnLoadCallback(() => drawMap(geo.arr));
        renderCountryTable(geo.tbl);
    }

    renderCharts(dataCharts);
    renderDetailTable(filtered); // Chamada da tabela de detalhes
}

function updateKPIs(data) {
    const total = data.reduce((a,b) => a + (b.spend||0), 0);
    const ped = data.length;
    const mat = new Set(data.map(r=>r.cod_material)).size;
    const cat = new Set(data.map(r=>r.categoria)).size;
    const fornDireto = new Set(data.filter(r=>r.classif==='Direto').map(r=>r.fornecedor)).size;
    const fornIndireto = new Set(data.filter(r=>r.classif==='Indireto').map(r=>r.fornecedor)).size;

    document.getElementById('total-spend-kpi').textContent = formatCurrencyNoDecimal(total);
    document.getElementById('total-pedidos-kpi').textContent = formatNumberThousand(ped); 
    document.getElementById('total-materiais-kpi').textContent = formatNumberThousand(mat);
    document.getElementById('total-categorias-kpi').textContent = formatNumberThousand(cat); 
    document.getElementById('fornecedores-indireto-kpi').innerHTML = `<span class="small">Dir: ${fornDireto} | Ind: ${fornIndireto}</span>`;
}

function processChartsData(data, filters) {
    const agg = (field, topN = null) => {
        const map = {};
        data.forEach(r => {
            const k = r[field] || 'N/A';
            map[k] = (map[k]||0) + (r.spend||0);
        });
        let arr = Object.entries(map).sort((a,b) => b[1]-a[1]);
        if(topN) {
            const top = arr.slice(0, topN);
            const other = arr.slice(topN).reduce((a,b)=>a+b[1],0);
            if(other > 0) top.push(['Outros', other]);
            return top;
        }
        return arr;
    };

    const cats = agg('categoria', filters.cat === 'all' ? null : parseInt(filters.cat));
    let cum = 0;
    const totalCat = cats.reduce((a,b)=>a+b[1],0);
    const pareto = cats.map(c => { cum += c[1]; return (cum/totalCat)*100; });

    const mats = agg('descricao_material', parseInt(filters.matCount));

    let dataForn = data;
    if(filters.fornCat !== 'all') dataForn = data.filter(r => r.categoria === filters.fornCat);
    const aggForn = (dt) => {
        const map = {}; dt.forEach(r => map[r.fornecedor] = (map[r.fornecedor]||0) + (r.spend||0));
        let arr = Object.entries(map).sort((a,b)=>b[1]-a[1]);
        const top = arr.slice(0,5);
        const oth = arr.slice(5).reduce((a,b)=>a+b[1],0);
        if(oth>0) top.push(['Outros', oth]);
        return top;
    };
    const forns = aggForn(dataForn);

    const comps = agg('p1_comprador', 5);

    const monthlyMap = {};
    data.forEach(r => {
        if(!r.data) return;
        const k = `${r.data.getFullYear()}-${String(r.data.getMonth()).padStart(2,'0')}`;
        monthlyMap[k] = (monthlyMap[k]||0) + r.spend;
    });
    const months = Object.keys(monthlyMap).sort().slice(-12);
    
    const pmpBins = { '0-9':0, '10-29':0, '30-44':0, '45-59':0, '60-89':0, '90-119':0, '120+':0 };
    data.forEach(r => {
        const p = r.pmp; const s = r.spend;
        if(p==null) return;
        if(p<=9) pmpBins['0-9']+=s;
        else if(p<=29) pmpBins['10-29']+=s;
        else if(p<=44) pmpBins['30-44']+=s;
        else if(p<=59) pmpBins['45-59']+=s;
        else if(p<=89) pmpBins['60-89']+=s;
        else if(p<=119) pmpBins['90-119']+=s;
        else pmpBins['120+']+=s;
    });

    return { cats, pareto, mats, forns, comps, months: { lbl: months, val: months.map(m=>monthlyMap[m]) }, pmp: pmpBins };
}

function processGeo(data) {
    const countryData = {};
    data.forEach(r => {
        const countryName = countryMap[r.forn_npais];
        if (!countryName) return;

        if (!countryData[countryName]) {
            countryData[countryName] = { totalSpend: 0, suppliers: {} };
        }

        const spend = r.spend || 0;
        const supplier = r.fornecedor || 'Fornecedor N/A'; 

        countryData[countryName].totalSpend += spend;
        countryData[countryName].suppliers[supplier] = (countryData[countryName].suppliers[supplier] || 0) + spend; 
    });

    const arr = [['Country', 'Spend', { role: 'tooltip', type: 'string', p: { html: true } }]];
    const tbl = [];
    const totalGlobal = data.reduce((a,b) => a + (b.spend||0), 0);
    
    Object.entries(countryData).sort(([, a], [, b]) => b.totalSpend - a.totalSpend)
        .forEach(([country, data]) => {
            const totalSpendFmt = formatCurrencyNoDecimal(data.totalSpend);
            const topSuppliers = Object.entries(data.suppliers).sort((a, b) => b[1] - a[1]).slice(0, 3); 

            let supplierListHtml = '';
            if (topSuppliers.length > 0) {
                supplierListHtml += '<div style="margin-top: 8px; font-size: 11px; color: #64748B;"><strong>Top 3 Fornecedores:</strong><ul style="padding-left: 18px; margin-top: 4px; margin-bottom: 0;">'; 
                topSuppliers.forEach(([supplier, spend]) => { 
                    const supplierName = supplier.length > 30 ? supplier.substring(0, 30) + '...' : supplier;
                    supplierListHtml += `<li style="line-height: 1.5;">${supplierName}: <span style="font-weight: 600;">${formatCurrencyNoDecimal(spend)}</span></li>`;
                });
                supplierListHtml += '</ul></div>';
            }

            const html = `
                <div style="padding:10px;font-family:Inter; min-width: 250px;">
                    <strong style="font-size: 14px; color: #1E293B;">${country}</strong>
                    <div style="font-size: 12px; margin-top: 4px; color: #475569;">Gasto Total: <span style="font-weight: bold;">${totalSpendFmt}</span></div>
                    ${supplierListHtml}
                </div>`;

            arr.push([country, data.totalSpend, html]);
            tbl.push({ country: country, spend: data.totalSpend, pct: (data.totalSpend / totalGlobal) * 100 });
        });
        
    return { arr, tbl };
}

function renderCharts(d) {
    const commonOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#FFFFFF',
                titleColor: '#1E293B',
                bodyColor: '#64748B',
                borderColor: '#E2E8F0',
                borderWidth: 1,
                titleFont: { size: 13, weight: 'bold', family: 'Inter' },
                bodyFont: { size: 12, family: 'Inter' },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label || ''}: ${formatCurrencyNoDecimal(ctx.raw)}`
                }
            },
            datalabels: {
                color: '#475569',
                anchor: 'end',
                align: 'top',
                offset: 4,
                font: { weight: '600', size: 10 },
                formatter: (v) => formatCurrencyNoDecimal(v)
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { border: { display: false }, grid: { color: '#F1F5F9' }, ticks: { callback: (v) => formatNumberThousand(v) } }
        }
    };

    Object.values(charts).forEach(c => { if(c.destroy) c.destroy(); });

    // 1. Categorias
    const ctxCat = document.getElementById('comprasCategoriaChart').getContext('2d');
    charts.cat = new Chart(ctxCat, {
        type: 'bar',
        data: {
            labels: d.cats.map(i=>i[0]),
            datasets: [
                { type: 'bar', label: 'Spend', data: d.cats.map(i=>i[1]), backgroundColor: createGradient(ctxCat, colors.blue.start, colors.blue.end), borderRadius: 6, barPercentage: 0.6 },
                { type: 'line', label: 'Pareto (%)', data: d.pareto, borderColor: '#1E293B', borderWidth: 2, pointRadius: 0, yAxisID: 'y1', datalabels: { display: false } }
            ]
        },
        options: {
            ...commonOpts,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                ...commonOpts.plugins, 
                legend: { display: true, position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } },
                tooltip: {
                    ...commonOpts.plugins.tooltip,
                    callbacks: {
                        label: (ctx) => ctx.datasetIndex === 1 ? ` ${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%` : ` ${ctx.dataset.label}: ${formatCurrencyNoDecimal(ctx.raw)}`
                    }
                },
                datalabels: {
                    color: '#475569', anchor: 'end', align: 'top', offset: 4, font: { weight: '600', size: 10 },
                    formatter: (v) => formatNumberThousand(Math.round(v / 1000)) + ' K'
                }
            },
            scales: { ...commonOpts.scales, y1: { position: 'right', grid: { display: false }, ticks: { callback: v => v.toFixed(0)+'%' } } },
            onClick: (e, el) => handleClick(el, d.cats, 'categoria')
        }
    });

    // 2. Top Materiais
    const ctxMat = document.getElementById('topMateriaisChart').getContext('2d');
    charts.mat = new Chart(ctxMat, {
        type: 'bar',
        data: {
            labels: d.mats.map(i=> i[0].length > 20 ? i[0].substring(0,20)+'...' : i[0]),
            datasets: [{ label: 'Spend', data: d.mats.map(i=>i[1]), backgroundColor: createGradient(ctxMat, colors.emerald.start, colors.emerald.end), borderRadius: 4, barPercentage: 0.7 }]
        },
        options: {
            ...commonOpts, indexAxis: 'y',
            scales: { x: { ...commonOpts.scales.y, ticks: { callback: (v) => formatNumberThousand(v) } }, y: commonOpts.scales.x },
            plugins: {
                ...commonOpts.plugins,
                datalabels: { color: '#1E293B', anchor: 'end', align: 'end', offset: 8, font: { weight: '600', size: 10 }, formatter: (v) => formatNumberThousand(Math.round(v / 1000)) + ' K' }
            },
            onClick: (e, el) => handleClick(el, d.mats, 'material')
        }
    });

    // 3. Fornecedores e Compradores (Doughnut)
    const renderDoughnut = (id, dataArr, typeFilter) => {
        const ctx = document.getElementById(id).getContext('2d');
        const bgColors = mainPalette.map(c => createGradient(ctx, c.start, c.end));
        return new Chart(ctx, {
            type: 'doughnut',
            data: { labels: dataArr.map(i=>i[0]), datasets: [{ data: dataArr.map(i=>i[1]), backgroundColor: bgColors, borderWidth: 0, hoverOffset: 4 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: commonOpts.plugins.tooltip,
                    datalabels: {
                        display: 'auto', color: '#fff', font: { weight: 'bold', size: 10 },
                        formatter: (value, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            return (value/total) < 0.04 ? '' : ((value / total) * 100).toFixed(1) + '%';
                        }
                    }
                },
                onClick: (e, el) => handleClick(el, dataArr, typeFilter)
            }
        });
    };
    charts.forn = renderDoughnut('topFornecedoresChart', d.forns, 'fornecedor');
    charts.comp = renderDoughnut('compradorChart', d.comps, 'comprador');

    // 4. Linha 12 Meses
    const ctxLine = document.getElementById('last12MonthsChart').getContext('2d');
    const gradLine = ctxLine.createLinearGradient(0,0,0,400);
    gradLine.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradLine.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    charts.line = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: d.months.lbl.map(s => { const [y,m] = s.split('-'); const d = new Date(y, parseInt(m)); return d.toLocaleDateString('pt-BR',{month:'short', year:'2-digit'}); }),
            datasets: [{ label: 'Spend Mensal', data: d.months.val, borderColor: colors.blue.end, backgroundColor: gradLine, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: colors.blue.end, pointBorderWidth: 2 }]
        },
        options: {
            ...commonOpts, interaction: { mode: 'index', intersect: false },
            scales: { ...commonOpts.scales, y: { ...commonOpts.scales.y, min: Math.min(...d.months.val)*0.8 } },
            plugins: {
                ...commonOpts.plugins,
                datalabels: { color: colors.blue.end, anchor: 'end', align: 'top', offset: 5, font: { weight: 'bold', size: 10 }, formatter: (value) => formatNumberThousand(Math.round(value / 1000)) + ' K' }
            },
            onClick: (e, el) => { if(el.length) { activeFilters.monthly = d.months.lbl[el[0].index]; renderDashboard(); } }
        }
    });

    // 5. PMP
    const ctxPmp = document.getElementById('pmpHistogramChart').getContext('2d');
    charts.pmp = new Chart(ctxPmp, {
        type: 'bar',
        data: { labels: Object.keys(d.pmp), datasets: [{ label: 'Spend', data: Object.values(d.pmp), backgroundColor: createGradient(ctxPmp, colors.indigo.start, colors.indigo.end), borderRadius: 6 }] },
        options: {
            ...commonOpts,
            plugins: {
                ...commonOpts.plugins,
                datalabels: {
                    color: '#475569', anchor: 'end', align: 'top', textAlign: 'center', font: { weight: 'bold', size: 10 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
                        return formatCurrencyNoDecimal(value) + '\n(' + (total > 0 ? ((value/total)*100).toFixed(1) + '%' : '0%') + ')';
                    }
                }
            }
        }
    });
}

// NOVA FUNÇÃO: Renderização da Tabela Consolidada por RG e Ordenada por Spend (Maior para Menor)
function renderDetailTable(data) {
    const tbody = document.querySelector('#detalhesComprasTable tbody');
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Nenhum dado encontrado para os filtros selecionados.</td></tr>`;
        return;
    }

    // Agrupa e consolida as linhas que possuem o mesmo Cód. Material (RG)
    const consolidatedMap = data.reduce((acc, row) => {
        const rg = row.cod_material || 'N/A';
        
        if (!acc[rg]) {
            acc[rg] = {
                cod_material: rg,
                descricao_material: row.descricao_material || 'N/A',
                categoria: row.categoria || 'N/A',
                fornecedor: row.fornecedor || 'N/A',
                p1_comprador: row.p1_comprador || 'N/A',
                classif: row.classif || 'N/A',
                pmp: row.pmp != null ? row.pmp : '-',
                spend: 0,
                rawDate: row.data // Usado para critério de desempate/atualização de dados descritivos
            };
        }

        // Soma o Spend das linhas de mesmo RG
        acc[rg].spend += (row.spend || 0);

        // Opcional: Se a linha atual for mais recente que a já armazenada, atualiza os metadados textuais
        if (row.data && row.data > acc[rg].rawDate) {
            acc[rg].descricao_material = row.descricao_material || acc[rg].descricao_material;
            acc[rg].fornecedor = row.fornecedor || acc[rg].fornecedor;
            acc[rg].p1_comprador = row.p1_comprador || acc[rg].p1_comprador;
            acc[rg].classif = row.classif || acc[rg].classif;
            acc[rg].pmp = row.pmp != null ? row.pmp : acc[rg].pmp;
            acc[rg].rawDate = row.data;
        }

        return acc;
    }, {});

    // Converte o objeto de agrupamento em Array e classifica do Maior Spend para o Menor
    const sortedData = Object.values(consolidatedMap).sort((a, b) => b.spend - a.spend);

    // Renderiza as linhas na tabela HTML
    tbody.innerHTML = sortedData.map(row => {
        const codMaterial = row.cod_material;
        const descMaterial = row.descricao_material;
        const categoria = row.categoria;
        const fornecedor = row.fornecedor;
        const comprador = row.p1_comprador;
        const classif = row.classif;
        const pmp = row.pmp;
        const totalSpend = formatCurrencyNoDecimal(row.spend);

        // Define a badge com base na classificação
        const classifBadge = classif === 'Direto' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary';

        return `
            <tr>
                <td class="font-monospace fw-semibold text-secondary">${codMaterial}</td>
                <td class="text-truncate" style="max-width: 220px;" title="${descMaterial}">${descMaterial}</td>
                <td>${categoria}</td>
                <td class="text-truncate" style="max-width: 200px;" title="${fornecedor}">${fornecedor}</td>
                <td>${comprador}</td>
                <td class="text-center"><span class="badge ${classifBadge}">${classif}</span></td>
                <td class="text-center fw-medium">${pmp}</td>
                <td class="text-end fw-bold text-dark">${totalSpend}</td>
            </tr>
        `;
    }).join('');
}

function handleClick(el, dataArr, type) {
    if(!el.length) return;
    const label = dataArr[el[0].index][0];
    activeFilters[type] = activeFilters[type] === label ? null : label;
    renderDashboard();
}

function drawMap(arr) {
    if(charts.geoMap) charts.geoMap.clearChart();
    charts.geoMap = new google.visualization.GeoChart(document.getElementById('regions_div'));
    charts.geoMap.draw(google.visualization.arrayToDataTable(arr), {
        colorAxis: { colors: ['#E0F2FE', '#0284C7'] }, 
        datalessRegionColor: '#F8FAFC',
        defaultColor: '#F1F5F9',
        legend: 'none',
        tooltip: { isHtml: true, textStyle: { fontName: 'Inter' } }
    });
    const loadingEl = document.getElementById('country-spend-loading');
    if (loadingEl) loadingEl.style.display = 'none';
}

function renderCountryTable(data) {
    const tbody = document.querySelector('#countrySpendTable tbody');
    if (tbody) {
        tbody.innerHTML = data.map(i => `
            <tr>
                <td class="fw-bold text-secondary">${i.country}</td>
                <td class="text-end fw-bold text-dark">${formatCurrencyNoDecimal(i.spend)}</td>
                <td class="text-end text-muted small">${i.pct.toFixed(1)}%</td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', loadDefaultFile);

const toggleBtn = document.getElementById('sidebar-toggle');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-minimized'));
}