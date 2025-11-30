# 📝 Ejemplos de Código de Solución

## 🚀 Ejemplo 1: Subir Código de Solución (cURL)

### Paso 1: Autenticarse como Profesor

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesor@universidad.edu",
    "password": "Profesor123!"
  }' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

echo "Token: $TOKEN"
```

### Paso 2: Subir Código de Solución para Two Sum (Python)

```bash
curl -X POST http://localhost:3000/challenges/CH-ABCDE/solution \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "import sys\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\ndef main():\n    lines = sys.stdin.read().strip().split(\"\\n\")\n    if len(lines) < 2:\n        return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    result = two_sum(nums, target)\n    result.sort()\n    print(f\"{result[0]} {result[1]}\")\n\nif __name__ == \"__main__\":\n    main()",
    "language": "python"
  }'
```

---

## 📋 Ejemplos de Código de Solución por Challenge

### 1. Two Sum - Python

```python
import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

def main():
    lines = sys.stdin.read().strip().split("\n")
    if len(lines) < 2:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    result = two_sum(nums, target)
    result.sort()
    print(f"{result[0]} {result[1]}")

if __name__ == "__main__":
    main()
```

### 2. Two Sum - JavaScript

```javascript
const fs = require("fs");

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

function main() {
  const input = fs.readFileSync(0, "utf-8").trim().split("\n");
  if (input.length < 2) return;
  const nums = input[0].trim().split(/\s+/).map(Number);
  const target = Number(input[1].trim());
  
  const result = twoSum(nums, target);
  result.sort((a, b) => a - b);
  console.log(`${result[0]} ${result[1]}`);
}

main();
```

### 3. Fibonacci - Python

```python
import sys

def fib(n):
    if n < 0:
        return -1
    if n == 0:
        return 0
    if n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def main():
    try:
        line = sys.stdin.read().strip()
        if not line:
            return
        n = int(line)
        print(fib(n))
    except ValueError:
        pass

if __name__ == "__main__":
    main()
```

### 4. Fibonacci - C++

```cpp
#include <iostream>
using namespace std;

long long fib(int n) {
    if (n < 0) return -1;
    if (n == 0) return 0;
    if (n == 1) return 1;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        long long temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

int main() {
    int n;
    if (cin >> n) {
        cout << fib(n) << endl;
    }
    return 0;
}
```

### 5. Suma de N Números - Python

```python
import sys

def main():
    lines = sys.stdin.read().strip().split("\n")
    if not lines:
        return
    
    n = int(lines[0])
    if len(lines) < 2:
        return
    
    numbers = list(map(int, lines[1].split()))
    total = sum(numbers)
    print(total)

if __name__ == "__main__":
    main()
```

### 6. Factorial - Python

```python
import sys

def factorial(n):
    if n < 0:
        return -1
    if n == 0 or n == 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def main():
    try:
        line = sys.stdin.read().strip()
        if not line:
            return
        n = int(line)
        print(factorial(n))
    except ValueError:
        pass

if __name__ == "__main__":
    main()
```

### 7. Hello World - Python

```python
print("Hello World")
```

### 8. Hello World - JavaScript

```javascript
console.log("Hello World");
```

### 9. Hello World - C++

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
```

### 10. Hello World - Java

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

---

## 🔧 Script Completo para Subir Múltiples Soluciones

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Login
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"profesor@universidad.edu","password":"Profesor123!"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

# Challenge ID (reemplaza con el ID real)
CHALLENGE_ID="CH-ABCDE"

# Subir solución Python para Two Sum
echo "Subiendo solución Python para Two Sum..."
curl -X POST "$BASE_URL/challenges/$CHALLENGE_ID/solution" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "import sys\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\ndef main():\n    lines = sys.stdin.read().strip().split(\"\\n\")\n    if len(lines) < 2:\n        return\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    result = two_sum(nums, target)\n    result.sort()\n    print(f\"{result[0]} {result[1]}\")\n\nif __name__ == \"__main__\":\n    main()",
    "language": "python"
  }'

echo ""
echo "✅ Solución subida exitosamente"
```

---

## 📱 Ejemplo desde el Frontend

### Interfaz para Profesor

Cuando un profesor va a `/challenges/CH-ABCDE`, verá:

```
┌─────────────────────────────────────────┐
│ Upload Solution Code                    │
├─────────────────────────────────────────┤
│ Sube el código de solución de           │
│ referencia. Los estudiantes podrán ver  │
│ este código en los detalles del        │
│ challenge.                              │
│                                         │
│ Language: [Python ▼]                    │
│                                         │
│ Solution Code:                          │
│ ┌─────────────────────────────────────┐ │
│ │ def two_sum(nums, target):          │ │
│ │     seen = {}                       │ │
│ │     for i, num in enumerate(nums):  │ │
│ │         complement = target - num    │ │
│ │         if complement in seen:      │ │
│ │             return [seen[...], i]   │ │
│ │         seen[num] = i               │ │
│ │     return []                        │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Upload Solution Code]                  │
└─────────────────────────────────────────┘
```

### Interfaz para Estudiante

Cuando un estudiante va a `/challenges/CH-ABCDE`, verá:

```
┌─────────────────────────────────────────┐
│ 💡 Solution Code                        │
├─────────────────────────────────────────┤
│ Código de solución de referencia en     │
│ python                                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ def two_sum(nums, target):          │ │
│ │     seen = {}                       │ │
│ │     for i, num in enumerate(nums):  │ │
│ │         complement = target - num    │ │
│ │         if complement in seen:      │ │
│ │             return [seen[...], i]   │ │
│ │         seen[num] = i               │ │
│ │     return []                        │ │
│ │                                     │ │
│ │ def main():                         │ │
│ │     ...                             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Profesor sube solución después de crear challenge

1. Profesor crea challenge "Two Sum"
2. Profesor sube test cases
3. Profesor sube código de solución en Python
4. Estudiantes pueden ver la solución cuando resuelven el challenge

### Caso 2: Actualizar solución existente

Si el profesor quiere cambiar la solución:

1. Va a `/challenges/CH-ABCDE`
2. Pega el nuevo código en "Upload Solution Code"
3. Hace clic en "Upload Solution Code"
4. El código anterior se reemplaza automáticamente

### Caso 3: Múltiples lenguajes (futuro)

Actualmente se puede subir una solución por challenge. En el futuro se podría extender para permitir múltiples soluciones en diferentes lenguajes.

---

## ✅ Verificación

Para verificar que el código se subió correctamente:

```bash
# Obtener detalles del challenge
curl -X GET http://localhost:3000/challenges/CH-ABCDE \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

Deberías ver en la respuesta:
```json
{
  "id": "CH-ABCDE",
  "title": "Two Sum",
  ...
  "solutionCode": "def two_sum(nums, target):\n    ...",
  "solutionLanguage": "python"
}
```

