-- CreateEnum
CREATE TYPE "Department" AS ENUM ('DSA', 'WEB_DEVELOPMENT', 'IOT', 'GAME_DEVELOPMENT_ANIMATION', 'DEVOPS_CLOUD', 'ML_DATA_SCIENCE', 'MEDIA_GRAPHICS_VIDEO', 'CORPORATE_RELATIONS');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "githubLink" TEXT,
    "liveLink" TEXT,
    "imageLinks" TEXT[],
    "doubts" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
