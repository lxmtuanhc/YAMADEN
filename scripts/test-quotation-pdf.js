const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  createQuotationPdf,
  normalizeQuoteForPdf,
  quotePdfFileName,
  quotationLogoPath,
  resolveFontPath
} = require("../lib/quotationPdf");

const outDir = path.join(__dirname, "..", "tmp", "quotation-pdf-tests");
fs.mkdirSync(outDir, { recursive: true });

function item(index, extra = "") {
  return {
    name: index % 2 ? `配線工事 ${extra}` : `Thi công điện ${extra}`,
    description: `CV 600V 3C-14sq / kiểm tra hệ thống / 幹線設備 ${extra}`,
    unit: "m",
    quantity: 10 + index,
    unitPrice: 3200 + index * 180,
    discountRate: index % 4 === 0 ? 5 : 0
  };
}

function baseQuote(items) {
  return {
    quoteNo: "Q-2026-15755",
    requestId: "YMD-85962",
    customerName: "Le Xuân Minh Tuấn",
    customerPhone: "03-1234-5678",
    customerEmail: "tuan@example.com",
    customerAddress: "東京都港区 2-3-1",
    projectName: "山田ビル 新築工事 電気設備工事",
    assigneeName: "佐藤 拓也",
    departmentName: "工事部",
    createdAt: "2026-05-22T00:00:00.000Z",
    validUntil: "2026-06-22T00:00:00.000Z",
    paymentTerms: "検収後30日以内",
    note: "施工範囲外の追加作業は別途協議します。",
    items
  };
}

function renderCase(name, quoteInput, lang) {
  const quote = normalizeQuoteForPdf(quoteInput);
  const doc = createQuotationPdf(quote, { lang });
  const pages = doc.bufferedPageRange().count;
  const filePath = path.join(outDir, `${name}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  doc.end();
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve({ filePath, pages, quote }));
    stream.on("error", reject);
  });
}

(async () => {
  const fontPath = resolveFontPath();
  const logoPath = quotationLogoPath();
  assert(fontPath, "Unicode font must be available");
  assert(fs.existsSync(fontPath), "Unicode font file must exist");
  assert(logoPath, "Quotation logo must be available");
  assert(!/admin/i.test(path.basename(logoPath)), "Quotation PDF must not use admin logo");

  const oneItem = await renderCase("case-1-one-item-ja", baseQuote([item(1)]), "ja");
  assert.strictEqual(oneItem.pages, 1, "1 item quote should fit on 1 A4 page");

  const fiveItems = await renderCase("case-2-five-items-vi", baseQuote([1, 2, 3, 4, 5].map(i => item(i))), "vi");
  assert.strictEqual(fiveItems.pages, 1, "5 item quote should fit on 1 A4 page");

  const missing = normalizeQuoteForPdf({ quoteNo: "Q-MISSING", requestId: "REQ-MISSING", items: [item(1)] });
  assert(!JSON.stringify(missing).includes("????"), "Missing data should not contain question mark placeholders");
  assert.strictEqual(missing.customerName, "-", "Missing customer should be '-'");

  const filename = quotePdfFileName(oneItem.quote);
  assert.strictEqual(filename, "YMD-85962_Le_Xuan_Minh_Tuan_20260522.pdf", "PDF filename format should be stable");

  const manyItems = await renderCase(
    "case-5-many-items-ja",
    baseQuote(Array.from({ length: 28 }, (_, index) => item(index + 1, "long text wraps naturally without overflowing the table"))),
    "ja"
  );
  assert(manyItems.pages > 1, "Many items should flow to additional pages");
  assert(manyItems.pages < 6, "Many items should not create obvious blank extra pages");

  console.log(JSON.stringify({
    ok: true,
    font: path.relative(path.join(__dirname, ".."), fontPath),
    logo: path.relative(path.join(__dirname, ".."), logoPath),
    pages: {
      oneItem: oneItem.pages,
      fiveItems: fiveItems.pages,
      manyItems: manyItems.pages
    },
    output: path.relative(path.join(__dirname, ".."), outDir)
  }));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
