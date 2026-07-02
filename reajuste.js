// --- CONFIGURATION ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyaWbT5hLTnR2DDP8XAq8DXlHuJ8hVolP2M1QzzANjgzyI8RLQBnLH2-sXMz-mPhk1G/exec"; 

document.getElementById('current-date-display').textContent = new Date().toLocaleDateString('en-US');

let currentMode = 'post';
let loadedData = []; 

// --- CURRENCY DEFINITIONS AND BASE RATES ---
const CURRENCIES = {
    'BRL': { symbol: 'R$', locale: 'pt-BR' },
    'USD': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'de-DE' },
    'THB': { symbol: '฿', locale: 'th-TH' }
};

let currentCurrency = 'USD'; // Default Display Currency (Input)

// Base currency definition per BU
const BASE_CURRENCY_MAP = {
    'Portáteis BR': 'BRL',
    'Interman': 'USD', 
    'Solo': 'EUR', 
};

const EXCHANGE_RATES = {
     'BRL': { 'BRL': 1.0000, 'USD': 0.1833, 'EUR': 0.1700 },
     'USD': { 'BRL': 5.4500, 'USD': 1.0000, 'EUR': 0.9300 },
     'THB': { 'BRL': 0.1500, 'USD': 0.0290, 'EUR': 0.0250 },
     'EUR': { 'BRL': 5.9000, 'USD': 1.0700, 'EUR': 1.0000 }
};

function parseLocaleFloat(value) {
    if (typeof value === 'string') {
        // Removes currency symbols and spaces, then replaces comma with dot if necessary
        let clean = value.replace(/[^\d.,-]/g, ''); 
        if (clean.includes(',') && clean.includes('.')) {
            return parseFloat(clean.replace(/\./g, '').replace(/,/g, '.')) || 0;
        }
        return parseFloat(clean.replace(/,/g, '.')) || 0;
    }
    return parseFloat(value) || 0;
}

function toServerFormat(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return "0.00";
    let fixed = parseFloat(value).toFixed(decimals);
    return fixed.replace('.', ',');
}

function formatDisplayCurrency(value) {
    const numValue = parseFloat(value) || 0;
    return numValue.toLocaleString(CURRENCIES[currentCurrency].locale, {
        style: 'currency', currency: currentCurrency
    });
}

function formatBaseCurrency(value, baseCurrency) {
    const numValue = parseFloat(value) || 0;
    const bCurr = CURRENCIES[baseCurrency] || CURRENCIES['USD'];
    return numValue.toLocaleString(bCurr.locale, {
        style: 'currency', currency: baseCurrency
    });
}

function getExchangeRate(inputCurrency, baseCurrency) {
    if (inputCurrency === baseCurrency) return 1.0000;
    if (EXCHANGE_RATES[inputCurrency] && EXCHANGE_RATES[inputCurrency][baseCurrency]) {
        return EXCHANGE_RATES[inputCurrency][baseCurrency];
    }
    return 1.0000;
}

function updateTaxaCambioState(currency, businessUnit) {
    const taxaCambioInput = document.getElementById('TaxaCambio');
    const baseCurrency = BASE_CURRENCY_MAP[businessUnit] || 'USD';
    
    const rate = getExchangeRate(currency, baseCurrency);
    const isBaseCurrency = (currency === baseCurrency);
    
    taxaCambioInput.value = rate.toFixed(4).replace('.', ',');
    taxaCambioInput.classList.remove('taxa-cambio-enabled', 'taxa-cambio-readonly');

    if (isBaseCurrency) {
        taxaCambioInput.setAttribute('readonly', 'true');
        taxaCambioInput.classList.add('taxa-cambio-readonly');
    } else { 
        taxaCambioInput.removeAttribute('readonly');
        taxaCambioInput.classList.add('taxa-cambio-enabled');
    }
}

