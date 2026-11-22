import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { z } from "zod";

const EVALS_DIR = "src/agents/invoice-extractor/evals";
const OUTPUT_DIR = path.join(EVALS_DIR, "fixtures");
const FONT = "node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf";
const FONT_BOLD = "node_modules/dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf";
const PAGE_MARGIN = 40;

const invoiceSchema = z.object({
  id: z.string(),
  seller: z.object({
    brand: z.string(),
    legalName: z.string(),
    address: z.string(),
  }),
  series: z.string(),
  date: z.string(),
  priceMode: z.enum(["gross", "net"]),
  vatRate: z.number().optional(),
  hasWarrantyColumn: z.boolean(),
  lines: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      warranty: z.string().optional(),
    }),
  ),
});
type Invoice = z.infer<typeof invoiceSchema>;

const fixtures = z
  .object({ invoices: z.array(invoiceSchema) })
  .parse(
    JSON.parse(await readFile(path.join(EVALS_DIR, "fixtures.json"), "utf8")),
  );

await mkdir(OUTPUT_DIR, { recursive: true });
for (const invoice of fixtures.invoices) {
  const output = path.join(OUTPUT_DIR, `${invoice.id}.pdf`);
  await renderInvoice(invoice, output);
  console.log(output);
}

function renderInvoice(invoice: Invoice, output: string) {
  const document = new PDFDocument({ size: "A4", margin: PAGE_MARGIN });
  const finished = new Promise<void>((resolve) => {
    document.pipe(createWriteStream(output)).on("finish", () => resolve());
  });
  document.registerFont("regular", FONT);
  document.registerFont("bold", FONT_BOLD);

  document
    .font("bold")
    .fontSize(26)
    .text(invoice.seller.brand, PAGE_MARGIN, 40);
  document
    .font("regular")
    .fontSize(9)
    .text(invoice.seller.legalName)
    .text(invoice.seller.address)
    .text("CUI RO00000000 · Reg. Com. J00/0000/0000 (date fictive)");
  document
    .font("bold")
    .fontSize(16)
    .text("FACTURĂ FISCALĂ", 330, 40, { width: 225, align: "right" })
    .font("regular")
    .fontSize(10)
    .text(`Seria ${invoice.series}`, { width: 225, align: "right" })
    .text(`Data facturii: ${invoice.date}`, { width: 225, align: "right" });
  document
    .fontSize(10)
    .text(
      "Cumpărător: Ion Popescu, Str. Exemplu 1, Cluj-Napoca",
      PAGE_MARGIN,
      130,
    )
    .fillColor("#b00")
    .text("SPECIMEN · document de test generat, fără valoare fiscală")
    .fillColor("#000");

  const isNet = invoice.priceMode === "net";
  const columns = [
    { title: "Nr.", width: 25 },
    { title: "Denumire produs / serviciu", width: isNet ? 200 : 255 },
    { title: "Cant.", width: 35 },
    { title: isNet ? "Preț unitar fără TVA" : "Preț unitar cu TVA", width: 75 },
    { title: isNet ? "Valoare fără TVA" : "Valoare", width: 70 },
    ...(isNet ? [{ title: "TVA", width: 55 }] : []),
    ...(invoice.hasWarrantyColumn ? [{ title: "Garanție", width: 55 }] : []),
  ];

  let y = 175;
  drawRow(
    document,
    columns,
    columns.map((column) => column.title),
    y,
    true,
  );
  y += 30;
  let total = 0;
  invoice.lines.forEach((line, index) => {
    const unitPrice = isNet
      ? round(line.unitPrice / (1 + (invoice.vatRate ?? 0)))
      : line.unitPrice;
    const value = round(unitPrice * line.quantity);
    const vat = round(line.unitPrice * line.quantity - value);
    total += line.unitPrice * line.quantity;
    const cells = [
      String(index + 1),
      line.description,
      String(line.quantity),
      formatRon(unitPrice),
      formatRon(value),
      ...(isNet ? [formatRon(vat)] : []),
      ...(invoice.hasWarrantyColumn ? [line.warranty ?? "-"] : []),
    ];
    y += drawRow(document, columns, cells, y, false);
  });

  document
    .font("bold")
    .fontSize(11)
    .text(`Total de plată: ${formatRon(total)} lei`, PAGE_MARGIN, y + 20, {
      width: 515,
      align: "right",
    });
  if (isNet) {
    document
      .font("regular")
      .fontSize(9)
      .text(`Cota TVA: ${Math.round((invoice.vatRate ?? 0) * 100)}%`, {
        width: 515,
        align: "right",
      });
  }
  document.end();
  return finished;
}

function drawRow(
  document: PDFKit.PDFDocument,
  columns: ReadonlyArray<{ width: number }>,
  cells: ReadonlyArray<string>,
  y: number,
  isHeader: boolean,
) {
  document.font(isHeader ? "bold" : "regular").fontSize(8.5);
  const height = Math.max(
    24,
    ...cells.map(
      (cell, index) =>
        document.heightOfString(cell, { width: columns[index].width - 6 }) + 10,
    ),
  );
  let x = PAGE_MARGIN;
  cells.forEach((cell, index) => {
    document.rect(x, y, columns[index].width, height).stroke("#999");
    document
      .fillColor("#000")
      .text(cell, x + 3, y + 5, { width: columns[index].width - 6 });
    x += columns[index].width;
  });
  return height;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function formatRon(value: number) {
  return value.toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
