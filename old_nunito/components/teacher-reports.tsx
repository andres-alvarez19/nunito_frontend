"use client"

import { useState } from "react"
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
  teacherName: string
  onBack: () => void
}

// Mock data for demonstration
const mockReports: RoomReport[] = [
  {
    roomId: "1",
    roomName: "Clase 3°A - Fonología",
    gameId: "image-word",
    difficulty: "easy",
    studentsCount: 8,
    averageScore: 85,
    completionRate: 100,
    createdAt: "2024-01-15T10:30:00Z",
    students: [
      {
        name: "Ana García",
        gameId: "image-word",
        score: 95,
        correctAnswers: 19,
        totalQuestions: 20,
        averageTime: 8.5,
        completedAt: "2024-01-15T10:45:00Z",
      },
      {
        name: "Carlos López",
        gameId: "image-word",
        score: 80,
        correctAnswers: 16,
        totalQuestions: 20,
        averageTime: 12.3,
        completedAt: "2024-01-15T10:47:00Z",
      },
      {
        name: "María Rodríguez",
        gameId: "image-word",
        score: 90,
        correctAnswers: 18,
        totalQuestions: 20,
        averageTime: 9.8,
        completedAt: "2024-01-15T10:46:00Z",
      },
      {
        name: "Diego Martínez",
        gameId: "image-word",
        score: 75,
        correctAnswers: 15,
        totalQuestions: 20,
        averageTime: 15.2,
        completedAt: "2024-01-15T10:48:00Z",
      },
    ],
  },
  {
    roomId: "2",
    roomName: "Clase 2°B - Sílabas",
    gameId: "syllable-count",
    difficulty: "medium",
    studentsCount: 6,
    averageScore: 78,
    completionRate: 83,
    createdAt: "2024-01-14T14:15:00Z",
    students: [
      {
        name: "Sofía Hernández",
        gameId: "syllable-count",
        score: 85,
        correctAnswers: 17,
        totalQuestions: 20,
        averageTime: 11.2,
        completedAt: "2024-01-14T14:30:00Z",
      },
      {
        name: "Mateo Silva",
        gameId: "syllable-count",
        score: 70,
        correctAnswers: 14,
        totalQuestions: 20,
        averageTime: 18.5,
        completedAt: "2024-01-14T14:32:00Z",
      },
    ],
  },
]

const gameNames = {
  "image-word": "Asociación Imagen-Palabra",
  "syllable-count": "Conteo de Sílabas",
  "rhyme-identification": "Identificación de Rimas",
  "audio-recognition": "Reconocimiento Auditivo",
}

const difficultyLabels = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Difícil",
}

export function TeacherReports({ teacherName, onBack }: TeacherReportsProps) {
  const [selectedReport, setSelectedReport] = useState<RoomReport | null>(null)

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

          {mockReports.length === 0 ? (
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
              {mockReports.map((report) => (
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
                            {report.averageScore}%
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
                          <span className="text-sm text-muted-foreground">{report.averageScore}%</span>
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