function updateCurrencyAndExchange() {
    const businessUnit = document.getElementById('BusinessUnit').value;
    const currencySelect = document.getElementById('currency-select');
    
    const baseCurrency = BASE_CURRENCY_MAP[businessUnit] || 'USD';
    
    if (!currencySelect.value) {
        currencySelect.value = baseCurrency;
    }

    currentCurrency = currencySelect.value;
    
    document.getElementById('label-taxa-cambio').textContent = `Rate (-> ${baseCurrency})`;
    document.getElementById('label-impacto-anual').textContent = `Total Annual Impact (${baseCurrency})`;
    
    updateTaxaCambioState(currentCurrency, businessUnit);
    
    document.getElementById('Moeda').value = currentCurrency;
    
    const sym = CURRENCIES[currentCurrency].symbol;
    document.getElementById('th-preco-atual').textContent = `Current Price (${sym})`;
    document.getElementById('th-preco-proposta').textContent = `Proposal (${sym})`;
    document.getElementById('th-preco-novo').textContent = `Final Price (${sym})`;
    document.getElementById('th-impacto-total').textContent = `Impact (Claim) (${sym})`;
    document.getElementById('th-impacto-anual').textContent = `Impact (Negot.) (${sym})`;
    
    calculateTotalImpact();
}

function changeCurrency(newCurrency) {
    currentCurrency = newCurrency;
    document.getElementById('Moeda').value = newCurrency;
    updateCurrencyAndExchange();
}

// --- MATERIALS TABLE ---
const COLUMN_CLASSES = ['CodMat[]', 'Descricao[]', 'price-current', 'price-proposal', 'price-new', 'vol-annual'];

const TEMPLATE_ROW = `
    <tr class="item-row">
        <td class="text-center row-id-field fw-bold text-secondary small">1</td> 
        <td><input type="text" class="table-input" name="CodMat[]" placeholder="Code"></td>
        <td><input type="text" class="table-input" name="Descricao[]" placeholder="Description"></td>
        <td><input type="text" class="table-input text-end price-current" placeholder="0.00" oninput="calcRow(this)"></td>
        <td><input type="text" class="table-input text-end text-muted fst-italic price-proposal" placeholder="0.00" oninput="calcRow(this)"></td> 
        <td><input type="text" class="table-input text-end price-new fw-bold" placeholder="0.00" oninput="calcRow(this)"></td>
        <td><input type="text" class="table-input text-end vol-annual" placeholder="0" oninput="calcRow(this)"></td>
        <td><input type="text" class="table-input text-end impact-total text-primary fw-bold" readonly data-raw="0"></td> 
        <td><input type="text" class="table-input text-end impact-annual text-danger fw-bold" readonly data-raw="0"></td>
    </tr>
`;

function addRow() {
    document.querySelector('#local-material-table tbody').insertAdjacentHTML('beforeend', TEMPLATE_ROW.trim());
    updateIndices();
}

function removeLastRow() {
    const rows = document.querySelectorAll('.item-row');
    if(rows.length > 1) rows[rows.length-1].remove();
    else if (rows.length === 1) rows[0].querySelectorAll('input').forEach(input => input.value = ''); 
    updateIndices();
    calculateTotalImpact();
}

function updateIndices() {
    document.querySelectorAll('.item-row').forEach((row, i) => {
        row.querySelector('.row-id-field').textContent = i + 1;
    });
}

function calcRow(el) {
    const row = el.closest('tr');
    const pCurrent = parseLocaleFloat(row.querySelector('.price-current').value);
    const pProposal = parseLocaleFloat(row.querySelector('.price-proposal').value);
    const pNew = parseLocaleFloat(row.querySelector('.price-new').value);
    const vol = parseLocaleFloat(row.querySelector('.vol-annual').value);
    
    const impactTotal = (pProposal - pCurrent) * vol;
    const impactAnnual = (pNew - pCurrent) * vol;
    
    const impactTotalEl = row.querySelector('.impact-total');
    impactTotalEl.dataset.raw = impactTotal;
    impactTotalEl.value = formatDisplayCurrency(impactTotal);
    
    const impactAnnualEl = row.querySelector('.impact-annual');
    impactAnnualEl.dataset.raw = impactAnnual;
    impactAnnualEl.value = formatDisplayCurrency(impactAnnual);
    
    impactAnnualEl.className = impactAnnual > 0 
        ? 'table-input text-end impact-annual text-danger fw-bold'
        : 'table-input text-end impact-annual text-success fw-bold';

    calculateTotalImpact();
}

