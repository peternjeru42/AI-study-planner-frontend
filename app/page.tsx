'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">StudyFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Testimonials
            </a>
            <Button onClick={() => router.push('/login')} variant="outline" size="sm">
              Sign In
            </Button>
            <Button onClick={() => router.push('/signup')} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Study Smarter with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered Planning
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate personalized study schedules, track progress, and ace your exams with intelligent planning that adapts to your learning style.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => router.push('/login?demo=student')}>
              Try as Student
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login?demo=admin')}>
              Try as Admin
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Demo credentials: student@example.com / demo123 or admin@example.com / demo123
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">Everything you need to succeed academically</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: 'Smart Scheduling',
              description: 'AI generates optimal study schedules based on deadline urgency and your preferences',
            },
            {
              icon: BarChart3,
              title: 'Progress Tracking',
              description: 'Monitor your completion rates and study hours across all subjects',
            },
            {
              icon: Calendar,
              title: 'Calendar Integration',
              description: 'View all assessments and study sessions in an interactive calendar',
            },
            {
              icon: BookOpen,
              title: 'Subject Management',
              description: 'Organize assessments by subject with custom color coding',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="border border-border hover:border-primary/50 transition">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What Students Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Emily Chen',
              role: 'Computer Science Major',
              quote: 'StudyFlow helped me manage 6 courses and improve my GPA by 0.8 points. The AI planner is a game-changer!',
            },
            {
              name: 'Marcus Johnson',
              role: 'Pre-Med Student',
              quote: 'The calendar integration made tracking deadlines so much easier. I never miss an assignment now.',
            },
            {
              name: 'Sophia Martinez',
              role: 'Engineering Student',
              quote: 'Love how StudyFlow adapts to my schedule. The smart scheduling saves me hours of planning each week.',
            },
          ].map((testimonial, idx) => (
            <Card key={idx} className="border border-border bg-card/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <h3 className="text-3xl font-bold text-foreground">Ready to Transform Your Study Habits?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students using StudyFlow to achieve their academic goals
            </p>
            <Button size="lg" onClick={() => router.push('/signup')}>
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 StudyFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
