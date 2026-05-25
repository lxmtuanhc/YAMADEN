const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROOT = path.resolve(__dirname, "..");
const PAGE = { size: "A4", width: 595.28, height: 841.89, margin: 30 };
const COLORS = {
  text: "#111111",
  subtext: "#444444",
  border: "#999999",
  line: "#B8B8B8",
  soft: "#F3F3F3",
  paper: "#FFFFFF",
  black: "#111111",
  footer: "#2B2B2B",
  red: "#DC2626"
};

const COMPANY = {
  nameJa: "\u682a\u5f0f\u4f1a\u793e\u5c71\u96fb",
  nameEn: "YAMADEN CO.,LTD",
  address: "",
  footerText: "\u96fb\u6c17\u8a2d\u5099\u5de5\u4e8b\u30fb\u8a2d\u8a08\u30fb\u65bd\u5de5\u30fb\u4fdd\u5b88\u306e\u3053\u3068\u306a\u3089\u5c71\u96fb\u3078"
};

const LABELS = {
  title: "\u5fa1\u898b\u7a4d\u66f8",
  clientInfo: "\u9867\u5ba2\u60c5\u5831",
  projectInfo: "\u5de5\u4e8b\u60c5\u5831",
  quoteInfo: "\u898b\u7a4d\u60c5\u5831",
  clientName: "\u9867\u5ba2\u540d",
  address: "\u4f4f\u6240",
  phone: "\u96fb\u8a71",
  email: "\u30e1\u30fc\u30eb",
  projectName: "\u5de5\u4e8b\u540d",
  assignee: "\u62c5\u5f53\u8005",
  department: "\u90e8\u7f72",
  validUntil: "\u6709\u52b9\u671f\u9650",
  quoteNo: "\u898b\u7a4d\u756a\u53f7",
  quoteDate: "\u898b\u7a4d\u65e5",
  paymentTerms: "\u652f\u6255\u6761\u4ef6",
  totalInclVat: "\u5408\u8a08\uff08\u7a0e\u8fbc\uff09",
  subtotal: "\u5c0f\u8a08",
  discount: "\u5024\u5f15",
  taxable: "\u8ab2\u7a0e\u5bfe\u8c61\u984d",
  vat: "\u6d88\u8cbb\u7a0e",
  total: "\u5408\u8a08",
  remarks: "\u5099\u8003",
  no: "No.",
  item: "\u54c1\u76ee",
  description: "\u4ed5\u69d8\u30fb\u5185\u5bb9",
  unit: "\u5358\u4f4d",
  qty: "\u6570\u91cf",
  unitPrice: "\u5358\u4fa1",
  disc: "\u5024\u5f15",
  amount: "\u91d1\u984d",
  prepared: "\u4f5c\u6210",
  checked: "\u78ba\u8a8d",
  approved: "\u627f\u8a8d",
  clientConfirm: "\u9867\u5ba2\u78ba\u8a8d",
  defaultRemarks: "\u672c\u898b\u7a4d\u306f\u8a18\u8f09\u7bc4\u56f2\u306b\u57fa\u3065\u304d\u307e\u3059\u3002\u7bc4\u56f2\u5916\u306e\u8ffd\u52a0\u4f5c\u696d\u306f\u5225\u9014\u304a\u898b\u7a4d\u308a\u3044\u305f\u3057\u307e\u3059\u3002",
  defaultPaymentTerms: "\u691c\u53ce\u5f8c30\u65e5\u4ee5\u5185"
};

function labelsFor() {
  return LABELS;
}

