-- Reconcile schema drift from Distributor -> Business and ensure Admin model exists.

-- Rename old Distributor table to Business when upgrading existing databases.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Distributor'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Business'
    ) THEN
        ALTER TABLE "Distributor" RENAME TO "Business";
    END IF;
END $$;

-- Keep index/constraint names aligned after table rename.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'Distributor_userId_key'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'Business_userId_key'
    ) THEN
        ALTER INDEX "Distributor_userId_key" RENAME TO "Business_userId_key";
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'Distributor_approvalStatus_idx'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'Business_approvalStatus_idx'
    ) THEN
        ALTER INDEX "Distributor_approvalStatus_idx" RENAME TO "Business_approvalStatus_idx";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Distributor_userId_fkey'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Business_userId_fkey'
    ) THEN
        ALTER TABLE "Business" RENAME CONSTRAINT "Distributor_userId_fkey" TO "Business_userId_fkey";
    END IF;
END $$;

-- Ensure Admin table exists for User <-> Admin relation.
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_userId_key" ON "Admin"("userId");

-- Add FK if it is missing.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Admin_userId_fkey'
    ) THEN
        ALTER TABLE "Admin"
            ADD CONSTRAINT "Admin_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
