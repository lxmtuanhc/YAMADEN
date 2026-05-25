const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROOT = path.resolve(__dirname, "..");
const PAGE = { size: "A4", width: 595.28, height: 841.89, margin: 32 };
const COLORS = {
  ink: "#222222",
  title: "#111111",
  muted: "#555555",
  primary: "#111111",
  line: "#CCCCCC",
  divider: "#DDDDDD",
  soft: "#FAFAFA",
  paper: "#FFFFFF",
  red: "#DC2626"
};

const COMPANY = {
  nameJa: "\u682a\u5f0f\u4f1a\u793e \u5c71\u96fb",
  nameEn: "YAMADEN CO.,LTD",
  tagline: "",
  address: "",
  phone: "",
  email: "",
  website: ""
};

const LABELS = {
  ja: {
    title: "\u5fa1\u898b\u7a4d\u66f8",
    titleSub: "",
    client: "\u9867\u5ba2",
    project: "\u5de5\u4e8b\u540d",
    quoteInfo: "\u898b\u7a4d\u60c5\u5831",
    quoteNo: "\u898b\u7a4d\u756a\u53f7",
    quoteDate: "\u898b\u7a4d\u65e5",
    validUntil: "\u6709\u52b9\u671f\u9650",
    paymentTerms: "\u652f\u6255\u6761\u4ef6",
    assignee: "\u62c5\u5f53\u8005",
    department: "\u90e8\u7f72",
    address: "\u4f4f\u6240",
    phone: "\u96fb\u8a71",
    email: "\u30e1\u30fc\u30eb",
    totalInclVat: "\u5408\u8a08\uff08\u7a0e\u8fbc\uff09",
    subtotal: "\u5c0f\u8a08",
    discount: "\u5024\u5f15",
    taxable: "\u8ab2\u7a0e\u5bfe\u8c61\u984d",
    vat: "\u6d88\u8cbb\u7a0e",
    total: "\u5408\u8a08",
    remarks: "\u5099\u8003",
    summary: "\u5408\u8a08",
    no: "No.",
    item: "\u54c1\u76ee",
    description: "\u4ed5\u69d8 / \u5185\u5bb9",
    unit: "\u5358\u4f4d",
    qty: "\u6570\u91cf",
    unitPrice: "\u5358\u4fa1",
    disc: "\u5024\u5f15",
    amount: "\u91d1\u984d",
    prepared: "\u4f5c\u6210",
    checked: "\u78ba\u8a8d",
    approved: "\u627f\u8a8d",
    clientSign: "\u9867\u5ba2",
    defaultRemarks: "\u672c\u898b\u7a4d\u306f\u8a18\u8f09\u7bc4\u56f2\u306b\u57fa\u3065\u304d\u307e\u3059\u3002\u7bc4\u56f2\u5916\u306e\u8ffd\u52a0\u4f5c\u696d\u306f\u5225\u9014\u304a\u898b\u7a4d\u308a\u3044\u305f\u3057\u307e\u3059\u3002",
    defaultPaymentTerms: "\u691c\u53ce\u5f8c30\u65e5\u4ee5\u5185"
  }
};

function labelsFor() {
  return LABELS.ja;
}

