-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
