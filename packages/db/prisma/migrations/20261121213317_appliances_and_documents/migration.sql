-- CreateEnum
CREATE TYPE "ApplianceCategory" AS ENUM ('FRIDGE', 'FREEZER', 'OVEN', 'HOB', 'MICROWAVE', 'DISHWASHER', 'WASHING_MACHINE', 'DRYER', 'WASHER_DRYER', 'AIR_CONDITIONER', 'WATER_HEATER', 'EXTRACTOR_HOOD', 'TV', 'COFFEE_MACHINE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('LABEL_PHOTO', 'INVOICE', 'PHOTO');

-- CreateTable
CREATE TABLE "Appliance" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "category" "ApplianceCategory" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "manufactureDate" TEXT,
    "purchaseDate" DATE,
    "purchasePriceRon" DECIMAL(10,2),
    "warrantyUntil" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "extractedData" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplianceDocument" (
    "applianceId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "ApplianceDocument_pkey" PRIMARY KEY ("applianceId","documentId")
);

-- CreateIndex
CREATE INDEX "Appliance_unitId_idx" ON "Appliance"("unitId");

-- CreateIndex
CREATE INDEX "Document_unitId_idx" ON "Document"("unitId");

-- CreateIndex
CREATE INDEX "ApplianceDocument_documentId_idx" ON "ApplianceDocument"("documentId");

-- AddForeignKey
ALTER TABLE "Appliance" ADD CONSTRAINT "Appliance_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplianceDocument" ADD CONSTRAINT "ApplianceDocument_applianceId_fkey" FOREIGN KEY ("applianceId") REFERENCES "Appliance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplianceDocument" ADD CONSTRAINT "ApplianceDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