function formatText(value) {
  if (value === null || value === undefined) return "-";
  const textValue = String(value).trim();
  return textValue ? textValue : "-";
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value, emptyAsDash = false) {
  if ((value === null || value === undefined || value === "") && emptyAsDash) return "-";
  return `\u00a5${numericValue(value).toLocaleString("ja-JP")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const textValue = String(value).trim();
    return textValue || "-";
  }
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function formatFileDate(value) {
  const date = value ? new Date(value) : new Date();
  const valid = Number.isNaN(date.getTime()) ? new Date() : date;
  return `${valid.getFullYear()}${String(valid.getMonth() + 1).padStart(2, "0")}${String(valid.getDate()).padStart(2, "0")}`;
}

function safeFilePart(value, fallback) {
  const cleaned = String(value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/[^A-Za-z0-9\s._-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
  return cleaned || fallback;
}

function quotePdfFileName(quote) {
  return [
    safeFilePart(
      quote.requestId ||
      quote.requestCode ||
      quote.requestNo ||
      quote.quoteNo ||
      quote.quoteCode ||
      quote.code,
      "quote"
    ),
    safeFilePart(quote.customerName || quote.customerCompany, "customer"),
    formatFileDate(quote.quotationDate || quote.quoteDate || quote.createdAt)
  ].join("_") + ".pdf";
}

function resolveFontPath() {
  const candidates = [
    path.join(ROOT, "fonts", "NotoSansJP-VF.ttf"),
    path.join(ROOT, "fonts", "NotoSansJP-Regular.ttf"),
    "C:\\Windows\\Fonts\\NotoSansJP-VF.ttf",
    "C:\\Windows\\Fonts\\meiryo.ttc",
    "C:\\Windows\\Fonts\\YuGothR.ttc"
  ];
  return candidates.find(filePath => fs.existsSync(filePath)) || null;
}

function setupFonts(doc) {
  const fontPath = resolveFontPath();
  if (!fontPath) {
    doc.font("Helvetica");
    return;
  }
  doc.registerFont("QuotationRegular", fontPath);
  doc.registerFont("QuotationBold", fontPath);
  doc.font("QuotationRegular");
}

function setFont(doc, bold = false) {
  doc.font(bold ? "QuotationBold" : "QuotationRegular");
}

function quotationLogoPath() {
  const candidates = [
    path.join(ROOT, "assets", "quotation-logo.png"),
    path.join(ROOT, "assets", "company-logo.png"),
    path.join(ROOT, "assets", "icon-512.png"),
    path.join(ROOT, "assets", "icon-192.png")
  ];
  return candidates.find(filePath => fs.existsSync(filePath)) || null;
}

function normalizeQuoteForPdf(quote = {}) {
  const quoteNo =
    quote.requestId ||
    quote.requestCode ||
    quote.requestNo ||
    quote.quoteNo ||
    quote.quoteCode ||
    quote.quoteNumber ||
    quote.code ||
    quote.number ||
    String(quote._id || "");
  const rawItems = Array.isArray(quote.quoteItems) && quote.quoteItems.length ? quote.quoteItems : Array.isArray(quote.items) ? quote.items : [];
  const items = rawItems.length ? rawItems.map((item, index) => {
    const quantity = numericValue(item.quantity ?? item.qty, 1);
    const unitPrice = numericValue(item.unitPrice ?? item.price, 0);
    const discountRate = numericValue(item.discountPercent ?? item.discountRate ?? item.discount, 0);
    const beforeDiscount = quantity * unitPrice;
    const computedDiscount = Math.round(beforeDiscount * discountRate / 100);
    const computedAmount = Math.max(0, beforeDiscount - computedDiscount);
    const storedAmount = numericValue(item.amount, NaN);
    return {
      no: index + 1,
      name: formatText(item.name || item.title),
      description: formatText(item.spec || item.description),
      unit: formatText(item.unit || "\u5f0f"),
      quantity,
      unitPrice,
      discountRate,
      amount: Number.isFinite(storedAmount) && storedAmount > 0 ? storedAmount : computedAmount
    };
  }) : [{
    no: 1,
    name: formatText(quote.projectName || quote.title || quote.content || quote.description || "\u96fb\u6c17\u5de5\u4e8b"),
    description: formatText(quote.content || quote.description),
    unit: "\u5f0f",
    quantity: 1,
    unitPrice: numericValue(quote.total || quote.subtotal, 0),
    discountRate: 0,
    amount: numericValue(quote.total || quote.subtotal, 0)
  }];

  const lineSubtotal = items.reduce((sum, item) => sum + numericValue(item.quantity, 1) * numericValue(item.unitPrice, 0), 0);
  const lineDiscount = items.reduce((sum, item) => {
    const beforeDiscount = numericValue(item.quantity, 1) * numericValue(item.unitPrice, 0);
    return sum + Math.round(beforeDiscount * numericValue(item.discountRate, 0) / 100);
  }, 0);
  const amountSubtotal = items.reduce((sum, item) => sum + numericValue(item.amount), 0);
  const subtotal = numericValue(quote.subtotal, lineSubtotal || amountSubtotal) || lineSubtotal || amountSubtotal;
  const discount = numericValue(quote.discountTotal ?? quote.discount, lineDiscount) || lineDiscount;
  const taxable = Math.max(0, numericValue(quote.taxableAmount ?? quote.taxable, subtotal - discount));
  const rawRate = quote.vatRate ?? quote.taxRate ?? 0.1;
  const taxRatePercent = numericValue(rawRate, 0.1) <= 1 ? numericValue(rawRate, 0.1) * 100 : numericValue(rawRate, 10);
  const tax = numericValue(quote.tax ?? quote.taxAmount ?? quote.vatAmount, Math.round(taxable * taxRatePercent / 100)) || Math.round(taxable * taxRatePercent / 100);
  const total = numericValue(quote.total, taxable + tax + numericValue(quote.rounding, 0)) || taxable + tax + numericValue(quote.rounding, 0);

  return {
    quoteNo: formatText(quoteNo),
    requestId: formatText(quoteNo),
    customerName: formatText(quote.customerName || quote.name),
    customerCompany: formatText(quote.customerCompany || quote.company),
    customerPerson: formatText(quote.customerPerson || quote.contactPerson),
    customerPhone: formatText(quote.customerPhone || quote.phone),
    customerEmail: formatText(quote.customerEmail || quote.email || quote.contact),
    customerAddress: formatText(quote.customerAddress || quote.address),
    projectName: formatText(quote.projectName || quote.title || quote.content || quote.description),
    assigneeName: formatText(quote.assigneeName || quote.staffName),
    departmentName: formatText(quote.departmentName || quote.department),
    createdAt: quote.quotationDate || quote.quoteDate || quote.createdAt || new Date(),
    validUntil: quote.validUntil || quote.expireDate || quote.validDate || "",
    paymentTerms: formatText(quote.paymentTerms),
    note: formatText(quote.note || quote.customerNote),
    items,
    subtotal,
    discount,
    taxable,
    tax,
    taxRatePercent,
    total
  };
}

function writeText(doc, value, x, y, options = {}) {
  doc.text(formatText(value), x, y, options);
}

function labelValue(doc, label, value, x, y, width, options = {}) {
  doc.fillColor(COLORS.muted);
  setFont(doc, true);
  doc.fontSize(options.labelSize || 6.5);
  writeText(doc, label, x, y, { width });
  doc.fillColor(COLORS.ink);
  setFont(doc, options.boldValue !== false);
  doc.fontSize(options.valueSize || 8);
  writeText(doc, value, x, y + 10, { width, lineGap: 1.5 });
}

function box(doc, x, y, width, height, stroke = COLORS.line, fill = COLORS.paper, radius = 4) {
  doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke);
}

function drawHeader(doc, q, labels) {
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  const y = 30;
  const logo = quotationLogoPath();
  if (logo) {
    doc.image(logo, left, y, { width: 38, height: 38, fit: [38, 38] });
  } else {
    doc.rect(left, y, 38, 38).fill(COLORS.primary);
    doc.fillColor(COLORS.paper);
    setFont(doc, true);
    doc.fontSize(18).text("Y", left + 12, y + 9);
  }

  doc.fillColor(COLORS.title);
  setFont(doc, true);
  doc.fontSize(14).text(COMPANY.nameJa, left + 52, y + 2, { width: 235 });
  doc.fontSize(9).text(COMPANY.nameEn, left + 52, y + 21, { width: 235 });
  if (COMPANY.tagline) {
    doc.fillColor(COLORS.muted);
    doc.fontSize(6.5).text(COMPANY.tagline, left + 52, y + 33, { width: 235 });
  }

  doc.moveTo(right - 172, y + 3).lineTo(right - 172, y + 39).strokeColor(COLORS.line).stroke();
  doc.fillColor(COLORS.title);
  setFont(doc, true);
  doc.fontSize(22).text(labels.title, right - 158, y + 3, { width: 158, align: "right" });
  if (labels.titleSub) {
    doc.fillColor(COLORS.muted);
    doc.fontSize(8).text(labels.titleSub, right - 158, y + 30, { width: 158, align: "right" });
  }
  return 84;
}

function drawInfoBoxes(doc, q, labels, y) {
  const left = PAGE.margin;
  const gap = 10;
  const width = (PAGE.width - PAGE.margin * 2 - gap * 2) / 3;
  const height = 98;
  const boxes = [
    {
      title: labels.client,
      values: [
        [labels.client, q.customerCompany !== "-" ? q.customerCompany : q.customerName],
        [labels.address, q.customerAddress],
        [labels.phone, q.customerPhone],
        [labels.email, q.customerEmail]
      ]
    },
    {
      title: labels.project,
      values: [
        [labels.project, q.projectName],
        [labels.assignee, q.assigneeName],
        [labels.department, q.departmentName],
        [labels.validUntil, formatDate(q.validUntil)]
      ]
    },
    {
      title: labels.quoteInfo,
      values: [
        [labels.quoteNo, q.quoteNo],
        [labels.quoteDate, formatDate(q.createdAt)],
        [labels.paymentTerms, q.paymentTerms]
      ]
    }
  ];

  boxes.forEach((item, index) => {
    const x = left + index * (width + gap);
    box(doc, x, y, width, height, COLORS.line, COLORS.paper);
    doc.fillColor(COLORS.title);
    setFont(doc, true);
    doc.fontSize(8).text(item.title, x + 10, y + 9, { width: width - 20 });
    doc.moveTo(x + 10, y + 23).lineTo(x + width - 10, y + 23).strokeColor(COLORS.divider).stroke();
    let yy = y + 29;
    item.values.forEach(([label, value], valueIndex) => {
      labelValue(doc, label, value, x + 10, yy, width - 20, { valueSize: valueIndex === 0 ? 8.3 : 7, boldValue: valueIndex === 0 });
      yy += valueIndex === 0 ? 21 : 17;
    });
  });
  return y + height + 14;
}

function drawTopSummary(doc, q, labels, y) {
  const left = PAGE.margin;
  const width = PAGE.width - PAGE.margin * 2;
  const height = 58;
  box(doc, left, y, width, height, COLORS.line, COLORS.paper);
  doc.roundedRect(left, y, 162, height, 4).fill(COLORS.primary);
  doc.fillColor(COLORS.paper);
  setFont(doc, true);
  doc.fontSize(8).text(labels.totalInclVat, left + 14, y + 11);
  doc.fontSize(22).text(formatMoney(q.total), left + 14, y + 27, { width: 134 });

  const cells = [
    [labels.subtotal, formatMoney(q.subtotal), COLORS.ink],
    [labels.discount, q.discount ? `- ${formatMoney(q.discount)}` : formatMoney(0), q.discount ? COLORS.red : COLORS.ink],
    [labels.vat, formatMoney(q.tax), COLORS.ink],
    [labels.total, formatMoney(q.total), COLORS.title]
  ];
  const start = left + 178;
  const cellW = (width - 178) / cells.length;
  cells.forEach(([label, value, color], index) => {
    const x = start + cellW * index;
    if (index > 0) doc.moveTo(x, y + 11).lineTo(x, y + height - 11).strokeColor(COLORS.line).stroke();
    doc.fillColor(COLORS.muted);
    setFont(doc, true);
    doc.fontSize(6.8).text(label, x + 7, y + 14, { width: cellW - 14, align: "center" });
    doc.fillColor(color);
    doc.fontSize(9.5).text(value, x + 7, y + 34, { width: cellW - 14, align: "center" });
  });
  return y + height + 14;
}

function tableColumns(labels) {
  return [
    { key: "no", label: labels.no, width: 30, align: "center" },
    { key: "name", label: labels.item, width: 98, align: "left" },
    { key: "description", label: labels.description, width: 144, align: "left" },
    { key: "unit", label: labels.unit, width: 34, align: "center" },
    { key: "quantity", label: labels.qty, width: 38, align: "center" },
    { key: "unitPrice", label: labels.unitPrice, width: 64, align: "right" },
    { key: "discountRate", label: labels.disc, width: 40, align: "center" },
    { key: "amount", label: labels.amount, width: 75, align: "right" }
  ];
}

function drawTableHeader(doc, cols, x, y) {
  doc.rect(x, y, cols.reduce((sum, col) => sum + col.width, 0), 23).fill(COLORS.primary);
  let xx = x;
  doc.fillColor(COLORS.paper);
  setFont(doc, true);
  doc.fontSize(7);
  cols.forEach(col => {
    writeText(doc, col.label, xx + 5, y + 7, { width: col.width - 10, align: col.align });
    xx += col.width;
  });
  return y + 23;
}

function rowHeight(doc, row, cols) {
  setFont(doc, false);
  doc.fontSize(7);
  const nameH = doc.heightOfString(row.name, { width: cols[1].width - 14, lineGap: 1.2 });
  const descH = doc.heightOfString(row.description, { width: cols[2].width - 14, lineGap: 1.2 });
  return Math.max(28, Math.ceil(Math.max(nameH, descH)) + 16);
}

function drawItemsTable(doc, q, labels, y) {
  const x = PAGE.margin;
  const cols = tableColumns(labels);
  const tableW = cols.reduce((sum, col) => sum + col.width, 0);
  let yy = drawTableHeader(doc, cols, x, y);
  q.items.forEach((item, index) => {
    const h = rowHeight(doc, item, cols);
    if (yy + h > PAGE.height - PAGE.margin - 190) {
      doc.addPage();
      yy = drawTableHeader(doc, cols, x, PAGE.margin);
    }
    if (index % 2 === 0) doc.rect(x, yy, tableW, h).fill(COLORS.soft);
    doc.rect(x, yy, tableW, h).strokeColor(COLORS.line).stroke();
    let xx = x;
    cols.forEach(col => {
      let value = item[col.key];
      if (col.key === "unitPrice" || col.key === "amount") value = formatMoney(value);
      if (col.key === "discountRate") value = `${numericValue(value)}%`;
      doc.fillColor(COLORS.ink);
      setFont(doc, false);
      doc.fontSize(7);
      writeText(doc, value, xx + 7, yy + 8, { width: col.width - 14, align: col.align, lineGap: 1.2 });
      xx += col.width;
    });
    yy += h;
  });
  return yy + 14;
}

function drawBottom(doc, q, labels, y) {
  if (y + 184 > PAGE.height - 28) {
    doc.addPage();
    y = PAGE.margin;
  }
  const left = PAGE.margin;
  const width = PAGE.width - PAGE.margin * 2;
  const remarksW = 302;
  const gap = 16;
  const summaryW = width - remarksW - gap;
  const h = 130;

  box(doc, left, y, remarksW, h, COLORS.line, COLORS.paper);
  doc.fillColor(COLORS.title);
  setFont(doc, true);
  doc.fontSize(8.2).text(labels.remarks, left + 11, y + 10);
  doc.fillColor(COLORS.ink);
  setFont(doc, false);
  doc.fontSize(7).text(q.note === "-" ? labels.defaultRemarks : q.note, left + 11, y + 27, { width: remarksW - 22, lineGap: 2 });
  doc.moveTo(left + 11, y + 76).lineTo(left + remarksW - 11, y + 76).strokeColor(COLORS.divider).stroke();
  doc.fillColor(COLORS.title);
  setFont(doc, true);
  doc.fontSize(8.2).text(labels.paymentTerms, left + 11, y + 88);
  doc.fillColor(COLORS.ink);
  setFont(doc, false);
  doc.fontSize(7).text(q.paymentTerms === "-" ? labels.defaultPaymentTerms : q.paymentTerms, left + 11, y + 105, { width: remarksW - 22 });

  const sx = left + remarksW + gap;
  box(doc, sx, y, summaryW, h, COLORS.primary, COLORS.paper);
  const rows = [
    [labels.subtotal, formatMoney(q.subtotal), COLORS.ink],
    [labels.discount, q.discount ? `- ${formatMoney(q.discount)}` : formatMoney(0), q.discount ? COLORS.red : COLORS.ink],
    [labels.taxable, formatMoney(q.taxable), COLORS.ink],
    [`${labels.vat} (${q.taxRatePercent}%)`, formatMoney(q.tax), COLORS.ink],
    [labels.totalInclVat, formatMoney(q.total), COLORS.paper]
  ];
  let yy = y + 13;
  rows.forEach(([label, value, color], index) => {
    const isTotal = index === rows.length - 1;
    if (isTotal) {
      doc.roundedRect(sx + 8, yy - 6, summaryW - 16, 28, 3).fill(COLORS.primary);
    }
    doc.fillColor(isTotal ? COLORS.paper : COLORS.ink);
    setFont(doc, true);
    doc.fontSize(isTotal ? 8.5 : 7.2);
    writeText(doc, label, sx + 14, yy, { width: summaryW - 28 });
    doc.fillColor(color);
    doc.fontSize(isTotal ? 15 : 8);
    writeText(doc, value, sx + 14, yy - (isTotal ? 4 : 0), { width: summaryW - 28, align: "right" });
    if (!isTotal) doc.moveTo(sx + 12, yy + 14).lineTo(sx + summaryW - 12, yy + 14).strokeColor(COLORS.divider).stroke();
    yy += isTotal ? 25 : 20;
  });
  return y + h + 16;
}

function drawFooter(doc, labels, y) {
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  if (y + 74 > PAGE.height - 28) {
    doc.addPage();
    y = PAGE.margin;
  }
  doc.moveTo(left, y).lineTo(right, y).strokeColor(COLORS.line).stroke();
  y += 10;
  const logo = quotationLogoPath();
  if (logo) doc.image(logo, left, y, { width: 26, height: 26, fit: [26, 26] });
  doc.fillColor(COLORS.ink);
  setFont(doc, true);
  doc.fontSize(9).text(COMPANY.nameJa, left + 34, y);
  doc.fontSize(7).text(COMPANY.nameEn, left + 34, y + 13);

  const companyInfo = [COMPANY.address, COMPANY.phone, COMPANY.email, COMPANY.website].filter(Boolean).join("  |  ");
  if (companyInfo) {
    doc.fillColor(COLORS.muted);
    setFont(doc, false);
    doc.fontSize(6.2).text(companyInfo, left + 34, y + 25, { width: 220 });
  }
  if (COMPANY.tagline) {
    doc.fillColor(COLORS.muted);
    setFont(doc, false);
    doc.fontSize(6.2).text(COMPANY.tagline, left, PAGE.height - PAGE.margin - 12, { width: right - left, align: "center" });
  }

  const labelsList = [labels.prepared, labels.checked, labels.approved, labels.clientSign];
  const sigX = right - 292;
  const sigW = 292 / 4;
  labelsList.forEach((label, index) => {
    const x = sigX + sigW * index;
    doc.rect(x, y - 2, sigW, 50).strokeColor(COLORS.line).stroke();
    doc.fillColor(COLORS.muted);
    setFont(doc, true);
    doc.fontSize(6.2).text(label, x + 4, y + 5, { width: sigW - 8, align: "center" });
  });
}

function drawQuotationPdf(doc, quote, options = {}) {
  setupFonts(doc);
  const labels = labelsFor(options.lang);
  let y = drawHeader(doc, quote, labels);
  y = drawInfoBoxes(doc, quote, labels, y);
  y = drawTopSummary(doc, quote, labels, y);
  y = drawItemsTable(doc, quote, labels, y);
  y = drawBottom(doc, quote, labels, y);
  drawFooter(doc, labels, y);
}

function createQuotationPdf(quote, options = {}) {
  const doc = new PDFDocument({
    size: "A4",
    margin: PAGE.margin,
    autoFirstPage: true,
    bufferPages: true
  });
  drawQuotationPdf(doc, quote, options);
  return doc;
}

module.exports = {
  COMPANY,
  PAGE,
  createQuotationPdf,
  drawQuotationPdf,
  formatDate,
  formatMoney,
  formatText,
  labelsFor,
  normalizeQuoteForPdf,
  quotePdfFileName,
  quotationLogoPath,
  resolveFontPath
};
