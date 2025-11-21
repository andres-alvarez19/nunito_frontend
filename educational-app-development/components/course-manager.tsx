"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react"

interface Course {
  id: string
  name: string
  description: string
  createdAt: string
  testSuites: number
}

export function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      name: "Español 3A",
      description: "Curso de lenguaje para 3er año básico",
      createdAt: "2024-01-15",
      testSuites: 3,
    },
    {
      id: "2",
      name: "Español 4B",
      description: "Curso de lenguaje para 4to año básico",
      createdAt: "2024-01-10",
      testSuites: 2,
    },
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseDesc, setNewCourseDesc] = useState("")

  const handleCreateCourse = () => {
    if (newCourseName) {
      const newCourse: Course = {
        id: Math.random().toString(),
        name: newCourseName,
        description: newCourseDesc,
        createdAt: new Date().toISOString().split("T")[0],
        testSuites: 0,
      }
      setCourses([...courses, newCourse])
      setNewCourseName("")
      setNewCourseDesc("")
      setIsCreating(false)
    }
  }

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id))
    if (selectedCourse === id) setSelectedCourse(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Mis Cursos</h3>
          <p className="text-sm text-muted-foreground">
            {courses.length} curso{courses.length !== 1 ? "s" : ""} disponible{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-muted/30 border-2">
          <CardHeader>
            <CardTitle>Crear Nuevo Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Nombre del Curso</label>
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Español 3A"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Descripción</label>
              <input
                type="text"
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe el curso"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateCourse} className="flex-1">
                Crear Curso
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline" className="flex-1 bg-transparent">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cursos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No hay cursos. Crea uno nuevo para comenzar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCourse === course.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                      <p className="text-xs mt-2 text-primary">
                        {course.testSuites} conjunto{course.testSuites !== 1 ? "s" : ""} de preguntas
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
