-- CreateTable
CREATE TABLE "SharedCart" (
    "id" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "country" "Country" NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedCartItem" (
    "id" TEXT NOT NULL,
    "sharedCartId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "SharedCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedCart_shareCode_key" ON "SharedCart"("shareCode");

-- AddForeignKey
ALTER TABLE "SharedCart" ADD CONSTRAINT "SharedCart_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedCartItem" ADD CONSTRAINT "SharedCartItem_sharedCartId_fkey" FOREIGN KEY ("sharedCartId") REFERENCES "SharedCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedCartItem" ADD CONSTRAINT "SharedCartItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
