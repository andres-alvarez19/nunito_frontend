"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, Play, Trophy, ImageIcon, Volume2, Mic, Hash } from "lucide-react"
import Image from "next/image"
import { TeacherLogin } from "@/components/teacher-login"
import { RoomCreation } from "@/components/room-creation"
import { RoomDashboard } from "@/components/room-dashboard"
import { StudentDashboard } from "@/components/student-dashboard"
import { NavigationMenu } from "@/components/navigation-menu"
import { GameLauncher } from "@/components/game-launcher"
import { StudentResults } from "@/components/student-results"
import { TeacherReports } from "@/components/teacher-reports"

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

interface GameResults {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  averageTime: number
  score: number
}

type AppState =
  | "home"
  | "teacher-login"
  | "room-creation"
  | "room-dashboard"
  | "student-dashboard"
  | "student-game"
  | "student-results"
  | "teacher-menu"
  | "teacher-reports"

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("home")
  const [activeTab, setActiveTab] = useState("student")
  const [studentName, setStudentName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [currentGameId, setCurrentGameId] = useState<string>("")
  const [gameResults, setGameResults] = useState<GameResults | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  const handleTeacherLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher)
    setAppState("teacher-menu")
  }

  const handleRoomCreated = (room: Room) => {
    setCurrentRoom(room)
    setAppState("room-dashboard")
  }

  const handleStudentJoin = () => {
    if (studentName.trim() && roomCode.trim()) {
      setAppState("student-dashboard")
    }
  }

  const handleStartGame = (gameId: string) => {
    setCurrentGameId(gameId)
    setAppState("student-game")
  }

  const handleGameComplete = (results: GameResults) => {
    setGameResults(results)
    setAppState("student-results")
  }

  const handleGameStart = () => {
    console.log("Game started!")
  }

  const handleGameEnd = () => {
    console.log("Game ended!")
  }

  const handleViewResults = () => {
    setAppState("teacher-reports")
  }

  const resetToHome = () => {
    setAppState("home")
    setCurrentTeacher(null)
    setCurrentRoom(null)
    setStudentName("")
    setRoomCode("")
    setCurrentGameId("")
    setGameResults(null)
    setDemoMode(false)
  }

  const handleTeacherNavigate = (section: string) => {
    if (section === "rooms") {
      setAppState("room-creation")
    } else if (section === "reports") {
      setAppState("teacher-reports")
    }
  }

  const handleStudentNavigate = (section: string) => {
    console.log("Student navigating to:", section)
  }

  const handleDemoGameStart = (gameId: string) => {
    setCurrentGameId(gameId)
    setDemoMode(true)
    setAppState("student-game")
  }

  const handleDemoGameComplete = (results: GameResults) => {
    setGameResults(results)
    setDemoMode(true)
    setAppState("student-results")
  }

  if (appState === "teacher-login") {
    return <TeacherLogin onLogin={handleTeacherLogin} onBack={resetToHome} />
  }

  if (appState === "teacher-menu" && currentTeacher) {
    return (
      <NavigationMenu
        userType="teacher"
        userName={currentTeacher.name}
        onNavigate={handleTeacherNavigate}
        onLogout={resetToHome}
      />
    )
  }

  if (appState === "teacher-reports" && currentTeacher) {
    return <TeacherReports teacherName={currentTeacher.name} onBack={() => setAppState("teacher-menu")} />
  }

  if (appState === "room-creation" && currentTeacher) {
    return (
      <RoomCreation
        teacher={currentTeacher}
        onRoomCreated={handleRoomCreated}
        onBack={() => setAppState("teacher-menu")}
      />
    )
  }

  if (appState === "room-dashboard" && currentRoom) {
    return (
      <RoomDashboard
        room={currentRoom}
        onStartGame={handleGameStart}
        onEndGame={handleGameEnd}
        onViewResults={handleViewResults}
        onBack={() => setAppState("teacher-menu")}
      />
    )
  }

  if (appState === "student-dashboard") {
    return (
      <StudentDashboard
        studentName={studentName}
        roomCode={roomCode}
        onStartGame={handleStartGame}
        onLeaveRoom={resetToHome}
      />
    )
  }

  if (appState === "student-game" && (currentRoom || demoMode)) {
    return (
      <GameLauncher
        gameId={currentGameId}
        difficulty={demoMode ? "easy" : (currentRoom?.difficulty as "easy" | "medium" | "hard")}
        timeLimit={demoMode ? 60 : currentRoom?.duration || 60}
        onGameComplete={demoMode ? handleDemoGameComplete : handleGameComplete}
        onBack={() => setAppState("home")}
      />
    )
  }

  if (appState === "student-results" && gameResults) {
    return (
      <StudentResults
        studentName={demoMode ? "Demo" : studentName}
        gameId={currentGameId}
        results={gameResults}
        onPlayAgain={() => setAppState("student-game")}
        onBackToHome={resetToHome}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image src="/images/nunito-logo.png" alt="Nunito" width={140} height={48} className="h-12 w-auto" priority />
          <div className="border-l border-primary-foreground/30 pl-3">
            <p className="text-sm opacity-90">Mini juegos para conciencia fonológica</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">¡Bienvenidos a Nunito!</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Una aplicación diseñada para niños de 6 a 9 años del Programa de Integración Escolar. Aprende jugando con
            nuestros mini juegos educativos.
          </p>
        </div>

        {/* Main Interface */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Acceso a la Aplicación</CardTitle>
            <CardDescription className="text-center">Selecciona tu rol para comenzar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Estudiante
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Profesor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="student-name">Tu nombre</Label>
                    <Input
                      id="student-name"
                      placeholder="Escribe tu nombre aquí"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="text-lg p-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room-code">Código de la sala</Label>
                    <Input
                      id="room-code"
                      placeholder="Código de 6 dígitos"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      className="text-lg p-3 text-center font-mono"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    className="w-full text-lg py-3"
                    size="lg"
                    disabled={!studentName.trim() || !roomCode.trim()}
                    onClick={handleStudentJoin}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Unirse a la Sala
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="teacher" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <Button className="w-full text-lg py-3" size="lg" onClick={() => setAppState("teacher-login")}>
                    <Users className="h-5 w-5 mr-2" />
                    Iniciar Sesión / Registrarse
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Inicia sesión o crea una cuenta para acceder a las funciones de profesor
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Games Preview */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center">Mini Juegos Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game 1: Image-Word Association */}
            <Card
              className="bg-mint-container border-mint cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleDemoGameStart("image-word")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-mint rounded-full flex items-center justify-center mb-2">
                  <ImageIcon className="h-8 w-8 text-mint-on" />
                </div>
                <CardTitle className="text-mint">Asociación Imagen-Palabra</CardTitle>
                <CardDescription>Relaciona imágenes con las palabras correctas</CardDescription>
                <Button
                  variant="outline"
                  className="mt-2 bg-mint/10 border-mint text-mint hover:bg-mint hover:text-mint-on"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Probar Demo
                </Button>
              </CardHeader>
            </Card>

            {/* Game 2: Syllable Counting */}
            <Card
              className="bg-pastel-container border-pastel cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleDemoGameStart("syllable-count")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-pastel rounded-full flex items-center justify-center mb-2">
                  <Hash className="h-8 w-8 text-pastel-on" />
                </div>
                <CardTitle className="text-pastel">Conteo de Sílabas</CardTitle>
                <CardDescription>Cuenta las sílabas de cada palabra</CardDescription>
                <Button
                  variant="outline"
                  className="mt-2 bg-pastel/10 border-pastel text-pastel hover:bg-pastel hover:text-pastel-on"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Probar Demo
                </Button>
              </CardHeader>
            </Card>

            {/* Game 3: Rhyme Identification */}
            <Card
              className="bg-violet-container border-violet cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleDemoGameStart("rhyme")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-violet rounded-full flex items-center justify-center mb-2">
                  <Volume2 className="h-8 w-8 text-violet-on" />
                </div>
                <CardTitle className="text-violet">Identificación de Rimas</CardTitle>
                <CardDescription>Encuentra las palabras que riman</CardDescription>
                <Button
                  variant="outline"
                  className="mt-2 bg-violet/10 border-violet text-violet hover:bg-violet hover:text-violet-on"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Probar Demo
                </Button>
              </CardHeader>
            </Card>

            {/* Game 4: Audio Recognition */}
            <Card
              className="bg-blue-container border-blue cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleDemoGameStart("audio-recognition")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue rounded-full flex items-center justify-center mb-2">
                  <Mic className="h-8 w-8 text-blue-on" />
                </div>
                <CardTitle className="text-blue">Reconocimiento Auditivo</CardTitle>
                <CardDescription>Escucha y selecciona la palabra correcta</CardDescription>
                <Button
                  variant="outline"
                  className="mt-2 bg-blue/10 border-blue text-blue hover:bg-blue hover:text-blue-on"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Probar Demo
                </Button>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-xl font-bold mb-4 text-center">Características</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <Trophy className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">Retroalimentación Inmediata</h4>
              <p className="text-sm text-muted-foreground">Recibe respuestas al instante para mejorar tu aprendizaje</p>
            </div>
            <div className="space-y-2">
              <Users className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">Salas Virtuales</h4>
              <p className="text-sm text-muted-foreground">
                Los profesores pueden crear salas y supervisar el progreso
              </p>
            </div>
            <div className="space-y-2">
              <BookOpen className="h-8 w-8 mx-auto text-primary" />
              <h4 className="font-semibold">Reportes Detallados</h4>
              <p className="text-sm text-muted-foreground">Seguimiento del rendimiento individual y grupal</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