function calculateTotalImpact() {
    let totalImpactAnnual = 0; 
    let totalImpactProposal = 0; 
    let totalBase = 0; 
    
    const taxa = parseLocaleFloat(document.getElementById('TaxaCambio').value) || 1;
    const bu = document.getElementById('BusinessUnit').value;
    const baseCurrency = BASE_CURRENCY_MAP[bu] || 'USD';

    document.querySelectorAll('.item-row').forEach(row => {
        totalImpactAnnual += parseFloat(row.querySelector('.impact-annual').dataset.raw) || 0;
        totalImpactProposal += parseFloat(row.querySelector('.impact-total').dataset.raw) || 0;
        
        const pCurrent = parseLocaleFloat(row.querySelector('.price-current').value);
        const vol = parseLocaleFloat(row.querySelector('.vol-annual').value);
        totalBase += (pCurrent * vol);
    });

    document.getElementById('TotalImpactoPleitoDisplay').value = formatDisplayCurrency(totalImpactProposal);
    document.getElementById('TotalImpactoNegocDisplay').value = formatDisplayCurrency(totalImpactAnnual);
    
    const impactoNeutralizado = totalImpactProposal - totalImpactAnnual;
    document.getElementById('ImpactoNeutralizadoDisplay').value = formatDisplayCurrency(impactoNeutralizado);
    
    const percNegoc = totalBase > 0 ? (totalImpactAnnual / totalBase) * 100 : 0;
    const percEl = document.getElementById('PercentualNegocDisplay');
    percEl.value = percNegoc.toFixed(2) + '%';
    percEl.className = percNegoc > 0 ? 'form-control form-control-sm text-danger fw-bold' : 'form-control form-control-sm text-success fw-bold';

    const totalConverted = totalImpactAnnual * taxa;
    
    const totalEl = document.getElementById('ImpactoAnualTotal');
    totalEl.value = formatBaseCurrency(totalConverted, baseCurrency);
    totalEl.dataset.raw = totalConverted; 

    document.getElementById('RawImpactoPleito').value = totalImpactProposal.toFixed(2);
    document.getElementById('RawImpactoNegoc').value = totalImpactAnnual.toFixed(2);
    document.getElementById('RawImpactoNeutralizado').value = impactoNeutralizado.toFixed(2);
    document.getElementById('RawPercentualNegoc').value = percNegoc.toFixed(2);
}

