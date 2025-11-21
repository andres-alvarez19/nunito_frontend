"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuestionForm } from "./question-form"

interface QuestionEditorModalProps {
  isOpen: boolean
  gameType: "image-word" | "syllable" | "rhyme" | "audio"
  question?: any
  isEditing?: boolean
  onSubmit: (data: any) => void
  onClose: () => void
}

export function QuestionEditorModal({
  isOpen,
  gameType,
  question,
  isEditing,
  onSubmit,
  onClose,
}: QuestionEditorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
        </DialogHeader>
        <QuestionForm
          gameType={gameType}
          initialData={question}
          isEditing={isEditing}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
