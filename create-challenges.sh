#!/bin/bash
BASE_URL="http://localhost:3000"

# Login profesor 1
PROF1_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
-d '{"email":"carlos.ruiz@universidad.edu","password":"Profesor123!"}' \
| python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

# Obtener userId
PROF1_ID=$(curl -s -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $PROF1_TOKEN" \
| python3 -c "import sys, json; print(json.load(sys.stdin)['userId'])")

echo "Profesor 1 ID: $PROF1_ID"
echo ""

# Challenge 1: Hello World
echo "Creando Challenge 1: Hello World..."
curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF1_TOKEN" \
-d "{\"title\":\"Hello World\",\"description\":\"Escribe un programa que imprima exactamente 'Hello World' (sin comillas).\",\"difficulty\":\"EASY\",\"tags\":[\"básico\"],\"timeLimit\":1000,\"memoryLimit\":128,\"authorId\":\"$PROF1_ID\",\"status\":\"PUBLISHED\",\"isPublic\":true,\"testcases\":[{\"caseNumber\":1,\"input\":\"\",\"output\":\"Hello World\",\"visible\":true}]}" \
| python3 -m json.tool

echo ""

# Challenge 2: Suma
echo "Creando Challenge 2: Suma de Dos Números..."
curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF1_TOKEN" \
-d "{\"title\":\"Suma de Dos Números\",\"description\":\"Lee dos números enteros (uno por línea) y retorna su suma.\",\"difficulty\":\"EASY\",\"tags\":[\"matemáticas\",\"básico\"],\"timeLimit\":1000,\"memoryLimit\":128,\"authorId\":\"$PROF1_ID\",\"status\":\"PUBLISHED\",\"isPublic\":true,\"testcases\":[{\"caseNumber\":1,\"input\":\"5\\n3\",\"output\":\"8\",\"visible\":true},{\"caseNumber\":2,\"input\":\"10\\n20\",\"output\":\"30\",\"visible\":true},{\"caseNumber\":3,\"input\":\"-5\\n10\",\"output\":\"5\",\"visible\":false}]}" \
| python3 -m json.tool

echo ""

# Login profesor 2
PROF2_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
-d '{"email":"ana.lopez@universidad.edu","password":"Profesor456!"}' \
| python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

PROF2_ID=$(curl -s -X GET "$BASE_URL/users/me" -H "Authorization: Bearer $PROF2_TOKEN" \
| python3 -c "import sys, json; print(json.load(sys.stdin)['userId'])")

echo "Profesor 2 ID: $PROF2_ID"
echo ""

# Challenge 3: Factorial
echo "Creando Challenge 3: Factorial..."
curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" \
-H "Authorization: Bearer $PROF2_TOKEN" \
-d "{\"title\":\"Factorial\",\"description\":\"Calcula el factorial de un número entero no negativo n. El factorial de n (n!) es el producto de todos los enteros positivos menores o iguales a n.\",\"difficulty\":\"EASY\",\"tags\":[\"matemáticas\",\"recursión\"],\"timeLimit\":1000,\"memoryLimit\":128,\"authorId\":\"$PROF2_ID\",\"status\":\"PUBLISHED\",\"isPublic\":true,\"testcases\":[{\"caseNumber\":1,\"input\":\"5\",\"output\":\"120\",\"visible\":true},{\"caseNumber\":2,\"input\":\"3\",\"output\":\"6\",\"visible\":true},{\"caseNumber\":3,\"input\":\"0\",\"output\":\"1\",\"visible\":false},{\"caseNumber\":4,\"input\":\"10\",\"output\":\"3628800\",\"visible\":false}]}" \
| python3 -m json.tool

echo ""
echo "✅ Challenges creados exitosamente"
