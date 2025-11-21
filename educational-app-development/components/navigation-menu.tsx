"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Settings, BarChart3, Users, BookOpen, LogOut } from "lucide-react"
import Image from "next/image"
import { GameQuestionEditor } from "./game-question-editor"
import { CourseManager } from "./course-manager"
import { TestSuiteManager } from "./test-suite-manager"

interface NavigationMenuProps {
  userType: "student" | "teacher"
  userName: string
  onNavigate: (section: string) => void
  onLogout: () => void
}

export function NavigationMenu({ userType, userName, onNavigate, onLogout }: NavigationMenuProps) {
  const [activeSection, setActiveSection] = useState("home")
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedTestSuite, setSelectedTestSuite] = useState<{ id: string; name: string; games: string[] } | null>(null)
  const [selectedGameEditor, setSelectedGameEditor] = useState<string | null>(null)

  const handleNavigate = (section: string) => {
    setActiveSection(section)
    onNavigate(section)
  }

  const teacherMenuItems = [
    { id: "home", label: "Inicio", icon: Home, description: "Panel principal" },
    { id: "rooms", label: "Mis Salas", icon: Users, description: "Gestionar salas activas" },
    { id: "reports", label: "Reportes", icon: BarChart3, description: "Ver resultados y estadísticas" },
    { id: "questions", label: "Gestionar Preguntas", icon: BookOpen, description: "Editar preguntas de juegos" },
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
      <header className="bg-white border-b-4 border-primary p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/nunito-logo.png"
              alt="Nunito"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
            <div className="border-l border-border pl-3 ml-1">
              <p className="text-sm text-muted-foreground">
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
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium text-primary">Salas Activas</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold text-primary">0</div>
                              <p className="text-xs text-muted-foreground mt-1">sesiones en progreso</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-mint-color-container/30 to-mint-color-container/5">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium" style={{ color: "var(--mint-color)" }}>
                                Estudiantes
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold" style={{ color: "var(--mint-color)" }}>
                                0
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">conectados esta semana</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-violet-color-container/30 to-violet-color-container/5">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium" style={{ color: "var(--violet-color)" }}>
                                Actividades
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold" style={{ color: "var(--violet-color)" }}>
                                0
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">completadas</p>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-blue-color-container/30 to-blue-color-container/5">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium" style={{ color: "var(--blue-color)" }}>
                                Progreso
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold" style={{ color: "var(--blue-color)" }}>
                                0%
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">promedio general</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Recent activity section */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              Actividad Reciente
                            </CardTitle>
                            <CardDescription>Últimas salas y reportes</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                  <p className="font-medium text-sm">No hay actividad reciente</p>
                                  <p className="text-xs text-muted-foreground">Crea una nueva sala para comenzar</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Action buttons */}
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

                {activeSection === "questions" && userType === "teacher" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Gestionar Preguntas de Juegos</h3>
                    <p className="text-muted-foreground mb-6">
                      Selecciona un curso y su conjunto de preguntas para agregar, editar o eliminar preguntas
                    </p>

                    <CourseManager onSelectCourse={(course) => setSelectedCourse(course)} />

                    {selectedCourse && (
                      <>
                        <Card className="border-2 border-primary/30">
                          <CardHeader>
                            <CardTitle>Conjuntos de Preguntas del Curso</CardTitle>
                            <CardDescription>Selecciona un conjunto para editar sus preguntas</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <TestSuiteManager onSelectTestSuite={(suite) => setSelectedTestSuite(suite)} />
                          </CardContent>
                        </Card>

                        {selectedTestSuite && (
                          <Card className="border-2 border-primary/30">
                            <CardHeader>
                              <CardTitle>Editar Preguntas: {selectedTestSuite.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {selectedTestSuite.games.map((gameId) => {
                                  const game = [
                                    { id: "image-word", title: "Asociación Imagen-Palabra" },
                                    { id: "syllable", title: "Conteo de Sílabas" },
                                    { id: "rhyme", title: "Identificación de Rimas" },
                                    { id: "audio", title: "Reconocimiento Auditivo" },
                                  ].find((g) => g.id === gameId)
                                  return (
                                    <Button
                                      key={gameId}
                                      variant={selectedGameEditor === gameId ? "default" : "outline"}
                                      className={selectedGameEditor === gameId ? "" : "bg-transparent"}
                                      onClick={() =>
                                        setSelectedGameEditor(selectedGameEditor === gameId ? null : gameId)
                                      }
                                    >
                                      {game?.title}
                                    </Button>
                                  )
                                })}
                              </div>

                              {selectedGameEditor && (
                                <GameQuestionEditor
                                  gameType={selectedGameEditor as "image-word" | "syllable" | "rhyme" | "audio"}
                                  gameTitle={
                                    {
                                      "image-word": "Asociación Imagen-Palabra",
                                      syllable: "Conteo de Sílabas",
                                      rhyme: "Identificación de Rimas",
                                      audio: "Reconocimiento Auditivo",
                                    }[selectedGameEditor] || ""
                                  }
                                />
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeSection === "settings" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold">Configuración</h3>

                    {/* Account Information */}
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

                    {userType === "teacher" && (
                      <>
                        {/* Game Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Configuración de Juegos</CardTitle>
                            <CardDescription>Personaliza los juegos educativos para tus salas</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Game Selection */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium">Juegos Disponibles</label>
                              <p className="text-sm text-muted-foreground mb-3">
                                Selecciona qué juegos deseas usar en tus salas
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="game1" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="game1" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Asociación Imagen-Palabra</span>
                                    <p className="text-xs text-muted-foreground">Relaciona imágenes con palabras</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="game2" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="game2" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Conteo de Sílabas</span>
                                    <p className="text-xs text-muted-foreground">Cuenta las sílabas de cada palabra</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="game3" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="game3" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Identificación de Rimas</span>
                                    <p className="text-xs text-muted-foreground">Encuentra palabras que riman</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="game4" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="game4" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Reconocimiento Auditivo</span>
                                    <p className="text-xs text-muted-foreground">Escucha y selecciona la palabra</p>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Difficulty Settings */}
                            <div className="border-t pt-6 space-y-3">
                              <label className="text-sm font-medium">Nivel de Dificultad Predeterminado</label>
                              <p className="text-sm text-muted-foreground mb-3">
                                Elige el nivel de dificultad para nuevas salas
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                  <input type="radio" id="easy" name="difficulty" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="easy" className="flex-1 cursor-pointer">
                                    <span className="font-medium text-green-600">Fácil</span>
                                    <p className="text-xs text-muted-foreground">3 opciones, palabras simples</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                  <input type="radio" id="medium" name="difficulty" className="w-4 h-4" />
                                  <label htmlFor="medium" className="flex-1 cursor-pointer">
                                    <span className="font-medium text-blue-600">Medio</span>
                                    <p className="text-xs text-muted-foreground">4 opciones, palabras variadas</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                                  <input type="radio" id="hard" name="difficulty" className="w-4 h-4" />
                                  <label htmlFor="hard" className="flex-1 cursor-pointer">
                                    <span className="font-medium text-red-600">Difícil</span>
                                    <p className="text-xs text-muted-foreground">5 opciones, palabras complejas</p>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Time Settings */}
                            <div className="border-t pt-6 space-y-3">
                              <label className="text-sm font-medium">Tiempo por Pregunta</label>
                              <p className="text-sm text-muted-foreground mb-3">Define el tiempo límite en segundos</p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="radio" id="time30" name="timeLimit" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="time30" className="flex-1 cursor-pointer">
                                    <span className="font-medium">30 segundos</span>
                                    <p className="text-xs text-muted-foreground">Más tiempo para pensar</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="radio" id="time45" name="timeLimit" className="w-4 h-4" />
                                  <label htmlFor="time45" className="flex-1 cursor-pointer">
                                    <span className="font-medium">45 segundos</span>
                                    <p className="text-xs text-muted-foreground">Tiempo moderado</p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="radio" id="time60" name="timeLimit" className="w-4 h-4" />
                                  <label htmlFor="time60" className="flex-1 cursor-pointer">
                                    <span className="font-medium">60 segundos</span>
                                    <p className="text-xs text-muted-foreground">Ritmo relajado</p>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Feedback Settings */}
                            <div className="border-t pt-6 space-y-3">
                              <label className="text-sm font-medium">Configuración de Retroalimentación</label>
                              <p className="text-sm text-muted-foreground mb-3">
                                Personaliza cómo recibirán feedback los estudiantes
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="feedback-audio" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="feedback-audio" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Sonidos de Feedback</span>
                                    <p className="text-xs text-muted-foreground">
                                      Reproducir sonidos para respuestas correctas/incorrectas
                                    </p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="feedback-visual" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="feedback-visual" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Animaciones Visuales</span>
                                    <p className="text-xs text-muted-foreground">
                                      Mostrar efectos visuales y celebraciones
                                    </p>
                                  </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <input type="checkbox" id="feedback-hints" defaultChecked className="w-4 h-4" />
                                  <label htmlFor="feedback-hints" className="flex-1 cursor-pointer">
                                    <span className="font-medium">Habilitar Pistas</span>
                                    <p className="text-xs text-muted-foreground">
                                      Permitir que estudiantes pidan pistas
                                    </p>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                            Guardar Configuración
                          </Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Restablecer Valores Predeterminados
                          </Button>
                        </div>
                      </>
                    )}
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
