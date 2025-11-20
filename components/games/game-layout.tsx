"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Star } from "lucide-react"

interface GameLayoutProps {
  title: string;
  description: string;
  progress: number;
  timeRemaining: number;
  correctAnswers: number;
  totalQuestions: number;
  children: React.ReactNode;
}

export function GameLayout({
  title,
  description,
  progress,
  timeRemaining,
  correctAnswers,
  totalQuestions,
  children,
}: GameLayoutProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-gray-500">{description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                {correctAnswers}/{totalQuestions}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
        {children}
      </div>
    </div>
  );
}
