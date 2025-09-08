'use client'

import { useState, useEffect } from 'react'
import GameEngine from '@/components/GameEngine'
import GameMenu from '@/components/GameMenu'

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'victory'>('menu')
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(0)

  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('jam-birthday-highscore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  // Save high score when score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('jam-birthday-highscore', score.toString())
    }
  }, [score, highScore])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setLevel(1)
  }

  const pauseGame = () => {
    setGameState('paused')
  }

  const resumeGame = () => {
    setGameState('playing')
  }

  const gameOver = (finalScore: number) => {
    setScore(finalScore)
    setGameState('gameOver')
  }

  const victory = (finalScore: number) => {
    setScore(finalScore)
    setGameState('victory')
  }

  const nextLevel = () => {
    setLevel(prev => prev + 1)
    setGameState('playing')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px]">
      {gameState === 'menu' && (
        <GameMenu
          type="start"
          onStart={startGame}
          highScore={highScore}
        />
      )}
      
      {gameState === 'playing' && (
        <GameEngine
          level={level}
          onPause={pauseGame}
          onGameOver={gameOver}
          onVictory={victory}
          onNextLevel={nextLevel}
          onScoreUpdate={setScore}
          currentScore={score}
        />
      )}
      
      {gameState === 'paused' && (
        <GameMenu
          type="pause"
          onResume={resumeGame}
          onRestart={startGame}
          currentScore={score}
        />
      )}
      
      {gameState === 'gameOver' && (
        <GameMenu
          type="gameOver"
          onRestart={startGame}
          currentScore={score}
          highScore={highScore}
        />
      )}
      
      {gameState === 'victory' && (
        <GameMenu
          type="victory"
          onRestart={startGame}
          onNextLevel={nextLevel}
          currentScore={score}
          highScore={highScore}
          level={level}
        />
      )}
    </div>
  )
}