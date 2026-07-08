// --- CONFIGURAÇÃO ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyaWbT5hLTnR2DDP8XAq8DXlHuJ8hVolP2M1QzzANjgzyI8RLQBnLH2-sXMz-mPhk1G/exec"; 

document.getElementById('current-date-display').textContent = new Date().toLocaleDateString();

// --- SISTEMA DE TRADUÇÃO MULTI-IDIOMAS (i18n) ---
let currentLanguage = 'en';

const TRANSLATIONS = {
    'en': {
        'main-title': 'Price Adjustment Request',
        'main-subtitle': 'Checklist and financial impact analysis',
        'checklist-title': 'Checklist',
        'sec-supplier-profile': 'Supplier Profile',
        'lbl-bu': 'Business Unit',
        'opt-select': 'Select...',
        'lbl-buyer': 'Buyer',
        'sec-impact-analysis': 'Impact Analysis',
        'lbl-reason': 'Reason for Request',
        'lbl-competitiveness': 'Competitiveness Analysis',
        'lbl-commodities': 'Commodities Analysis',
        'lbl-offset': 'Is there a mapped reduction to neutralize?',
        'lbl-impact-claim': 'Impact (Claim)',
        'lbl-impact-negot': 'Impact (Negot.)',
        'lbl-neutralized': 'Neutralized Impact',
        'lbl-avg-adj': 'Average Adjustment %',
        'sec-supplier-data': 'Supplier Data',
        'lbl-code': 'Code',
        'lbl-supplier-name': 'Supplier Name',
        'lbl-impl-date': 'Implementation Date',
        'lbl-new-payment': 'New Payment Term',
        'sec-financial': 'Financial',
        'lbl-currency': 'Currency',
        'lbl-tax-rate': 'Rate',
        'lbl-total-annual-impact': 'Total Annual Impact',
        'lbl-comments': 'Comments',
        'btn-save': 'Save Adjustment',
        'sec-materials-list': 'Materials List',
        'btn-add-item': 'Add Item',
        'btn-remove': 'Remove',
        'th-code': 'Code',
        'th-desc': 'Description',
        'th-curr-price': 'Current Price',
        'th-proposal': 'Proposal',
        'th-final-price': 'Final Price',
        'th-vol': 'Vol.',
        'th-impact-claim': 'Impact (Claim)',
        'th-impact-negot': 'Impact (Negot.)',
        'tip-text': 'Tip: Fill in Current Price, Proposal, Final Price and Volume to calculate. **You can copy cells from Excel and paste directly into the table above.**',
        'placeholder-reason': 'e.g., Inflation, Collective Agreement, Raw Material...',
        'placeholder-competitiveness': 'Market comparison...',
        'placeholder-commodities': 'Raw material trends...',
        'placeholder-offset': 'Mapped Reduction?',
        'placeholder-code': 'Code',
        'placeholder-desc': 'Description',
        'msg-processing': 'Processing...',
        'msg-sending': 'Sending data...',
        'msg-saved': 'Saved successfully!',
        'msg-error-conn': 'Connection error.',
        'msg-copied': 'Table copied! Paste into Outlook (Ctrl+V).',
        'email-dear': 'Dear All,',
        'email-intro': 'Please find below the price adjustment impact analysis for',
        'email-details': 'Details'
    },
    'pt-BR': {
        'main-title': 'Solicitação de Reajuste',
        'main-subtitle': 'Check-list e análise de impacto financeiro',
        'checklist-title': 'Check List',
        'sec-supplier-profile': 'Perfil do Fornecedor',
        'lbl-bu': 'Unidade de Negócio',
        'opt-select': 'Selecione...',
        'lbl-buyer': 'Comprador',
        'sec-impact-analysis': 'Análise de Impacto',
        'lbl-reason': 'Motivo da Solicitação',
        'lbl-competitiveness': 'Análise de competitividade',
        'lbl-commodities': 'Análise de commodities',
        'lbl-offset': 'Há redução mapeada para neutralizar?',
        'lbl-impact-claim': 'Impacto (Pleito)',
        'lbl-impact-negot': 'Impacto (Negoc.)',
        'lbl-neutralized': 'Impacto Neutralizado',
        'lbl-avg-adj': '% média reajuste',
        'sec-supplier-data': 'Dados do Fornecedor',
        'lbl-code': 'Cód.',
        'lbl-supplier-name': 'Nome do Fornecedor',
        'lbl-impl-date': 'Data Implementação',
        'lbl-new-payment': 'Novo Prazo Pagto',
        'sec-financial': 'Financeiro',
        'lbl-currency': 'Moeda',
        'lbl-tax-rate': 'Taxa',
        'lbl-total-annual-impact': 'Impacto Anual Total',
        'lbl-comments': 'Comentários',
        'btn-save': 'Salvar Reajuste',
        'sec-materials-list': 'Lista de Materiais',
        'btn-add-item': 'Add Item',
        'btn-remove': 'Remover',
        'th-code': 'Cód.',
        'th-desc': 'Descrição',
        'th-curr-price': 'Preço Atual',
        'th-proposal': 'Proposta',
        'th-final-price': 'Preço Final',
        'th-vol': 'Vol.',
        'th-impact-claim': 'Impacto (Pleito)',
        'th-impact-negot': 'Impacto (Negoc.)',
        'tip-text': 'Dica: Preencha Preço Atual, Proposta, Preço Final e Volume para calcular. **Você pode copiar células do Excel e colar diretamente na tabela acima.**',
        'placeholder-reason': 'Ex: Inflação, Dissídio, Matéria Prima...',
        'placeholder-competitiveness': 'Comparativo com mercado...',
        'placeholder-commodities': 'Tendências de matéria-prima...',
        'placeholder-offset': 'Redução Mapeada?',
        'placeholder-code': 'Código',
        'placeholder-desc': 'Descrição',
        'msg-processing': 'Processando...',
        'msg-sending': 'Enviando dados...',
        'msg-saved': 'Salvo com sucesso!',
        'msg-error-conn': 'Erro de conexão.',
        'msg-copied': 'Tabela copiada! Cole no Outlook (Ctrl+V).',
        'email-dear': 'Prezados精神,',
        'email-intro': 'Segue análise de impacto para reajuste de preço -',
        'email-details': 'Detalhes'
    },
    'th': {
        'main-title': 'คำขอปรับราคา',
        'main-subtitle': 'รายการตรวจสอบและการวิเคราะห์ผลกระทบทางการเงิน',
        'checklist-title': 'รายการตรวจสอบ',
        'sec-supplier-profile': 'ข้อมูลซัพพลายเออร์',
        'lbl-bu': 'หน่วยธุรกิจ',
        'opt-select': 'เลือก...',
        'lbl-buyer': 'ผู้จัดซื้อ',
        'sec-impact-analysis': 'การวิเคราะห์ผลกระทบ',
        'lbl-reason': 'เหตุผลที่ขอปรับราคา',
        'lbl-competitiveness': 'การวิเคราะห์ความสามารถในการแข่งขัน',
        'lbl-commodities': 'การวิเคราะห์สินค้าโภคภัณฑ์',
        'lbl-offset': 'มีการลดราคาที่วางแผนไว้เพื่อชดเชยหรือไม่?',
        'lbl-impact-claim': 'ผลกระทบ (เรียกร้อง)',
        'lbl-impact-negot': 'ผลกระทบ (เจรจา)',
        'lbl-neutralized': 'ผลกระทบที่บรรเทาได้',
        'lbl-avg-adj': '% การปรับราคาเฉลี่ย',
        'sec-supplier-data': 'ข้อมูลซัพพลายเออร์',
        'lbl-code': 'รหัส',
        'lbl-supplier-name': 'ชื่อซัพพลายเออร์',
        'lbl-impl-date': 'วันที่มีผลบังคับใช้',
        'lbl-new-payment': 'เงื่อนไขการชำระเงินใหม่',
        'sec-financial': 'การเงิน',
        'lbl-currency': 'สกุลเงิน',
        'lbl-tax-rate': 'อัตราแลกเปลี่ยน',
        'lbl-total-annual-impact': 'ผลกระทบต่อปีทั้งหมด',
        'lbl-comments': 'ความคิดเห็น',
        'btn-save': 'บันทึกการปรับราคา',
        'sec-materials-list': 'รายการวัตถุดิบ',
        'btn-add-item': 'เพิ่มรายการ',
        'btn-remove': 'ลบรายการ',
        'th-code': 'รหัส',
        'th-desc': 'รายละเอียด',
        'th-curr-price': 'ราคาปัจจุบัน',
        'th-proposal': 'ราคาที่เสนอ',
        'th-final-price': 'ราคาขั้นสุดท้าย',
        'th-vol': 'จำนวน',
        'th-impact-claim': 'ผลกระทบ (เรียกร้อง)',
        'th-impact-negot': 'ผลกระทบ (เจรจา)',
        'tip-text': 'คำแนะนำ: กรอกราคาปัจจุบัน ราคาที่เสนอ ราคาขั้นสุดท้าย และจำนวนเพื่อคำนวณ **คุณสามารถคัดลอกเซลล์จาก Excel และวางในตารางด้านบนได้โดยตรง**',
        'placeholder-reason': 'ตย: เงินเฟ้อ, ค่าจ้าง, วัตถุดิบ...',
        'placeholder-competitiveness': 'เปรียบเทียบกับตลาด...',
        'placeholder-commodities': 'แนวโน้มวัตถุดิบ...',
        'placeholder-offset': 'แผนการลดราคา?',
        'placeholder-code': 'รหัส',
        'placeholder-desc': 'รายละเอียด',
        'msg-processing': 'กำลังดำเนินการ...',
        'msg-sending': 'กำลังส่งข้อมูล...',
        'msg-saved': 'บันทึกสำเร็จแล้ว!',
        'msg-error-conn': 'การเชื่อมต่อผิดพลาด',
        'msg-copied': 'คัดลอกตารางแล้ว! วางใน Outlook (Ctrl+V)',
        'email-dear': 'เรียน ทีมงาน,',
        'email-intro': 'เอกสารแนบตารางการวิเคราะห์ผลกระทบการปรับราคาของ -',
        'email-details': 'รายละเอียด'
    },
    'de': {
        'main-title': 'Preisanpassungsantrag',
        'main-subtitle': 'Checkliste und finanzielle Auswirkungsanalyse',
        'checklist-title': 'Checkliste',
        'sec-supplier-profile': 'Lieferantenprofil',
        'lbl-bu': 'Geschäftsbereich',
        'opt-select': 'Auswählen...',
        'lbl-buyer': 'Einkäufer',
        'sec-impact-analysis': 'Auswirkungsanalyse',
        'lbl-reason': 'Grund für die Anfrage',
        'lbl-competitiveness': 'Wettbewerbsanalyse',
        'lbl-commodities': 'Rohstoffanalyse',
        'lbl-offset': 'Gibt es eine geplante Reduzierung zur Neutralisierung?',
        'lbl-impact-claim': 'Auswirkung (Forderung)',
        'lbl-impact-negot': 'Auswirkung (Verhandelt)',
        'lbl-neutralized': 'Neutralisierte Auswirkung',
        'lbl-avg-adj': 'Durchschn. Anpassung %',
        'sec-supplier-data': 'Lieferantendaten',
        'lbl-code': 'Code',
        'lbl-supplier-name': 'Lieferantenname',
        'lbl-impl-date': 'Umsetzungsdatum',
        'lbl-new-payment': 'Neues Zahlungsziel',
        'sec-financial': 'Finanzen',
        'lbl-currency': 'Währung',
        'lbl-tax-rate': 'Wechselkurs',
        'lbl-total-annual-impact': 'Gesamte jährliche Auswirkung',
        'lbl-comments': 'Kommentare',
        'btn-save': 'Anpassung speichern',
        'sec-materials-list': 'Materialliste',
        'btn-add-item': 'Artikel hinzufügen',
        'btn-remove': 'Entfernen',
        'th-code': 'Code',
        'th-desc': 'Beschreibung',
        'th-curr-price': 'Aktueller Preis',
        'th-proposal': 'Angebot',
        'th-final-price': 'Endpreis',
        'th-vol': 'Vol.',
        'th-impact-claim': 'Auswirkung (Forderung)',
        'th-impact-negot': 'Auswirkung (Verhandelt)',
        'tip-text': 'Tipp: Füllen Sie aktuellen Preis, Angebot, Endpreis und Volumen aus, um zu rechnen. **Sie können Zellen aus Excel kopieren und direkt in die obige Tabelle einfügen.**',
        'placeholder-reason': 'z.B. Inflation, Tarifvertrag, Rohstoff...',
        'placeholder-competitiveness': 'Marktvergleich...',
        'placeholder-commodities': 'Rohstofftrends...',
        'placeholder-offset': 'Geplante Reduzierung?',
        'placeholder-code': 'Code',
        'placeholder-desc': 'Beschreibung',
        'msg-processing': 'In Bearbeitung...',
        'msg-sending': 'Daten werden gesendet...',
        'msg-saved': 'Erfolgreich gespeichert!',
        'msg-error-conn': 'Verbindungsfehler.',
        'msg-copied': 'Tabelle kopiert! In Outlook einfügen (Ctrl+V).',
        'email-dear': 'Sehr geehrte Damen und Herren,',
        'email-intro': 'Anbei finden Sie die Preisanpassungs-Auswirkungsanalyse für -',
        'email-details': 'Details'
    }
};

