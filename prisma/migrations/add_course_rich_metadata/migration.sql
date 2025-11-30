-- Add rich metadata to Course model for educational platform
ALTER TABLE "Course" ADD COLUMN "description" TEXT;
ALTER TABLE "Course" ADD COLUMN "category" TEXT;
ALTER TABLE "Course" ADD COLUMN "level" TEXT;
ALTER TABLE "Course" ADD COLUMN "nrc" TEXT;
ALTER TABLE "Course" ADD COLUMN "group" TEXT;
ALTER TABLE "Course" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "Course" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- Create Lesson table for course content
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "duration" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- Create LessonResource table for lesson materials
CREATE TABLE "LessonResource" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "LessonResource_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Lesson_courseId_order_idx" ON "Lesson"("courseId", "order");

-- Add foreign keys
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonResource" ADD CONSTRAINT "LessonResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