document.addEventListener('paste', function(e) {
    const activeElement = document.activeElement;
    const table = document.getElementById('local-material-table');
    
    if (!table.contains(activeElement) || activeElement.tagName !== 'INPUT' || activeElement.readOnly) return;
    
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    if (!pastedText) return;

    e.preventDefault(); 
    const rows = pastedText.trim().split('\n');
    if (rows.length === 0) return;

    let currentRow = activeElement.closest('tr');
    let currentInput = activeElement;
    
    const allInputsInTable = Array.from(currentRow.querySelectorAll('.table-input')).filter(input => !input.readOnly);
    let startColIndex = allInputsInTable.indexOf(currentInput);

    if (startColIndex === -1) {
        const inputName = currentInput.getAttribute('name') || Array.from(currentInput.classList).find(cls => COLUMN_CLASSES.includes(cls));
        startColIndex = COLUMN_CLASSES.indexOf(inputName);
    }
    if (startColIndex === -1) return; 

    rows.forEach((line, rowIndex) => {
        const cells = line.split('\t');
        if (rowIndex > 0) {
            let nextRow = currentRow.nextElementSibling;
            if (!nextRow) {
                addRow();
                const allRows = document.querySelectorAll('.item-row');
                nextRow = allRows[allRows.length - 1];
            }
            currentRow = nextRow; 
            const newRowInputs = Array.from(currentRow.querySelectorAll('.table-input')).filter(input => !input.readOnly);
            currentInput = newRowInputs[startColIndex];
            if (!currentInput) return; 
        }
        
        const rowInputs = Array.from(currentRow.querySelectorAll('.table-input')).filter(input => !input.readOnly);
        cells.forEach((cellValue, colIndex) => {
            const targetIndex = startColIndex + colIndex;
            if (targetIndex < rowInputs.length) {
                const targetInput = rowInputs[targetIndex];
                targetInput.value = cellValue.trim(); 
                if (['price-current', 'price-new', 'price-proposal', 'vol-annual'].some(cls => targetInput.classList.contains(cls))) {
                    calcRow(targetInput);
                }
            }
        });
    });
    calculateTotalImpact(); 
});

