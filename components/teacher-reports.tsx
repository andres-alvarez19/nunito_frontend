"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Trophy, Download, Filter, Calendar } from "lucide-react"

interface StudentResult {
  name: string
  gameId: string
  score: number
  correctAnswers: number
  totalQuestions: number
  averageTime: number
  completedAt: string
}

interface RoomReport {
  roomId: string
  roomName: string
  gameId: string
  difficulty: string
  studentsCount: number
  averageScore: number
  completionRate: number
  createdAt: string
  students: StudentResult[]
}

interface TeacherReportsProps {
  teacherId: string;
  teacherName: string;
  onBack: () => void;
}

export function TeacherReports({ teacherId, teacherName, onBack }: TeacherReportsProps) {
  const [reports, setReports] = useState<RoomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<RoomReport | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/rooms/all/results?teacherId=${teacherId}`);
        const data = await response.json();
        
        // Process the data to group results by room
        const reportsByRoom = data.reduce((acc, result) => {
          const { roomCode, studentName, results, timestamp } = result;
          if (!acc[roomCode]) {
            acc[roomCode] = {
              roomId: roomCode,
              roomName: `Sala ${roomCode}`, // You might want to fetch room details for a better name
              gameId: 'image-word', // This should come from room details
              difficulty: 'easy', // This should come from room details
              studentsCount: 0,
              averageScore: 0,
              completionRate: 0,
              createdAt: timestamp,
              students: [],
            };
          }
          
          acc[roomCode].students.push({
            name: studentName,
            gameId: 'image-word',
            score: results.score,
            correctAnswers: results.correctAnswers,
            totalQuestions: results.totalQuestions,
            averageTime: results.averageTime,
            completedAt: timestamp,
          });
          
          return acc;
        }, {} as { [key: string]: RoomReport });

        // Calculate aggregate values
        Object.values(reportsByRoom).forEach(report => {
          report.studentsCount = report.students.length;
          const totalScore = report.students.reduce((sum, s) => sum + s.score, 0);
          report.averageScore = report.students.length > 0 ? totalScore / report.students.length : 0;
          report.completionRate = report.students.length > 0 ? 100 : 0; // This is a simplified calculation
        });

        setReports(Object.values(reportsByRoom));
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, [teacherId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 70) return "secondary"
    return "outline"
  }

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{selectedReport.roomName}</h1>
              <p className="text-muted-foreground">
                {gameNames[selectedReport.gameId as keyof typeof gameNames]} -{" "}
                {difficultyLabels[selectedReport.difficulty as keyof typeof difficultyLabels]}
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Volver a Reportes
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{selectedReport.studentsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Promedio General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(selectedReport.averageScore)}`}>
                  {selectedReport.averageScore}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Tasa de Finalización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{selectedReport.completionRate}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{formatDate(selectedReport.createdAt)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Student Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultados por Estudiante</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedReport.students.map((student, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">{student.name}</h4>
                      <Badge variant={getScoreBadgeVariant(student.score)} className="text-lg px-3 py-1">
                        {student.score}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Respuestas Correctas</p>
                        <p className="text-lg font-semibold">
                          {student.correctAnswers}/{student.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                        <p className="text-lg font-semibold">{formatTime(student.averageTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completado</p>
                        <p className="text-lg font-semibold">{formatDate(student.completedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progreso</p>
                        <Progress value={student.score} className="mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
            <p className="text-muted-foreground">Profesor: {teacherName}</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Volver al Menú
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                Todos los Juegos
              </Button>
              <Button variant="outline" size="sm">
                Última Semana
              </Button>
              <Button variant="outline" size="sm">
                Exportar Todo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Salas Recientes</h2>

          {reports.length === 0 ? (
            <Card>
              <CardContent className="pt-8">
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hay reportes disponibles</h3>
                  <p className="text-muted-foreground">
                    Los reportes aparecerán aquí después de que los estudiantes completen las actividades.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <Card key={report.roomId} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.roomName}</CardTitle>
                      <Badge variant="secondary">{gameNames[report.gameId as keyof typeof gameNames]}</Badge>
                    </div>
                    <CardDescription>{formatDate(report.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{report.studentsCount}</p>
                          <p className="text-sm text-muted-foreground">Estudiantes</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${getScoreColor(report.averageScore)}`}>
                            {report.averageScore.toFixed(0)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Promedio</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{report.completionRate}%</p>
                          <p className="text-sm text-muted-foreground">Completado</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progreso General</span>
                          <span className="text-sm text-muted-foreground">{report.averageScore.toFixed(0)}%</span>
                        </div>
                        <Progress value={report.averageScore} />
                      </div>

                      <Button onClick={() => setSelectedReport(report)} className="w-full" variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
