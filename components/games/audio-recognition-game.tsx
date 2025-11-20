"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { GameLayout } from "./game-layout";
import { CheckCircle, XCircle, Volume2, Play, Pause } from "lucide-react"

interface AudioQuestion {
  id: number
  audioWord: string
  options: string[]
  correctAnswer: string
}

interface AudioRecognitionGameProps {
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

const gameQuestions: Record<string, AudioQuestion[]> = {
  easy: [
    {
      id: 1,
      audioWord: "GATO",
      options: ["GATO", "PATO", "RATO"],
      correctAnswer: "GATO",
    },
    {
      id: 2,
      audioWord: "CASA",
      options: ["CASA", "MASA", "PASA"],
      correctAnswer: "CASA",
    },
    {
      id: 3,
      audioWord: "SOL",
      options: ["SOL", "GOL", "COL"],
      correctAnswer: "SOL",
    },
    {
      id: 4,
      audioWord: "FLOR",
      options: ["FLOR", "AMOR", "COLOR"],
      correctAnswer: "FLOR",
    },
    {
      id: 5,
      audioWord: "PELOTA",
      options: ["PELOTA", "COMETA", "GALLETA"],
      correctAnswer: "PELOTA",
    },
  ],
  medium: [
    {
      id: 1,
      audioWord: "MARIPOSA",
      options: ["MARIPOSA", "HERMOSA", "ESPOSA", "ROSA"],
      correctAnswer: "MARIPOSA",
    },
    {
      id: 2,
      audioWord: "ELEFANTE",
      options: ["ELEFANTE", "GIGANTE", "ESTUDIANTE", "IMPORTANTE"],
      correctAnswer: "ELEFANTE",
    },
    {
      id: 3,
      audioWord: "BICICLETA",
      options: ["BICICLETA", "COMETA", "GALLETA", "MALETA"],
      correctAnswer: "BICICLETA",
    },
    {
      id: 4,
      audioWord: "COMPUTADORA",
      options: ["COMPUTADORA", "LAVADORA", "GRABADORA", "CALCULADORA"],
      correctAnswer: "COMPUTADORA",
    },
  ],
  hard: [
    {
      id: 1,
      audioWord: "REFRIGERADOR",
      options: ["REFRIGERADOR", "COMPUTADOR", "TELEVISOR", "PROCESADOR", "GENERADOR"],
      correctAnswer: "REFRIGERADOR",
    },
    {
      id: 2,
      audioWord: "EXTRAORDINARIO",
      options: ["EXTRAORDINARIO", "ORDINARIO", "NECESARIO", "VOLUNTARIO", "UNIVERSITARIO"],
      correctAnswer: "EXTRAORDINARIO",
    },
    {
      id: 3,
      audioWord: "RESPONSABILIDAD",
      options: ["RESPONSABILIDAD", "POSIBILIDAD", "HABILIDAD", "FACILIDAD", "MOVILIDAD"],
      correctAnswer: "RESPONSABILIDAD",
    },
  ],
}

export function AudioRecognitionGame({ onGameComplete, difficulty, timeLimit, studentName, roomCode }: AudioRecognitionGameProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false)
  const [results, setResults] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    responseTimes: [] as number[],
  })
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [celebrationMode, setCelebrationMode] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [audioWaveAnimation, setAudioWaveAnimation] = useState(false)

  const correctAudio = typeof Audio !== 'undefined' ? new Audio('/correct-answer.wav') : null;
  const incorrectAudio = typeof Audio !== 'undefined' ? new Audio('/incorrect-answer.wav') : null;

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
    setHasPlayedAudio(false)
    setTimeout(() => {
      playAudio()
    }, 1000)
  }, [currentQuestion])

  const handleTimeUp = () => {
    if (!showFeedback) {
      setSelectedAnswer(null)
      setIsCorrect(false)
      setShowFeedback(true)
      setResults((prev) => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1,
        responseTimes: [...prev.responseTimes, 30],
      }))
    }
  }

  const playAudio = () => {
    setIsPlaying(true)
    setHasPlayedAudio(true)
    setPlayCount((prev) => prev + 1)
    setAudioWaveAnimation(true)

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentQ.audioWord)
      utterance.lang = "es-ES"
      utterance.rate = 0.8
      utterance.pitch = 1.2

      utterance.onend = () => {
        setIsPlaying(false)
        setAudioWaveAnimation(false)
      }

      speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => {
        setIsPlaying(false)
        setAudioWaveAnimation(false)
      }, 2000)
    }
  }

  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
    setIsPlaying(false)
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

    if (correct && correctAudio) {
      correctAudio.play();
    } else if (incorrectAudio) {
      incorrectAudio.play();
    }

    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
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
      setPlayCount(0)
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

  return (
    <GameLayout
      title="Reconocimiento Auditivo"
      description={`Pregunta ${currentQuestion + 1} de ${questions.length}`}
      progress={progress}
      timeRemaining={timeRemaining}
      correctAnswers={results.correctAnswers}
      totalQuestions={questions.length}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Volume2 className="h-6 w-6" />
              Escucha la palabra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div
                className={`bg-blue text-blue-on rounded-full w-32 h-32 mx-auto flex items-center justify-center mb-6 transition-all duration-300 ${
                  celebrationMode ? "scale-110" : audioWaveAnimation ? "scale-105" : "hover:scale-102"
                }`}
              >
                {isPlaying ? (
                  <div className="animate-pulse">
                    <Volume2 className={`h-16 w-16 ${audioWaveAnimation ? "animate-bounce" : ""}`} />
                  </div>
                ) : (
                  <Volume2 className="h-16 w-16" />
                )}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={isPlaying ? stopAudio : playAudio}
                  size="lg"
                  className="text-lg px-8 transition-all duration-200 hover:scale-105"
                  disabled={showFeedback}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Detener
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      {hasPlayedAudio ? `Repetir (${playCount})` : "Reproducir"}
                    </>
                  )}
                </Button>

                <p className="text-muted-foreground">
                  {hasPlayedAudio
                    ? `Puedes reproducir el audio las veces que necesites (${playCount} ${playCount === 1 ? "vez" : "veces"})`
                    : "Haz clic para escuchar la palabra"}
                </p>
              </div>
            </div>

            {showFeedback && (
              <div className="text-center space-y-4 p-4 bg-muted rounded-lg">
                <h4 className="text-lg font-semibold">La palabra era:</h4>
                <div className="bg-blue text-blue-on rounded-lg p-4">
                  <span className="text-3xl font-bold">{currentQ.correctAnswer}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">¿Qué palabra escuchaste?</CardTitle>
            <CardDescription className="text-center">Selecciona la opción correcta</CardDescription>
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
                  disabled={showFeedback || !hasPlayedAudio}
                >
                  {option}
                </Button>
              )
            })}

            {!hasPlayedAudio && (
              <p className="text-center text-muted-foreground text-sm mt-4">
                Primero debes escuchar el audio para poder responder
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
                    : `¡Excelente! Identificaste correctamente la palabra "${currentQ.correctAnswer}".`
                  : `La palabra correcta era "${currentQ.correctAnswer}".`}
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
