#!/bin/bash

# Script para cargar test cases a un challenge
# Uso: ./upload-test-cases.sh <CHALLENGE_ID> <EMAIL> <PASSWORD>

BASE_URL="http://localhost:3000"
CHALLENGE_ID="${1}"
EMAIL="${2}"
PASSWORD="${3}"

if [ -z "$CHALLENGE_ID" ] || [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "❌ Uso: ./upload-test-cases.sh <CHALLENGE_ID> <EMAIL> <PASSWORD>"
  echo ""
  echo "Ejemplo:"
  echo "  ./upload-test-cases.sh CH-ABCDE profesor@universidad.edu Profesor123!"
  exit 1
fi

echo "🔐 Autenticando..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "None" ]; then
  echo "❌ Error: No se pudo autenticar. Verifica email y contraseña."
  exit 1
fi

echo "✅ Autenticado exitosamente"
echo ""
echo "📤 Cargando test cases para challenge: $CHALLENGE_ID"
echo ""

# Ejemplo de test cases - Two Sum
TESTCASES='[
  {
    "caseNumber": 1,
    "input": "2 7 11 15\n9",
    "output": "0 1",
    "visible": true
  },
  {
    "caseNumber": 2,
    "input": "3 2 4\n6",
    "output": "1 2",
    "visible": true
  },
  {
    "caseNumber": 3,
    "input": "3 3\n6",
    "output": "0 1",
    "visible": false
  },
  {
    "caseNumber": 4,
    "input": "1 2 3 4 5 6 7 8 9 10\n19",
    "output": "8 9",
    "visible": false
  }
]'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/challenges/$CHALLENGE_ID/testcases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$TESTCASES")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Test cases cargados exitosamente"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo "❌ Error al cargar test cases (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi

