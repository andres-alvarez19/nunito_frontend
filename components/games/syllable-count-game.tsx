"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Star, Hash, Volume2 } from "lucide-react"

interface SyllableQuestion {
  id: number
  word: string
  syllables: string[]
  correctCount: number
  options: number[]
}

interface SyllableCountGameProps {
  onGameComplete: (results: GameResults) => void
  difficulty: "easy" | "medium" | "hard"
  timeLimit: number
}

interface GameResults {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  averageTime: number
  score: number
  maxStreak: number
}

const gameQuestions: Record<string, SyllableQuestion[]> = {
  easy: [
    {
      id: 1,
      word: "CASA",
      syllables: ["CA", "SA"],
      correctCount: 2,
      options: [1, 2, 3],
    },
    {
      id: 2,
      word: "GATO",
      syllables: ["GA", "TO"],
      correctCount: 2,
      options: [1, 2, 3],
    },
    {
      id: 3,
      word: "SOL",
      syllables: ["SOL"],
      correctCount: 1,
      options: [1, 2, 3],
    },
    {
      id: 4,
      word: "PELOTA",
      syllables: ["PE", "LO", "TA"],
      correctCount: 3,
      options: [1, 2, 3],
    },
    {
      id: 5,
      word: "FLOR",
      syllables: ["FLOR"],
      correctCount: 1,
      options: [1, 2, 3],
    },
  ],
  medium: [
    {
      id: 1,
      word: "MARIPOSA",
      syllables: ["MA", "RI", "PO", "SA"],
      correctCount: 4,
      options: [2, 3, 4, 5],
    },
    {
      id: 2,
      word: "ELEFANTE",
      syllables: ["E", "LE", "FAN", "TE"],
      correctCount: 4,
      options: [2, 3, 4, 5],
    },
    {
      id: 3,
      word: "BICICLETA",
      syllables: ["BI", "CI", "CLE", "TA"],
      correctCount: 4,
      options: [2, 3, 4, 5],
    },
    {
      id: 4,
      word: "COMPUTADORA",
      syllables: ["COM", "PU", "TA", "DO", "RA"],
      correctCount: 5,
      options: [3, 4, 5, 6],
    },
  ],
  hard: [
    {
      id: 1,
      word: "REFRIGERADOR",
      syllables: ["RE", "FRI", "GE", "RA", "DOR"],
      correctCount: 5,
      options: [3, 4, 5, 6],
    },
    {
      id: 2,
      word: "EXTRAORDINARIO",
      syllables: ["EX", "TRAOR", "DI", "NA", "RIO"],
      correctCount: 5,
      options: [4, 5, 6, 7],
    },
    {
      id: 3,
      word: "RESPONSABILIDAD",
      syllables: ["RES", "PON", "SA", "BI", "LI", "DAD"],
      correctCount: 6,
      options: [4, 5, 6, 7],
    },
  ],
}

export function SyllableCountGame({ onGameComplete, difficulty, timeLimit }: SyllableCountGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSyllables, setShowSyllables] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
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
  const [syllableAnimation, setSyllableAnimation] = useState(false)

  const questions = gameQuestions[difficulty] || gameQuestions.easy
  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

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
      setSelectedAnswer(null)
      setIsCorrect(false)
      setShowFeedback(true)
      setShowSyllables(true)
      setResults((prev) => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1,
        responseTimes: [...prev.responseTimes, 30],
      }))
    }
  }

  const handleAnswerSelect = (answer: number) => {
    if (showFeedback) return

    const responseTime = (Date.now() - questionStartTime) / 1000
    const correct = answer === currentQ.correctCount

    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setShowFeedback(true)
    setShowSyllables(true)
    setSyllableAnimation(true)

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

    setTimeout(() => setSyllableAnimation(false), 1000)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setShowSyllables(false)
      setIsCorrect(false)
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
      const utterance = new SpeechSynthesisUtterance(currentQ.word)
      utterance.lang = "es-ES"
      utterance.rate = 0.7
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={`min-h-screen bg-pastel-container p-4 transition-all duration-500 ${celebrationMode ? "animate-pulse" : ""}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-pastel text-pastel-on">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Conteo de Sílabas</CardTitle>
                <CardDescription className="text-pastel-on/80">
                  Pregunta {currentQuestion + 1} de {questions.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(timeRemaining)}
                </Badge>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  {results.correctAnswers}/{questions.length}
                </Badge>
                {streak > 0 && (
                  <Badge
                    className={`text-lg px-3 py-1 ${streak >= 3 ? "bg-yellow-500 animate-bounce" : "bg-blue-500"}`}
                  >
                    🔥 {streak}
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">¿Cuántas sílabas tiene esta palabra?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div
                  className={`bg-pastel text-pastel-on rounded-lg p-8 mb-4 transition-transform duration-300 ${
                    celebrationMode ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <span className="text-6xl font-bold">{currentQ.word}</span>
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
                    Separa la palabra en partes pequeñas que puedas pronunciar de una vez
                  </p>
                )}
              </div>

              {showSyllables && (
                <div className="text-center space-y-4">
                  <h4 className="text-lg font-semibold">División silábica:</h4>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {currentQ.syllables.map((syllable, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-lg px-3 py-2 transition-all duration-300 ${
                          syllableAnimation ? "animate-bounce" : ""
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {syllable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Hash className="h-6 w-6" />
                Número de sílabas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQ.options.map((option, index) => {
                let buttonVariant: "default" | "destructive" | "secondary" = "secondary"
                let buttonClass = "w-full text-2xl py-6 h-auto font-bold transition-all duration-200 hover:scale-105"

                if (showFeedback) {
                  if (option === currentQ.correctCount) {
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
                    {option} {option === 1 ? "sílaba" : "sílabas"}
                  </Button>
                )
              })}
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
                      : `¡Excelente! La palabra "${currentQ.word}" tiene ${currentQ.correctCount} ${
                          currentQ.correctCount === 1 ? "sílaba" : "sílabas"
                        }.`
                    : `La palabra "${currentQ.word}" tiene ${currentQ.correctCount} ${
                        currentQ.correctCount === 1 ? "sílaba" : "sílabas"
                      }.`}
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
      </div>
    </div>
  )
}
