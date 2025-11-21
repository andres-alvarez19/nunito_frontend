"use client"

import { useState } from "react"
import { testSuitesController } from "@/controllers/testSuites"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Play } from "lucide-react"

interface TestSuite {
  id: number
  name: string
  description: string
  games: string[]
  createdAt: string
  status: "active" | "inactive"
}

interface TestSuiteManagerProps {
  onSelectTest?: (test: TestSuite) => void
}

export function TestSuiteManager({ onSelectTest }: TestSuiteManagerProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 1,
      name: "Prueba Fonológica Básica",
      description: "Prueba con los 4 juegos para evaluación inicial",
      games: ["image-word", "syllable"],
      createdAt: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Prueba Avanzada",
      description: "Prueba con enfoque en rimas y audio",
      games: ["rhyme", "audio"],
      createdAt: "2024-01-10",
      status: "inactive",
    },
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newTestName, setNewTestName] = useState("")
  const [newTestDesc, setNewTestDesc] = useState("")
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  const allGames = [
    { id: "image-word", name: "Asociación Imagen-Palabra" },
    { id: "syllable", name: "Conteo de Sílabas" },
    { id: "rhyme", name: "Identificación de Rimas" },
    { id: "audio", name: "Reconocimiento Auditivo" },
  ]

  const handleCreateTest = async () => {
    if (newTestName && selectedGames.length > 0) {
      try {
        // Aquí debes obtener el courseId de alguna forma, por ejemplo de props o contexto
        const courseId = "0ea633c2-1fba-49be-9e96-4640a8ebba83"; // Reemplaza por el valor real
        const payload = {
          name: newTestName,
          description: newTestDesc,
          courseId,
          games: selectedGames,
        };
        const createdTestSuite = await testSuitesController.create(payload);
        // Obtener el test suite completo usando el endpoint /api/test-suites/{testSuiteId}
        const fullTestSuite = await testSuitesController.getById(createdTestSuite.id);
        setTestSuites([...testSuites, {
          id: fullTestSuite.id,
          name: fullTestSuite.name,
          description: fullTestSuite.description || "",
          games: fullTestSuite.games || [],
          createdAt: fullTestSuite.createdAt,
          status: "active",
        }]);
        setNewTestName("");
        setNewTestDesc("");
        setSelectedGames([]);
        setIsCreating(false);
      } catch (error) {
        alert("Error al crear el conjunto de preguntas");
      }
    }
  }

  const handleDeleteTest = (id: number) => {
    setTestSuites(testSuites.filter((t) => t.id !== id))
  }

  const toggleGameSelection = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter((g) => g !== gameId))
    } else {
      setSelectedGames([...selectedGames, gameId])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Conjuntos de Preguntas</h3>
          <p className="text-sm text-muted-foreground">
            Cada conjunto contiene los 4 juegos con preguntas personalizadas
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Conjunto
        </Button>
      </div>

      {isCreating && (
        <Card className="bg-muted/30 border-2">
          <CardHeader>
            <CardTitle>Crear Nuevo Conjunto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Nombre del Conjunto</label>
              <input
                type="text"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Prueba Inicial"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Descripción</label>
              <input
                type="text"
                value={newTestDesc}
                onChange={(e) => setNewTestDesc(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe el propósito de este conjunto"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Selecciona los Juegos</label>
              <div className="space-y-2">
                {allGames.map((game) => (
                  <div key={game.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <input
                      type="checkbox"
                      id={game.id}
                      checked={selectedGames.includes(game.id)}
                      onChange={() => toggleGameSelection(game.id)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={game.id} className="flex-1 cursor-pointer">
                      {game.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateTest} className="flex-1">
                Crear Conjunto
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
          <CardTitle>Conjuntos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {testSuites.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No hay conjuntos disponibles. Crea uno nuevo.</p>
          ) : (
            <div className="space-y-3">
              {testSuites.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {test.games.map((gameId) => {
                        const gameName = allGames.find((g) => g.id === gameId)?.name || gameId
                        return (
                          <span key={gameId} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            {gameName}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onSelectTest?.(test)} className="bg-transparent">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteTest(test.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
