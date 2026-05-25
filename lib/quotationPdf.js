const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const ROOT = path.resolve(__dirname, "..");
const PAGE = { size: "A4", width: 595.28, height: 841.89, margin: 32 };
const COLORS = {
  ink: "#111827",
  muted: "#64748b",
  navy: "#0f2747",
  navy2: "#12345c",
  line: "#d7dee8",
  soft: "#f7f9fc",
  paper: "#ffffff",
  red: "#dc2626"
};

const COMPANY = {
  nameJa: "株式会社 山電",
  nameEn: "YAMADEN CO.,LTD",
  tagline: "YAMADEN ELECTRICAL SOLUTIONS",
  address: "Tokyo, Japan",
  phone: "03-1234-5678",
  email: "info@yamaden.co.jp",
  website: "www.yamaden.co.jp"
};

const LABELS = {
  ja: {
    title: "御見積書",
    titleSub: "QUOTATION",
    client: "顧客",
    project: "工事名",
    quoteInfo: "見積情報",
    quoteNo: "見積番号",
    quoteDate: "見積日",
    validUntil: "有効期限",
    paymentTerms: "支払条件",
    assignee: "担当者",
    department: "部署",
    address: "住所",
    phone: "電話",
    email: "メール",
    totalInclVat: "合計（税込）",
    subtotal: "小計",
    discount: "値引",
    taxable: "課税対象額",
    vat: "消費税",
    total: "合計",
    remarks: "備考",
    summary: "合計",
    no: "No.",
    item: "品目",
    description: "仕様 / 内容",
    unit: "単位",
    qty: "数量",
    unitPrice: "単価",
    disc: "値引",
    amount: "金額",
    prepared: "作成",
    checked: "確認",
    approved: "承認",
    clientSign: "顧客",
    defaultRemarks: "本見積は記載範囲に基づきます。範囲外の追加作業は別途お見積りいたします。",
    defaultPaymentTerms: "検収後30日以内"
  },
  vi: {
    title: "BÁO GIÁ",
    titleSub: "QUOTATION",
    client: "Khách hàng",
    project: "Công trình",
    quoteInfo: "Thông tin báo giá",
    quoteNo: "Mã báo giá",
    quoteDate: "Ngày báo giá",
    validUntil: "Hiệu lực",
    paymentTerms: "Điều khoản thanh toán",
    assignee: "Phụ trách",
    department: "Bộ phận",
    address: "Địa chỉ",
    phone: "Điện thoại",
    email: "Email",
    totalInclVat: "Tổng cộng (gồm VAT)",
    subtotal: "Tạm tính",
    discount: "Giảm giá",
    taxable: "Thành tiền chịu thuế",
    vat: "Thuế VAT",
    total: "Tổng cộng",
    remarks: "Ghi chú",
    summary: "Tổng kết",
    no: "No.",
    item: "Hạng mục",
    description: "Quy cách / mô tả",
    unit: "Đơn vị",
    qty: "SL",
    unitPrice: "Đơn giá",
    disc: "Giảm",
    amount: "Thành tiền",
    prepared: "Lập",
    checked: "Kiểm tra",
    approved: "Duyệt",
    clientSign: "Khách hàng",
    defaultRemarks: "Báo giá này dựa trên phạm vi đã nêu. Các công việc phát sinh ngoài phạm vi sẽ được báo giá riêng.",
    defaultPaymentTerms: "Thanh toán trong vòng 30 ngày sau nghiệm thu"
  }
};

function labelsFor(lang) {
  return LABELS[lang === "vi" ? "vi" : "ja"];
}

