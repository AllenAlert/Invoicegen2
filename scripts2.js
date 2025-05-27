// Show form on load
const overlay = document.getElementById('formOverlay');
if (overlay) overlay.style.display = 'flex';

// Cancel button
const cancelBtn = document.getElementById('cancelBtn');
if (cancelBtn && overlay) {
  cancelBtn.onclick = () => overlay.style.display = 'none';
}

// Add more items
const addItemBtn = document.getElementById('addItem');
const itemsContainer = document.getElementById('itemsContainer');
if (addItemBtn && itemsContainer) {
  addItemBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML =
      '<input type="text" class="desc" placeholder="Description" required/>' +
      '<input type="number" class="price" placeholder="Price" required/>' +
      '<input type="number" class="qty" placeholder="Qty" required/>';
    itemsContainer.appendChild(row);
  });
}

// Generate unique invoice ID in format INV-YYYYMMDD-0001
function generateInvoiceID() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  // Retrieve last count from localStorage
  const lastDate = localStorage.getItem('lastInvoiceDate');
  let count = Number(localStorage.getItem('dailyInvoiceCount')) || 0;

  if (lastDate !== datePart) {
    count = 1; // reset count if new day
  } else {
    count += 1;
  }

  localStorage.setItem('lastInvoiceDate', datePart);
  localStorage.setItem('dailyInvoiceCount', count);

  const countPart = String(count).padStart(4, '0');
  return `INV-${datePart}-${countPart}`;
}

// Handle form submit (with barcode)
const invoiceForm = document.getElementById('invoiceForm');
if (invoiceForm && overlay) {
  invoiceForm.addEventListener('submit', e => {
    e.preventDefault();

    // ─── BARCODE GENERATION ──────────────────────────────────────────────────────
    // 1) Unique ID for this invoice
    const invoiceId = generateInvoiceID();
    // 2) Barcode image URL (Code 128)
    const barcodeUrl = `https://barcodeapi.org/api/128/${invoiceId}`;
    // 3) Create <img> and insert above datesSection
    const barcodeImg = document.createElement('img');
    barcodeImg.src = barcodeUrl;
    barcodeImg.alt = `Invoice #${invoiceId}`;
    barcodeImg.style.maxWidth = '180px';
    barcodeImg.style.marginBottom = '10px';

    const datesSectionContainer = document.getElementById('datesSection');
    if (datesSectionContainer && datesSectionContainer.parentNode) {
      datesSectionContainer.parentNode.insertBefore(barcodeImg, datesSectionContainer);
    }
    // ─────────────────────────────────────────────────────────────────────────────

    // Display invoice ID if you have a slot for it
    const invoiceIdSlot = document.getElementById('invoice-id');
    if (invoiceIdSlot) invoiceIdSlot.textContent = invoiceId;

    // Header logo (if you ever add a logo URL input)
    const logoSlot = document.getElementById('logoSlot');
    const logoUrl = document.getElementById('logoUrl');
    if (logoSlot && logoUrl) logoSlot.src = logoUrl.value;

    // Dates
    const invoiceDate = document.getElementById('invoiceDate');
    const dueDate = document.getElementById('dueDate');
    const datesSection = document.getElementById('datesSection');
    if (invoiceDate && dueDate && datesSection) {
      datesSection.innerHTML =
        `<p><strong>Invoice Date:</strong> ${invoiceDate.value}</p>` +
        `<p><strong>Invoice Due Date:</strong> ${dueDate.value}</p>`;
    }

    // Billing
    const clientName = document.getElementById('clientName');
    const clientAddress = document.getElementById('clientAddress');
    const billingSection = document.getElementById('billingSection');
    if (clientName && clientAddress && billingSection) {
      billingSection.innerHTML =
        `<p><strong>BILLING TO</strong><br>${clientName.value}<br>${clientAddress.value}</p>`;
    }

    // Items table
    const descs = document.querySelectorAll('.desc');
    const prices = document.querySelectorAll('.price');
    const qtys   = document.querySelectorAll('.qty');
    let tbl = '<tr><th>Description</th><th>Price</th><th>Qty</th><th>Total</th></tr>';
    let total = 0;
    descs.forEach((d,i) => {
      const p = parseFloat(prices[i]?.value || 0);
      const q = parseInt(qtys[i]?.value || 0);
      const t = p * q;
      total += t;
      tbl += `<tr><td>${d.value}</td><td>₦${p}</td><td>${q}</td><td>₦${t}</td></tr>`;
    });
    const itemsTable = document.getElementById('itemsTable');
    if (itemsTable) itemsTable.innerHTML = tbl;

    // Summary calculations
    const discount = document.getElementById('discount');
    const taxInput = document.getElementById('tax');
    const summarySection = document.getElementById('summarySection');
    const disc = parseFloat(discount?.value) || 0;
    const taxPercent = parseFloat(taxInput?.value) || 0;
    const taxAmount = ((total - disc) * taxPercent) / 100;
    const grand = total - disc + taxAmount;
    if (summarySection) {
      summarySection.innerHTML =
        `<tr><td><strong>Total</strong></td><td>₦${total.toFixed(2)}</td></tr>` +
        `<tr><td><strong>Discount</strong></td><td>₦${disc.toFixed(2)}</td></tr>` +
        `<tr><td><strong>Tax (${taxPercent}%)</strong></td><td>₦${taxAmount.toFixed(2)}</td></tr>` +
        `<tr><td class="grand-total"><strong>Grand Total</strong></td><td class="grand-total">₦${grand.toFixed(2)}</td></tr>`;
    }

    // Hide form
    overlay.style.display = 'none';
  });
}