function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Traduz textos estáticos baseados em data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.innerHTML = TRANSLATIONS[lang][key];
        }
    });

    // Atualiza Placeholders Dinâmicos
    document.getElementById('MotivoReajuste').placeholder = TRANSLATIONS[lang]['placeholder-reason'];
    document.getElementById('AnaliseCompetitividade').placeholder = TRANSLATIONS[lang]['placeholder-competitiveness'];
    document.getElementById('AnaliseCommodities').placeholder = TRANSLATIONS[lang]['placeholder-commodities'];
    document.getElementById('ReducaoMapeada').placeholder = TRANSLATIONS[lang]['placeholder-offset'];

    // Força atualização dos cabeçalhos das moedas dinâmicas da tabela
    const businessUnit = document.getElementById('BusinessUnit').value;
    if (businessUnit) {
        updateCurrencyLabelsOnly();
    } else {
        const sym = CURRENCIES[currentCurrency].symbol;
        document.getElementById('th-preco-atual').textContent = `${TRANSLATIONS[lang]['th-curr-price']} (${sym})`;
        document.getElementById('th-preco-proposta').textContent = `${TRANSLATIONS[lang]['th-proposal']} (${sym})`;
        document.getElementById('th-preco-novo').textContent = `${TRANSLATIONS[lang]['th-final-price']} (${sym})`;
        document.getElementById('th-impacto-total').textContent = `${TRANSLATIONS[lang]['th-impact-claim']} (${sym})`;
        document.getElementById('th-impacto-anual').textContent = `${TRANSLATIONS[lang]['th-impact-negot']} (${sym})`;
    }

    // Atualiza as linhas já existentes para refletir os novos placeholders de código/descrição
    document.querySelectorAll('.item-row').forEach(row => {
        row.querySelector('[name="CodMat[]"]').placeholder = TRANSLATIONS[lang]['placeholder-code'];
        row.querySelector('[name="Descricao[]"]').placeholder = TRANSLATIONS[lang]['placeholder-desc'];
    });

    calculateTotalImpact();
}