function formatText(value) {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text ? text : "-";
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMoney(value, emptyAsDash = false) {
  if ((value === null || value === undefined || value === "") && emptyAsDash) return "-";
  return `¥${numericValue(value).toLocaleString("ja-JP")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const text = String(value).trim();
    return text || "-";
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
    safeFilePart(quote.requestId || quote.quoteNo, "quote"),
    safeFilePart(quote.customerName || quote.customerCompany, "customer"),
    formatFileDate(quote.createdAt)
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
  const quoteNo = quote.quoteNo || quote.quoteCode || quote.quoteNumber || quote.code || quote.number || quote.id || String(quote._id || "");
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
      unit: formatText(item.unit || "式"),
      quantity,
      unitPrice,
      discountRate,
      amount: Number.isFinite(storedAmount) && storedAmount > 0 ? storedAmount : computedAmount
    };
  }) : [{
    no: 1,
    name: formatText(quote.projectName || quote.title || quote.content || quote.description || "Electrical work"),
    description: formatText(quote.content || quote.description),
    unit: "式",
    quantity: 1,
    unitPrice: numericValue(quote.total || quote.subtotal, 0),
    discountRate: 0,
    amount: numericValue(quote.total || quote.subtotal, 0)
  }];

  const itemSubtotal = items.reduce((sum, item) => sum + numericValue(item.amount), 0);
  const subtotal = numericValue(quote.subtotal, itemSubtotal) || itemSubtotal;
  const discount = numericValue(quote.discountTotal ?? quote.discount, 0);
  const taxable = Math.max(0, subtotal - discount);
  const rawRate = quote.vatRate ?? quote.taxRate ?? 0.1;
  const taxRatePercent = numericValue(rawRate, 0.1) <= 1 ? numericValue(rawRate, 0.1) * 100 : numericValue(rawRate, 10);
  const tax = numericValue(quote.tax ?? quote.taxAmount ?? quote.vatAmount, Math.round(taxable * taxRatePercent / 100)) || Math.round(taxable * taxRatePercent / 100);
  const total = numericValue(quote.total, taxable + tax + numericValue(quote.rounding, 0)) || taxable + tax + numericValue(quote.rounding, 0);

  return {
    quoteNo: formatText(quoteNo),
    requestId: formatText(quote.requestId || quote.requestCode || quote.requestNo || quoteNo),
    customerName: formatText(quote.customerName || quote.name),
    customerCompany: formatText(quote.customerCompany || quote.company),
    customerPerson: formatText(quote.customerPerson || quote.contactPerson),
    customerPhone: formatText(quote.customerPhone || quote.phone),
    customerEmail: formatText(quote.customerEmail || quote.email || quote.contact),
    customerAddress: formatText(quote.customerAddress || quote.address),
    projectName: formatText(quote.projectName || quote.title || quote.content || quote.description),
    assigneeName: formatText(quote.assigneeName || quote.staffName),
    departmentName: formatText(quote.departmentName || quote.department),
    createdAt: quote.createdAt || new Date(),
    validUntil: quote.validUntil || quote.expireDate || quote.validDate || "",
    currency: formatText(quote.currency || "JPY"),
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

function labelValue(doc, label, value, x, y, width, options = {}) {
  doc.fillColor(COLORS.muted);
  setFont(doc, true);
  doc.fontSize(options.labelSize || 6.5);
  text(doc, label, x, y, { width });
  doc.fillColor(COLORS.ink);
  setFont(doc, options.boldValue !== false);
  doc.fontSize(options.valueSize || 8);
  text(doc, value, x, y + 10, { width, lineGap: 1.5 });
}

function box(doc, x, y, width, height, stroke = COLORS.line, fill = COLORS.paper) {
  doc.roundedRect(x, y, width, height, 5).fillAndStroke(fill, stroke);
}

function drawHeader(doc, q, labels) {
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  const y = 28;
  const logo = quotationLogoPath();
  if (logo) doc.image(logo, left, y, { width: 36, height: 36, fit: [36, 36] });
  else {
    doc.rect(left, y, 36, 36).fill(COLORS.navy);
    doc.fillColor(COLORS.paper);
    setFont(doc, true);
    doc.fontSize(18).text("Y", left + 11, y + 8);
  }
  doc.fillColor(COLORS.ink);
  setFont(doc, true);
  doc.fontSize(13).text(COMPANY.nameJa, left + 48, y + 1, { width: 220 });
  doc.fontSize(9).text(COMPANY.nameEn, left + 48, y + 18, { width: 220 });
  doc.fillColor(COLORS.muted);
  doc.fontSize(6.5).text(COMPANY.tagline, left + 48, y + 31, { width: 220 });
  doc.moveTo(right - 178, y + 2).lineTo(right - 178, y + 38).strokeColor(COLORS.line).stroke();
  doc.fillColor(COLORS.ink);
  setFont(doc, true);
  doc.fontSize(20).text(labels.title, right - 168, y + 1, { width: 168, align: "right" });
  doc.fillColor(COLORS.muted);
  doc.fontSize(8).text(labels.titleSub, right - 168, y + 27, { width: 168, align: "right" });
  return 82;
}

function drawInfoBoxes(doc, q, labels, y) {
  const left = PAGE.margin;
  const gap = 10;
  const width = (PAGE.width - PAGE.margin * 2 - gap * 2) / 3;
  const height = 100;
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
        [labels.paymentTerms, q.paymentTerms],
        ["Currency", q.currency]
      ]
    }
  ];

  boxes.forEach((item, index) => {
    const x = left + index * (width + gap);
    box(doc, x, y, width, height, COLORS.line, COLORS.soft);
    doc.fillColor(COLORS.navy);
    setFont(doc, true);
    doc.fontSize(8).text(item.title, x + 10, y + 9, { width: width - 20 });
    let yy = y + 27;
    item.values.forEach(([label, value], valueIndex) => {
      labelValue(doc, label, value, x + 10, yy, width - 20, { valueSize: valueIndex === 0 ? 8.5 : 7, boldValue: valueIndex === 0 });
      yy += valueIndex === 0 ? 21 : 17;
    });
  });
  return y + height + 16;
}

function drawTopSummary(doc, q, labels, y) {
  const left = PAGE.margin;
  const width = PAGE.width - PAGE.margin * 2;
  const height = 58;
  box(doc, left, y, width, height, COLORS.line, COLORS.paper);
  doc.roundedRect(left, y, 160, height, 5).fill(COLORS.navy);
  doc.fillColor(COLORS.paper);
  setFont(doc, true);
  doc.fontSize(8).text(labels.totalInclVat, left + 14, y + 11);
  doc.fontSize(22).text(formatMoney(q.total), left + 14, y + 27, { width: 132 });
  const cells = [
    [labels.subtotal, formatMoney(q.subtotal), COLORS.ink],
    [labels.discount, q.discount ? `- ${formatMoney(q.discount)}` : formatMoney(0), q.discount ? COLORS.red : COLORS.ink],
    [labels.vat, formatMoney(q.tax), COLORS.ink],
    [labels.total, formatMoney(q.total), COLORS.navy]
  ];
  const start = left + 176;
  const cellW = (width - 176) / cells.length;
  cells.forEach(([label, value, color], index) => {
    const x = start + cellW * index;
    if (index > 0) doc.moveTo(x, y + 11).lineTo(x, y + height - 11).strokeColor(COLORS.line).stroke();
    doc.fillColor(COLORS.muted);
    setFont(doc, true);
    doc.fontSize(6.5).text(label, x + 6, y + 14, { width: cellW - 12, align: "center" });
    doc.fillColor(color);
    doc.fontSize(9).text(value, x + 6, y + 34, { width: cellW - 12, align: "center" });
  });
  return y + height + 14;
}

function tableColumns(labels) {
  return [
    { key: "no", label: labels.no, width: 28, align: "center" },
    { key: "name", label: labels.item, width: 98, align: "left" },
    { key: "description", label: labels.description, width: 148, align: "left" },
    { key: "unit", label: labels.unit, width: 34, align: "center" },
    { key: "quantity", label: labels.qty, width: 38, align: "center" },
    { key: "unitPrice", label: labels.unitPrice, width: 64, align: "right" },
    { key: "discountRate", label: labels.disc, width: 40, align: "center" },
    { key: "amount", label: labels.amount, width: 73, align: "right" }
  ];
}

function drawTableHeader(doc, cols, x, y) {
  doc.rect(x, y, cols.reduce((sum, col) => sum + col.width, 0), 22).fill(COLORS.navy);
  let xx = x;
  doc.fillColor(COLORS.paper);
  setFont(doc, true);
  doc.fontSize(6.3);
  cols.forEach(col => {
    text(doc, col.label, xx + 4, y + 7, { width: col.width - 8, align: col.align });
    xx += col.width;
  });
  return y + 22;
}

function rowHeight(doc, row, cols) {
  setFont(doc, false);
  doc.fontSize(6.7);
  const nameH = doc.heightOfString(row.name, { width: cols[1].width - 8, lineGap: 1 });
  const descH = doc.heightOfString(row.description, { width: cols[2].width - 8, lineGap: 1 });
  return Math.max(24, Math.ceil(Math.max(nameH, descH)) + 13);
}

function drawItemsTable(doc, q, labels, y) {
  const x = PAGE.margin;
  const cols = tableColumns(labels);
  const tableW = cols.reduce((sum, col) => sum + col.width, 0);
  let yy = drawTableHeader(doc, cols, x, y);
  q.items.forEach((item, index) => {
    const h = rowHeight(doc, item, cols);
    if (yy + h > PAGE.height - PAGE.margin - 196) {
      doc.addPage();
      yy = drawTableHeader(doc, cols, x, PAGE.margin);
    }
    if (index % 2 === 0) doc.rect(x, yy, tableW, h).fill(COLORS.soft);
    doc.rect(x, yy, tableW, h).strokeColor(COLORS.line).stroke();
    let xx = x;
    cols.forEach(col => {
      let value = item[col.key];
      if (col.key === "unitPrice" || col.key === "amount") value = formatMoney(value).replace("¥", "");
      if (col.key === "discountRate") value = `${numericValue(value)}%`;
      doc.fillColor(COLORS.ink);
      setFont(doc, false);
      doc.fontSize(6.7);
      text(doc, value, xx + 4, yy + 7, { width: col.width - 8, align: col.align, lineGap: 1 });
      xx += col.width;
    });
    yy += h;
  });
  return yy + 14;
}

function drawBottom(doc, q, labels, y) {
  if (y + 188 > PAGE.height - 28) {
    doc.addPage();
    y = PAGE.margin;
  }
  const left = PAGE.margin;
  const width = PAGE.width - PAGE.margin * 2;
  const remarksW = 302;
  const gap = 16;
  const summaryW = width - remarksW - gap;
  const h = 132;
  box(doc, left, y, remarksW, h, COLORS.line, COLORS.paper);
  doc.fillColor(COLORS.navy);
  setFont(doc, true);
  doc.fontSize(8).text(labels.remarks, left + 10, y + 10);
  doc.fillColor(COLORS.ink);
  setFont(doc, false);
  doc.fontSize(7).text(q.note === "-" ? labels.defaultRemarks : q.note, left + 10, y + 27, { width: remarksW - 20, lineGap: 2 });
  doc.moveTo(left, y + 78).lineTo(left + remarksW, y + 78).strokeColor(COLORS.line).stroke();
  doc.fillColor(COLORS.navy);
  setFont(doc, true);
  doc.fontSize(8).text(labels.paymentTerms, left + 10, y + 90);
  doc.fillColor(COLORS.ink);
  setFont(doc, false);
  doc.fontSize(7).text(q.paymentTerms === "-" ? labels.defaultPaymentTerms : q.paymentTerms, left + 10, y + 107, { width: remarksW - 20 });

  const sx = left + remarksW + gap;
  box(doc, sx, y, summaryW, h, COLORS.navy, COLORS.paper);
  const rows = [
    [labels.subtotal, formatMoney(q.subtotal), COLORS.ink],
    [labels.discount, q.discount ? `- ${formatMoney(q.discount)}` : formatMoney(0), q.discount ? COLORS.red : COLORS.ink],
    [labels.taxable, formatMoney(q.taxable), COLORS.ink],
    [`${labels.vat} (${q.taxRatePercent}%)`, formatMoney(q.tax), COLORS.ink],
    [labels.totalInclVat, formatMoney(q.total), COLORS.navy]
  ];
  let yy = y + 13;
  rows.forEach(([label, value, color], index) => {
    if (index === rows.length - 1) {
      doc.moveTo(sx + 10, yy - 5).lineTo(sx + summaryW - 10, yy - 5).strokeColor(COLORS.line).stroke();
      doc.fontSize(10);
    }
    doc.fillColor(index === rows.length - 1 ? COLORS.navy : COLORS.ink);
    setFont(doc, true);
    doc.fontSize(index === rows.length - 1 ? 9 : 7);
    text(doc, label, sx + 12, yy, { width: summaryW - 24 });
    doc.fillColor(color);
    doc.fontSize(index === rows.length - 1 ? 16 : 8);
    text(doc, value, sx + 12, yy - (index === rows.length - 1 ? 4 : 0), { width: summaryW - 24, align: "right" });
    yy += index === rows.length - 1 ? 24 : 21;
  });
  return y + h + 16;
}

function drawFooter(doc, labels, y) {
  const left = PAGE.margin;
  const right = PAGE.width - PAGE.margin;
  if (y + 88 > PAGE.height - 28) {
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
  doc.fillColor(COLORS.muted);
  setFont(doc, false);
  doc.fontSize(6.2).text(`${COMPANY.address}  |  ${COMPANY.phone}  |  ${COMPANY.email}  |  ${COMPANY.website}`, left + 34, y + 25, { width: 220 });
  const labelsList = [labels.prepared, labels.checked, labels.approved, labels.clientSign];
  const sigX = right - 292;
  const sigW = 292 / 4;
  labelsList.forEach((label, index) => {
    const x = sigX + sigW * index;
    doc.rect(x, y - 2, sigW, 50).strokeColor(COLORS.line).stroke();
    doc.fillColor(COLORS.muted);
    setFont(doc, true);
    doc.fontSize(6).text(label, x + 4, y + 5, { width: sigW - 8, align: "center" });
  });
  const footerBarY = PAGE.height - PAGE.margin - 22;
  doc.rect(0, footerBarY, PAGE.width, 22).fill(COLORS.navy);
  doc.fillColor(COLORS.paper);
  setFont(doc, false);
  doc.fontSize(6.2).text(COMPANY.tagline, left, footerBarY + 7, { width: right - left, align: "center" });
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
