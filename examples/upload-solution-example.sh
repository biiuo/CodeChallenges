#!/bin/bash

# Script de ejemplo para subir código de solución
# Uso: ./upload-solution-example.sh <CHALLENGE_ID> <EMAIL> <PASSWORD>

BASE_URL="http://localhost:3000"
CHALLENGE_ID="${1}"
EMAIL="${2}"
PASSWORD="${3}"

if [ -z "$CHALLENGE_ID" ] || [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "❌ Uso: ./upload-solution-example.sh <CHALLENGE_ID> <EMAIL> <PASSWORD>"
  echo ""
  echo "Ejemplo:"
  echo "  ./upload-solution-example.sh CH-ABCDE profesor@universidad.edu Profesor123!"
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
echo "📤 Subiendo código de solución para: $CHALLENGE_ID"
echo ""

# Ejemplo: Two Sum en Python
SOLUTION_CODE='def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

def main():
    import sys
    lines = sys.stdin.read().strip().split("\n")
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    result = two_sum(nums, target)
    result.sort()
    print(f"{result[0]} {result[1]}")

if __name__ == "__main__":
    main()'

# Escapar el código para JSON
ESCAPED_CODE=$(echo "$SOLUTION_CODE" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))")

PAYLOAD=$(cat <<EOF
{
  "code": $ESCAPED_CODE,
  "language": "python"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/challenges/$CHALLENGE_ID/solution" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Código de solución subido exitosamente"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
  echo "❌ Error al subir código de solución (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi

echo ""
echo "🔍 Verificando que se guardó correctamente..."
curl -s -X GET "$BASE_URL/challenges/$CHALLENGE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print('✅ Código de solución:', 'Sí' if data.get('solutionCode') else 'No'); print('Lenguaje:', data.get('solutionLanguage', 'N/A'))" 2>/dev/null

