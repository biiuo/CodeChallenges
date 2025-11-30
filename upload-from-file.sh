#!/bin/bash

# Script para cargar test cases desde un archivo JSON
# Uso: ./upload-from-file.sh <CHALLENGE_ID> <JSON_FILE> <EMAIL> <PASSWORD>

BASE_URL="http://localhost:3000"
CHALLENGE_ID="${1}"
JSON_FILE="${2}"
EMAIL="${3}"
PASSWORD="${4}"

if [ -z "$CHALLENGE_ID" ] || [ -z "$JSON_FILE" ] || [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "❌ Uso: ./upload-from-file.sh <CHALLENGE_ID> <JSON_FILE> <EMAIL> <PASSWORD>"
  echo ""
  echo "Ejemplo:"
  echo "  ./upload-from-file.sh CH-ABCDE examples/test-cases.json profesor@universidad.edu Profesor123!"
  exit 1
fi

if [ ! -f "$JSON_FILE" ]; then
  echo "❌ Error: Archivo no encontrado: $JSON_FILE"
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
echo "📤 Cargando test cases desde: $JSON_FILE"
echo "   Challenge ID: $CHALLENGE_ID"
echo ""

# Leer el archivo JSON
TESTCASES=$(cat "$JSON_FILE")

# Si el archivo tiene múltiples tipos, extraer solo el array
# (asumiendo que el usuario especifica qué tipo quiere)
if echo "$TESTCASES" | grep -q '"twoSum"\|"fibonacci"\|"sumaN"'; then
  echo "⚠️  El archivo contiene múltiples tipos de test cases."
  echo "Selecciona el tipo:"
  echo "1) twoSum"
  echo "2) fibonacci"
  echo "3) sumaN"
  echo "4) factorial"
  echo "5) helloWorld"
  read -p "Opción [1-5]: " type_option
  
  case $type_option in
    1) KEY="twoSum" ;;
    2) KEY="fibonacci" ;;
    3) KEY="sumaN" ;;
    4) KEY="factorial" ;;
    5) KEY="helloWorld" ;;
    *) echo "❌ Opción inválida"; exit 1 ;;
  esac
  
  TESTCASES=$(echo "$TESTCASES" | python3 -c "import sys, json; data=json.load(sys.stdin); print(json.dumps(data['$KEY']))" 2>/dev/null)
fi

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

