"use client"
import { ImageWordGame } from "./games/image-word-game"
import { SyllableCountGame } from "./games/syllable-count-game"
import { RhymeGame } from "./games/rhyme-game"
import { AudioRecognitionGame } from "./games/audio-recognition-game"

interface GameLauncherProps {
  gameId: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  onGameComplete: (results: GameResults) => void;
  onBack: () => void;
  studentName: string;
  roomCode: string;
}

interface GameResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  score: number;
}

export function GameLauncher({ gameId, difficulty, timeLimit, onGameComplete, onBack, studentName, roomCode }: GameLauncherProps) {
  const renderGame = () => {
    const gameProps = {
      difficulty,
      timeLimit: timeLimit * 60, // Convert minutes to seconds
      onGameComplete,
      studentName,
      roomCode,
    };

    switch (gameId) {
      case "image-word":
        return <ImageWordGame {...gameProps} />;
      case "syllable-count":
        return <SyllableCountGame {...gameProps} />;
      case "rhyme-identification":
        return <RhymeGame {...gameProps} />;
      case "audio-recognition":
        return <AudioRecognitionGame {...gameProps} />;
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Juego no encontrado</h2>
              <button onClick={onBack} className="text-primary hover:underline">
                Volver
              </button>
            </div>
          </div>
        );
    }
  };

  return renderGame();
}