function formatText(value) {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text || "-";
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value, emptyAsDash = false) {
  if ((value === null || value === undefined || value === "") && emptyAsDash) return "-";
  return `\u00a5${Math.round(numericValue(value)).toLocaleString("ja-JP")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatText(value);
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

function isMongoObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || "").trim());
}

function generatedQuoteNo() {
  return "YMD-" + String(Date.now()).slice(-5);
}

function displayCode(value) {
  const text = String(value || "").trim();
  return text && !isMongoObjectId(text) ? text : "";
}

function resolveDisplayQuoteNo(quote = {}) {
  const candidates = [
    quote.quoteNo,
    quote.quoteCode,
    quote.quoteNumber,
    quote.code,
    quote.number,
    quote.requestId,
    quote.requestCode,
    quote.requestNo
  ];
  const ymd = candidates.map(displayCode).find(value => /^YMD-\d+/i.test(value));
  return ymd
    || displayCode(quote.quoteNo)
    || displayCode(quote.quoteCode)
    || displayCode(quote.quoteNumber)
    || displayCode(quote.code)
    || displayCode(quote.number)
    || generatedQuoteNo();
}

function quotePdfFileName(quote) {
  return [
    safeFilePart(resolveDisplayQuoteNo(quote), "quote"),
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
  const quoteNo = resolveDisplayQuoteNo(quote);
  const rawItems = Array.isArray(quote.quoteItems) && quote.quoteItems.length ? quote.quoteItems : Array.isArray(quote.items) ? quote.items : [];
  const items = rawItems.length ? rawItems.map((item, index) => {
    const quantity = numericValue(item.quantity ?? item.qty, 1);
    const unitPrice = numericValue(item.unitPrice ?? item.price, 0);
    const discountRate = numericValue(item.discountPercent ?? item.discountRate ?? item.discount, 0);
    const lineSubtotal = quantity * unitPrice;
    const lineDiscount = Math.round(lineSubtotal * discountRate / 100);
    const computedAmount = Math.max(0, lineSubtotal - lineDiscount);
    const storedAmount = numericValue(item.amount, NaN);
    return {
      no: index + 1,
      name: formatText(item.name || item.title),
      description: formatText(item.spec || item.description),
      unit: formatText(item.unit || "\u5f0f"),
      quantity,
      unitPrice,
      discountRate,
      lineSubtotal,
      lineDiscount,
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
    lineSubtotal: numericValue(quote.total || quote.subtotal, 0),
    lineDiscount: 0,
    amount: numericValue(quote.total || quote.subtotal, 0)
  }];

  const computedSubtotal = items.reduce((sum, item) => sum + numericValue(item.lineSubtotal), 0);
  const computedDiscount = items.reduce((sum, item) => sum + numericValue(item.lineDiscount), 0);
  const subtotal = numericValue(quote.subtotal, computedSubtotal) || computedSubtotal;
  const discount = numericValue(quote.discountTotal ?? quote.discount, computedDiscount) || computedDiscount;
  const taxable = Math.max(0, numericValue(quote.taxableAmount ?? quote.taxable, subtotal - discount));
  const rawRate = quote.vatRate ?? quote.taxRate ?? 0.1;
  const taxRatePercent = numericValue(rawRate, 0.1) <= 1 ? numericValue(rawRate, 0.1) * 100 : numericValue(rawRate, 10);
  const tax = numericValue(quote.tax ?? quote.taxAmount ?? quote.vatAmount, Math.round(taxable * taxRatePercent / 100)) || Math.round(taxable * taxRatePercent / 100);
  const total = numericValue(quote.total, taxable + tax + numericValue(quote.rounding, 0)) || taxable + tax + numericValue(quote.rounding, 0);

  return {
    quoteNo: formatText(quoteNo),
    requestId: formatText(displayCode(quote.requestId) || displayCode(quote.requestCode) || displayCode(quote.requestNo) || "-"),
    customerName: formatText(quote.customerName || quote.name),
    customerCompany: formatText(quote.customerCompany || quote.company),
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

function text(doc, value, x, y, options = {}) {
  doc.text(formatText(value), x, y, options);
}

function line(doc, x1, y1, x2, y2, color = COLORS.border, width = 1) {
  doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(width).stroke();
}

function rect(doc, x, y, w, h, stroke = COLORS.border, fill = null, width = 1) {
  if (fill) doc.rect(x, y, w, h).fill(fill);
  doc.rect(x, y, w, h).strokeColor(stroke).lineWidth(width).stroke();
}

function drawLogo(doc, x, y, size) {
  const logo = quotationLogoPath();
  if (logo) {
    doc.image(logo, x, y, { width: size, height: size, fit: [size, size] });
    return;
  }
  doc.rect(x, y, size, size).fill(COLORS.black);
  doc.fillColor(COLORS.paper);
  setFont(doc, true);
  doc.fontSize(size * 0.48).text("Y", x, y + size * 0.24, { width: size, align: "center" });
}

function drawHeader(doc, labels) {
  const { margin } = PAGE;
  const right = PAGE.width - margin;
  const y = 28;
  drawLogo(doc, margin, y, 46);
  doc.fillColor(COLORS.text);
  setFont(doc, true);
  doc.fontSize(18).text(COMPANY.nameJa, margin + 60, y + 4, { width: 250 });
  setFont(doc, false);
  doc.fontSize(9.5).fillColor(COLORS.subtext).text(COMPANY.nameEn, margin + 60, y + 30, { width: 250 });
  line(doc, right - 178, y + 5, right - 178, y + 47, COLORS.border, 1.1);
  setFont(doc, true);
  doc.fillColor(COLORS.text);
  doc.fontSize(30).text(labels.title, right - 165, y + 6, { width: 165, align: "right" });
  line(doc, margin, y + 58, right, y + 58, COLORS.border, 1.1);
  return y + 72;
}

function drawInfoBox(doc, x, y, w, h, title, rows) {
  rect(doc, x, y, w, h, COLORS.border, COLORS.paper, 1.1);
  doc.rect(x, y, w, 28).fill(COLORS.soft);
  rect(doc, x, y, w, h, COLORS.border, null, 1.1);
  line(doc, x, y + 28, x + w, y + 28, COLORS.border, 1);
  setFont(doc, true);
  doc.fillColor(COLORS.text).fontSize(11).text(title, x + 13, y + 8, { width: w - 26 });
  let yy = y + 38;
  rows.forEach((row, index) => {
    setFont(doc, true);
    doc.fillColor(COLORS.subtext).fontSize(9.5).text(row[0], x + 13, yy, { width: w - 26 });
    setFont(doc, true);
    doc.fillColor(COLORS.text).fontSize(index === 0 ? 11 : 10).text(row[1], x + 13, yy + 12, { width: w - 26, lineGap: 1.2 });
    yy += index === 0 ? 31 : 28;
  });
}

function drawInfoBoxes(doc, q, labels, y) {
  const left = PAGE.margin;
  const gap = 10;
  const w = (PAGE.width - PAGE.margin * 2 - gap * 2) / 3;
  const h = 108;
  drawInfoBox(doc, left, y, w, h, labels.clientInfo, [
    [labels.clientName, q.customerCompany !== "-" ? q.customerCompany : q.customerName],
    [labels.address, q.customerAddress],
    [labels.phone, q.customerPhone],
    [labels.email, q.customerEmail]
  ]);
  drawInfoBox(doc, left + w + gap, y, w, h, labels.projectInfo, [
    [labels.projectName, q.projectName],
    [labels.assignee, q.assigneeName],
    [labels.department, q.departmentName],
    [labels.validUntil, formatDate(q.validUntil)]
  ]);
  drawInfoBox(doc, left + (w + gap) * 2, y, w, h, labels.quoteInfo, [
    [labels.quoteNo, q.quoteNo],
    [labels.quoteDate, formatDate(q.createdAt)],
    [labels.paymentTerms, q.paymentTerms]
  ]);
  return y + h + 12;
}

function drawTopSummary(doc, q, labels, y) {
  const left = PAGE.margin;
  const w = PAGE.width - PAGE.margin * 2;
  const h = 62;
  rect(doc, left, y, w, h, COLORS.border, COLORS.paper, 1.1);
  doc.rect(left, y, 182, h).fill(COLORS.black);
  doc.fillColor(COLORS.paper);
  setFont(doc, true);
  doc.fontSize(11.5).text(labels.totalInclVat, left + 16, y + 11, { width: 150 });
  doc.fontSize(24).text(formatMoney(q.total), left + 16, y + 32, { width: 150 });
  const cells = [
    [labels.subtotal, formatMoney(q.subtotal), COLORS.text],
    [labels.discount, q.discount ? `- ${formatMoney(q.discount)}` : formatMoney(0), q.discount ? COLORS.red : COLORS.text],
    [labels.vat, formatMoney(q.tax), COLORS.text],
    [labels.total, formatMoney(q.total), COLORS.text]
  ];
  const start = left + 182;
  const cellW = (w - 182) / 4;
  cells.forEach(([label, value, color], index) => {
    const x = start + cellW * index;
    if (index > 0) line(doc, x, y + 12, x, y + h - 12, COLORS.border, 1);
    setFont(doc, true);
    doc.fillColor(COLORS.subtext).fontSize(10.5).text(label, x + 8, y + 14, { width: cellW - 16, align: "center" });
    doc.fillColor(color).fontSize(index === 3 ? 13 : 11.5).text(value, x + 8, y + 37, { width: cellW - 16, align: "center" });
  });
  return y + h + 12;
}

function tableColumns(labels) {
  return [
    { key: "no", label: labels.no, width: 31, align: "center" },
    { key: "name", label: labels.item, width: 100, align: "left" },
    { key: "description", label: labels.description, width: 164, align: "left" },
    { key: "unit", label: labels.unit, width: 34, align: "center" },
    { key: "quantity", label: labels.qty, width: 38, align: "center" },
    { key: "unitPrice", label: labels.unitPrice, width: 58, align: "right" },
    { key: "discountRate", label: labels.disc, width: 39, align: "center" },
    { key: "amount", label: labels.amount, width: 66, align: "right" }
  ];
}

function drawTableHeader(doc, cols, x, y) {
  const width = cols.reduce((sum, col) => sum + col.width, 0);
  doc.rect(x, y, width, 26).fill(COLORS.black);
  setFont(doc, true);
  doc.fillColor(COLORS.paper).fontSize(8.4);
  let xx = x;
  cols.forEach(col => {
    text(doc, col.label, xx + 7, y + 8, { width: col.width - 14, align: col.align });
    if (xx > x) line(doc, xx, y, xx, y + 26, "#555555", 0.8);
    xx += col.width;
  });
  return y + 26;
}

function rowHeight(doc, row, cols) {
  setFont(doc, false);
  doc.fontSize(8.4);
  const nameH = doc.heightOfString(row.name, { width: cols[1].width - 12, lineGap: 1 });
  const descH = doc.heightOfString(row.description, { width: cols[2].width - 12, lineGap: 1 });
  return Math.max(30, Math.ceil(Math.max(nameH, descH)) + 13);
}

function drawItemsTable(doc, q, labels, y) {
  const x = PAGE.margin;
  const cols = tableColumns(labels);
  const tableW = cols.reduce((sum, col) => sum + col.width, 0);
  let yy = drawTableHeader(doc, cols, x, y);
  q.items.forEach((item, index) => {
    const h = rowHeight(doc, item, cols);
    if (yy + h > PAGE.height - PAGE.margin - 198) {
      doc.addPage();
      yy = drawTableHeader(doc, cols, x, PAGE.margin);
    }
    if (index % 2 === 0) doc.rect(x, yy, tableW, h).fill(COLORS.soft);
    rect(doc, x, yy, tableW, h, COLORS.line, null, 0.9);
    let xx = x;
    cols.forEach(col => {
      let value = item[col.key];
      if (col.key === "unitPrice" || col.key === "amount") value = formatMoney(value);
      if (col.key === "discountRate") value = `${numericValue(value)}%`;
      setFont(doc, col.key === "name" || col.key === "amount");
      doc.fillColor(COLORS.text).fontSize(8.4);
      text(doc, value, xx + 6, yy + 8, { width: col.width - 12, align: col.align, lineGap: 1 });
      if (xx > x) line(doc, xx, yy, xx, yy + h, COLORS.line, 0.7);
      xx += col.width;
    });
    yy += h;
  });
  return yy + 14;
}

function drawBottom(doc, q, labels, y) {
  if (y + 156 > PAGE.height - PAGE.margin - 76) {
    doc.addPage();
    y = PAGE.margin;
  }
  const left = PAGE.margin;
  const width = PAGE.width - PAGE.margin * 2;
  const gap = 18;
  const remarksW = 316;
  const summaryW = width - remarksW - gap;
  const h = 126;

  rect(doc, left, y, remarksW, h, COLORS.border, COLORS.paper, 1.1);
  doc.rect(left, y, remarksW, 27).fill(COLORS.soft);
  rect(doc, left, y, remarksW, h, COLORS.border, null, 1.1);
  setFont(doc, true);
  doc.fillColor(COLORS.text).fontSize(10.5).text(labels.remarks, left + 14, y + 8);
  setFont(doc, false);
  doc.fillColor(COLORS.text).fontSize(9).text(q.note === "-" ? labels.defaultRemarks : q.note, left + 14, y + 34, { width: remarksW - 28, lineGap: 1.5 });
  line(doc, left, y + 72, left + remarksW, y + 72, COLORS.border, 1);
  setFont(doc, true);
  doc.fillColor(COLORS.text).fontSize(10.5).text(labels.paymentTerms, left + 14, y + 82);
  setFont(doc, false);
  doc.fillColor(COLORS.text).fontSize(9).text(q.paymentTerms === "-" ? labels.defaultPaymentTerms : q.paymentTerms, left + 14, y + 104, { width: remarksW - 28, lineGap: 1.5 });

  const sx = left + remarksW + gap;
  rect(doc, sx, y, summaryW, h, COLORS.black, COLORS.paper, 1.4);
  const rows = [
    [labels.subtotal, formatMoney(q.subtotal), COLORS.text],
    [labels.discount, q.discount ? `- ${formatMoney(q.discount)}` : formatMoney(0), q.discount ? COLORS.red : COLORS.text],
    [labels.taxable, formatMoney(q.taxable), COLORS.text],
    [`${labels.vat} (${q.taxRatePercent}%)`, formatMoney(q.tax), COLORS.text]
  ];
  let yy = y + 12;
  rows.forEach(([label, value, color]) => {
    setFont(doc, true);
    doc.fillColor(COLORS.text).fontSize(9.3).text(label, sx + 14, yy, { width: summaryW - 28 });
    doc.fillColor(color).fontSize(9.8).text(value, sx + 14, yy, { width: summaryW - 28, align: "right" });
    line(doc, sx + 12, yy + 17, sx + summaryW - 12, yy + 17, COLORS.line, 0.8);
    yy += 22;
  });
  doc.rect(sx + 9, y + h - 37, summaryW - 18, 29).fill(COLORS.black);
  setFont(doc, true);
  doc.fillColor(COLORS.paper).fontSize(10).text(labels.totalInclVat, sx + 18, y + h - 28, { width: summaryW - 36 });
  doc.fontSize(17).text(formatMoney(q.total), sx + 18, y + h - 31, { width: summaryW - 36, align: "right" });
  return y + h + 16;
}

function drawFooter(doc, labels, y) {
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  if (y + 68 > PAGE.height - 52) {
    doc.addPage();
    y = PAGE.margin;
  }
  line(doc, left, y, right, y, COLORS.black, 1.2);
  y += 12;
  drawLogo(doc, left, y, 30);
  setFont(doc, true);
  doc.fillColor(COLORS.text).fontSize(10).text(COMPANY.nameJa, left + 40, y + 1, { width: 210 });
  setFont(doc, false);
  doc.fillColor(COLORS.subtext).fontSize(7.5).text(COMPANY.nameEn, left + 40, y + 17, { width: 210 });
  if (COMPANY.address) {
    doc.fontSize(7).text(COMPANY.address, left + 40, y + 29, { width: 210 });
  }

  const sigW = 310;
  const sigX = right - sigW;
  const cellW = sigW / 4;
  [labels.prepared, labels.checked, labels.approved, labels.clientConfirm].forEach((label, index) => {
    const x = sigX + cellW * index;
    rect(doc, x, y - 2, cellW, 46, COLORS.line, COLORS.paper, 0.9);
    doc.rect(x, y - 2, cellW, 17).fill(COLORS.soft);
    rect(doc, x, y - 2, cellW, 46, COLORS.line, null, 0.9);
    setFont(doc, true);
    doc.fillColor(COLORS.text).fontSize(7.5).text(label, x + 4, y + 4, { width: cellW - 8, align: "center" });
  });

  const barY = PAGE.height - 52;
  doc.rect(0, barY, PAGE.width, 24).fill(COLORS.footer);
  setFont(doc, true);
  doc.fillColor(COLORS.paper).fontSize(8).text(COMPANY.footerText, PAGE.margin, barY + 8, { width: PAGE.width - PAGE.margin * 2, align: "center", lineBreak: false });
}

function drawQuotationPdf(doc, quote, options = {}) {
  setupFonts(doc);
  const labels = labelsFor(options.lang);
  let y = drawHeader(doc, labels);
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
