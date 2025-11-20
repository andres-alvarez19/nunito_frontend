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

interface Room {
  id: string;
  code: string;
  name: string;
  game: string;
  difficulty: string;
  duration: number;
  teacherId: string;
  students: string[];
  isActive: boolean;
}

export function StudentDashboard({ studentName, roomCode, onStartGame, onLeaveRoom }: StudentDashboardProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/rooms/${roomCode}`);
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error("Failed to fetch room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode]);

  useEffect(() => {
    if (room) {
      const ws = new WebSocket(`ws://localhost:3001?roomCode=${room.code}`);

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'student-joined') {
          setRoom(message.payload.room);
        } else if (message.type === 'game-started') {
          setRoom((prev) => prev ? { ...prev, isActive: true } : null);
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [room]);

  if (isLoading) {
    return <p>Cargando sala...</p>;
  }

  if (!room) {
    return <p>Sala no encontrada.</p>;
  }

  const { name, game, difficulty, students, isActive } = room;
  
  const gameNames = {
    "image-word": "Asociación Imagen-Palabra",
    "syllable-count": "Conteo de Sílabas",
    "rhyme-identification": "Identificación de Rimas",
    "audio-recognition": "Reconocimiento Auditivo",
  }

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
        {!isActive ? (
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
                  Estudiantes conectados ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {students.map((student, index) => (
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
          /* Game Active Screen */
          <div className="space-y-6">
            {/* Game Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{gameNames[game as keyof typeof gameNames]}</CardTitle>
                    <CardDescription className="text-lg">Nivel: {difficulty}</CardDescription>
                  </div>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    Activo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => onStartGame(game)}
                  className="w-full text-xl py-6"
                  size="lg"
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
  )
}
