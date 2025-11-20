"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Users, Clock, Play, Square, BarChart3 } from "lucide-react"

interface Teacher {
  name: string
  email: string
}

interface Room {
  id: string
  code: string
  name: string
  game: string
  difficulty: string
  duration: number
  teacher: Teacher
  students: string[]
  isActive: boolean
}

interface RoomDashboardProps {
  room: Room
  onStartGame: () => void
  onEndGame: () => void
  onViewResults: () => void
  onBack: () => void
}

export function RoomDashboard({ room, onStartGame, onEndGame, onViewResults, onBack }: RoomDashboardProps) {
  const [currentRoom, setCurrentRoom] = useState(room)
  const [timeRemaining, setTimeRemaining] = useState(room.duration * 60)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001?roomCode=${room.code}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'student-joined') {
        setCurrentRoom(message.payload.room);
      }
    };

    return () => {
      ws.close();
    };
  }, [room.code]);

  // Timer countdown
  useEffect(() => {
    if (currentRoom.isActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentRoom.isActive, timeRemaining])

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(currentRoom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartGame = () => {
    setCurrentRoom((prev) => ({ ...prev, isActive: true }))
    onStartGame()
  }

  const handleEndGame = () => {
    setCurrentRoom((prev) => ({ ...prev, isActive: false }))
    onEndGame()
  }

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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{currentRoom.name}</h1>
            <p className="text-muted-foreground">Sala creada por {currentRoom.teacher.name}</p>
          </div>
          <Badge variant={currentRoom.isActive ? "default" : "secondary"} className="text-lg px-4 py-2">
            {currentRoom.isActive ? "Activa" : "En espera"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Información de la Sala
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Código de acceso</p>
                    <p className="text-2xl font-mono font-bold">{currentRoom.code}</p>
                  </div>
                  <Button onClick={copyRoomCode} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Juego</p>
                    <p className="font-semibold">{gameNames[currentRoom.game as keyof typeof gameNames]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dificultad</p>
                    <p className="font-semibold">
                      {difficultyLabels[currentRoom.difficulty as keyof typeof difficultyLabels]}
                    </p>
                  </div>
                </div>

                {currentRoom.isActive && (
                  <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-lg font-mono font-bold">Tiempo restante: {formatTime(timeRemaining)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Control del Juego</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {!currentRoom.isActive ? (
                    <Button onClick={handleStartGame} className="flex-1" disabled={currentRoom.students.length === 0}>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Juego
                    </Button>
                  ) : (
                    <Button onClick={handleEndGame} variant="destructive" className="flex-1">
                      <Square className="h-4 w-4 mr-2" />
                      Finalizar Juego
                    </Button>
                  )}
                  <Button onClick={onViewResults} variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Resultados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estudiantes ({currentRoom.students.length})
              </CardTitle>
              <CardDescription>Estudiantes conectados a la sala</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentRoom.students.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Esperando estudiantes...</p>
                ) : (
                  currentRoom.students.map((student, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{student}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack}>
            Volver al menú principal
          </Button>
        </div>
      </div>
    </div>
  )
}
