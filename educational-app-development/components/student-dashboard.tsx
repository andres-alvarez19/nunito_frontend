"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, Trophy, Star, Heart, Zap } from "lucide-react"

interface StudentDashboardProps {
  studentName: string
  roomCode: string
  onStartGame: (gameId: string) => void
  onLeaveRoom: () => void
}

interface GameStatus {
  id: string
  name: string
  isActive: boolean
  timeRemaining: number
  totalTime: number
  difficulty: string
  color: string
}

export function StudentDashboard({ studentName, roomCode, onStartGame, onLeaveRoom }: StudentDashboardProps) {
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/rooms/code/${roomCode}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
        }
      } catch (error) {
        // Manejo de error opcional
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode]);

  // Simular inicio de juego (puedes adaptar esto a tu lógica real)
  useEffect(() => {
    if (room && room.isActive) {
      setIsWaiting(false);
    }
  }, [room]);

  // Timer y lógica de juego (puedes adaptar esto a tu lógica real)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = room && room.duration ? 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{studentName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">¡Hola, {studentName}!</h1>
              <p className="text-sm opacity-90">Sala: {roomCode}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onLeaveRoom} size="sm">
            Salir de la sala
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {isWaiting ? (
          /* Waiting Screen */
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Clock className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Esperando que inicie el juego...</h2>
            <p className="text-muted-foreground mb-6">Tu profesor iniciará la actividad pronto</p>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Users className="h-5 w-5" />
                  Estudiantes conectados ({connectedStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {connectedStudents.map((student, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <div className="min-h-screen bg-background">
                        {/* Header */}
                        <header className="bg-primary text-primary-foreground p-4 shadow-lg">
                          <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold">{studentName.charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <h1 className="text-xl font-bold">¡Hola, {studentName}!</h1>
                                <p className="text-sm opacity-90">Sala: {roomCode}</p>
                              </div>
                            </div>
                            <Button variant="secondary" onClick={onLeaveRoom} size="sm">
                              Salir de la sala
                            </Button>
                          </div>
                        </header>

                        <main className="max-w-4xl mx-auto p-4 space-y-6">
                          {isLoading ? (
                            <p>Cargando sala...</p>
                          ) : !room ? (
                            <p>Sala no encontrada.</p>
                          ) : isWaiting ? (
                            <div className="text-center py-12">
                              <div className="animate-pulse">
                                <div className="w-20 h-20 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                                  <Clock className="h-10 w-10 text-primary" />
                                </div>
                              </div>
                              <h2 className="text-2xl font-bold mb-4">Esperando que inicie el juego...</h2>
                              <p className="text-muted-foreground mb-6">Tu profesor iniciará la actividad pronto</p>

                              <Card className="max-w-md mx-auto">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2 justify-center">
                                    <Users className="h-5 w-5" />
                                    Estudiantes conectados ({room.students.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-2">
                                    {room.students.map((student, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className={`text-sm ${student === studentName ? "font-bold" : ""}`}>{student}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Game Status */}
                              <Card className="bg-mint-container border-mint">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-mint text-2xl">Juego Activo</CardTitle>
                                      <CardDescription className="text-lg">Nivel: {room.difficulty}</CardDescription>
                                    </div>
                                    <Badge variant="default" className="text-lg px-4 py-2">
                                      Activo
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Clock className="h-6 w-6 text-primary" />
                                    <div className="flex-1">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Tiempo restante</span>
                                        <span className="text-lg font-mono font-bold">{formatTime(room.duration * 60)}</span>
                                      </div>
                                      <Progress value={progressPercentage} className="h-3" />
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() => onStartGame(room.game)}
                                    className="w-full text-xl py-6"
                                    size="lg"
                                    disabled={room.duration === 0}
                                  >
                                    <Zap className="h-6 w-6 mr-3" />
                                    ¡Comenzar a Jugar!
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </main>
                      </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <p>Selecciona la palabra que mejor corresponda a la imagen</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <p>Recibirás retroalimentación inmediata sobre tu respuesta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
