#!/bin/bash

# Script para insertar datos de prueba en la aplicación
# Asegúrate de que el backend esté corriendo en http://localhost:3000

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "🌱 Iniciando inserción de datos de prueba"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
# Helper function to extract JSON value
extract_json() {
  echo "$1" | python3 -c "import sys, json; print(json.load(sys.stdin)['$2'])"
}


# ===========================================
# 1. CREAR USUARIOS
# ===========================================
echo -e "${YELLOW}📝 Creando usuarios...${NC}"
echo ""

# 1.1 Admin
echo "Creando Admin..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@universidad.edu",
    "password": "Admin123!",
    "name": "Admin Principal",
    "code": "ADMIN001",
    "username": "admin",
    "role": "ADMIN"
  }')
echo "$ADMIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ADMIN_RESPONSE"
ADMIN_TOKEN=$(extract_json "$ADMIN_RESPONSE" "access" 2>/dev/null || echo "")
echo -e "${GREEN}✓ Admin creado${NC}"
echo ""

# 1.2 Profesor 1
echo "Creando Profesor 1..."
PROF1_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.ruiz@universidad.edu",
    "password": "Profesor123!",
    "name": "Dr. Carlos Ruiz",
    "code": "PROF001",
    "username": "carlos.ruiz",
    "role": "PROFESSOR"
  }')
echo "$PROF1_RESPONSE" | jq '.'
PROF1_TOKEN=$(echo "$PROF1_RESPONSE" | jq -r '.access')
echo -e "${GREEN}✓ Profesor 1 creado${NC}"
echo ""

# 1.3 Profesor 2
echo "Creando Profesor 2..."
PROF2_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.lopez@universidad.edu",
    "password": "Profesor456!",
    "name": "Dra. Ana López",
    "code": "PROF002",
    "username": "ana.lopez",
    "role": "PROFESSOR"
  }')
echo "$PROF2_RESPONSE" | jq '.'
PROF2_TOKEN=$(echo "$PROF2_RESPONSE" | jq -r '.access')
echo -e "${GREEN}✓ Profesor 2 creado${NC}"
echo ""

# 1.4 Estudiante 1
echo "Creando Estudiante 1..."
STU1_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.garcia@estudiante.edu",
    "password": "Estudiante123!",
    "name": "María García",
    "code": "EST001",
    "username": "maria.garcia",
    "role": "STUDENT"
  }')
echo "$STU1_RESPONSE" | jq '.'
STU1_TOKEN=$(echo "$STU1_RESPONSE" | jq -r '.access')
echo -e "${GREEN}✓ Estudiante 1 creado${NC}"
echo ""

# 1.5 Estudiante 2
echo "Creando Estudiante 2..."
STU2_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pedro.martinez@estudiante.edu",
    "password": "Estudiante456!",
    "name": "Pedro Martínez",
    "code": "EST002",
    "username": "pedro.martinez",
    "role": "STUDENT"
  }')
echo "$STU2_RESPONSE" | jq '.'
STU2_TOKEN=$(echo "$STU2_RESPONSE" | jq -r '.access')
echo -e "${GREEN}✓ Estudiante 2 creado${NC}"
echo ""

# 1.6 Estudiante 3
echo "Creando Estudiante 3..."
STU3_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lucia.fernandez@estudiante.edu",
    "password": "Estudiante789!",
    "name": "Lucía Fernández",
    "code": "EST003",
    "username": "lucia.fernandez",
    "role": "STUDENT"
  }')
echo "$STU3_RESPONSE" | jq '.'
STU3_TOKEN=$(echo "$STU3_RESPONSE" | jq -r '.access')
echo -e "${GREEN}✓ Estudiante 3 creado${NC}"
echo ""

# ===========================================
# 2. CREAR CURSOS
# ===========================================
echo -e "${YELLOW}📚 Creando cursos...${NC}"
echo ""

# 2.1 Curso de Programación
echo "Creando Curso: Introducción a la Programación..."
COURSE1_RESPONSE=$(curl -s -X POST "$BASE_URL/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF1_TOKEN" \
  -d '{
    "code": "PROG101",
    "name": "Introducción a la Programación",
    "period": "2025-1",
    "professorCode": ["PROF001"]
  }')
