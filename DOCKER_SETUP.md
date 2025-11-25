# Docker Setup - Todo Automático 🐳

Este proyecto está completamente configurado para funcionar con Docker sin comandos adicionales.

## ✨ Opción 1: Script Automático (RECOMENDADO)

```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

**Esto automáticamente:**
- ✅ Construye todas las imágenes de runners (Python, Node, C++, Java)
- ✅ Inicia PostgreSQL
- ✅ Inicia Redis
- ✅ Inicia el backend
- ✅ Ejecuta migraciones de Prisma
- ✅ Genera tipos de Prisma
- ✅ Muestra URLs de acceso

---

## ✨ Opción 2: Comandos npm (Alternativa)

```bash
# Construir todo y levantar (Una sola línea)
npm run docker:up

# Ver logs del backend
npm run docker:logs

# Detener servicios
npm run docker:down

# Limpiar todo (incluyendo imágenes y volúmenes)
npm run docker:clean
```

---

## ✨ Opción 3: Docker Compose Directo

```bash
# Construir imágenes de runners manualmente
docker build -t runner-python:latest ./runners/runner-python
docker build -t runner-node:latest ./runners/runner-node
docker build -t runner-cpp:latest ./runners/runner-cpp
docker build -t runner-java:latest ./runners/runner-java

# Luego solo:
docker-compose up -d
```

---

## 🔄 Qué Hace Docker Automáticamente

### En el Dockerfile:
```dockerfile
# 1. Genera tipos de Prisma en build
RUN if [ -d prisma ]; then npx prisma generate; fi

# 2. En el entrypoint del contenedor:
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### En el docker-compose.yml:
```yaml
# 1. Espera a que PostgreSQL esté listo
depends_on:
  db:
    condition: service_healthy

# 2. Ejecuta el script entrypoint.sh que genera Prisma
entrypoint: ["/app/docker/entrypoint.sh"]
```

### En package.json:
```json
"postinstall": "prisma generate"  // Ejecuta al hacer npm install
```

---

## 📍 URLs de Acceso

Una vez que los servicios estén corriendo:

```
🌐 Backend API:           http://localhost:3000
📊 Prometheus Metrics:    http://localhost:3000/metrics/prometheus
📊 JSON Metrics:          http://localhost:3000/metrics/json
🔍 Redis Commander:       http://localhost:8081
🗄️  PostgreSQL:           localhost:5432 (user:pass)
```

---

## 🔍 Ver Logs

```bash
# Logs del backend
docker-compose logs -f backend

# Logs de PostgreSQL
docker-compose logs -f db

# Logs de Redis
docker-compose logs -f redis

# Todos los logs
docker-compose logs -f
```

---

## ⚙️ Variables de Entorno

El docker-compose usa estas variables por defecto:

```env
DATABASE_URL: postgresql://user:pass@db:5432/db?schema=public
REDIS_URL: redis://default:redispass@redis:6379/0
NODE_ENV: development
```

Para producción, crea `.env.production`:

```env
DATABASE_URL: postgresql://user:pass@db:5432/db?schema=public
REDIS_URL: redis://default:redispass@redis:6379/0
JWT_ACCESS_SECRET: tu-super-secret-key
JWT_REFRESH_SECRET: tu-super-secret-key
NODE_ENV: production
```

---

## 🛑 Detener Servicios

```bash
# Solo pausar (datos se mantienen)
docker-compose stop

# Detener completamente
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina base de datos)
docker-compose down -v

# Limpiar todo: contenedores, imágenes, volúmenes
npm run docker:clean
```

---

## ✅ Verificar que Todo Funciona

### 1. Verificar contenedores
```bash
docker-compose ps
```

Deberías ver:
```
db_proyecto_final              Up (healthy)
api_proyecto_final             Up
redis                          Up (healthy)
redis-commander                Up
```

### 2. Verificar conexión a la API
```bash
curl http://localhost:3000/metrics/json
```

Deberías obtener JSON con métricas.

### 3. Ver que Prisma se generó
```bash
docker-compose exec backend ls -la node_modules/@prisma/client/
```

---

## 🐛 Solucionar Problemas

### "Port already in use"
```bash
# Ver qué está usando el puerto
lsof -i :3000  # Mac/Linux
ss -tulpn | grep :3000  # Linux alternativo

# Cambiar puertos en docker-compose.yml:
ports:
  - "3001:3000"  # Backend en puerto 3001
```

### "Database connection refused"
PostgreSQL tarda en iniciar. Espera 10 segundos y reinicia:
```bash
docker-compose restart backend
```

### "Cannot find module '@prisma/client'"
```bash
docker-compose exec backend npm run postinstall
docker-compose restart backend
```

---

## 📋 Resumen

| Comando | Efecto |
|---------|--------|
| `./build-and-run.sh` | TODO automático |
| `npm run docker:up` | Construir + levantar |
| `npm run docker:down` | Detener servicios |
| `npm run docker:logs` | Ver logs backend |
| `docker-compose ps` | Ver estado servicios |
| `docker-compose stop` | Pausar (datos se mantienen) |
| `npm run docker:clean` | Limpiar todo |

---

## ✨ Tabla de Imágenes Docker

| Imagen | Puerto | Healthcheck |
|--------|--------|-------------|
| postgres:16 | 5432 | `pg_isready -U user -d db` |
| redis:7-alpine | 6379 | `redis-cli PING` |
| node:20-alpine (backend) | 3000 | No (se inicia con docker-compose) |
| runner-python:latest | N/A | Se ejecuta bajo demanda |
| runner-node:latest | N/A | Se ejecuta bajo demanda |
| runner-cpp:latest | N/A | Se ejecuta bajo demanda |
| runner-java:latest | N/A | Se ejecuta bajo demanda |

---

**¡Listo! Todo configurado para Linux/Docker. 🚀**
