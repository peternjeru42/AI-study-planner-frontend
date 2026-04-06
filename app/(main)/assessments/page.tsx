'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Edit2, Plus, Trash2 } from 'lucide-react';

import { assessmentsApi, subjectsApi } from '@/lib/api';
import { Assessment, Subject } from '@/lib/types';
import { DateUtils } from '@/lib/utils/date';
import { ASSESSMENT_STATUSES, ASSESSMENT_TYPES } from '@/lib/utils/constants';
import AssessmentForm from '@/components/assessments/AssessmentForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const [nextAssessments, nextSubjects] = await Promise.all([assessmentsApi.list(), subjectsApi.list()]);
      setAssessments(nextAssessments);
      setSubjects(nextSubjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAssessment = async (assessment: Partial<Assessment>) => {
    try {
      await assessmentsApi.create(assessment);
      await loadData();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
    }
  };

  const handleUpdateAssessment = async (id: string, updates: Partial<Assessment>) => {
    try {
      await assessmentsApi.update(id, updates);
      await loadData();
      setEditingAssessment(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assessment');
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await assessmentsApi.remove(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assessment');
    }
  };

  const getSubjectName = (subjectId: string) => subjects.find((subject) => subject.id === subjectId)?.name || 'Unknown';

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || assessment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
          <p className="text-muted-foreground mt-1">Manage all your assignments and exams</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Assessment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search assessments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        >
          <option value="">All Statuses</option>
          {ASSESSMENT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {showForm ? (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentForm subjects={subjects} onSubmit={handleAddAssessment} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      ) : null}

      {editingAssessment ? (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Edit Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentForm
              initialData={editingAssessment}
              subjects={subjects}
              onSubmit={(assessment) => handleUpdateAssessment(editingAssessment.id, assessment)}
              onCancel={() => setEditingAssessment(null)}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assessments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.map((assessment) => {
                    const daysLeft = DateUtils.daysUntil(new Date(assessment.dueDate));
                    return (
                      <tr key={assessment.id} className="border-b border-border hover:bg-secondary/30 transition">
                        <td className="py-3 px-4 text-foreground">{assessment.title}</td>
                        <td className="py-3 px-4 text-foreground text-sm">{getSubjectName(assessment.subjectId)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{ASSESSMENT_TYPES.find((type) => type.value === assessment.type)?.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-foreground text-sm">
                          {DateUtils.formatDate(new Date(assessment.dueDate))}
                          <p className="text-xs text-muted-foreground">{daysLeft === 0 ? 'Today' : `${daysLeft} days`}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(assessment.status)}
                            <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                              {ASSESSMENT_STATUSES.find((status) => status.value === assessment.status)?.label ?? assessment.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setEditingAssessment(assessment)} className="p-2 hover:bg-secondary rounded-lg transition">
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
