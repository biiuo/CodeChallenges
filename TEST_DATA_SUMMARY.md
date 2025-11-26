# 📊 Datos de Prueba Insertados

## ✅ Estado Actual

Se han insertado exitosamente datos de prueba en la base de datos.

## 👥 Usuarios Creados

| Rol | Nombre | Email | Password | Code | Username |
|-----|--------|-------|----------|------|----------|
| **Admin** | Admin Principal | admin@universidad.edu | Admin123! | ADMIN001 | admin |
| **Profesor** | Dr. Carlos Ruiz | carlos.ruiz@universidad.edu | Profesor123! | PROF001 | carlos.ruiz |
| **Profesor** | Dra. Ana López | ana.lopez@universidad.edu | Profesor456! | PROF002 | ana.lopez |
| **Estudiante** | María García | maria.garcia@estudiante.edu | Estudiante123! | EST001 | maria.garcia |
| **Estudiante** | Pedro Martínez | pedro.martinez@estudiante.edu | Estudiante456! | EST002 | pedro.martinez |
| **Estudiante** | Lucía Fernández | lucia.fernandez@estudiante.edu | Estudiante789! | EST003 | lucia.fernandez |

## 📚 Cursos Creados

| Code | Nombre | Período | Profesor |
|------|--------|---------|----------|
| **PROG101** | Introducción a la Programación | 2025-1 | Dr. Carlos Ruiz (PROF001) |
| **ALG201** | Estructuras de Datos y Algoritmos | 2025-1 | Dra. Ana López (PROF002) |

## 🎯 Challenges Creados

### 1. Hello World
- **Dificultad:** EASY
- **Tags:** básico
- **Autor:** Dr. Carlos Ruiz
- **Descripción:** Escribe un programa que imprima exactamente 'Hello World' (sin comillas).
- **Casos de prueba:** 1 caso visible
- **Límites:** 1000ms, 128MB

### 2. Suma de Dos Números
- **Dificultad:** EASY
- **Tags:** matemáticas, básico
- **Autor:** Dr. Carlos Ruiz
- **Descripción:** Lee dos números enteros (uno por línea) y retorna su suma.
- **Casos de prueba:** 2 visibles, 1 oculto
- **Límites:** 1000ms, 128MB

### 3. Factorial
- **Dificultad:** EASY
- **Tags:** matemáticas, recursión
- **Autor:** Dra. Ana López
- **Descripción:** Calcula el factorial de un número entero no negativo n.
- **Casos de prueba:** 2 visibles, 2 ocultos
- **Límites:** 1000ms, 128MB

## 🔗 Enlaces Útiles

- **API Swagger:** http://localhost:3000/api
- **Redis Commander:** http://localhost:8081

## 🧪 Pruebas Rápidas

### Login como Admin
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@universidad.edu","password":"Admin123!"}'
```

### Login como Estudiante
```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.garcia@estudiante.edu","password":"Estudiante123!"}'
```

### Listar Challenges (requiere token)
```bash
TOKEN="<tu_token_aquí>"
curl -X GET "http://localhost:3000/challenges" \
  -H "Authorization: Bearer $TOKEN"
```

### Crear Submission (requiere token de estudiante)
```bash
TOKEN="<tu_token_aquí>"
curl -X POST "http://localhost:3000/submissions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "challengeId": "<challenge_id>",
    "code": "print(\"Hello World\")",
    "language": "python"
  }'
```

## 📝 Notas

- Todos los challenges están publicados (`PUBLISHED`) y son públicos (`isPublic: true`)
- Los estudiantes pueden ver y resolver todos los challenges
- Los profesores pueden crear nuevos challenges y cursos
- El admin tiene acceso completo al sistema
