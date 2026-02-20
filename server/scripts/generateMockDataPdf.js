const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "seedDemoData.js");
const outputPath = path.join(__dirname, "..", "mock-data-report.pdf");

function extractBlock(source, startLabel, endLabel) {
  const start = source.indexOf(startLabel);
  const end = source.indexOf(endLabel, start + startLabel.length);
  if (start === -1 || end === -1 || end <= start) {
    return `${startLabel}\n[Block not found]\n`;
  }
  return source.slice(start, end).trimEnd();
}

function wrapLine(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const parts = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let cut = remaining.lastIndexOf(" ", maxLen);
    if (cut < 1) cut = maxLen;
    parts.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining.length) parts.push(remaining);
  return parts;
}

function escapePdfText(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdfFromLines(lines) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginLeft = 40;
  const marginTop = 40;
  const marginBottom = 40;
  const fontSize = 9;
  const lineHeight = 12;
  const maxTextWidthChars = 102;
  const maxLinesPerPage = Math.floor((pageHeight - marginTop - marginBottom) / lineHeight);

  const wrapped = [];
  for (const line of lines) {
    const expanded = line.replace(/\t/g, "  ");
    const chunks = wrapLine(expanded, maxTextWidthChars);
    if (chunks.length === 0) wrapped.push("");
    else wrapped.push(...chunks);
  }

  const pages = [];
  for (let i = 0; i < wrapped.length; i += maxLinesPerPage) {
    pages.push(wrapped.slice(i, i + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push(["No data"]);

  const objects = [];

  function addObject(content) {
    objects.push(content);
    return objects.length;
  }

  const fontObj = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  const pageObjIds = [];

  for (const pageLines of pages) {
    const yStart = pageHeight - marginTop - fontSize;
    const streamLines = [
      "BT",
      `/F1 ${fontSize} Tf`,
      `${marginLeft} ${yStart} Td`
    ];

    for (let i = 0; i < pageLines.length; i += 1) {
      const line = escapePdfText(pageLines[i]);
      if (i === 0) streamLines.push(`(${line}) Tj`);
      else streamLines.push("T*", `(${line}) Tj`);
    }
    streamLines.push("ET");
    const streamContent = streamLines.join("\n");
    const streamObj = addObject(`<< /Length ${Buffer.byteLength(streamContent, "utf8")} >>\nstream\n${streamContent}\nendstream`);
    const pageObj = addObject(
      `<< /Type /Page /Parent PAGES_REF /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${streamObj} 0 R >>`
    );
    pageObjIds.push(pageObj);
  }

  const kids = pageObjIds.map((id) => `${id} 0 R`).join(" ");
  const pagesObj = addObject(`<< /Type /Pages /Kids [ ${kids} ] /Count ${pageObjIds.length} >>`);
  const catalogObj = addObject(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  for (const pageId of pageObjIds) {
    objects[pageId - 1] = objects[pageId - 1].replace("PAGES_REF", `${pagesObj} 0 R`);
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(pdf, "utf8");
}

function main() {
  const source = fs.readFileSync(sourcePath, "utf8");

  const recruitersBlock = extractBlock(source, "const recruitersSeed = [", "const studentsSeed = [");
  const studentsBlock = extractBlock(source, "const studentsSeed = [", "const hashPassword = async");
  const jobsBlock = extractBlock(source, "const jobsSeed = [", "const out = [];");
  const appBlock = extractBlock(source, "const appSeed = [", "for (const app of appSeed)");

  const recruitersCount = (recruitersBlock.match(/role:\s*"recruiter"/g) || []).length;
  const studentsCount = (studentsBlock.match(/role:\s*"student"/g) || []).length;

  const report = [
    "Jobify Mock Data Report",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Recruiters: ${recruitersCount}`,
    `Students: ${studentsCount}`,
    "",
    "================ RECRUITERS SEED ================",
    recruitersBlock,
    "",
    "================ STUDENTS SEED ================",
    studentsBlock,
    "",
    "================ JOBS SEED ================",
    jobsBlock,
    "",
    "================ APPLICATIONS SEED ================",
    appBlock
  ];

  const lines = report.join("\n").split("\n");
  const pdfBytes = createPdfFromLines(lines);
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF created: ${outputPath}`);
}

main();
