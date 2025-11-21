"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

interface QuestionFormProps {
  gameType: "image-word" | "syllable" | "rhyme" | "audio"
  initialData?: any
  isEditing?: boolean
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function QuestionForm({ gameType, initialData, isEditing, onSubmit, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState(initialData || getInitialData(gameType))
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)

  function getInitialData(type: string) {
    switch (type) {
      case "image-word":
        return { text: "", correctAnswer: "", options: ["", "", ""], imageFile: null, difficulty: "easy", hint: "" }
      case "syllable":
        return { word: "", syllables: "", correctCount: 0, difficulty: "easy", hint: "" }
      case "rhyme":
        return { mainWord: "", correctAnswer: "", options: ["", "", ""], imageFile: null, difficulty: "easy", hint: "" }
      case "audio":
        return { audioText: "", correctAnswer: "", options: ["", "", ""], difficulty: "easy", hint: "" }
      default:
        return {}
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <Card className="bg-muted/30 border-2">
      <CardHeader>
        <CardTitle className="text-lg">{isEditing ? "Editar Pregunta" : "Nueva Pregunta"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(gameType === "image-word" || gameType === "rhyme") && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {gameType === "image-word" ? "¿Qué palabra está en la imagen?" : "Palabra principal para rimas"}
              </label>
              <input
                type="text"
                value={formData.text || formData.mainWord || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [gameType === "image-word" ? "text" : "mainWord"]: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa la palabra"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Respuesta Correcta</label>
              <input
                type="text"
                value={formData.correctAnswer || ""}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa la respuesta correcta"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Opciones de Respuesta</label>
              <div className="space-y-2">
                {(formData.options || []).map((option: string, index: number) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])]
                      newOptions[index] = e.target.value
                      setFormData({ ...formData, options: newOptions })
                    }}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Opción ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Subir Imagen</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <Upload className="h-4 w-4" />
                  Seleccionar imagen
                </label>
              </div>
              {imagePreview && (
                <div className="mt-3 relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null)
                      setFormData({ ...formData, imageFile: null })
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Pista (Opcional)</label>
              <input
                type="text"
                value={formData.hint || ""}
                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa una pista para ayudar al estudiante"
              />
            </div>
          </>
        )}
        {gameType === "syllable" && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">Palabra</label>
              <input
                type="text"
                value={formData.word || ""}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa la palabra"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Sílabas (separadas por guiones)</label>
              <input
                type="text"
                value={formData.syllables || ""}
                onChange={(e) => setFormData({ ...formData, syllables: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: CA-SA"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Cantidad de Sílabas</label>
              <input
                type="number"
                value={formData.correctCount || 0}
                onChange={(e) => setFormData({ ...formData, correctCount: Number.parseInt(e.target.value) })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Pista (Opcional)</label>
              <input
                type="text"
                value={formData.hint || ""}
                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Pronuncia la palabra lentamente"
              />
            </div>
          </>
        )}
        {gameType === "audio" && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">Texto a Escuchar</label>
              <input
                type="text"
                value={formData.audioText || ""}
                onChange={(e) => setFormData({ ...formData, audioText: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa el texto que será pronunciado"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Respuesta Correcta</label>
              <input
                type="text"
                value={formData.correctAnswer || ""}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa la respuesta correcta"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Opciones de Respuesta</label>
              <div className="space-y-2">
                {(formData.options || []).map((option: string, index: number) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])]
                      newOptions[index] = e.target.value
                      setFormData({ ...formData, options: newOptions })
                    }}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={`Opción ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Pista (Opcional)</label>
              <input
                type="text"
                value={formData.hint || ""}
                onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ingresa una pista para ayudar al estudiante"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-sm font-medium block mb-2">Nivel de Dificultad</label>
          <select
            value={formData.difficulty || "easy"}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            {isEditing ? "Guardar Cambios" : "Agregar Pregunta"}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