function updateCurrencyLabelsOnly() {
    const lang = currentLanguage;
    const sym = CURRENCIES[currentCurrency].symbol;
    const bu = document.getElementById('BusinessUnit').value;
    const baseCurrency = BASE_CURRENCY_MAP[bu] || 'USD';

    document.getElementById('label-taxa-cambio').innerHTML = `<span data-i18n="lbl-tax-rate">${TRANSLATIONS[lang]['lbl-tax-rate']}</span> (-> ${baseCurrency})`;
    document.getElementById('label-impacto-anual').innerHTML = `<span data-i18n="lbl-total-annual-impact">${TRANSLATIONS[lang]['lbl-total-annual-impact']}</span> (${baseCurrency})`;
    
    document.getElementById('th-preco-atual').textContent = `${TRANSLATIONS[lang]['th-curr-price']} (${sym})`;
    document.getElementById('th-preco-proposta').textContent = `${TRANSLATIONS[lang]['th-proposal']} (${sym})`;
    document.getElementById('th-preco-novo').textContent = `${TRANSLATIONS[lang]['th-final-price']} (${sym})`;
    document.getElementById('th-impacto-total').textContent = `${TRANSLATIONS[lang]['th-impact-claim']} (${sym})`;
    document.getElementById('th-impacto-anual').textContent = `${TRANSLATIONS[lang]['th-impact-negot']} (${sym})`;
}


