import type { UserLanguage } from "@turnover/core/user/constants/user.constants";

import Card from "@/components/card";
import CopyButton from "@/components/copy-button";
import UnitRegenerateLinkButton from "@/features/unit/components/unit/unit-regenerate-link-button";
import { MANAGER_TEXT } from "@/features/user/constants/manager-text.constants";

export default function UnitReportLinkCard({
  unit,
  reportUrl,
  qrSvg,
  language,
}: Readonly<{
  unit: { id: string; name: string };
  reportUrl: string;
  qrSvg: string;
  language: UserLanguage;
}>) {
  const text = MANAGER_TEXT[language];
  const qrDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;

  return (
    <Card title={text.reportLink.title}>
      <p className="text-sm opacity-70">{text.reportLink.intro}</p>
      <p className="font-mono text-sm break-all">{reportUrl}</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL, nothing for next/image to optimize */}
      <img
        src={qrDataUrl}
        alt={text.reportLink.qrAlt(unit.name)}
        className="mx-auto w-48 rounded bg-white"
      />
      <div className="flex flex-wrap gap-2">
        <CopyButton
          text={reportUrl}
          copyLabel={text.copyLink}
          copiedLabel={text.copied}
        />
        <a
          href={qrDataUrl}
          download={text.reportLink.qrFileName(unit.name)}
          className="rounded border border-foreground/20 px-4 py-2 text-center font-medium"
        >
          {text.reportLink.downloadQr}
        </a>
        <UnitRegenerateLinkButton unitId={unit.id} language={language} />
      </div>
    </Card>
  );
}
