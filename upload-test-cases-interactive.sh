#!/bin/bash

# Script interactivo para cargar test cases
# Uso: ./upload-test-cases-interactive.sh

BASE_URL="http://localhost:3000"

echo "🔐 Autenticación"
echo "----------------"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""

echo "Autenticando..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "None" ]; then
  echo "❌ Error: Credenciales inválidas"
  exit 1
fi

echo "✅ Autenticado exitosamente"
echo ""

read -p "Challenge ID (ej: CH-ABCDE): " CHALLENGE_ID

echo ""
echo "Selecciona el tipo de test cases:"
echo "1) Two Sum"
echo "2) Fibonacci"
echo "3) Suma de N números"
echo "4) Factorial"
echo "5) Hello World"
echo "6) Ingresar manualmente (JSON)"
echo ""

read -p "Opción [1-6]: " option

case $option in
  1)
    TESTCASES='[
      {"caseNumber": 1, "input": "2 7 11 15\n9", "output": "0 1", "visible": true},
      {"caseNumber": 2, "input": "3 2 4\n6", "output": "1 2", "visible": true},
      {"caseNumber": 3, "input": "3 3\n6", "output": "0 1", "visible": false},
      {"caseNumber": 4, "input": "1 2 3 4 5 6 7 8 9 10\n19", "output": "8 9", "visible": false}
    ]'
    ;;
  2)
    TESTCASES='[
      {"caseNumber": 1, "input": "0", "output": "0", "visible": true},
      {"caseNumber": 2, "input": "1", "output": "1", "visible": true},
      {"caseNumber": 3, "input": "5", "output": "5", "visible": true},
      {"caseNumber": 4, "input": "10", "output": "55", "visible": false},
      {"caseNumber": 5, "input": "20", "output": "6765", "visible": false}
    ]'
    ;;
  3)
    TESTCASES='[
      {"caseNumber": 1, "input": "3\n1 2 3", "output": "6", "visible": true},
      {"caseNumber": 2, "input": "5\n10 20 30 40 50", "output": "150", "visible": true},
      {"caseNumber": 3, "input": "1\n100", "output": "100", "visible": false}
    ]'
    ;;
  4)
    TESTCASES='[
      {"caseNumber": 1, "input": "5", "output": "120", "visible": true},
      {"caseNumber": 2, "input": "3", "output": "6", "visible": true},
      {"caseNumber": 3, "input": "0", "output": "1", "visible": false},
      {"caseNumber": 4, "input": "10", "output": "3628800", "visible": false}
    ]'
    ;;
  5)
    TESTCASES='[
      {"caseNumber": 1, "input": "", "output": "Hello World", "visible": true}
    ]'
    ;;
  6)
    echo ""
    echo "Pega el JSON de los test cases (presiona Ctrl+D cuando termines):"
    TESTCASES=$(cat)
    ;;
  *)
    echo "❌ Opción inválida"
    exit 1
    ;;
esac

echo ""
echo "📤 Cargando test cases..."
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

