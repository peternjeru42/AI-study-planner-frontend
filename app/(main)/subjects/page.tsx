'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Edit2, Plus, Trash2 } from 'lucide-react';

import { subjectsApi } from '@/lib/api';
import { Subject } from '@/lib/types';
import SubjectForm from '@/components/subjects/SubjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [error, setError] = useState('');

  const loadSubjects = async () => {
    try {
      setError('');
      setSubjects(await subjectsApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects');
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAddSubject = async (subject: Subject) => {
    try {
      await subjectsApi.create(subject);
      await loadSubjects();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      await subjectsApi.update(id, updates);
      await loadSubjects();
      setEditingSubject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectsApi.remove(id);
      await loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject');
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage your course subjects</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Search subjects by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {showForm ? (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectForm onSubmit={handleAddSubject} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      ) : null}

      {editingSubject ? (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Edit Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectForm
              initialData={editingSubject}
              onSubmit={(subject) => handleUpdateSubject(editingSubject.id, subject)}
              onCancel={() => setEditingSubject(null)}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary rounded-lg">
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">No subjects found</h3>
                  <p className="text-sm text-muted-foreground">Add your first subject to get started</p>
                </div>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredSubjects.map((subject) => (
            <Card key={subject.id} className="hover:border-primary/50 transition">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-4 h-4 rounded-full shrink-0 mt-1" style={{ backgroundColor: subject.color }} />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingSubject(subject)} className="p-2 hover:bg-secondary rounded-lg transition">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                    {subject.instructor ? <p className="text-xs text-muted-foreground">Instructor: {subject.instructor}</p> : null}
                    {subject.semester ? <p className="text-xs text-muted-foreground">{subject.semester}</p> : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
