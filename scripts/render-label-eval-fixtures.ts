import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";

const EVALS_DIR = "src/agents/label-extractor/evals";
const OUTPUT_DIR = path.join(EVALS_DIR, "fixtures", "rendered");
const WIDTH = 800;
const HEIGHT = 420;
const SPECS_ROW = `
  <line x1="26" y1="320" x2="${WIDTH - 26}" y2="320" stroke="#444"/>
  <text x="30" y="355" font-size="20" fill="#1b1b1b">220-240V~ 50Hz</text>
  <text x="260" y="355" font-size="20" fill="#1b1b1b">IPX4</text>
  <text x="360" y="360" font-size="34" font-weight="700" fill="#1b1b1b">CE</text>`;

const GLARE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs><radialGradient id="glare"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="560" cy="330" rx="260" ry="110" fill="url(#glare)"/>
</svg>`;

const renderedCaseSchema = z.object({
  id: z.string(),
  layout: z.enum(["bsh", "samsung", "lg", "generic", "blank"]),
  lines: z.record(z.string(), z.string()),
  effects: z.object({
    rotateDegrees: z.number().optional(),
    blurSigma: z.number().optional(),
    cropRightFraction: z.number().optional(),
    cropTopFraction: z.number().optional(),
    glare: z.boolean().optional(),
  }),
});
type RenderedCase = z.infer<typeof renderedCaseSchema>;

const fixtures = z
  .object({ rendered: z.array(renderedCaseSchema) })
  .parse(
    JSON.parse(await readFile(path.join(EVALS_DIR, "fixtures.json"), "utf8")),
  );

await mkdir(OUTPUT_DIR, { recursive: true });
for (const renderedCase of fixtures.rendered) {
  const output = path.join(OUTPUT_DIR, `${renderedCase.id}.jpg`);
  await renderLabel(renderedCase).then((image) => image.toFile(output));
  console.log(output);
}

async function renderLabel(renderedCase: RenderedCase) {
  const { effects } = renderedCase;
  let image = sharp(Buffer.from(buildSvg(renderedCase)));

  if (effects.glare) {
    image = sharp(
      await image
        .composite([{ input: Buffer.from(GLARE_SVG), top: 0, left: 0 }])
        .png()
        .toBuffer(),
    );
  }
  if (effects.cropRightFraction || effects.cropTopFraction) {
    const top = Math.round(HEIGHT * (effects.cropTopFraction ?? 0));
    image = sharp(
      await image
        .extract({
          left: 0,
          top,
          width: Math.round(WIDTH * (1 - (effects.cropRightFraction ?? 0))),
          height: HEIGHT - top,
        })
        .png()
        .toBuffer(),
    );
  }
  if (effects.blurSigma) {
    image = sharp(await image.blur(effects.blurSigma).png().toBuffer());
  }
  if (effects.rotateDegrees) {
    image = sharp(
      await image
        .rotate(effects.rotateDegrees, { background: "#5a5f66" })
        .png()
        .toBuffer(),
    );
  }
  return image.jpeg({ quality: 82 });
}

function buildSvg({ layout, lines }: RenderedCase) {
  if (layout === "blank") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><rect width="${WIDTH}" height="${HEIGHT}" fill="#d8d8d8"/></svg>`;
  }
  const body = {
    bsh: bshBody,
    samsung: samsungBody,
    lg: lgBody,
    generic: genericBody,
  }[layout](lines);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" font-family="Arial, Helvetica, sans-serif">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#5a5f66"/>
  <rect x="12" y="12" width="${WIDTH - 24}" height="${HEIGHT - 24}" rx="10" fill="#eceee9" stroke="#333" stroke-width="2"/>
  ${body}
  ${SPECS_ROW}
</svg>`;
}

function bshBody(lines: Record<string, string>) {
  return `
  ${text(30, 70, lines.brand, 46, 700)}
  ${text(400, 62, lines.productType, 18)}
  <rect x="26" y="95" width="${WIDTH - 52}" height="46" fill="none" stroke="#222" stroke-width="2"/>
  ${text(36, 128, `E-Nr. ${lines.enr}`, 28, 700)}
  ${text(470, 128, lines.fd, 26)}
  ${text(30, 190, `Type ${lines.type}`, 24)}
  ${text(30, 240, "Made in Germany", 20)}`;
}

function samsungBody(lines: Record<string, string>) {
  return `
  ${barcode(30, 28, 520, 50)}
  ${text(30, 108, lines.model, 20)}
  ${text(30, 150, lines.brand, 32, 700)}
  ${text(400, 150, lines.productType, 22)}
  ${tableRow(175, "MODEL", lines.model)}
  ${tableRow(215, "SERIAL NO", lines.serial)}
  ${tableRow(255, "Date of Production", lines.date)}`;
}

function lgBody(lines: Record<string, string>) {
  return `
  <circle cx="58" cy="60" r="26" fill="#a50034"/>
  ${text(96, 72, lines.brand, 34, 700)}
  ${text(300, 70, lines.productType, 26, 700)}
  ${tableRow(110, "MODEL", lines.model)}
  ${tableRow(150, "SERIAL No.", lines.serial)}
  ${text(30, 240, lines.serial, 40, 700)}
  ${tableRow(260, "Manufactured", lines.date)}`;
}

function genericBody(lines: Record<string, string>) {
  return `
  ${text(30, 75, lines.brand, 44, 700)}
  ${text(30, 125, lines.productType, 22)}
  ${text(30, 185, `Model: ${lines.model}`, 28, 700)}
  ${lines.serial ? text(470, 185, lines.serial, 22) : ""}
  ${lines.date ? text(30, 240, lines.date, 22) : ""}
  ${lines.extra ? text(30, 290, lines.extra, 20) : ""}`;
}

function tableRow(y: number, label: string, value: string) {
  return `<line x1="26" y1="${y}" x2="${WIDTH - 26}" y2="${y}" stroke="#444"/>
  ${text(30, y + 28, label, 20)}
  ${text(330, y + 28, value, 24, 700)}`;
}

function text(
  x: number,
  y: number,
  content: string,
  size: number,
  weight = 400,
) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="#1b1b1b">${escapeXml(content)}</text>`;
}

function barcode(x: number, y: number, width: number, height: number) {
  let bars = "";
  for (let offset = 0, index = 0; offset < width; index++) {
    const barWidth = 1 + ((index * 7) % 4);
    if (index % 2 === 0) {
      bars += `<rect x="${x + offset}" y="${y}" width="${barWidth}" height="${height}" fill="#111"/>`;
    }
    offset += barWidth;
  }
  return bars;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&apos;");
}
