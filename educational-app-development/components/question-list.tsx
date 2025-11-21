"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2 } from "lucide-react"

interface Question {
  id: number
  text: string
  answer?: string
  options?: string[]
  image?: string
}

interface QuestionListProps {
  questions: Question[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="font-medium">No hay preguntas aún</p>
        <p className="text-sm">Comienza agregando la primera pregunta</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-lg">Preguntas ({questions.length})</h4>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Question Number and Text */}
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="text-base font-semibold">
                      {index + 1}
                    </Badge>
                    <p className="font-medium text-lg">{question.text}</p>
                  </div>

                  {/* Image Preview */}
                  {question.image && (
                    <div className="mb-3">
                      <img
                        src={question.image || "/placeholder.svg"}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="mb-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-semibold">Respuesta Correcta</p>
                    <p className="font-semibold text-foreground">{question.answer}</p>
                  </div>

                  {/* Answer Options */}
                  {question.options && question.options.length > 0 && (
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-2">Opciones de Respuesta</p>
                      <div className="flex flex-wrap gap-2">
                        {question.options.map((option, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => onEdit(question.id)} className="bg-transparent">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
