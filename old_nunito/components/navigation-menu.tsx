"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Settings, BarChart3, Users, BookOpen, LogOut } from "lucide-react"

interface NavigationMenuProps {
  userType: "student" | "teacher"
  userName: string
  onNavigate: (section: string) => void
  onLogout: () => void
}

export function NavigationMenu({ userType, userName, onNavigate, onLogout }: NavigationMenuProps) {
  const [activeSection, setActiveSection] = useState("home")

  const handleNavigate = (section: string) => {
    setActiveSection(section)
    onNavigate(section)
  }

  const teacherMenuItems = [
    { id: "home", label: "Inicio", icon: Home, description: "Panel principal" },
    { id: "rooms", label: "Mis Salas", icon: Users, description: "Gestionar salas activas" },
    { id: "reports", label: "Reportes", icon: BarChart3, description: "Ver resultados y estadísticas" },
    { id: "settings", label: "Configuración", icon: Settings, description: "Ajustes de cuenta" },
  ]

  const studentMenuItems = [
    { id: "home", label: "Inicio", icon: Home, description: "Unirse a una sala" },
    { id: "games", label: "Juegos", icon: BookOpen, description: "Ver juegos disponibles" },
  ]

  const menuItems = userType === "teacher" ? teacherMenuItems : studentMenuItems

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">PIE Educativo</h1>
              <p className="text-sm opacity-90">
                {userType === "teacher" ? `Profesor: ${userName}` : `Estudiante: ${userName}`}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {userType === "teacher" ? "Profesor" : "Estudiante"}
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegación</CardTitle>
                <CardDescription>Selecciona una sección</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleNavigate(item.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  )
                })}
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const activeItem = menuItems.find((item) => item.id === activeSection)
                    const Icon = activeItem?.icon || Home
                    return (
                      <>
                        <Icon className="h-5 w-5" />
                        {activeItem?.label || "Inicio"}
                      </>
                    )
                  })()}
                </CardTitle>
                <CardDescription>
                  {menuItems.find((item) => item.id === activeSection)?.description || "Panel principal"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "home" && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <h2 className="text-2xl font-bold mb-4">
                        {userType === "teacher" ? "Panel del Profesor" : "Panel del Estudiante"}
                      </h2>
                      <p className="text-muted-foreground">
                        {userType === "teacher"
                          ? "Desde aquí puedes crear salas, gestionar actividades y ver reportes de tus estudiantes."
                          : "Ingresa el código de una sala para unirte a las actividades de tu profesor."}
                      </p>
                    </div>

                    {userType === "teacher" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              Crear Nueva Sala
                            </CardTitle>
                            <CardDescription>Configura una nueva sesión de juegos educativos</CardDescription>
                          </CardHeader>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              Ver Reportes
                            </CardTitle>
                            <CardDescription>Revisa el progreso y resultados de tus estudiantes</CardDescription>
                          </CardHeader>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Card className="max-w-md mx-auto">
                          <CardHeader>
                            <CardTitle>Unirse a una Sala</CardTitle>
                            <CardDescription>Pide a tu profesor el código de la sala</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button className="w-full" onClick={() => handleNavigate("join")}>
                              <Users className="h-4 w-4 mr-2" />
                              Ingresar Código
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "games" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Juegos Disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-mint-container border-mint">
                        <CardHeader>
                          <CardTitle className="text-mint">Asociación Imagen-Palabra</CardTitle>
                          <CardDescription>Relaciona imágenes con palabras</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="bg-pastel-container border-pastel">
                        <CardHeader>
                          <CardTitle className="text-pastel">Conteo de Sílabas</CardTitle>
                          <CardDescription>Cuenta las sílabas de cada palabra</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="bg-violet-container border-violet">
                        <CardHeader>
                          <CardTitle className="text-violet">Identificación de Rimas</CardTitle>
                          <CardDescription>Encuentra palabras que riman</CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="bg-blue-container border-blue">
                        <CardHeader>
                          <CardTitle className="text-blue">Reconocimiento Auditivo</CardTitle>
                          <CardDescription>Escucha y selecciona la palabra</CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>
                )}

                {activeSection === "rooms" && userType === "teacher" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Mis Salas</h3>
                      <Button>
                        <Users className="h-4 w-4 mr-2" />
                        Nueva Sala
                      </Button>
                    </div>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No tienes salas activas en este momento.</p>
                      <p>Crea una nueva sala para comenzar una actividad.</p>
                    </div>
                  </div>
                )}

                {activeSection === "reports" && userType === "teacher" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Reportes y Estadísticas</h3>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No hay reportes disponibles aún.</p>
                      <p>Los reportes aparecerán después de completar actividades.</p>
                    </div>
                  </div>
                )}

                {activeSection === "settings" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Configuración</h3>
                    <Card>
                      <CardHeader>
                        <CardTitle>Información de la Cuenta</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <p className="text-lg">{userName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Tipo de Usuario</label>
                          <p className="text-lg capitalize">{userType === "teacher" ? "Profesor" : "Estudiante"}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
