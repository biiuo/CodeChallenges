#!/bin/bash

echo "🚀 Aplicando sistema de gestión de cursos educativos..."
echo ""

cd /home/mgbel/pf/CodeChallenges

# 1. Generar cliente Prisma con los nuevos modelos
echo "📦 Generando cliente Prisma..."
npx prisma generate

# 2. Verificar que Docker está corriendo
echo ""
echo "🐳 Verificando Docker..."
docker ps | grep postgres || echo "⚠️  PostgreSQL no está corriendo"

# 3. Aplicar migraciones (si es necesario)
echo ""
echo "📊 Para aplicar migraciones a la base de datos, ejecuta:"
echo "   npx prisma migrate dev --name course_learning_platform"
echo ""

# 4. Reiniciar backend
echo "🔄 Reiniciando backend..."
docker compose restart api

echo ""
echo "✅ Sistema listo!"
echo ""
echo "📋 Resumen de componentes creados:"
echo "   Backend:"
echo "   - ✅ Modelo Course extendido (description, category, level, nrc, group, coverImage, isPublished)"
echo "   - ✅ Modelo Lesson (lecciones con videos y recursos)"
echo "   - ✅ Modelo LessonResource (PDFs, links, código, etc.)"
echo "   - ✅ 8+ endpoints nuevos en courses.controller.ts"
echo ""
echo "   Frontend:"
echo "   - ✅ CreateCourseForm.tsx - Formulario completo de creación"
echo "   - ✅ CourseLessonsManager.tsx - Gestión de lecciones (profesores)"
echo "   - ✅ CourseLearningPlatform.tsx - Plataforma de aprendizaje (estudiantes)"
echo "   - ✅ ProfessorPanel.tsx - Gestión de profesores"
echo "   - ✅ CourseDetail.tsx actualizado con nuevas tabs"
echo ""
echo "📚 Lee COURSE_SYSTEM_README.md para más información"
echo ""
echo "🔗 Accede a:"
echo "   - Admin: http://localhost:5173/courses (crear cursos)"
echo "   - Profesor: http://localhost:5173/courses/:id (gestionar contenido)"
echo "   - Estudiante: http://localhost:5173/courses/catalog (inscribirse)"
echo ""
