"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import useSound from 'use-sound';
import { GameLayout } from "./game-layout";
import { CheckCircle, XCircle } from "lucide-react"

interface GameQuestion {
  id: number
  image: string
  correctAnswer: string
  options: string[]
  hint: string
}

interface ImageWordGameProps {
  onGameComplete: (results: GameResults) => void;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  studentName: string;
  roomCode: string;
}

interface GameResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  score: number;
  maxStreak: number;
}

const gameQuestions: Record<string, GameQuestion[]> = {
  easy: [
    {
      id: 1,
      image: "/gato-naranja-sentado.jpg",
      correctAnswer: "GATO",
      options: ["GATO", "PERRO", "PÁJARO"],
      hint: "Es un animal doméstico que dice 'miau'",
    },
    {
      id: 2,
      image: "/casa-azul-con-puerta-roja.jpg",
      correctAnswer: "CASA",
      options: ["CASA", "CARRO", "ÁRBOL"],
      hint: "Es donde vive la gente",
    },
    {
      id: 3,
      image: "/pelota-roja-redonda.jpg",
      correctAnswer: "PELOTA",
      options: ["PELOTA", "CUBO", "LIBRO"],
      hint: "Es redonda y se usa para jugar",
    },
    {
      id: 4,
      image: "/sol-amarillo-brillante.jpg",
      correctAnswer: "SOL",
      options: ["SOL", "LUNA", "ESTRELLA"],
      hint: "Nos da luz y calor durante el día",
    },
    {
      id: 5,
      image: "/flor-rosa-bonita.jpg",
      correctAnswer: "FLOR",
      options: ["FLOR", "HOJA", "RAMA"],
      hint: "Es bonita, colorida y huele bien",
    },
  ],
  medium: [
    {
      id: 1,
      image: "/mariposa-colorida-volando.jpg",
      correctAnswer: "MARIPOSA",
      options: ["MARIPOSA", "ABEJA", "LIBÉLULA", "MOSCA"],
      hint: "Es un insecto con alas coloridas",
    },
    {
      id: 2,
      image: "/elefante-gris-grande.jpg",
      correctAnswer: "ELEFANTE",
      options: ["ELEFANTE", "RINOCERONTE", "HIPOPÓTAMO", "JIRAFA"],
      hint: "Es un gran mamífero con trompa",
    },
    {
      id: 3,
      image: "/bicicleta-roja-con-ruedas.jpg",
      correctAnswer: "BICICLETA",
      options: ["BICICLETA", "MOTOCICLETA", "PATINETA", "TRICICLO"],
      hint: "Es un vehículo con dos ruedas que se pone en marcha con pedales",
    },
  ],
  hard: [
    {
      id: 1,
      image: "/telescopio-astron-mico-negro.jpg",
      correctAnswer: "TELESCOPIO",
      options: ["TELESCOPIO", "MICROSCOPIO", "BINOCULARES", "CÁMARA", "PERISCOPIO"],
      hint: "Es un instrumento usado para observar objetos lejanos",
    },
    {
      id: 2,
      image: "/orquesta-sinf-nica-instrumentos.jpg",
      correctAnswer: "ORQUESTA",
      options: ["ORQUESTA", "BANDA", "CORO", "CONJUNTO", "GRUPO"],
      hint: "Es un grupo de músicos que tocan diferentes instrumentos",
    },
  ],
}

