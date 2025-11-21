"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { QuestionEditorModal } from "./question-editor-modal"

interface Question {
  id: number
  [key: string]: any
}

interface GameQuestionEditorProps {
  gameType: "image-word" | "syllable" | "rhyme" | "audio"
  gameTitle: string
}

export function GameQuestionEditor({ gameType, gameTitle }: GameQuestionEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "Pregunta de ejemplo 1",
      correctAnswer: "Respuesta 1",
      options: ["Opción 1", "Opción 2"],
      difficulty: "easy",
    },
    {
      id: 2,
      text: "Pregunta de ejemplo 2",
      correctAnswer: "Respuesta 2",
      options: ["Opción 1", "Opción 2"],
      difficulty: "medium",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const handleAddQuestion = (formData: any) => {
    const newQuestion: Question = { id: Math.max(...questions.map((q) => q.id), 0) + 1, ...formData }
    setQuestions([...questions, newQuestion])
    setIsModalOpen(false)
    setEditingQuestion(null)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setIsModalOpen(true)
  }

  const handleSaveEdit = (formData: any) => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? { ...q, ...formData } : q)))
      setIsModalOpen(false)
      setEditingQuestion(null)
    }
  }

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingQuestion(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{gameTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} pregunta{questions.length !== 1 ? "s" : ""} disponible{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Pregunta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preguntas</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No hay preguntas disponibles. Crea una nueva.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 cursor-pointer" onClick={() => handleEditQuestion(question)}>
                    <p className="font-medium">
                      {index + 1}. {question.text || question.word || question.audioText || question.mainWord}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Respuesta: <span className="font-semibold text-green-600">{question.correctAnswer}</span>
                      {" • "}
                      Dificultad:{" "}
                      <span
                        className={`font-semibold ${question.difficulty === "easy" ? "text-green-600" : question.difficulty === "medium" ? "text-blue-600" : "text-red-600"}`}
                      >
                        {question.difficulty === "easy"
                          ? "Fácil"
                          : question.difficulty === "medium"
                            ? "Medio"
                            : "Difícil"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditQuestion(question)}
                      className="bg-transparent"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuestionEditorModal
        isOpen={isModalOpen}
        gameType={gameType}
        question={editingQuestion}
        isEditing={!!editingQuestion}
        onSubmit={editingQuestion ? handleSaveEdit : handleAddQuestion}
        onClose={handleCloseModal}
      />
    </div>
  )
}