// --- FORM SUBMIT ---
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = document.getElementById('submit-button');
    const originalBtnHtml = submitButton.innerHTML;
    
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing...`;
    showToast("Sending data...", "primary");
    
    const formData = new FormData(form);

    const rowId = document.getElementById('row-id').value;
    if(rowId) {
        formData.set('rowId', rowId); 
    }
    const action = document.getElementById('action-type').value;
    formData.set('action', action);

    // Financial Data
    const taxa = parseLocaleFloat(document.getElementById('TaxaCambio').value);
    formData.set('TaxaCambio', toServerFormat(taxa, 4));
    
    formData.set('ImpactoPleito', toServerFormat(parseFloat(document.getElementById('RawImpactoPleito').value)));
    formData.set('ImpactoNegoc', toServerFormat(parseFloat(document.getElementById('RawImpactoNegoc').value)));
    formData.set('ImpactoNeutralizado', toServerFormat(parseFloat(document.getElementById('RawImpactoNeutralizado').value)));
    formData.set('PercentualNegoc', toServerFormat(parseFloat(document.getElementById('RawPercentualNegoc').value)));
    
    const totalBase = parseFloat(document.getElementById('ImpactoAnualTotal').dataset.raw) || 0;
    formData.set('ImpactoAnualTotal', toServerFormat(totalBase));

    const materialData = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const item = {
            CodMat: row.querySelector('[name="CodMat[]"]').value,
            Descricao: row.querySelector('[name="Descricao[]"]').value,
            PrecoAntes: parseLocaleFloat(row.querySelector('.price-current').value), 
            PrecoProposta: parseLocaleFloat(row.querySelector('.price-proposal').value), 
            PrecoDepois: parseLocaleFloat(row.querySelector('.price-new').value), 
            VolumeAnual: parseLocaleFloat(row.querySelector('.vol-annual').value),
            ImpactoPleito: (parseFloat(row.querySelector('.impact-total').dataset.raw) || 0).toFixed(2),
            ImpactoNegoc: (parseFloat(row.querySelector('.impact-annual').dataset.raw) || 0).toFixed(2)
        };
        if(item.CodMat || item.Descricao) materialData.push(item);
    });

    formData.append('MaterialList', JSON.stringify(materialData));

    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: formData });
        const data = await res.json();
        
        if(data.result === 'success' || data.status === 'success') {
            showToast(`Saved! ID: ${data.id || 'Ok'}`, "success");
            
            // Only opens the email automatically if it is a NEW request
            if (action === 'insert') {
                    await copyAndOpenOutlook();
            }
            
            resetFormToInsert();
            if(currentMode === 'get') loadData(); 

        } else {
            showToast("Error: " + (data.error || data.message), "danger");
        }
    } catch (err) {
        console.error(err);
        showToast("Connection error.", "danger");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnHtml;
        if (action === 'edit') setMode('get');
    }
}

function resetFormToInsert() {
    document.getElementById('reajusteForm').reset();
    document.getElementById('action-type').value = 'insert';
    document.getElementById('row-id').value = '';
    
    document.querySelector('#local-material-table tbody').innerHTML = TEMPLATE_ROW;
    document.querySelector('.row-id-field').textContent = '1';
    
    const btn = document.getElementById('submit-button');
    btn.className = 'btn btn-danger w-100 fw-bold py-2 rounded-pill shadow-sm';
    btn.innerHTML = '<i class="fas fa-save me-2"></i>Save Price Adjustment';
    
    const cancelBtn = document.getElementById('cancel-button');
    if(cancelBtn) cancelBtn.remove();
    
    const emailBtn = document.getElementById('send-email-button-edit');
    if(emailBtn) emailBtn.remove();
    
    document.getElementById('currency-select').value = 'USD';
    document.getElementById('BusinessUnit').value = "";
    changeCurrency('USD');
}

// --- GET DATA (History) ---
function setMode(mode) {
    currentMode = mode;
    document.getElementById('local-insert-view').style.display = mode === 'post' ? 'block' : 'none';
    document.getElementById('get-data-view').style.display = mode === 'get' ? 'block' : 'none';
    
    const btnPost = document.getElementById('btn-mode-post');
    const btnGet = document.getElementById('btn-mode-get');
    
    if(mode === 'post') {
        btnPost.classList.replace('btn-outline-secondary', 'btn-primary');
        btnGet.classList.replace('btn-primary', 'btn-outline-secondary');
    } else {
        btnPost.classList.replace('btn-primary', 'btn-outline-secondary');
        btnGet.classList.replace('btn-outline-secondary', 'btn-primary');
        loadData();
        resetFormToInsert(); 
    }
}

function loadData() {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center p-3"><div class="spinner-border text-primary" role="status"></div></td></tr>';
    
    fetch(SCRIPT_URL + '?action=readReajuste')
    .then(res => res.json())
    .then(data => {
        loadedData = data; 
        tbody.innerHTML = '';
        if(!data || !data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>';
            return;
        }
        
        data.forEach((row, index) => {
            let dateVig = new Date(row['Data Vigência']).toLocaleDateString('en-US');
            let val = row['Impacto (Negoc.)'];
            let val2 = row['Impacto Neutralizado'];
            if(typeof val === 'string') val = parseFloat(val.replace('.','').replace(',','.'));
            let baseCurrency = BASE_CURRENCY_MAP[row['BusinessUnit']] || 'USD';
            let impactoNegoc = (val || 0).toLocaleString(CURRENCIES[baseCurrency].locale, {style:'currency', currency: baseCurrency });
            let impactoNeut = (val2 || 0).toLocaleString(CURRENCIES[baseCurrency].locale, {style:'currency', currency: baseCurrency });
            
            let html = `<tr>
                <td class="ps-4"><button onclick="fetchAndEditRow(${index})" class="btn btn-sm btn-outline-primary rounded-pill px-3"><i class="fas fa-edit me-1"></i>Edit</button></td>
                <td>${dateVig}</td>
                <td><span class="badge bg-light text-dark border">${row['BusinessUnit'] || ''}</span></td>
                <td>${row['Fornecedor'] || ''}</td>
                <td class="text-center text-danger fw-bold">${impactoNegoc}</td>
                <td class="text-center text-success fw-bold">${impactoNeut}</td>
                <td class="small text-muted text-truncate" style="max-width: 150px;">${row['Comentários'] || ''}</td>
            </tr>`;
            tbody.innerHTML += html;
        });
    })
    .catch(e => {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading data.</td></tr>';
    });
}

// --- EDIT FUNCTION ---
function fetchAndEditRow(index) {
    setMode('post');
    const item = loadedData[index];
    if(!item) return showToast("Error loading item.", "danger");
    
    const actionsDiv = document.getElementById('form-actions');
    if(!document.getElementById('send-email-button-edit')) {
        const btn = document.createElement('button');
        btn.id = 'send-email-button-edit';
        btn.className = 'btn btn-outline-dark w-100 fw-bold py-2 rounded-pill shadow-sm mb-2';
        btn.type = 'button';
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Email (Outlook)';
        btn.onclick = copyAndOpenOutlook;
        actionsDiv.insertBefore(btn, document.getElementById('submit-button'));
    }

    document.getElementById('action-type').value = 'edit';
    document.getElementById('row-id').value = item.row;

    document.getElementById('BusinessUnit').value = item['BusinessUnit'] || '';
    document.getElementById('Comprador').value = item['Comprador'] || '';
    document.getElementById('MotivoReajuste').value = item['Motivo'] || '';
    document.getElementById('CodFornecedor').value = item['Cód. Fornecedor'] || '';
    document.getElementById('Fornecedor').value = item['Fornecedor'] || '';
    document.getElementById('PrazoNovo').value = item['Novo Prazo'] || '';
    document.getElementById('Comentarios').value = item['Comentários'] || '';

    document.getElementById('AnaliseCompetitividade').value = item['Análise Competitividade'] || '';
    document.getElementById('AnaliseCommodities').value = item['Análise Commodities'] || '';
    document.getElementById('ReducaoMapeada').value = item['Redução Mapeada'] || '';

    if(item['Data Vigência']) {
        let d = item['Data Vigência'];
        if(typeof d === 'string' && d.includes('T')) d = d.split('T')[0];
        document.getElementById('DataVigencia').value = d;
    }

    const moedaSalva = item['Moeda'] || 'USD';
    const taxaSalva = item['Taxa Câmbio'] ? parseLocaleFloat(String(item['Taxa Câmbio'])) : 1;

    updateCurrencyAndExchange(); 
    
    const currSelect = document.getElementById('currency-select');
    currSelect.value = moedaSalva;
    currentCurrency = moedaSalva;
    
    document.getElementById('TaxaCambio').value = toServerFormat(taxaSalva, 4);
    changeCurrency(currSelect.value); 

    const tbody = document.querySelector('#local-material-table tbody');
    tbody.innerHTML = '';
    
    let matList = [];
    try {
        let rawJson = item['JSON Materiais'];
        if(!rawJson) rawJson = item['MaterialList'];

        if(rawJson && typeof rawJson === 'string') {
            matList = JSON.parse(rawJson);
        } else if(rawJson) {
            matList = rawJson;
        }
    } catch(e) { console.error("Error parsing json", e); }

    if(matList.length) {
        matList.forEach(mat => {
            tbody.insertAdjacentHTML('beforeend', TEMPLATE_ROW.trim());
            const newRow = tbody.lastElementChild;
            const inputs = newRow.querySelectorAll('input');
            
            inputs[0].value = mat.CodMat || '';
            inputs[1].value = mat.Descricao || '';
            inputs[2].value = (mat.PrecoAntes || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
            inputs[3].value = (mat.PrecoProposta || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
            inputs[4].value = (mat.PrecoDepois || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
            inputs[5].value = (mat.VolumeAnual || 0).toLocaleString('en-US', {maximumFractionDigits: 0});
            
            calcRow(inputs[2]); 
        });
    } else {
        tbody.insertAdjacentHTML('beforeend', TEMPLATE_ROW.trim());
    }
    updateIndices();
    calculateTotalImpact(); 

    const btn = document.getElementById('submit-button');
    btn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Update Record';
    btn.className = 'btn btn-warning w-100 fw-bold py-2 rounded-pill shadow-sm text-dark';

    if(!document.getElementById('cancel-button')) {
            const cBtn = document.createElement('button');
            cBtn.id = 'cancel-button';
            cBtn.className = 'btn btn-outline-danger w-100 fw-bold py-2 rounded-pill mt-2';
            cBtn.innerHTML = 'Cancel Edit';
            cBtn.type = 'button';
            cBtn.onclick = resetFormToInsert;
            actionsDiv.appendChild(cBtn);
    }
    showToast("Edit mode activated.", "success");
}

// --- EMAIL / OUTLOOK FUNCTION ---
async function copyAndOpenOutlook() {
    const unit = document.getElementById('BusinessUnit').value || '';
    const fornecedor = document.getElementById('Fornecedor').value || '';
    const motivo = document.getElementById('MotivoReajuste').value || '';
    const dataVig = document.getElementById('DataVigencia').value || '';
    const impacto = document.getElementById('TotalImpactoNegocDisplay').value || '';
    const avoidance = document.getElementById('ImpactoNeutralizadoDisplay').value || '0.00'; 
    const perc = document.getElementById('PercentualNegocDisplay').value || '';
    const comentarios = document.getElementById('Comentarios').value || '';
    const comprador = document.getElementById('Comprador').value || '';

    // NEW FIELDS
    const aComp = document.getElementById('AnaliseCompetitividade').value || '-';
    const aComm = document.getElementById('AnaliseCommodities').value || '-';
    const rMap = document.getElementById('ReducaoMapeada').value || '-';
    
    // STYLES
    const styleHeader = 'background-color: #000; color: white; font-weight: bold; padding: 5px; border: 1px solid #000; text-align: center;';
    const styleCellLabel = 'background-color: #f2f2f2; font-weight: bold; padding: 5px; border: 1px solid #000; color: #000;';
    const styleCellVal = 'padding: 5px; border: 1px solid #000; text-align: center; color: #000;';
    const styleBold = 'font-weight: bold; color: #000;';

    const symbol = CURRENCIES[currentCurrency] ? CURRENCIES[currentCurrency].symbol : '';
    const formatMoney = (val) => {
        let num = parseLocaleFloat(val);
        return symbol + ' ' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    let html = `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #000;">
            <p>Dear Team,</p>
            <p>Please find below the impact analysis for the price adjustment - <strong>${fornecedor}</strong>:</p>
            <br>
            <table style="border-collapse: collapse; width: 100%; max-width: 800px; font-size: 10pt; border: 1px solid #000;">
                    <thead>
                    <tr><th style="${styleHeader}" width="40%">Description</th><th style="${styleHeader}" width="60%">Details</th></tr>
                </thead>
                <tbody>
                    <tr><td style="${styleCellLabel}">Business Unit:</td><td style="${styleCellVal}">${unit}</td></tr>
                    <tr><td style="${styleCellLabel}">Buyer:</td><td style="${styleCellVal}">${comprador}</td></tr>
                    <tr><td style="${styleCellLabel}">Supplier:</td><td style="${styleCellVal}">${fornecedor}</td></tr>
                    <tr><td style="${styleCellLabel}">Reason:</td><td style="${styleCellVal}">${motivo}</td></tr>
                    
                    <tr><td style="${styleCellLabel}">Competitiveness Analysis:</td><td style="${styleCellVal}">${aComp}</td></tr>
                    <tr><td style="${styleCellLabel}">Commodities Analysis:</td><td style="${styleCellVal}">${aComm}</td></tr>
                    <tr><td style="${styleCellLabel}">Mapped Reduction (Offset):</td><td style="${styleCellVal}">${rMap}</td></tr>

                    <tr><td style="${styleCellLabel}">Effective Date:</td><td style="${styleCellVal}">${dataVig}</td></tr>
                    <tr><td style="${styleCellLabel}">% Adjustment:</td><td style="${styleCellVal} ${styleBold}">${perc}</td></tr>
                    <tr><td style="${styleCellLabel}">Financial Impact:</td><td style="${styleCellVal} ${styleBold} color: #dc3545;">${impacto}</td></tr>
                    
                    <tr>
                        <td style="${styleCellLabel}">Avoidance (Neutralized):</td>
                        <td style="${styleCellVal} ${styleBold} color: #198754;">${avoidance}</td>
                    </tr>

                    <tr><td style="${styleCellLabel}">Comments:</td><td style="${styleCellVal} text-align: left;">${comentarios}</td></tr>
                </tbody>
            </table>
            <br>
            <table style="border-collapse: collapse; width: 100%; max-width: 1000px; font-size: 9pt; border: 1px solid #000;">
                <thead>
                    <tr>
                        <th style="${styleHeader}">Code</th>
                        <th style="${styleHeader}">Description</th>
                        <th style="${styleHeader}">Current Price</th>
                        <th style="${styleHeader}">Proposal</th>
                        <th style="${styleHeader}">New Price</th>
                        <th style="${styleHeader}">Volume</th>
                        <th style="${styleHeader}">Impact</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const tableRows = document.querySelectorAll('#local-material-table tbody .item-row');
    tableRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const cod = inputs[0].value;
        const desc = inputs[1].value;
        
        if(cod || desc) {
            const pAtual = formatMoney(inputs[2].value);
            const pProposta = formatMoney(inputs[3].value);
            const pNovo = formatMoney(inputs[4].value);
            const pImpacto = formatMoney(inputs[7].value);

            html += `<tr>
                <td style="${styleCellVal}">${cod}</td>
                <td style="${styleCellVal} text-align:left;">${desc}</td>
                <td style="${styleCellVal}">${pAtual}</td>
                <td style="${styleCellVal}">${pProposta}</td>
                <td style="${styleCellVal}">${pNovo}</td>
                <td style="${styleCellVal}">${inputs[5].value}</td>
                <td style="${styleCellVal} ${styleBold}">${pImpacto}</td> 
            </tr>`;
        }
    });
    
    html += `</tbody></table><br><p>Best regards,<br><strong>${comprador}</strong></p></div>`;

    // --- ROBUST COPY LOGIC ---
    try {
        if (navigator.clipboard && navigator.clipboard.write) {
            const type = "text/html";
            const blob = new Blob([html], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            await navigator.clipboard.write(data);
        } else {
            throw new Error("Clipboard API not available");
        }
    } catch (err) {
        console.warn("Modern method failed, trying legacy fallback...", err);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        tempDiv.style.position = "fixed";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);
        
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        selection.removeAllRanges();
        selection.addRange(range);
        
        try {
            document.execCommand('copy');
        } catch (e) {
            console.error("Copy fallback failed", e);
            showToast("Error: Copy the table manually.", "danger");
            return; 
        } finally {
            document.body.removeChild(tempDiv);
            selection.removeAllRanges();
        }
    }

    showToast("Table copied! Paste it into Outlook (Ctrl+V).", "success");
    
    const subject = encodeURIComponent(`Price Adjustment - ${fornecedor} - ${unit}`);
    const body = encodeURIComponent("Paste the table here (Ctrl+V)...");
    
    setTimeout(() => { window.location.href = `mailto:?subject=${subject}&body=${body}`; }, 300);
}

function showToast(msg, type) {
    const el = document.getElementById('post-status-toast');
    el.className = `toast align-items-center text-white bg-${type} border-0 status-toast`;
    el.style.display = 'block';
    document.getElementById('toast-message').innerText = msg;
    if(type !== 'primary') setTimeout(() => el.style.display='none', 5000);
}
function hideToast() { document.getElementById('post-status-toast').style.display='none'; }

window.onload = () => {
    document.querySelector('#local-material-table tbody').innerHTML = TEMPLATE_ROW.trim();
    document.querySelector('.row-id-field').textContent = '1';
    changeCurrency('USD');
};
