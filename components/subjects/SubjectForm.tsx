'use client';

import { useState, useEffect } from 'react';
import { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SUBJECT_COLORS } from '@/lib/utils/constants';

interface SubjectFormProps {
  initialData?: Subject;
  onSubmit: (subject: Subject) => void;
  onCancel: () => void;
}

export default function SubjectForm({ initialData, onSubmit, onCancel }: SubjectFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    instructor: initialData?.instructor || '',
    color: initialData?.color || '#3B82F6',
    semester: initialData?.semester || '',
    description: initialData?.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    const subject: Subject = {
      id: initialData?.id || `subject-${Date.now()}`,
      userId: user.id,
      ...formData,
    };

    onSubmit(subject);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subject Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Data Structures"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subject Code *</label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., CS201"
          />
          {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Instructor</label>
          <Input
            value={formData.instructor}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            placeholder="e.g., Prof. John Smith"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Semester</label>
          <Input
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            placeholder="e.g., Spring 2024"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Color</label>
          <div className="grid grid-cols-4 gap-2">
            {SUBJECT_COLORS.map((colorOption) => (
              <button
                key={colorOption.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: colorOption.value })}
                className={`w-10 h-10 rounded-lg border-2 transition ${
                  formData.color === colorOption.value
                    ? 'border-foreground'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: colorOption.value }}
                title={colorOption.label}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add notes about this subject..."
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-border">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Add'} Subject
        </Button>
      </div>
    </form>
  );
}
