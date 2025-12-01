# Sistema de Gestión de Challenges en Cursos

## 📋 Resumen

Este sistema permite gestionar la asociación de challenges (retos algorítmicos) a cursos académicos, proporcionando una plataforma completa para organizar, evaluar y supervisar el progreso de estudiantes en entornos de aprendizaje de programación.

## 🎯 Características Principales

### 1. **Gestión de Cursos Mejorada**

Los cursos ahora incluyen atributos extendidos para una mejor organización:

- **Información básica**: código, nombre, período
- **Descripción detallada**: descripción del curso
- **Categorización**: categoría (web-development, data-science, algorithms, etc.)
- **Nivel**: beginner, intermediate, advanced
- **Organización**: grupo o sección
- **Visual**: imagen de portada
- **Estado**: publicado/despublicado

### 2. **Asociación de Challenges a Cursos**

#### Agregar Challenges
```
POST /courses/:id/challenges
```
Permite a profesores y administradores agregar uno o más challenges a un curso específico.

**Características**:
- Validación de existencia de challenges
- Prevención de duplicados
- Respuesta con conteo de challenges agregados y ya existentes

#### Remover Challenges
```
DELETE /courses/:id/challenges
```
Permite desasociar challenges de un curso.

#### Listar Challenges de un Curso
```
GET /courses/:id/challenges
```
Obtiene todos los challenges asociados a un curso, incluyendo:
- Información del challenge
- Casos de prueba
- Datos del autor

### 3. **Estadísticas Avanzadas**

```
GET /courses/:id/statistics
```

Proporciona métricas detalladas del curso:

**Métricas Generales**:
- Total de estudiantes inscritos
- Total de challenges asignados
- Total de submissions realizadas

**Estadísticas por Challenge**:
- Total de intentos
- Submissions exitosas
- Tasa de éxito (%)
- Dificultad

**Progreso de Estudiantes**:
- Challenges completados
- Total de submissions
- Score promedio

### 4. **Clonación de Challenges**

```
POST /courses/:targetId/clone-from/:sourceId
```

Permite copiar todos los challenges de un curso a otro, útil para:
- Reutilizar retos entre diferentes períodos académicos
- Crear cursos similares con contenido pre-configurado
- Migrar contenido entre grupos

**Características**:
- Validación de ambos cursos (origen y destino)
- Prevención de duplicados automática
- Reporte de challenges clonados vs saltados

### 5. **Publicación de Cursos**

```
PUT /courses/:id/publish
```

Control del estado de visibilidad del curso:
- **Publicado**: Visible para inscripción de estudiantes
- **Despublicado**: Solo visible para profesores/administradores

## 🔧 Use Cases Implementados

### Core Use Cases

1. **AddChallengesToCourseUseCase**
   - Valida existencia del curso
   - Verifica existencia de challenges
   - Previene duplicados
   - Agrega challenges mediante relación N:M

2. **RemoveChallengesFromCourseUseCase**
   - Valida existencia del curso
   - Verifica presencia de challenges en el curso
   - Desconecta relaciones

3. **GetCourseChallengesUseCase**
   - Obtiene lista completa con información relacionada
   - Incluye datos del autor y casos de prueba

### Use Cases Avanzados

4. **GetCourseStatisticsUseCase**
   - Calcula métricas del curso
   - Analiza progreso individual de estudiantes
   - Genera estadísticas por challenge

5. **CloneChallengesToCourseUseCase**
   - Duplica configuración de challenges entre cursos
   - Maneja prevención inteligente de duplicados

6. **PublishCourseUseCase**
   - Controla visibilidad del curso
   - Gestiona acceso de estudiantes

## 📊 Modelo de Datos

### Entidad Course (Actualizada)

```typescript
{
  id: string
  code: string (único)
  name: string
  period: string
  description?: string
  category?: string
  level?: string
  group?: string
  coverImage?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Relaciones

- **Course ↔ Challenge**: Relación N:M (muchos a muchos)
- **Course ↔ Professor**: Relación N:M
- **Course ↔ Student**: Relación N:M a través de CourseStudent
- **Course → Submission**: Relación 1:N

## 🔐 Permisos

### ADMIN y PROFESSOR pueden:
- ✅ Crear y modificar cursos
- ✅ Agregar/remover challenges
- ✅ Ver estadísticas
- ✅ Clonar challenges entre cursos
- ✅ Publicar/despublicar cursos

### STUDENT puede:
- ✅ Ver cursos publicados
- ✅ Ver challenges de cursos en los que está inscrito
- ✅ Enviar submissions
- ❌ NO puede modificar cursos ni ver estadísticas

## 🚀 Ejemplos de Uso

### 1. Crear un curso completo

```bash
POST /courses
{
  "code": "PROG-2025-1",
  "name": "Programación Backend",
  "period": "2025-1",
  "description": "Curso de programación backend con Node.js y NestJS",
  "category": "web-development",
  "level": "intermediate",
  "group": "1",
  "coverImage": "https://example.com/backend-cover.jpg",
  "isPublished": false,
  "professorCode": ["PROF001"]
}
```

### 2. Agregar challenges al curso

```bash
POST /courses/550e8400-e29b-41d4-a716-446655440000/challenges
{
  "challengeIds": [
    "CH-TWOSUM",
    "CH-FIBONACCI",
    "CH-BINARY-SEARCH"
  ]
}
```

### 3. Obtener estadísticas del curso

```bash
GET /courses/550e8400-e29b-41d4-a716-446655440000/statistics
```

### 4. Clonar challenges a otro grupo

```bash
POST /courses/550e8400-e29b-41d4-a716-446655440001/clone-from/550e8400-e29b-41d4-a716-446655440000
```

### 5. Publicar el curso

```bash
PUT /courses/550e8400-e29b-41d4-a716-446655440000/publish
{
  "isPublished": true
}
```

## 🎓 Flujo de Trabajo Recomendado

### Para Profesores:

1. **Crear el curso** con información completa
2. **Agregar challenges** relevantes al tema
3. **Revisar estadísticas** para verificar configuración
4. **Publicar el curso** cuando esté listo
5. **Monitorear progreso** de estudiantes mediante estadísticas

### Para Administradores:

1. **Gestionar cursos** globalmente
2. **Clonar challenges** entre períodos similares
3. **Supervisar métricas** de todos los cursos
4. **Administrar profesores** asignados a cursos

## 📈 Métricas y Analítica

El sistema proporciona:

- **Tasa de éxito por challenge**: % de estudiantes que resuelven correctamente
- **Progreso individual**: Challenges completados por estudiante
- **Score promedio**: Calidad de las soluciones
- **Intentos totales**: Engagement del estudiante con el material

## 🔄 Integración con Evaluaciones

Este sistema se integra con el módulo de evaluaciones (parciales) permitiendo:

- Asignar challenges específicos a evaluaciones
- Rastrear submissions dentro del contexto de evaluación
- Calcular calificaciones automáticas
- Generar reportes de desempeño

## 🛠️ Tecnologías Utilizadas

- **NestJS**: Framework backend
- **Prisma ORM**: Gestión de base de datos
- **PostgreSQL**: Base de datos relacional
- **TypeScript**: Tipado estático
- **Swagger/OpenAPI**: Documentación de API

## 📝 Notas Adicionales

- Los challenges pueden pertenecer a múltiples cursos simultáneamente
- Las estadísticas se calculan en tiempo real
- La clonación de challenges no duplica los challenges en sí, solo las referencias
- Los cursos despublicados permanecen visibles para profesores y administradores
