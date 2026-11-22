import Card from "@/components/card";
import CopyButton from "@/components/copy-button";
import UnitRegenerateLinkButton from "@/features/unit/components/unit/unit-regenerate-link-button";

export default function UnitReportLinkCard({
  unit,
  reportUrl,
  qrSvg,
}: Readonly<{
  unit: { id: string; name: string };
  reportUrl: string;
  qrSvg: string;
}>) {
  const qrDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;

  return (
    <Card title="Report link">
      <p className="text-sm opacity-70">
        Guests and cleaners open this link (or scan the QR code) to report a
        problem. No login needed.
      </p>
      <p className="font-mono text-sm break-all">{reportUrl}</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL, nothing for next/image to optimize */}
      <img
        src={qrDataUrl}
        alt={`QR code for ${unit.name}`}
        className="mx-auto w-48 rounded bg-white"
      />
      <div className="flex flex-wrap gap-2">
        <CopyButton text={reportUrl} />
        <a
          href={qrDataUrl}
          download={`${unit.name} QR code.svg`}
          className="rounded border border-foreground/20 px-4 py-2 text-center font-medium"
        >
          Download QR
        </a>
        <UnitRegenerateLinkButton unitId={unit.id} />
      </div>
    </Card>
  );
}
