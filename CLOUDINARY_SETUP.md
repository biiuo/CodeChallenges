# Cloudinary Setup - Course Cover Images

## ✅ Implementación Completa

### Backend (NestJS)

**Archivos creados:**
- `src/infrastructure/cloudinary.service.ts` - Servicio para subir imágenes a Cloudinary
- `src/presentation/controllers/courses-cover.controller.ts` - Endpoint para subir cover images

**Módulo actualizado:**
- `src/presentation/modules/courses-extended.module.ts` - Registra CloudinaryService y CoursesCoverController

**Endpoint disponible:**
```
POST /courses/cover/upload
Authorization: Bearer <token>
Roles: ADMIN, PROFESSOR
Content-Type: multipart/form-data

Body: FormData con campo 'file' (imagen)
Response: { url: "https://res.cloudinary.com/..." }
```

**Validaciones:**
- Solo imágenes (jpg, jpeg, png, gif, webp)
- Tamaño máximo: 5MB
- Requiere autenticación y rol ADMIN o PROFESSOR

---

### Frontend (React)

**Archivos creados/modificados:**
- `frontend/src/api/cloudinaryApi.ts` - Función `uploadCoverImage(file: File)`
- `frontend/src/pages/courses/CreateCourseForm.tsx` - Input de archivo + botón de upload

**Funcionalidad:**
1. Usuario selecciona imagen desde su computadora
2. Hace clic en "Upload to Cloudinary"
3. La imagen se sube al backend que la procesa con Cloudinary
4. La URL resultante se guarda en el campo `coverImage` del curso

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Edita `.env` en la raíz del proyecto:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 2. Docker Compose

Ya configurado en `docker-compose.yml`:

```yaml
backend:
  environment:
    - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
    - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
    - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
```

### 3. Obtener Credenciales de Cloudinary

1. Ve a https://cloudinary.com/
2. Crea una cuenta gratis
3. En el Dashboard, copia:
   - **Cloud name**
   - **API Key**
   - **API Secret**
4. Pégalos en el archivo `.env`

---

## 🚀 Uso

### En el formulario de creación de curso:

1. Haz clic en el input de archivo
2. Selecciona una imagen (jpg, png, gif, webp)
3. Haz clic en "Upload to Cloudinary"
4. Espera a que se suba (aparecerá la preview)
5. Crea el curso normalmente

### Alternativamente:

Puedes pegar directamente una URL de imagen en el campo de texto si ya tienes la imagen en otro lugar.

---

## 📝 Notas Técnicas

- Las imágenes se suben a la carpeta `course_covers` en Cloudinary
- El archivo temporal se elimina del servidor después de subir
- La URL generada es pública y accesible desde cualquier lugar
- El campo `coverImage` en la base de datos almacena la URL (String)

---

## 🔄 Próximos Pasos (Opcionales)

- [ ] Agregar transformaciones de Cloudinary (resize, crop, optimización automática)
- [ ] Implementar upload para recursos de lecciones (PDFs, documentos)
- [ ] Agregar preview de video antes de crear lección
- [ ] Implementar eliminación de imágenes antiguas al actualizar cover