echo "$COURSE1_RESPONSE" | jq '.'
COURSE1_ID=$(echo "$COURSE1_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Curso PROG101 creado${NC}"
echo ""

# 2.2 Curso de Algoritmos
echo "Creando Curso: Estructuras de Datos y Algoritmos..."
COURSE2_RESPONSE=$(curl -s -X POST "$BASE_URL/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF2_TOKEN" \
  -d '{
    "code": "ALG201",
    "name": "Estructuras de Datos y Algoritmos",
    "period": "2025-1",
    "professorCode": ["PROF002"]
  }')
echo "$COURSE2_RESPONSE" | jq '.'
COURSE2_ID=$(echo "$COURSE2_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Curso ALG201 creado${NC}"
echo ""

# ===========================================
# 3. INSCRIBIR ESTUDIANTES EN CURSOS
# ===========================================
echo -e "${YELLOW}👥 Inscribiendo estudiantes en cursos...${NC}"
echo ""

# Inscribir estudiantes en PROG101
echo "Inscribiendo estudiantes en PROG101..."
curl -s -X POST "$BASE_URL/courses/$COURSE1_ID/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF1_TOKEN" \
  -d '{"studentCodes": ["EST001", "EST002", "EST003"]}' | jq '.'
echo -e "${GREEN}✓ Estudiantes inscritos en PROG101${NC}"
echo ""

# Inscribir estudiantes en ALG201
echo "Inscribiendo estudiantes en ALG201..."
curl -s -X POST "$BASE_URL/courses/$COURSE2_ID/students" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF2_TOKEN" \
  -d '{"studentCodes": ["EST001", "EST002"]}' | jq '.'
echo -e "${GREEN}✓ Estudiantes inscritos en ALG201${NC}"
echo ""

# ===========================================
# 4. CREAR CHALLENGES
# ===========================================
echo -e "${YELLOW}🎯 Creando challenges...${NC}"
echo ""

# 4.1 Challenge: Hello World
echo "Creando Challenge: Hello World..."
PROF1_ID=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $PROF1_TOKEN" | jq -r '.id')

CHALLENGE1_RESPONSE=$(curl -s -X POST "$BASE_URL/challenges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF1_TOKEN" \
  -d "{
    \"title\": \"Hello World\",
    \"description\": \"Escribe un programa que imprima 'Hello World' en la consola.\",
    \"difficulty\": \"EASY\",
    \"tags\": [\"introducción\", \"básico\"],
    \"timeLimit\": 1000,
    \"memoryLimit\": 128,
    \"authorId\": \"$PROF1_ID\",
    \"status\": \"PUBLISHED\",
    \"isPublic\": true,
    \"testcases\": [
      {
        \"caseNumber\": 1,
        \"input\": \"\",
        \"output\": \"Hello World\",
        \"visible\": true
      }
    ]
  }")
echo "$CHALLENGE1_RESPONSE" | jq '.'
CHALLENGE1_ID=$(echo "$CHALLENGE1_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Challenge 'Hello World' creado${NC}"
echo ""

# 4.2 Challenge: Two Sum
echo "Creando Challenge: Two Sum..."
CHALLENGE2_RESPONSE=$(curl -s -X POST "$BASE_URL/challenges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF1_TOKEN" \
  -d "{
    \"title\": \"Two Sum\",
    \"description\": \"Dado un array de enteros nums y un entero target, retorna los índices de dos números que sumen target. Input: Primera línea contiene los números separados por espacio, segunda línea el target. Output: Los dos índices separados por espacio.\",
    \"difficulty\": \"EASY\",
    \"tags\": [\"arrays\", \"hash-table\"],
    \"timeLimit\": 2000,
    \"memoryLimit\": 256,
    \"authorId\": \"$PROF1_ID\",
    \"status\": \"PUBLISHED\",
    \"isPublic\": true,
    \"testcases\": [
      {
        \"caseNumber\": 1,
        \"input\": \"2 7 11 15\\n9\",
        \"output\": \"0 1\",
        \"visible\": true
      },
      {
        \"caseNumber\": 2,
        \"input\": \"3 2 4\\n6\",
        \"output\": \"1 2\",
        \"visible\": true
      },
      {
        \"caseNumber\": 3,
        \"input\": \"3 3\\n6\",
        \"output\": \"0 1\",
        \"visible\": false
      }
    ]
  }")
echo "$CHALLENGE2_RESPONSE" | jq '.'
CHALLENGE2_ID=$(echo "$CHALLENGE2_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Challenge 'Two Sum' creado${NC}"
echo ""

# 4.3 Challenge: Suma de Números
echo "Creando Challenge: Suma de Números..."
PROF2_ID=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $PROF2_TOKEN" | jq -r '.id')

CHALLENGE3_RESPONSE=$(curl -s -X POST "$BASE_URL/challenges" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROF2_TOKEN" \
  -d "{
    \"title\": \"Suma de Dos Números\",
    \"description\": \"Lee dos números enteros y retorna su suma. Input: Dos números en líneas separadas. Output: La suma.\",
    \"difficulty\": \"EASY\",
    \"tags\": [\"matemáticas\", \"básico\"],
    \"timeLimit\": 1000,
    \"memoryLimit\": 128,
    \"authorId\": \"$PROF2_ID\",
    \"status\": \"PUBLISHED\",
    \"isPublic\": true,
    \"testcases\": [
      {
        \"caseNumber\": 1,
        \"input\": \"5\\n3\",
        \"output\": \"8\",
        \"visible\": true
      },
      {
        \"caseNumber\": 2,
        \"input\": \"10\\n20\",
        \"output\": \"30\",
        \"visible\": true
      },
      {
        \"caseNumber\": 3,
        \"input\": \"-5\\n10\",
        \"output\": \"5\",
        \"visible\": false
      },
      {
        \"caseNumber\": 4,
        \"input\": \"100\\n200\",
        \"output\": \"300\",
        \"visible\": false
      }
    ]
  }")
echo "$CHALLENGE3_RESPONSE" | jq '.'
CHALLENGE3_ID=$(echo "$CHALLENGE3_RESPONSE" | jq -r '.id')
echo -e "${GREEN}✓ Challenge 'Suma de Dos Números' creado${NC}"
echo ""

# ===========================================
# RESUMEN
# ===========================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Datos de prueba insertados exitosamente${NC}"
echo "=========================================="
echo ""
echo "📊 Resumen:"
echo "  - 6 Usuarios creados (1 Admin, 2 Profesores, 3 Estudiantes)"
echo "  - 2 Cursos creados"
echo "  - 3 Challenges creados con casos de prueba"
echo ""
echo "🔑 Credenciales de acceso:"
echo "  Admin: admin@universidad.edu / Admin123!"
echo "  Profesor 1: carlos.ruiz@universidad.edu / Profesor123!"
echo "  Profesor 2: ana.lopez@universidad.edu / Profesor456!"
echo "  Estudiante 1: maria.garcia@estudiante.edu / Estudiante123!"
echo "  Estudiante 2: pedro.martinez@estudiante.edu / Estudiante456!"
echo "  Estudiante 3: lucia.fernandez@estudiante.edu / Estudiante789!"
echo ""
echo "🌐 Swagger UI: http://localhost:3000/api"
echo ""
