#!/bin/bash

# Script simple para insertar datos de prueba
BASE_URL="http://localhost:3000"

echo "=========================================="
echo "🌱 Insertando datos de prueba"
echo "=========================================="
echo ""

# Crear usuarios
echo "📝 Creando usuarios..."

curl -s -X POST "$BASE_URL/auth/signup" -H "Content-Type: application/json" \
-d '{"email":"admin@universidad.edu","password":"Admin123!","name":"Admin Principal","code":"ADMIN001","username":"admin","role":"ADMIN"}' \
| python3 -m json.tool

curl -s -X POST "$BASE_URL/auth/signup" -H "Content-Type: application/json" \
-d '{"email":"carlos.ruiz@universidad.edu","password":"Profesor123!","name":"Dr. Carlos Ruiz","code":"PROF001","username":"carlos.ruiz","role":"PROFESSOR"}' \
| python3 -m json.tool

curl -s -X POST "$BASE_URL/auth/signup" -H "Content-Type: application/json" \
-d '{"email":"ana.lopez@universidad.edu","password":"Profesor456!","name":"Dra. Ana López","code":"PROF002","username":"ana.lopez","role":"PROFESSOR"}' \
| python3 -m json.tool

curl -s -X POST "$BASE_URL/auth/signup" -H "Content-Type: application/json" \
-d '{"email":"maria.garcia@estudiante.edu","password":"Estudiante123!","name":"María García","code":"EST001","username":"maria.garcia","role":"STUDENT"}' \
| python3 -m json.tool

curl -s -X POST "$BASE_URL/auth/signup" -H "Content-Type: application/json" \
-d '{"email":"pedro.martinez@estudiante.edu","password":"Estudiante456!","name":"Pedro Martínez","code":"EST002","username":"pedro.martinez","role":"STUDENT"}' \
| python3 -m json.tool

curl -s -X POST "$BASE_URL/auth/signup" -H "Content-Type: application/json" \
-d '{"email":"lucia.fernandez@estudiante.edu","password":"Estudiante789!","name":"Lucía Fernández","code":"EST003","username":"lucia.fernandez","role":"STUDENT"}' \
| python3 -m json.tool

echo ""
echo "✓ 6 usuarios creados"
echo ""

# Login como profesor 1 para crear cursos
echo "📚 Creando cursos..."
PROF1_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
-d '{"email":"carlos.ruiz@universidad.edu","password":"Profesor123!"}' \
| python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

# Crear curso 1
curl -s -X POST "$BASE_URL/courses" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF1_TOKEN" \
-d '{"code":"PROG101","name":"Introducción a la Programación","period":"2025-1","professorCode":["PROF001"]}' \
| python3 -m json.tool

# Login como profesor 2
PROF2_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
-d '{"email":"ana.lopez@universidad.edu","password":"Profesor456!"}' \
| python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

# Crear curso 2
curl -s -X POST "$BASE_URL/courses" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF2_TOKEN" \
-d '{"code":"ALG201","name":"Estructuras de Datos y Algoritmos","period":"2025-1","professorCode":["PROF002"]}' \
| python3 -m json.tool

echo ""
echo "✓ 2 cursos creados"
echo ""

# Obtener IDs de cursos
echo "👥 Inscribiendo estudiantes..."
COURSE1_ID=$(curl -s -X GET "$BASE_URL/courses" -H "Authorization: Bearer $PROF1_TOKEN" \
| python3 -c "import sys, json; data=json.load(sys.stdin); print([c['id'] for c in data if c['code']=='PROG101'][0])")

COURSE2_ID=$(curl -s -X GET "$BASE_URL/courses" -H "Authorization: Bearer $PROF2_TOKEN" \
| python3 -c "import sys, json; data=json.load(sys.stdin); print([c['id'] for c in data if c['code']=='ALG201'][0])")

# Inscribir estudiantes
curl -s -X POST "$BASE_URL/courses/$COURSE1_ID/students" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF1_TOKEN" \
-d '{"studentCodes":["EST001","EST002","EST003"]}' | python3 -m json.tool

curl -s -X POST "$BASE_URL/courses/$COURSE2_ID/students" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF2_TOKEN" \
-d '{"studentCodes":["EST001","EST002"]}' | python3 -m json.tool

echo ""
echo "✓ Estudiantes inscritos"
echo ""

# Crear challenges
echo "🎯 Creando challenges..."

# Obtener ID del profesor 1
PROF1_ID=$(curl -s -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $PROF1_TOKEN" \
| python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# Challenge 1: Hello World
curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF1_TOKEN" \
-d "{\"title\":\"Hello World\",\"description\":\"Escribe un programa que imprima 'Hello World'.\",\"difficulty\":\"EASY\",\"tags\":[\"básico\"],\"timeLimit\":1000,\"memoryLimit\":128,\"authorId\":\"$PROF1_ID\",\"status\":\"PUBLISHED\",\"isPublic\":true,\"testcases\":[{\"caseNumber\":1,\"input\":\"\",\"output\":\"Hello World\",\"visible\":true}]}" \
| python3 -m json.tool

# Challenge 2: Suma Simple
curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF1_TOKEN" \
-d "{\"title\":\"Suma de Dos Números\",\"description\":\"Lee dos números y retorna su suma. Input: dos líneas. Output: la suma.\",\"difficulty\":\"EASY\",\"tags\":[\"matemáticas\"],\"timeLimit\":1000,\"memoryLimit\":128,\"authorId\":\"$PROF1_ID\",\"status\":\"PUBLISHED\",\"isPublic\":true,\"testcases\":[{\"caseNumber\":1,\"input\":\"5\\n3\",\"output\":\"8\",\"visible\":true},{\"caseNumber\":2,\"input\":\"10\\n20\",\"output\":\"30\",\"visible\":true}]}" \
| python3 -m json.tool

# Obtener ID del profesor 2
PROF2_ID=$(curl -s -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $PROF2_TOKEN" \
| python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# Challenge 3: Factorial
curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF2_TOKEN" \
-d "{\"title\":\"Factorial\",\"description\":\"Calcula el factorial de un número. Input: un entero n. Output: n!\",\"difficulty\":\"EASY\",\"tags\":[\"matemáticas\",\"recursión\"],\"timeLimit\":1000,\"memoryLimit\":128,\"authorId\":\"$PROF2_ID\",\"status\":\"PUBLISHED\",\"isPublic\":true,\"testcases\":[{\"caseNumber\":1,\"input\":\"5\",\"output\":\"120\",\"visible\":true},{\"caseNumber\":2,\"input\":\"3\",\"output\":\"6\",\"visible\":true},{\"caseNumber\":3,\"input\":\"0\",\"output\":\"1\",\"visible\":false}]}" \
| python3 -m json.tool

echo ""
echo "✓ 3 challenges creados"
echo ""

echo "=========================================="
echo "✅ Datos insertados exitosamente"
echo "=========================================="
echo ""
echo "🔑 Credenciales:"
echo "  Admin: admin@universidad.edu / Admin123!"
echo "  Profesor 1: carlos.ruiz@universidad.edu / Profesor123!"
echo "  Profesor 2: ana.lopez@universidad.edu / Profesor456!"
echo "  Estudiante 1: maria.garcia@estudiante.edu / Estudiante123!"
echo "  Estudiante 2: pedro.martinez@estudiante.edu / Estudiante456!"
echo "  Estudiante 3: lucia.fernandez@estudiante.edu / Estudiante789!"
echo ""
echo "🌐 API Docs: http://localhost:3000/api"
echo ""
