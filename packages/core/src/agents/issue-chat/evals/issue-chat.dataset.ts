import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { z } from "zod";

import { storedIssueDiagnosisSchema } from "@turnover/core/issue/schemas/issue-diagnosis.schema";
import prisma from "@turnover/core/lib/db";
import {
  ApplianceCategory,
  HandymanTrade,
  IssueCategory,
  IssueResolution,
  IssueStatus,
  UserLanguage,
} from "@turnover/db/enums";

const FIXTURES_PATH = "src/agents/issue-chat/evals/issue-chat.fixtures.json";

const organizationSchema = z.object({
  key: z.string(),
  name: z.string(),
  units: z.array(
    z.object({ key: z.string(), name: z.string(), address: z.string() }),
  ),
  handymen: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
      phone: z.string(),
      trades: z.array(z.enum(HandymanTrade)),
    }),
  ),
  appliances: z.array(
    z.object({
      key: z.string(),
      unit: z.string(),
      category: z.enum(ApplianceCategory),
      brand: z.string(),
      model: z.string(),
      purchaseDate: z.iso.date().nullable(),
      purchasePriceRon: z.number().nullable(),
      warrantyUntil: z.iso.date().nullable(),
      retiredAt: z.iso.datetime().optional(),
    }),
  ),
  issues: z.array(
    z.object({
      key: z.string(),
      unit: z.string(),
      appliance: z.string().nullable(),
      description: z.string(),
      status: z.enum(IssueStatus),
      createdAt: z.iso.datetime(),
      category: z.enum(IssueCategory).optional(),
      diagnosis: storedIssueDiagnosisSchema.optional(),
      scheduledFor: z.iso.date().optional(),
      scheduledTime: z.string().optional(),
      resolvedAt: z.iso.datetime().optional(),
      resolution: z.enum(IssueResolution).optional(),
      resolvedBy: z.string().nullable().optional(),
      costRon: z.number().nullable().optional(),
      messages: z
        .array(z.object({ handyman: z.string(), sentAt: z.iso.datetime() }))
        .optional(),
    }),
  ),
});
type EvalOrganization = z.infer<typeof organizationSchema>;

const issueChatEvalCaseSchema = z.object({
  id: z.string(),
  language: z.enum(UserLanguage),
  question: z.string(),
  numbers: z.array(z.number()).default([]),
  mentions: z.array(z.string()).default([]),
  forbidden: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  isRefusal: z.boolean().default(false),
});
export type IssueChatEvalCase = z.infer<typeof issueChatEvalCaseSchema>;

const fixturesSchema = z.object({
  today: z.iso.date(),
  organizations: z.array(organizationSchema),
  cases: z.array(issueChatEvalCaseSchema),
});

export const loadIssueChatEvalFixtures = async () =>
  fixturesSchema.parse(JSON.parse(await readFile(FIXTURES_PATH, "utf8")));

export const seedIssueChatEvalData = async (
  organizations: ReadonlyArray<EvalOrganization>,
) => {
  const ids = new Map<string, string>();
  const organizationIds: string[] = [];
  for (const organization of organizations) {
    organizationIds.push(await seedOrganization(organization, ids));
  }
  const user = await prisma.user.create({
    data: {
      auth0Id: `eval|issue-chat|${randomUUID()}`,
      email: "issue-chat-eval@example.com",
      name: "Eval Manager",
      language: "EN",
      membership: {
        create: { organizationId: organizationIds[0], role: "OWNER" },
      },
    },
  });
  return { userId: user.id, organizationIds, ids };
};

export const deleteIssueChatEvalData = async (
  seeded: Readonly<{ userId: string; organizationIds: ReadonlyArray<string> }>,
) => {
  await prisma.user.delete({ where: { id: seeded.userId } });
  for (const id of seeded.organizationIds) {
    await prisma.organization.delete({ where: { id } });
  }
};

export const fillQuestionIds = (
  question: string,
  ids: ReadonlyMap<string, string>,
) =>
  question.replace(/\{\{(\w+):([\w-]+)\}\}/g, (_match, kind, key) =>
    requireId(ids, kind, key),
  );

const seedOrganization = async (
  organization: EvalOrganization,
  ids: Map<string, string>,
) => {
  const { id: organizationId } = await prisma.organization.create({
    data: { name: organization.name },
  });
  for (const unit of organization.units) {
    const created = await prisma.unit.create({
      data: {
        organizationId,
        name: unit.name,
        address: unit.address,
        reportToken: randomUUID(),
      },
    });
    ids.set(`unit:${unit.key}`, created.id);
  }
  for (const handyman of organization.handymen) {
    const created = await prisma.handyman.create({
      data: {
        organizationId,
        name: handyman.name,
        phone: handyman.phone,
        trades: handyman.trades,
      },
    });
    ids.set(`handyman:${handyman.key}`, created.id);
  }
  for (const {
    key,
    unit,
    retiredAt,
    ...appliance
  } of organization.appliances) {
    const created = await prisma.appliance.create({
      data: {
        ...appliance,
        unitId: requireId(ids, "unit", unit),
        purchaseDate:
          appliance.purchaseDate && new Date(appliance.purchaseDate),
        warrantyUntil:
          appliance.warrantyUntil && new Date(appliance.warrantyUntil),
        retiredAt: retiredAt && new Date(retiredAt),
      },
    });
    ids.set(`appliance:${key}`, created.id);
  }
  for (const issue of organization.issues) {
    const created = await prisma.issue.create({
      data: {
        unitId: requireId(ids, "unit", issue.unit),
        applianceId:
          issue.appliance && requireId(ids, "appliance", issue.appliance),
        reporterRole: "GUEST",
        reporterLanguage: "EN",
        description: issue.description,
        status: issue.status,
        category: issue.category,
        diagnosis: issue.diagnosis,
        scheduledFor: issue.scheduledFor && new Date(issue.scheduledFor),
        scheduledTime: issue.scheduledTime,
        resolution: issue.resolution,
        resolvedByHandymanId:
          issue.resolvedBy && requireId(ids, "handyman", issue.resolvedBy),
        costRon: issue.costRon,
        resolvedAt: issue.resolvedAt && new Date(issue.resolvedAt),
        createdAt: new Date(issue.createdAt),
        handymanMessages: {
          create: (issue.messages ?? []).map((message) => {
            const handyman = organization.handymen.find(
              ({ key }) => key === message.handyman,
            );
            return {
              handymanId: requireId(ids, "handyman", message.handyman),
              recipientName: handyman?.name,
              recipientPhone: handyman?.phone,
              textRo: "Bună ziua, puteți trece să vedeți o problemă?",
              openedInWhatsAppAt: new Date(message.sentAt),
            };
          }),
        },
      },
    });
    ids.set(`issue:${issue.key}`, created.id);
  }
  return organizationId;
};

const requireId = (
  ids: ReadonlyMap<string, string>,
  kind: string,
  key: string,
) => {
  const id = ids.get(`${kind}:${key}`);
  if (!id) throw new Error(`No seeded ${kind} ${key}`);
  return id;
};
