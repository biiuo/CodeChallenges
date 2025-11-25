# Runners - Code Execution Sandbox

Este directorio contiene las imágenes Docker para ejecutar código en sandbox aislado de forma segura.

## Estructura

- `runner-python/` — Imagen para ejecutar código Python 3.11
- `runner-node/` — Imagen para ejecutar código Node.js 20
- `runner-cpp/` — Imagen para compilar y ejecutar código C++
- `runner-java/` — Imagen para compilar y ejecutar código Java 17

## Características de seguridad

Cada runner ejecuta con:
- **Usuario no-root** (`runner`) — evita privs innecesarios
- **Sin acceso a internet** (`--network none`)
- **Límite de CPU** (`--cpus 0.5`)
- **Límite de memoria** (`--memory 512m`)
- **Sistema de archivos de solo lectura** (`--read-only`)
- **Área temporal escribible limitada** (`--tmpfs /tmp:rw,size=128m`)
- **Límite de procesos** (`--pids-limit 10`)
- **Destrucción automática** (`--rm`)

## Construcción de imágenes

### Opción 1: Construcción manual
```bash
docker build -t runner-python:latest ./runners/runner-python/
docker build -t runner-node:latest ./runners/runner-node/
docker build -t runner-cpp:latest ./runners/runner-cpp/
docker build -t runner-java:latest ./runners/runner-java/
```

### Opción 2: Construcción con docker-compose
```bash
docker compose --profile build-only build
```

## Uso desde el backend

El servicio `RunnerService` (en `src/infrastructure/runners/runner.service.ts`) proporciona:

```typescript
import { RunnerService, ProgrammingLanguage } from 'src/infrastructure/runners/runner.service';

// Inyectar el servicio
constructor(private runner: RunnerService) {}

// Ejecutar código
const result = await this.runner.executeCode(
  ProgrammingLanguage.PYTHON,
  'print("hello")',
  '',
  1500 // timeLimit en ms
);

// Ejecutar contra múltiples casos
const results = await this.runner.executeAgainstTestCases(
  ProgrammingLanguage.PYTHON,
  'print(int(input()))',
  [
    { id: 1, input: '5', output: '5' },
    { id: 2, input: '10', output: '10' }
  ],
  1500
);
```

## Formatos de código esperados

### Python
```python
# Archivo: solution.py
# Leer entrada desde stdin
n = int(input())
print(n * 2)
```

### Node.js
```javascript
// Archivo: solution.js
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
let n;
rl.on('line', (line) => {
  n = parseInt(line);
  console.log(n * 2);
});
```

### C++
```cpp
// Archivo: solution.cpp
#include <iostream>
using namespace std;
int main() {
  int n;
  cin >> n;
  cout << n * 2 << endl;
  return 0;
}
```

### Java
```java
// Archivo: Solution.java (debe coincidir con el nombre de clase)
import java.util.Scanner;

public class Solution {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    System.out.println(n * 2);
  }
}
```

## Estados de ejecución

- **OK** — Salida correcta y dentro del timeLimit
- **WA** (Wrong Answer) — Salida incorrecta
- **TLE** (Time Limit Exceeded) — Excedió el tiempo permitido
- **RE** (Runtime Error) — Error durante ejecución (segfault, excepción, etc)
- **CE** (Compilation Error) — Error en compilación (C++, Java)

## Observabilidad

El backend registra logs JSON para cada ejecución con:
- `submissionId` — ID único de seguimiento
- `event` — queued, started, caseResult, finished, error
- `language` — lenguaje del código
- `status` — estado final
- `durationMs` — tiempo de ejecución
- `runnerImage` — imagen usada

Expone métricas en:
- `/metrics/prometheus` — Formato Prometheus
- `/metrics/json` — Formato JSON

## Ejemplos de ejecución

### Prueba local sin Docker
```bash
# Python
python3 -c "print('Hello')"

# Node.js
node -e "console.log('Hello')"

# C++
echo '#include <iostream>' > test.cpp
echo 'int main() { std::cout << "Hello" << std::endl; }' >> test.cpp
g++ test.cpp -o test && ./test

# Java
echo 'public class Test { public static void main(String[] args) { System.out.println("Hello"); } }' > Test.java
javac Test.java && java Test
```

### Prueba con Docker individual
```bash
# Python
docker run --rm -v $(pwd)/test:/code:ro runner-python:latest python /code/solution.py < /code/input.txt

# C++
docker run --rm -v $(pwd)/test:/code:ro runner-cpp:latest g++ /code/solution.cpp -o /tmp/a.out && /tmp/a.out < /code/input.txt
```

## Troubleshooting

### Error: "docker: command not found"
Instala Docker en tu máquina o asegúrate de que Docker Desktop está corriendo (Windows/Mac).

### Error: "Error response from daemon: no such image"
Construye primero las imágenes:
```bash
docker compose --profile build-only build
```

### Error: "Can't create directory"
Verifica permisos de escritura en `/tmp` o el directorio temporal configurado.

### TLE siempre
Aumenta `timeLimit` o verifica que el código tenga un bug de lógica infinita.

## Notas de seguridad adicionales (Producción)

Para hardening adicional en producción:
- Usar `--security-opt=no-new-privileges`
- Aplicar seccomp profile restrictivo (`--security-opt seccomp=default`)
- Considerar AppArmor o SELinux
- Usar rootless Docker
- Monitorear logs de Kernel (podman auditlog)
- Implementar rate limiting en API
