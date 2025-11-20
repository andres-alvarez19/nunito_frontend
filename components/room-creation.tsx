"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Play } from "lucide-react"

interface Teacher {
  teacherId: string;
  name: string;
  email: string;
}

interface RoomCreationProps {
  teacher: Teacher;
  onRoomCreated: (room: Room) => void;
  onBack: () => void;
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

const games = [
  { id: "image-word", name: "Asociación Imagen-Palabra", color: "mint" },
  { id: "syllable-count", name: "Conteo de Sílabas", color: "pastel" },
  { id: "rhyme-identification", name: "Identificación de Rimas", color: "violet" },
  { id: "audio-recognition", name: "Reconocimiento Auditivo", color: "blue" },
]

export function RoomCreation({ teacher, onRoomCreated, onBack }: RoomCreationProps) {
  const [roomData, setRoomData] = useState({
    name: "",
    game: "",
    difficulty: "",
    duration: 10,
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch("http://localhost:3001/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...roomData, teacherId: teacher.teacherId }),
      });

      if (response.ok) {
        const newRoom = await response.json();
        onRoomCreated(newRoom);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      alert("An error occurred during room creation.");
    } finally {
      setIsCreating(false);
    }
  }

  const selectedGame = games.find((g) => g.id === roomData.game)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Crear Nueva Sala</h1>
          <p className="text-muted-foreground mt-2">Bienvenido, {teacher.name}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de la Sala
            </CardTitle>
            <CardDescription>Configura los parámetros para tu sesión educativa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <Label htmlFor="room-name">Nombre de la sala</Label>
                <Input
                  id="room-name"
                  placeholder="Ej: Clase 3°A - Fonología"
                  value={roomData.name}
                  onChange={(e) => setRoomData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="game-select">Seleccionar juego</Label>
                <Select
                  value={roomData.game}
                  onValueChange={(value) => setRoomData((prev) => ({ ...prev, game: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un mini juego" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Nivel de dificultad</Label>
                  <Select
                    value={roomData.difficulty}
                    onValueChange={(value) => setRoomData((prev) => ({ ...prev, difficulty: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Intermedio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Select
                    value={roomData.duration.toString()}
                    onValueChange={(value) => setRoomData((prev) => ({ ...prev, duration: Number.parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedGame && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Juego seleccionado:</h4>
                  <Badge variant="secondary" className={`bg-${selectedGame.color}-container`}>
                    {selectedGame.name}
                  </Badge>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  <Play className="h-4 w-4 mr-2" />
                  {isCreating ? "Creando sala..." : "Crear Sala"}
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
