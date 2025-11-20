"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, RefreshCw } from "lucide-react"

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

interface TeacherDashboardProps {
  teacherId: string;
  teacherName: string;
  onGoToRoom: (room: Room) => void;
  onCreateRoom: () => void;
  onViewReports: () => void;
  onLogout: () => void;
}

export function TeacherDashboard({ teacherId, teacherName, onGoToRoom, onCreateRoom, onViewReports, onLogout }: TeacherDashboardProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/teachers/${teacherId}/rooms`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [teacherId]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel del Profesor</h1>
            <p className="text-muted-foreground">Bienvenido, {teacherName}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onCreateRoom}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Crear Nueva Sala
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Crea una nueva sala de juegos para tus estudiantes.</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewReports}>
            <CardHeader>
              <CardTitle>Ver Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Revisa el progreso y los resultados de tus estudiantes.</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Tus Salas Activas</h2>
            <Button variant="outline" size="sm" onClick={fetchRooms} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refrescar
            </Button>
          </div>

          {isLoading ? (
            <p>Cargando salas...</p>
          ) : rooms.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground">No tienes salas activas.</p>
                  <Button variant="link" onClick={onCreateRoom}>
                    Crea una ahora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onGoToRoom(room)}>
                  <CardHeader>
                    <CardTitle>{room.name}</CardTitle>
                    <CardDescription>Código: {room.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge>{room.game}</Badge>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{room.students.length}</span>
                      </div>
                      <Badge variant={room.isActive ? "default" : "secondary"}>
                        {room.isActive ? "Activa" : "Cerrada"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
