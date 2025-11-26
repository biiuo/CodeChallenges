#!/bin/bash
# Seed sample submissions for existing challenges
BASE_URL="http://localhost:3000"

# Login as student
STU_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" \
-d '{"email":"maria.garcia@estudiante.edu","password":"Estudiante123!"}' \
| python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

# List challenges
CHALLENGES=$(curl -s -X GET "$BASE_URL/challenges" -H "Authorization: Bearer $STU_TOKEN")

# Extract challenge IDs by title using python
HELLO_ID=$(echo "$CHALLENGES" | python3 -c "import sys, json; data=json.load(sys.stdin); print([c['id'] for c in data if c['title']=='Hello World'][0])")
SUMA_ID=$(echo "$CHALLENGES" | python3 -c "import sys, json; data=json.load(sys.stdin); print([c['id'] for c in data if c['title']=='Suma de Dos Números'][0])")
FACT_ID=$(echo "$CHALLENGES" | python3 -c "import sys, json; data=json.load(sys.stdin); print([c['id'] for c in data if c['title']=='Factorial'][0])")

echo "Using challenge IDs: Hello=$HELLO_ID, Suma=$SUMA_ID, Factorial=$FACT_ID"

# Create Python submission for Hello World
curl -s -X POST "$BASE_URL/submissions" -H "Content-Type: application/json" -H "Authorization: Bearer $STU_TOKEN" \
-d "{\"challengeId\":\"$HELLO_ID\",\"code\":\"print('Hello World')\",\"language\":\"python\"}" | python3 -m json.tool

# Create JS submission for Suma de Dos Números (use temp file to avoid escaping issues)
cat > /tmp/submission_suma_js.json << 'JSON'
{
	"challengeId": "__SUMA_ID__",
	"code": "function main() { const fs=require('fs'); const lines=fs.readFileSync(0,'utf8').trim().split(/\n/); const a=parseInt(lines[0]); const b=parseInt(lines[1]); console.log(a+b); } main();",
	"language": "javascript"
}
JSON
sed -i "s/__SUMA_ID__/$SUMA_ID/g" /tmp/submission_suma_js.json
curl -s -X POST "$BASE_URL/submissions" -H "Content-Type: application/json" -H "Authorization: Bearer $STU_TOKEN" \
--data-binary @/tmp/submission_suma_js.json | python3 -m json.tool

# Create Python submission for Factorial (intentional wrong for one case)
PY_FACT='import sys\nimport math\nprint(math.factorial(int(sys.stdin.read().strip())))'
curl -s -X POST "$BASE_URL/submissions" -H "Content-Type: application/json" -H "Authorization: Bearer $STU_TOKEN" \
-d "{\"challengeId\":\"$FACT_ID\",\"code\":\"$PY_FACT\",\"language\":\"python\"}" | python3 -m json.tool
