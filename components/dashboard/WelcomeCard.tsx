'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface WelcomeCardProps {
  user: User;
  onGeneratePlan?: () => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ user, onGeneratePlan }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
      <CardContent className="pt-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {getGreeting()}, {user.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ready to ace your exams? Let&apos;s create a study plan.
              </p>
            </div>
            <Button
              onClick={onGeneratePlan}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <BookOpen className="w-4 h-4" />
              Generate Study Plan
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
