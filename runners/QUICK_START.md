# Módulo 4: Runners - Guía Rápida de Inicio

## 1️⃣ Construir imágenes runner

```bash
# Opción A: Construcción individual (manual)
docker build -t runner-python:latest ./runners/runner-python/
docker build -t runner-node:latest ./runners/runner-node/
docker build -t runner-cpp:latest ./runners/runner-cpp/
docker build -t runner-java:latest ./runners/runner-java/

# Opción B: Construcción con docker-compose (recomendado)
docker compose --profile build-only build
```

**Verificar que las imágenes existen:**
```bash
docker images | grep "runner-"
```

---

## 2️⃣ Iniciar el proyecto con runners

```bash
# Asegurar que las imágenes existen primero
docker compose --profile build-only build

# Iniciar backend con database y redis
docker compose up -d

# Verificar que todo está en funcionamiento
docker compose ps
docker logs api_proyecto_final
```

---

## 3️⃣ Probar runners localmente (sin Docker)

Si quieres probar los runners sin usar Docker:

```bash
# Navega a la carpeta de runners
cd runners

# Ejecuta el script de prueba (requiere Python, Node, g++, javac instalados)
python test_runner_local.py
```

Ejemplo de salida:
```
============================================================
Runner Service - Local Test
============================================================

[PYTHON]
  Case 1: ✓ PASS
    Input: 5
    Expected: 10
    Got: 10
    Status: OK
```

---

## 4️⃣ Endpoints de prueba

### Ejecutar un submission simple

```bash
curl -X POST http://localhost:3000/submissions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(int(input())*2)",
    "language": "python",
    "testCases": [
      { "id": 1, "input": "5", "output": "10" },
      { "id": 2, "input": "20", "output": "40" }
    ],
    "timeLimit": 1500
  }'
```

### Ver métricas

```bash
# Formato Prometheus
curl http://localhost:3000/metrics/prometheus

# Formato JSON
curl http://localhost:3000/metrics/json
```

Ejemplo de respuesta:
```json
{
  "submissions_total": 5,
  "submissions_accepted": 4,
  "submissions_wrong_answer": 1,
  "average_execution_time_ms": 234,
  "active_runners": 0
}
```

---

## 5️⃣ Comandos útiles Docker

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de un runner
docker logs <container_id>

# Entrar a un contenedor runner
docker run -it --rm runner-python:latest sh

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar imágenes no usadas
docker image prune -f
```

---

## 6️⃣ Estructura de carpetas

```
runners/
├── runner-python/
│   ├── Dockerfile
│   └── .dockerignore
├── runner-node/
│   ├── Dockerfile
│   └── .dockerignore
├── runner-cpp/
│   ├── Dockerfile
│   └── .dockerignore
├── runner-java/
│   ├── Dockerfile
│   └── .dockerignore
├── test_runner_local.py
└── README.md
```

---

## 7️⃣ Solución de problemas

### Error: "Cannot connect to Docker daemon"
```bash
# Verificar que Docker está corriendo
docker info

# Reiniciar Docker daemon (Linux)
sudo systemctl restart docker
```

### Error: "Image not found"
```bash
# Construir las imágenes primero
docker compose --profile build-only build
```

### Error: "Port already in use"
```bash
# Ver qué proceso está usando el puerto
lsof -i :3000  # Mac/Linux
ss -tulpn | grep :3000  # Linux alternativo

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

---

## 8️⃣ Testing de runners

### Probar Python runner
```bash
docker run --rm \
  --network none \
  --cpus 0.5 \
  --memory 512m \
  -v $(pwd)/test-code:/submission:ro \
  runner-python:latest \
  sh -c "python /submission/solution.py < /submission/input.txt"
```

### Probar Node.js runner
```bash
docker run --rm \
  --network none \
  --cpus 0.5 \
  --memory 512m \
  -v $(pwd)/test-code:/submission:ro \
  runner-node:latest \
  sh -c "node /submission/solution.js < /submission/input.txt"
```

### Probar C++ runner
```bash
docker run --rm \
  --network none \
  --cpus 0.5 \
  --memory 512m \
  -v $(pwd)/test-code:/submission:ro \
  runner-cpp:latest \
  sh -c "g++ -o /tmp/solution /submission/solution.cpp && /tmp/solution < /submission/input.txt"
```

### Probar Java runner
```bash
docker run --rm \
  --network none \
  --cpus 0.5 \
  --memory 512m \
  -v $(pwd)/test-code:/submission:ro \
  runner-java:latest \
  sh -c "javac -d /tmp /submission/Solution.java && java -cp /tmp Solution < /submission/input.txt"
```

---

## 9️⃣ Características de seguridad

Cada runner tiene las siguientes restricciones:

| Restricción | Valor | Propósito |
|------------|-------|-----------|
| `--network none` | Sin red | Evita acceso a internet |
| `--cpus 0.5` | 50% CPU | Limita uso de procesador |
| `--memory 512m` | 512 MB RAM | Limita uso de memoria |
| `--read-only` | Sólo lectura | Protege filesystem |
| `--tmpfs /tmp` | Temporal en RAM | Permite escritura temporal |
| `--pids-limit 10` | Max 10 procesos | Evita fork bombs |
| Timeout | 1.5 segundos | Mata procesos lentos |

---

## 🔟 Integración con backend

El backend usa `RunnerService` que:

1. Recibe código y test cases
2. Escribe código a archivo temporal
3. Ejecuta Docker con restricciones de seguridad
4. Captura stdout/stderr
5. Compara salida con esperada
6. Retorna: `{ status, output, timeMsElapsed }`

Código de ejemplo:
```typescript
const result = await runnerService.executeCode(
  'python',
  'print(int(input()) * 2)',
  '5',
  1500
);
// { output: '10', stderr: '', status: 'OK', timeMsElapsed: 145 }
```

---

**¡Todo listo para ejecutar código de forma segura! 🚀**