// --- DEFINIÇÃO DE MOEDAS E TAXAS BASE ---
const CURRENCIES = {
    'USD': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'de-DE' },
    'THB': { symbol: '฿', locale: 'th-TH' },
    'CNY': { symbol: '¥', locale: 'zh-CN' }
};

let currentCurrency = 'USD';

const BASE_CURRENCY_MAP = {
    'Interman': 'USD', 
    'Solo EUA': 'USD', 
    'Solo DEU': 'EUR',
    'Solo CHN': 'CNY'
};

const EXCHANGE_RATES = {
     'USD': { 'USD': 1.0000, 'EUR': 0.9300, 'CNY': 7.2300, 'THB': 36.5000 },
     'EUR': { 'USD': 1.0700, 'EUR': 1.0000, 'CNY': 7.7500, 'THB': 39.2000 },
     'CNY': { 'USD': 0.1380, 'EUR': 0.1290, 'CNY': 1.0000, 'THB': 5.0500 },
     'THB': { 'USD': 0.0274, 'EUR': 0.0255, 'CNY': 0.1980, 'THB': 1.0000 }
};

function parseLocaleFloat(value) {
    if (typeof value === 'string') {
        let clean = value.replace(/[^\d.,-]/g, ''); 
        if (clean.includes(',') && clean.includes('.')) {
            clean = clean.replace(/\./g, '').replace(/,/g, '.');
        } else if (clean.includes(',')) {
            clean = clean.replace(/,/g, '.');
        }
        return parseFloat(clean) || 0;
    }
    return parseFloat(value) || 0;
}