export function ImageWordGame({ onGameComplete, difficulty, timeLimit, studentName, roomCode }: ImageWordGameProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [results, setResults] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    responseTimes: [] as number[],
  })
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [celebrationMode, setCelebrationMode] = useState(false)
  
  const [playCorrect] = useSound('/correct-answer.wav');
  const [playIncorrect] = useSound('/incorrect-answer.wav');

  const questions = gameQuestions[difficulty] || gameQuestions.easy
  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3001?roomCode=${roomCode}`);
    setWs(socket);

    return () => {
      socket.close();
    };
  }, [roomCode]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showFeedback) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeRemaining === 0) {
      handleTimeUp()
    }
  }, [timeRemaining, showFeedback])

  // Reset question timer
  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestion])

  const handleTimeUp = () => {
    if (!showFeedback) {
      setSelectedAnswer(null)
      setIsCorrect(false)
      setShowFeedback(true)
      setResults((prev) => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1,
        responseTimes: [...prev.responseTimes, 30], // Max time for unanswered
      }))
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'student-answered',
        payload: {
          studentName,
          answer,
        }
      }));
    }

    const responseTime = (Date.now() - questionStartTime) / 1000
    const correct = answer === currentQ.correctAnswer

    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
    }

    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak(Math.max(maxStreak, newStreak))

      // Celebration for streaks of 3+
      if (newStreak >= 3) {
        setCelebrationMode(true)
        setTimeout(() => setCelebrationMode(false), 2000)
      }
    } else {
      setStreak(0)
    }

    setResults((prev) => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: correct ? prev.incorrectAnswers : prev.incorrectAnswers + 1,
      responseTimes: [...prev.responseTimes, responseTime],
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setIsCorrect(false)
      setShowHint(false)
      setTimeRemaining(timeLimit)
    } else {
      // Game complete
      const averageTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
      const score = Math.round((results.correctAnswers / questions.length) * 100)

      onGameComplete({
        totalQuestions: questions.length,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        averageTime,
        score,
        maxStreak,
      })
    }
  }

  return (
    <GameLayout
      title="Asociación Imagen-Palabra"
      description={`Pregunta ${currentQuestion + 1} de ${questions.length}`}
      progress={progress}
      timeRemaining={timeRemaining}
      correctAnswers={results.correctAnswers}
      totalQuestions={questions.length}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">¿Qué ves en la imagen?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={currentQ.image || "/placeholder.svg"}
                  alt="Imagen del juego"
                  className={`w-64 h-64 object-cover rounded-lg border-4 border-mint transition-transform duration-300 ${
                    celebrationMode ? "scale-105" : "hover:scale-102"
                  }`}
                />
                {showFeedback && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    {isCorrect ? (
                      <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
                    ) : (
                      <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {!showFeedback && (
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="text-sm">
                  {showHint ? "Ocultar pista" : "💡 Ver pista"}
                </Button>
                {showHint && (
                  <p className="mt-2 text-sm text-muted-foreground bg-yellow-50 p-2 rounded">{currentQ.hint}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Selecciona la palabra correcta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, index) => {
              let buttonVariant: "default" | "destructive" | "secondary" = "secondary"
              let buttonClass = "w-full text-lg py-4 h-auto transition-all duration-200 hover:scale-105"

              if (showFeedback) {
                if (option === currentQ.correctAnswer) {
                  buttonVariant = "default"
                  buttonClass += " bg-green-500 hover:bg-green-600 text-white animate-pulse"
                } else if (option === selectedAnswer && !isCorrect) {
                  buttonVariant = "destructive"
                  buttonClass += " animate-shake"
                }
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                >
                  {option}
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <Card
          className={`${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} transition-all duration-500`}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <span className="text-2xl font-bold text-green-700">
                      {streak >= 3 ? "¡INCREÍBLE RACHA!" : "¡Correcto!"}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <span className="text-2xl font-bold text-red-700">Incorrecto</span>
                  </>
                )}
              </div>
              <p className="text-lg">
                {isCorrect
                  ? streak >= 3
                    ? `¡Fantástico! Llevas ${streak} respuestas correctas seguidas. ¡Sigue así!`
                    : "¡Excelente trabajo! Has seleccionado la respuesta correcta."
                  : `La respuesta correcta era: ${currentQ.correctAnswer}`}
              </p>
              <Button onClick={handleNextQuestion} size="lg" className="text-lg px-8 animate-bounce">
                {currentQuestion < questions.length - 1 ? "Siguiente Pregunta" : "Ver Resultados"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {celebrationMode && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
    </GameLayout>
  );
}
