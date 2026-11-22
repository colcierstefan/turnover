import "server-only";

import QRCode from "qrcode";

import env from "@turnover/core/config/env.config";

export const getReportUrl = (reportToken: string) =>
  `${env.app.baseUrl}/r/${reportToken}`;

export const createReportQrSvg = (reportUrl: string) =>
  QRCode.toString(reportUrl, { type: "svg", margin: 2 });
