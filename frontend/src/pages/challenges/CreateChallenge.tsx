import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { challengesApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const CreateChallenge: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setError(null);
    
    // Verificar autenticación
    if (!token || !user) {
      setError('Debes estar autenticado para crear un challenge');
      return;
    }

    // Verificar permisos
    if (user.role !== 'ADMIN' && user.role !== 'PROFESSOR') {
      setError('Solo ADMIN y PROFESSOR pueden crear challenges');
      return;
    }

    try {
      // Convert tags string to array (handle empty string)
      const tagsArray = data.tags && data.tags.trim() 
        ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
        : [];
      
      // Validar campos requeridos
      if (!data.title || !data.title.trim()) {
        setError('El título es requerido');
        return;
      }
      
      if (!data.description || !data.description.trim()) {
        setError('La descripción es requerida');
        return;
      }

      if (!data.timeLimit || isNaN(parseInt(data.timeLimit, 10))) {
        setError('El tiempo límite debe ser un número válido');
        return;
      }

      if (!data.memoryLimit || isNaN(parseInt(data.memoryLimit, 10))) {
        setError('El límite de memoria debe ser un número válido');
        return;
      }
      
      // Build payload with proper types
      const payload = {
        // Ensure authorId is a string (backend validation requires string)
        authorId: String(user.id),
        title: data.title.trim(),
        description: data.description.trim(),
        difficulty: data.difficulty || 'EASY',
        tags: tagsArray.length > 0 ? tagsArray : ['general'],
        timeLimit: parseInt(data.timeLimit, 10),
        memoryLimit: parseInt(data.memoryLimit, 10),
        isPublic: data.isPublic === 'true' || data.isPublic === true,
      };
      
      console.log('Creating challenge with payload:', payload);
      const response = await challengesApi.create(payload);
      console.log('Challenge created successfully:', response.data);
      navigate('/challenges');
    } catch (err: any) {
      console.error('Failed to create challenge', err);
      let errorMessage = 'Error al crear el challenge';
      
      if (err.response) {
        // Error del servidor
        if (err.response.status === 401) {
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || 'Datos inválidos. Verifica todos los campos.';
        } else if (err.response.status === 403) {
          errorMessage = 'No tienes permisos para crear challenges';
        } else if (err.response.status === 409) {
          errorMessage = err.response.data?.message || 'Ya existe un challenge con ese título';
        } else {
          errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        errorMessage = err.message || 'Error desconocido';
      }
      
      setError(errorMessage);
    }
  };


  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create New Challenge</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {(!token || !user) && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>Debes estar autenticado para crear un challenge.</p>
        </div>
      )}

      {user && user.role !== 'ADMIN' && user.role !== 'PROFESSOR' && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>Solo ADMIN y PROFESSOR pueden crear challenges.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            {...register('title', { required: 'El título es requerido' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="Ej: Two Sum"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            {...register('description', { required: 'La descripción es requerida' })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="Describe el problema, formato de entrada y salida..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              {...register('difficulty', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              {...register('tags', { required: false })}
              placeholder="arrays, dp, math"
              defaultValue=""
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Limit (ms) *</label>
            <input
              type="number"
              {...register('timeLimit', { 
                required: 'El tiempo límite es requerido',
                min: { value: 100, message: 'Mínimo 100ms' }
              })}
              defaultValue={1000}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.timeLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.timeLimit.message as string}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Memory Limit (MB) *</label>
            <input
              type="number"
              {...register('memoryLimit', { 
                required: 'El límite de memoria es requerido',
                min: { value: 64, message: 'Mínimo 64MB' }
              })}
              defaultValue={128}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.memoryLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.memoryLimit.message as string}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Visibility</label>
          <select
            {...register('isPublic', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Create Challenge
        </button>
      </form>
    </div>
  );
};
