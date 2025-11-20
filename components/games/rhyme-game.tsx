"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import useSound from 'use-sound';
import { GameLayout } from "./game-layout";
import { CheckCircle, XCircle, Volume2 } from "lucide-react"

interface RhymeQuestion {
  id: number
  keyWord: string
  options: string[]
  correctRhymes: string[]
}

interface RhymeGameProps {
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

const gameQuestions: Record<string, RhymeQuestion[]> = {
  easy: [
    {
      id: 1,
      keyWord: "GATO",
      options: ["PATO", "CASA", "RATO", "FLOR"],
      correctRhymes: ["PATO", "RATO"],
    },
    {
      id: 2,
      keyWord: "SOL",
      options: ["GOL", "MAR", "COL", "PAN"],
      correctRhymes: ["GOL", "COL"],
    },
    {
      id: 3,
      keyWord: "FLOR",
      options: ["AMOR", "MESA", "COLOR", "GATO"],
      correctRhymes: ["AMOR", "COLOR"],
    },
    {
      id: 4,
      keyWord: "CASA",
      options: ["MASA", "PERRO", "PASA", "LIBRO"],
      correctRhymes: ["MASA", "PASA"],
    },
  ],
  medium: [
    {
      id: 1,
      keyWord: "CORAZÓN",
      options: ["RATÓN", "MESA", "CANCIÓN", "ÁRBOL", "LIMÓN"],
      correctRhymes: ["RATÓN", "CANCIÓN", "LIMÓN"],
    },
    {
      id: 2,
      keyWord: "MARIPOSA",
      options: ["HERMOSA", "GATO", "ROSA", "CASA", "ESPOSA"],
      correctRhymes: ["HERMOSA", "ROSA", "ESPOSA"],
    },
    {
      id: 3,
      keyWord: "VENTANA",
      options: ["MAÑANA", "PERRO", "CAMPANA", "LIBRO", "HERMANA"],
      correctRhymes: ["MAÑANA", "CAMPANA", "HERMANA"],
    },
  ],
  hard: [
    {
      id: 1,
      keyWord: "MARAVILLOSO",
      options: ["FABULOSO", "MESA", "HERMOSO", "GATO", "PODEROSO", "LIBRO"],
      correctRhymes: ["FABULOSO", "HERMOSO", "PODEROSO"],
    },
    {
      id: 2,
      keyWord: "EXTRAORDINARIO",
      options: ["ORDINARIO", "CASA", "NECESARIO", "PERRO", "VOLUNTARIO", "ÁRBOL"],
      correctRhymes: ["ORDINARIO", "NECESARIO", "VOLUNTARIO"],
    },
  ],
}

export function RhymeGame({ onGameComplete, difficulty, timeLimit, studentName, roomCode }: RhymeGameProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [results, setResults] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    responseTimes: [] as number[],
  })
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [celebrationMode, setCelebrationMode] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [rhymeAnimation, setRhymeAnimation] = useState(false)

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

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestion])

  const handleTimeUp = () => {
    if (!showFeedback) {
      handleSubmitAnswer()
    }
  }

  const handleAnswerToggle = (answer: string) => {
    if (showFeedback) return

    setSelectedAnswers((prev) => {
      if (prev.includes(answer)) {
        return prev.filter((a) => a !== answer)
      } else {
        return [...prev, answer]
      }
    })
  }

  const handleSubmitAnswer = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'student-answered',
        payload: {
          studentName,
          answer: selectedAnswers,
        }
      }));
    }

    const responseTime = (Date.now() - questionStartTime) / 1000

    const correctSelections = selectedAnswers.filter((answer) => currentQ.correctRhymes.includes(answer))
    const incorrectSelections = selectedAnswers.filter((answer) => !currentQ.correctRhymes.includes(answer))

    const isCorrect = correctSelections.length === currentQ.correctRhymes.length && incorrectSelections.length === 0

    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }

    setShowFeedback(true)
    setRhymeAnimation(true)

    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak(Math.max(maxStreak, newStreak))

      if (newStreak >= 3) {
        setCelebrationMode(true)
        setTimeout(() => setCelebrationMode(false), 2000)
      }
    } else {
      setStreak(0)
    }

    setResults((prev) => ({
      ...prev,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: isCorrect ? prev.incorrectAnswers : prev.incorrectAnswers + 1,
      responseTimes: [...prev.responseTimes, responseTime],
    }))

    setTimeout(() => setRhymeAnimation(false), 1000)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswers([])
      setShowFeedback(false)
      setShowHint(false)
      setTimeRemaining(timeLimit)
    } else {
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

  const pronounceWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentQ.keyWord)
      utterance.lang = "es-ES"
      utterance.rate = 0.7
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const getButtonVariant = (option: string) => {
    if (!showFeedback) {
      return selectedAnswers.includes(option) ? "default" : "secondary"
    }

    if (currentQ.correctRhymes.includes(option)) {
      return "default"
    } else if (selectedAnswers.includes(option)) {
      return "destructive"
    }
    return "secondary"
  }

  const getButtonClass = (option: string) => {
    let baseClass = "w-full text-lg py-4 h-auto transition-all duration-200 hover:scale-105"

    if (showFeedback) {
      if (currentQ.correctRhymes.includes(option)) {
        baseClass += " bg-green-500 hover:bg-green-600 text-white animate-pulse"
      } else if (selectedAnswers.includes(option)) {
        baseClass += " animate-shake"
      }
    }

    return baseClass
  }

  const isCorrectAnswer =
    selectedAnswers.filter((answer) => currentQ.correctRhymes.includes(answer)).length ===
      currentQ.correctRhymes.length &&
    selectedAnswers.filter((answer) => !currentQ.correctRhymes.includes(answer)).length === 0

  return (
    <GameLayout
      title="Identificación de Rimas"
      description={`Pregunta ${currentQuestion + 1} de ${questions.length}`}
      progress={progress}
      timeRemaining={timeRemaining}
      correctAnswers={results.correctAnswers}
      totalQuestions={questions.length}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Word */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Volume2 className="h-6 w-6" />
              Palabra clave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div
                className={`bg-violet text-violet-on rounded-lg p-8 mb-4 transition-transform duration-300 ${
                  celebrationMode ? "scale-105" : "hover:scale-102"
                }`}
              >
                <span className="text-6xl font-bold">{currentQ.keyWord}</span>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={pronounceWord} className="mr-2 bg-transparent">
                  <Volume2 className="h-4 w-4 mr-1" />
                  Escuchar
                </Button>
                {!showFeedback && (
                  <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                    {showHint ? "Ocultar pista" : "💡 Ver pista"}
                  </Button>
                )}
              </div>
              {showHint && !showFeedback && (
                <p className="mt-2 text-sm text-muted-foreground bg-yellow-50 p-2 rounded">
                  Las palabras que riman terminan con sonidos similares
                </p>
              )}
              <p className="text-lg text-muted-foreground mt-4">
                Encuentra todas las palabras que rimen con "{currentQ.keyWord}"
              </p>
            </div>
            {showFeedback && (
              <div className="text-center space-y-4">
                <h4 className="text-lg font-semibold">Respuestas correctas:</h4>
                <div className="flex justify-center gap-2 flex-wrap">
                  {currentQ.correctRhymes.map((rhyme, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-lg px-3 py-2 bg-green-100 transition-all duration-300 ${
                        rhymeAnimation ? "animate-bounce" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {rhyme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Selecciona las palabras que riman</CardTitle>
            <CardDescription className="text-center">Puedes seleccionar más de una opción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, index) => {
              let buttonClass = "w-full text-lg py-4 h-auto transition-all duration-200 hover:scale-105"

              if (showFeedback) {
                if (currentQ.correctRhymes.includes(option)) {
                  buttonClass += " bg-green-500 hover:bg-green-600 text-white animate-pulse"
                } else if (selectedAnswers.includes(option)) {
                  buttonClass += " animate-shake"
                }
              }

              return (
                <Button
                  key={index}
                  variant={getButtonVariant(option)}
                  className={buttonClass}
                  onClick={() => handleAnswerToggle(option)}
                  disabled={showFeedback}
                >
                  {option}
                  {selectedAnswers.includes(option) && !showFeedback && <CheckCircle className="h-5 w-5 ml-2" />}
                </Button>
              )
            })}
            {!showFeedback && selectedAnswers.length > 0 && (
              <Button onClick={handleSubmitAnswer} className="w-full mt-4 animate-bounce" size="lg">
                Confirmar Respuesta ({selectedAnswers.length} seleccionada
                {selectedAnswers.length !== 1 ? "s" : ""})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <Card
          className={`${isCorrectAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} transition-all duration-500`}
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {isCorrectAnswer ? (
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
                {isCorrectAnswer
                  ? streak >= 3
                    ? `¡Fantástico! Llevas ${streak} respuestas correctas seguidas. ¡Sigue así!`
                    : `¡Excelente! Has encontrado todas las palabras que riman con "${currentQ.keyWord}".`
                  : `Las palabras que riman con "${currentQ.keyWord}" son: ${currentQ.correctRhymes.join(", ")}.`}
              </p>
              <Button onClick={handleNextQuestion} size="lg" className="text-lg px-8 animate-bounce">
                {currentQuestion < questions.length - 1 ? "Siguiente Pregunta" : "Ver Resultados"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Celebration Overlay */}
      {celebrationMode && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
    </GameLayout>
  );
}
