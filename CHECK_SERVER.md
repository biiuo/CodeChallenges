# Verificación del Servidor - ERR_EMPTY_RESPONSE

## Problema
El error `ERR_EMPTY_RESPONSE` indica que el servidor backend no está corriendo o se está cayendo al iniciar.

## Soluciones

### 1. Verificar que el servidor esté corriendo

**Si usas Docker Compose:**
```bash
# Verificar contenedores
docker ps

# Ver logs del backend
docker logs api_proyecto_final

# Reiniciar el backend
docker restart api_proyecto_final

# O iniciar todo desde cero
docker compose down
docker compose up -d
```

**Si usas npm directamente:**
```bash
# Verificar si hay un proceso corriendo
ps aux | grep node

# Iniciar el servidor
npm run start:dev

# O en modo producción
npm run build
npm run start:prod
```

### 2. Verificar errores de compilación

```bash
# Compilar el proyecto
npm run build

# Si hay errores, verificar:
# - Imports faltantes
# - Errores de sintaxis
# - Dependencias no instaladas
```

### 3. Verificar variables de entorno

Asegúrate de que el archivo `.env` tenga todas las variables necesarias:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `REDIS_URL` o `REDIS_HOST` y `REDIS_PORT`

### 4. Verificar que la base de datos esté corriendo

```bash
# Si usas Docker
docker ps | grep db

# Verificar conexión
psql -h localhost -p 5433 -U user -d codechallenges
```

### 5. Verificar logs del servidor

**Docker:**
```bash
docker logs -f api_proyecto_final
```

**npm:**
Los logs aparecerán directamente en la terminal donde ejecutaste `npm run start:dev`

## Cambios Recientes que Podrían Afectar

Se corrigieron los siguientes problemas:
1. ✅ Orden del constructor en `courses.controller.ts`
2. ✅ Guard faltante `IsMemberOrProfessorOfCourseGuard` agregado al módulo

## Próximos Pasos

1. **Reinicia el servidor** usando uno de los métodos arriba
2. **Verifica los logs** para ver si hay errores específicos
3. **Prueba el endpoint de health check**: `GET http://localhost:3000/`
4. **Prueba el login**: `POST http://localhost:3000/auth/login`

Si el problema persiste, comparte los logs del servidor para identificar el error específico.

