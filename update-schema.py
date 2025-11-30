#!/usr/bin/env python3
"""
Script para extender el modelo Course en schema.prisma con campos educativos
y añadir modelos Lesson y LessonResource
"""

schema_path = "/home/mgbel/pf/CodeChallenges/prisma/schema.prisma"

# Leer el archivo actual
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Buscar el modelo Course y reemplazarlo
old_course_model = '''model Course {
  id        String   @id @default(uuid())           // PK
  code      String   @unique                        // Código único del curso (ej: NRC o identificador)
  name      String                                  // Nombre del curso
  period    String                                  // Ej: "2025-1"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones:
  professors  User[]           @relation("CourseProfessor")   // Profesores asignados (N:M)
  students    CourseStudent[]                                 // Estudiantes inscritos (N:M)
  challenges  Challenge[]      @relation("CourseChallenges")  // Retos asociados al curso (1:N)
  evaluations Evaluation[]                                    // Relación con evaluaciones
  submissions Submission[]
}'''

new_course_model = '''model Course {
  id          String   @id @default(uuid())           // PK
  code        String   @unique                        // Código único del curso (ej: NRC o identificador)
  name        String                                  // Nombre del curso
  period      String                                  // Ej: "2025-1"
  description String?                                 // Descripción del curso
  category    String?                                 // Categoría (ej: "web-development", "data-science")
  level       String?                                 // Nivel: "beginner", "intermediate", "advanced"
  nrc         String?                                 // NRC o código de matrícula
  group       String?                                 // Grupo (ej: "1", "A")
  coverImage  String?                                 // URL de la imagen de portada del curso
  isPublished Boolean  @default(false)                // Si el curso está publicado
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relaciones:
  professors  User[]           @relation("CourseProfessor")   // Profesores asignados (N:M)
  students    CourseStudent[]                                 // Estudiantes inscritos (N:M)
  challenges  Challenge[]      @relation("CourseChallenges")  // Retos asociados al curso (1:N)
  evaluations Evaluation[]                                    // Relación con evaluaciones
  submissions Submission[]
  lessons     Lesson[]                                        // Lecciones del curso
}'''

new_models = '''
// ===================================================

/// Lección dentro de un curso (contenido de aprendizaje)
model Lesson {
  id          String   @id @default(uuid())
  courseId    String
  title       String
  description String?
  videoUrl    String?
  duration    String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  course    Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  resources LessonResource[]

  @@index([courseId, order])
}

// ===================================================

/// Recurso asociado a una lección (PDFs, links, código, etc.)
model LessonResource {
  id       String @id @default(uuid())
  lessonId String
  title    String
  url      String
  type     String // "pdf", "doc", "code", "link", "other"

  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
}
'''

# Reemplazar el modelo Course
content = content.replace(old_course_model, new_course_model)

# Añadir los nuevos modelos después del modelo SubmissionTestResult (al final)
content = content.rstrip() + '\n' + new_models

# Escribir el archivo actualizado
with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Schema actualizado exitosamente")
print("📝 Modelos añadidos: Lesson, LessonResource")
print("📝 Campos añadidos a Course: description, category, level, nrc, group, coverImage, isPublished, lessons")
