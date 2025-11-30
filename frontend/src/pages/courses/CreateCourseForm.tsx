import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesApi, usersApi } from '../../api/client';
import { uploadCoverImage } from '../../api/cloudinaryApi';

interface Props {
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'cloud-computing', label: 'Cloud Computing' },
  { value: 'devops', label: 'DevOps' },
  { value: 'programming-fundamentals', label: 'Programming Fundamentals' },
  { value: 'database', label: 'Database' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'game-development', label: 'Game Development' },
  { value: 'blockchain', label: 'Blockchain' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const CreateCourseForm: React.FC<Props> = ({ onSuccess }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    level: '',
    group: '',
    coverImage: '',
    year: currentYear.toString(),
    term: '1',
    isPublished: false,
  });
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
    // Seleccionar automáticamente al profesor actual si es profesor
    React.useEffect(() => {
      if (user && user.role === 'PROFESSOR') {
        setSelectedProfessors([user.id]);
      }
    }, [user]);
  
  // Estados para la subida de imagen
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const { data: professors } = useQuery({
    queryKey: ['users', 'professors'],
    queryFn: async () => {
      const { data } = await usersApi.getAll();
      return data.filter((u: any) => u.role === 'PROFESSOR');
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const period = `${form.year}-${form.term}`;
      
      // Create course
      const courseRes = await coursesApi.create({
        code: form.code,
        name: form.name,
        period,
      });

      const courseId = courseRes.data.id;

      // Update metadata
      await coursesApi.updateMetadata(courseId, {
        description: form.description,
        category: form.category,
        level: form.level,
        group: form.group,
        coverImage: form.coverImage,
        isPublished: form.isPublished,
      });

      // Assign professors
      if (selectedProfessors.length) {
        for (const profId of selectedProfessors) {
          try {
            await coursesApi.assignProfessor(courseId, profId);
          } catch (err) {
            console.error('Failed to assign professor:', profId, err);
          }
        }
      }
      // Auto-assign current professor if not already assigned
      if (user && user.role === 'PROFESSOR' && !selectedProfessors.includes(user.id)) {
        try {
          await coursesApi.assignProfessor(courseId, user.id);
        } catch (err) {
          console.error('Failed to auto-assign current professor:', user.id, err);
        }
      }

      return courseRes;
    },
    onSuccess: () => {
      setForm({
        code: '',
        name: '',
        description: '',
        category: '',
        level: '',
        group: '',
        coverImage: '',
        year: currentYear.toString(),
        term: '1',
        isPublished: false,
      });
      setSelectedProfessors([]);
      qc.invalidateQueries({ queryKey: ['courses'] });
      onSuccess?.();
    },
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Create New Course</h2>

      <div className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course Code *</label>
            <input
              className="w-full border p-2 rounded"
              placeholder="e.g., CS101"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Course Name *</label>
            <input
              className="w-full border p-2 rounded"
              placeholder="e.g., Introduction to Programming"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Course description..."
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Category and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full border p-2 rounded"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              className="w-full border p-2 rounded"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
            >
              <option value="">Select level</option>
              {LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Group only */}
        <div>
          <label className="block text-sm font-medium mb-1">Group</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="e.g., A, B, 1, 2"
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value })}
          />
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-medium mb-1">Period *</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border p-2 rounded"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            >
              {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="border p-2 rounded"
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
            >
              <option value="1">1 (Enero-Junio)</option>
              <option value="2">2 (Agosto-Diciembre)</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Period: {form.year}-{form.term}
          </p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2 rounded mb-2"
            onChange={e => {
              setCoverFile(e.target.files?.[0] || null);
              setCoverError(null);
            }}
          />
          <button
            type="button"
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:bg-gray-400"
            disabled={!coverFile || uploadingCover}
            onClick={async () => {
              if (!coverFile) return;
              setUploadingCover(true);
              setCoverError(null);
              try {
                const url = await uploadCoverImage(coverFile);
                setForm(f => ({ ...f, coverImage: url }));
              } catch (err) {
                setCoverError('Error uploading image');
              }
              setUploadingCover(false);
            }}
          >
            {uploadingCover ? 'Uploading...' : 'Upload to Cloudinary'}
          </button>
          {coverError && <div className="text-red-600 text-sm mt-1">{coverError}</div>}
          {form.coverImage && (
            <div className="mt-2">
              <img src={form.coverImage} alt="Preview" className="w-full h-32 object-cover rounded" onError={e => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
          <input
            className="w-full border p-2 rounded mt-2"
            placeholder="Or paste image URL manually"
            value={form.coverImage}
            onChange={e => setForm({ ...form, coverImage: e.target.value })}
          />
        </div>

        {/* Professors */}
        <div>
          <label className="block text-sm font-medium mb-1">Assign Professors</label>
          <div className="border rounded p-2 max-h-40 overflow-auto space-y-1">
            {professors?.length ? (
              professors.map((p: any) => (
                <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedProfessors.includes(p.id)}
                    disabled={user && user.role === 'PROFESSOR' && user.id === p.id}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedProfessors((prev) =>
                        checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                      );
                    }}
                  />
                  <span>
                    {p.name} <span className="text-gray-500">(@{p.username})</span>
                    {user && user.role === 'PROFESSOR' && user.id === p.id && (
                      <span className="ml-2 text-xs text-green-600">(You)</span>
                    )}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-gray-500 text-sm">No professors found</div>
            )}
          </div>
        </div>

        {/* Published */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            <span className="text-sm font-medium">Publish course immediately</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !form.code || !form.name}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-medium"
          >
            {createMutation.isPending ? 'Creating Course...' : 'Create Course'}
          </button>
          {createMutation.isError && (
            <div className="mt-2 text-red-600 text-sm">
              Failed to create course. Check if the code already exists.
            </div>
          )}
          {createMutation.isSuccess && (
            <div className="mt-2 text-green-600 text-sm">
              ✓ Course created successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourseForm;

