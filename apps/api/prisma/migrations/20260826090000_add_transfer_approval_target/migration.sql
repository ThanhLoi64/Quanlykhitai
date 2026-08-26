ALTER TABLE "Transfer"
  ADD COLUMN "toUserId" INTEGER,
  ADD COLUMN "approvalTenantId" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "approvalUserId" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "Transfer_approvalUserId_status_idx"
  ON "Transfer"("approvalUserId", "status");