function toServerFormat(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return "0,00";
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
    
    currencySelect.value = baseCurrency;
    currentCurrency = baseCurrency;
    
    updateCurrencyLabelsOnly();
    updateTaxaCambioState(currentCurrency, businessUnit);
    
    document.getElementById('Moeda').value = currentCurrency;
    calculateTotalImpact();
}

function changeCurrency(newCurrency) {
    currentCurrency = newCurrency;
    document.getElementById('Moeda').value = newCurrency;
    
    updateCurrencyLabelsOnly();
    const businessUnit = document.getElementById('BusinessUnit').value;
    updateTaxaCambioState(currentCurrency, businessUnit);
    
    document.querySelectorAll('.item-row').forEach(row => {
        const inp = row.querySelector('.price-current');
        if (inp && inp.value) calcRow(inp);
    });
    
    calculateTotalImpact();
}

// --- TABELA DE MATERIAIS ---
const COLUMN_CLASSES = ['CodMat[]', 'Descricao[]', 'price-current', 'price-proposal', 'price-new', 'vol-annual'];

function addRow() {
    const lang = currentLanguage;
    const template = `
        <tr class="item-row">
            <td class="text-center row-id-field fw-bold text-secondary small">1</td> 
            <td><input type="text" class="table-input" name="CodMat[]" placeholder="${TRANSLATIONS[lang]['placeholder-code']}"></td>
            <td><input type="text" class="table-input" name="Descricao[]" placeholder="${TRANSLATIONS[lang]['placeholder-desc']}"></td>
            <td><input type="text" class="table-input text-end price-current" placeholder="0.00" oninput="calcRow(this)"></td>
            <td><input type="text" class="table-input text-end text-muted fst-italic price-proposal" placeholder="0.00" oninput="calcRow(this)"></td> 
            <td><input type="text" class="table-input text-end price-new fw-bold" placeholder="0.00" oninput="calcRow(this)"></td>
            <td><input type="text" class="table-input text-end vol-annual" placeholder="0" oninput="calcRow(this)"></td>
            <td><input type="text" class="table-input text-end impact-total text-primary fw-bold" readonly data-raw="0"></td> 
            <td><input type="text" class="table-input text-end impact-annual text-danger fw-bold" readonly data-raw="0"></td>
        </tr>
    `;
    document.querySelector('#local-material-table tbody').insertAdjacentHTML('beforeend', template.trim());
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

// Lógica de colagem estruturada do Excel
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

// --- SUBMIT DO FORMULÁRIO ---
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const lang = currentLanguage;
    const form = e.target;
    const submitButton = document.getElementById('submit-button');
    const originalBtnHtml = submitButton.innerHTML;
    
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${TRANSLATIONS[lang]['msg-processing']}`;
    showToast(TRANSLATIONS[lang]['msg-sending'], "primary");
    
    const formData = new FormData(form);
    formData.set('action', 'insert');

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
            showToast(TRANSLATIONS[lang]['msg-saved'], "success");
            await copyAndOpenOutlook();
            resetForm();
        } else {
            showToast("Erro: " + (data.error || data.message), "danger");
        }
    } catch (err) {
        console.error(err);
        showToast(TRANSLATIONS[lang]['msg-error-conn'], "danger");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnHtml;
    }
}

function resetForm() {
    document.getElementById('reajusteForm').reset();
    document.getElementById('currency-select').value = 'USD';
    document.getElementById('BusinessUnit').value = "";
    changeCurrency('USD');
}

// --- FUNÇÃO DE EXPORTAÇÃO PARA OUTLOOK INTERNACIONALE —
async function copyAndOpenOutlook() {
    const lang = currentLanguage;
    const unit = document.getElementById('BusinessUnit').value || '';
    const fornecedor = document.getElementById('Fornecedor').value || '';
    const motivo = document.getElementById('MotivoReajuste').value || '';
    const dataVig = document.getElementById('DataVigencia').value || '';
    const impacto = document.getElementById('TotalImpactoNegocDisplay').value || '';
    const avoidance = document.getElementById('ImpactoNeutralizadoDisplay').value || '0.00'; 
    const perc = document.getElementById('PercentualNegocDisplay').value || '';
    const comentarios = document.getElementById('Comentarios').value || '';
    const comprador = document.getElementById('Comprador').value || '';

    const aComp = document.getElementById('AnaliseCompetitividade').value || '-';
    const aComm = document.getElementById('AnaliseCommodities').value || '-';
    const rMap = document.getElementById('ReducaoMapeada').value || '-';
    
    const styleHeader = 'background-color: #000; color: white; font-weight: bold; padding: 5px; border: 1px solid #000; text-align: center;';
    const styleCellLabel = 'background-color: #f2f2f2; font-weight: bold; padding: 5px; border: 1px solid #000; color: #000;';
    const styleCellVal = 'padding: 5px; border: 1px solid #000; text-align: center; color: #000;';
    const styleBold = 'font-weight: bold; color: #000;';

    const symbol = CURRENCIES[currentCurrency] ? CURRENCIES[currentCurrency].symbol : '';
    const formatMoney = (val) => {
        let num = parseLocaleFloat(val);
        return symbol + ' ' + num.toLocaleString(CURRENCIES[currentCurrency].locale, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    };

    let html = `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #000;">
            <p>${TRANSLATIONS[lang]['email-dear']}</p>
            <p>${TRANSLATIONS[lang]['email-intro']} <strong>${fornecedor}</strong>:</p>
            <br>
            <table style="border-collapse: collapse; width: 100%; max-width: 800px; font-size: 10pt; border: 1px solid #000;">
                <thead>
                    <tr><th style="${styleHeader}" width="40%">${TRANSLATIONS[lang]['th-desc']}</th><th style="${styleHeader}" width="60%">${TRANSLATIONS[lang]['email-details']}</th></tr>
                </thead>
                <tbody>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-bu']}:</td><td style="${styleCellVal}">${unit}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-buyer']}:</td><td style="${styleCellVal}">${comprador}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-supplier-name']}:</td><td style="${styleCellVal}">${fornecedor}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-reason']}:</td><td style="${styleCellVal}">${motivo}</td></tr>
                    
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-competitiveness']}:</td><td style="${styleCellVal}">${aComp}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-commodities']}:</td><td style="${styleCellVal}">${aComm}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-offset']}:</td><td style="${styleCellVal}">${rMap}</td></tr>

                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-impl-date']}:</td><td style="${styleCellVal}">${dataVig}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-avg-adj']}:</td><td style="${styleCellVal} ${styleBold}">${perc}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-impact-negot']}:</td><td style="${styleCellVal} ${styleBold} color: #dc3545;">${impacto}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-neutralized']}:</td><td style="${styleCellVal} ${styleBold} color: #198754;">${avoidance}</td></tr>
                    <tr><td style="${styleCellLabel}">${TRANSLATIONS[lang]['lbl-comments']}:</td><td style="${styleCellVal} text-align: left;">${comentarios}</td></tr>
                </tbody>
            </table>
            <br>
            <table style="border-collapse: collapse; width: 100%; max-width: 1000px; font-size: 9pt; border: 1px solid #000;">
                <thead>
                    <tr>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-code']}</th>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-desc']}</th>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-curr-price']}</th>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-proposal']}</th>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-final-price']}</th>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-vol']}</th>
                        <th style="${styleHeader}">${TRANSLATIONS[lang]['th-impact-claim']}</th>
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
            console.error("Fallback clipboard failed", e);
            return; 
        } finally {
            document.body.removeChild(tempDiv);
            selection.removeAllRanges();
        }
    }

    showToast(TRANSLATIONS[lang]['msg-copied'], "success");
    
    const subject = encodeURIComponent(`${TRANSLATIONS[lang]['main-title']} - ${fornecedor} - ${unit}`);
    const body = encodeURIComponent("Ctrl+V...");
    
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
    // Inicializa a tabela padrão
    document.querySelector('#local-material-table tbody').innerHTML = '';
    addRow(); 
    // Força o carregamento do idioma inglês como padrão do sistema
    changeLanguage('en');
};
