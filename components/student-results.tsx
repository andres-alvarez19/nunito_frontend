"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Clock, Target, Award, Home } from "lucide-react"

interface GameResults {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  averageTime: number
  score: number
}

interface StudentResultsProps {
  studentName: string
  gameId: string
  results: GameResults
  onPlayAgain: () => void
  onBackToHome: () => void
}

const gameNames = {
  "image-word": "Asociación Imagen-Palabra",
  "syllable-count": "Conteo de Sílabas",
  "rhyme-identification": "Identificación de Rimas",
  "audio-recognition": "Reconocimiento Auditivo",
}

const gameColors = {
  "image-word": "mint",
  "syllable-count": "pastel",
  "rhyme-identification": "violet",
  "audio-recognition": "blue",
}

export function StudentResults({ studentName, gameId, results, onPlayAgain, onBackToHome }: StudentResultsProps) {
  const gameName = gameNames[gameId as keyof typeof gameNames] || "Juego"
  const gameColor = gameColors[gameId as keyof typeof gameColors] || "mint"

  const getPerformanceMessage = () => {
    if (results.score >= 90) return "¡Excelente trabajo!"
    if (results.score >= 70) return "¡Muy bien hecho!"
    if (results.score >= 50) return "¡Buen esfuerzo!"
    return "¡Sigue practicando!"
  }

  const getPerformanceIcon = () => {
    if (results.score >= 90) return <Trophy className="h-16 w-16 text-yellow-500" />
    if (results.score >= 70) return <Award className="h-16 w-16 text-blue-500" />
    if (results.score >= 50) return <Star className="h-16 w-16 text-green-500" />
    return <Target className="h-16 w-16 text-orange-500" />
  }

  const getStarRating = () => {
    if (results.score >= 90) return 3
    if (results.score >= 70) return 2
    return 1
  }

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`
  }

  return (
    <div className={`min-h-screen bg-${gameColor}-container p-4`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className={`bg-${gameColor} text-${gameColor}-on`}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">¡Juego Completado!</CardTitle>
            <CardDescription className={`text-${gameColor}-on/80 text-lg`}>
              {gameName} - {studentName}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main Results */}
        <Card>
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              {/* Performance Icon */}
              <div className="flex justify-center">{getPerformanceIcon()}</div>

              {/* Performance Message */}
              <div>
                <h2 className="text-3xl font-bold mb-2">{getPerformanceMessage()}</h2>
                <p className="text-xl text-muted-foreground">Has obtenido {results.score} puntos</p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      star <= getStarRating() ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Score Progress */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Puntuación</span>
                  <span className="text-2xl font-bold">{results.score}%</span>
                </div>
                <Progress value={results.score} className="h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Preguntas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{results.totalQuestions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Respuestas Correctas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{results.correctAnswers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Respuestas Incorrectas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{results.incorrectAnswers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tiempo Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{formatTime(results.averageTime)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Logros Obtenidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.score >= 90 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">¡Maestro del Juego!</h4>
                    <p className="text-sm text-yellow-700">Obtuviste más del 90% de respuestas correctas</p>
                  </div>
                </div>
              )}

              {results.correctAnswers === results.totalQuestions && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Target className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-green-800">¡Perfecto!</h4>
                    <p className="text-sm text-green-700">Respondiste todas las preguntas correctamente</p>
                  </div>
                </div>
              )}

              {results.averageTime <= 10 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-blue-800">¡Rápido como el Rayo!</h4>
                    <p className="text-sm text-blue-700">Tiempo promedio menor a 10 segundos</p>
                  </div>
                </div>
              )}

              {results.score >= 50 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Star className="h-8 w-8 text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-purple-800">¡Buen Trabajo!</h4>
                    <p className="text-sm text-purple-700">Completaste el juego exitosamente</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">¡Sigue Aprendiendo!</h3>
              <p className="text-muted-foreground">
                {results.score >= 80
                  ? "¡Excelente trabajo! Estás dominando muy bien este juego. ¿Te animas a probar otro?"
                  : "¡Muy bien! Cada vez que juegas, aprendes algo nuevo. ¡Sigue practicando para mejorar aún más!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={onPlayAgain} size="lg" className="text-lg px-8">
            <Star className="h-5 w-5 mr-2" />
            Jugar de Nuevo
          </Button>
          <Button onClick={onBackToHome} variant="outline" size="lg" className="text-lg px-8 bg-transparent">
            <Home className="h-5 w-5 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
