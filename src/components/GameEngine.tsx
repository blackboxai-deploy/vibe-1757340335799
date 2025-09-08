'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { GameLogic, LEVEL_CONFIGS, ActivePowerUp } from '@/lib/gameLogic'
import { AudioManager } from '@/lib/audioManager'
import GameHUD from './GameHUD'

interface GameEngineProps {
  level: number
  onPause: () => void
  onGameOver: (score: number) => void
  onVictory: (score: number) => void
  onNextLevel: () => void
  onScoreUpdate: (score: number) => void
  currentScore: number
}

export default function GameEngine({
  level,
  onPause,
  onGameOver,
  onVictory,
  onNextLevel,
  onScoreUpdate,
  currentScore
}: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLogicRef = useRef<GameLogic | null>(null)
  const audioManagerRef = useRef<AudioManager | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef<number>(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameState, setGameState] = useState(() => ({
    score: currentScore,
    level: level,
    lives: 3,
    collectibles: { presents: 0, cakes: 0, balloons: 0 },
    activePowerUps: [] as ActivePowerUp[],
    gameTime: 0,
    paused: false
  }))
  
  // Canvas dimensions
  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 600
  
  // Initialize game systems
  useEffect(() => {
    if (!canvasRef.current) return
    
    // Initialize game logic
    gameLogicRef.current = new GameLogic(level, CANVAS_WIDTH, CANVAS_HEIGHT)
    gameLogicRef.current.gameState.score = currentScore
    
    // Initialize audio manager
    audioManagerRef.current = new AudioManager()
    audioManagerRef.current.startBackgroundMusic()
    
    // Start game loop
    startGameLoop()
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (audioManagerRef.current) {
        audioManagerRef.current.stopBackgroundMusic()
      }
    }
  }, [level, currentScore])
  
  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      keysRef.current.add(event.code)
      
      // Handle pause
      if (event.code === 'KeyP' || event.code === 'Escape') {
        onPause()
      }
    }
    
    const handleKeyUp = (event: KeyboardEvent) => {
      event.preventDefault()
      keysRef.current.delete(event.code)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onPause])
  
  // Touch input handling for mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()
      const touch = event.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      
      // Jump on tap
      keysRef.current.add('Space')
    }
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()
      if (!touchStartRef.current) return
      
      const touch = event.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      
      // Movement based on horizontal swipe
      if (Math.abs(deltaX) > 20) {
        keysRef.current.delete('ArrowLeft')
        keysRef.current.delete('ArrowRight')
        
        if (deltaX > 0) {
          keysRef.current.add('ArrowRight')
        } else {
          keysRef.current.add('ArrowLeft')
        }
      }
    }
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()
      keysRef.current.delete('Space')
      keysRef.current.delete('ArrowLeft')
      keysRef.current.delete('ArrowRight')
      touchStartRef.current = null
    }
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])
  
  const startGameLoop = useCallback(() => {
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      if (gameLogicRef.current && canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          // Handle input
          gameLogicRef.current.handleInput(keysRef.current)
          
          // Update game state
          const result = gameLogicRef.current.update(deltaTime)
          
          // Update local state
          setGameState({ ...gameLogicRef.current.gameState })
          
          // Handle score updates
          if (result.scoreUpdate !== currentScore) {
            onScoreUpdate(result.scoreUpdate)
          }
          
          // Handle audio feedback
          handleAudioFeedback()
          
          // Render game
          gameLogicRef.current.render(ctx)
          
          // Check end conditions
          if (result.gameOver) {
            if (audioManagerRef.current && soundEnabled) {
              audioManagerRef.current.stopBackgroundMusic()
              audioManagerRef.current.playGameOverSound()
            }
            onGameOver(result.scoreUpdate)
            return
          }
          
          if (result.levelComplete) {
            if (audioManagerRef.current && soundEnabled) {
              audioManagerRef.current.stopBackgroundMusic()
              if (level >= 3) {
                audioManagerRef.current.playBirthdayFanfare()
              } else {
                audioManagerRef.current.playLevelCompleteSound()
              }
            }
            
            if (level >= 3) {
              // Game completed - show victory with special birthday message
              setTimeout(() => onVictory(result.scoreUpdate), 1000)
            } else {
              // Continue to next level
              setTimeout(() => onNextLevel(), 1000)
            }
            return
          }
        }
      }
      
      animationIdRef.current = requestAnimationFrame(gameLoop)
    }
    
    animationIdRef.current = requestAnimationFrame(gameLoop)
  }, [level, currentScore, onGameOver, onVictory, onNextLevel, onScoreUpdate, soundEnabled])
  
  const handleAudioFeedback = useCallback(() => {
    if (!gameLogicRef.current || !audioManagerRef.current || !soundEnabled) return
    
    // This is a simplified audio feedback system
    // In a real implementation, you'd want to track what sounds have been played
    // to avoid repeating them every frame
    
    // Play jump sound when player is jumping (simplified check)
    if (keysRef.current.has('Space') && gameLogicRef.current.player.isGrounded) {
      audioManagerRef.current.playJumpSound()
    }
  }, [soundEnabled])
  
  const handlePauseClick = useCallback(() => {
    if (gameLogicRef.current) {
      gameLogicRef.current.pause()
    }
    if (audioManagerRef.current) {
      audioManagerRef.current.stopBackgroundMusic()
    }
    onPause()
  }, [onPause])
  
  const handleToggleSound = useCallback(() => {
    if (audioManagerRef.current) {
      const newSoundState = audioManagerRef.current.toggleSound()
      setSoundEnabled(newSoundState)
      
      if (newSoundState) {
        audioManagerRef.current.startBackgroundMusic()
      }
    }
  }, [])
  
  const levelConfig = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)]
  
  return (
    <div className="relative">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-purple-400 rounded-lg shadow-2xl bg-gradient-to-b from-sky-200 to-green-200 max-w-full h-auto"
        style={{
          imageRendering: 'pixelated', // Retro pixelated look
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Game HUD Overlay */}
      <GameHUD
        gameState={gameState}
        levelConfig={levelConfig}
        onPause={handlePauseClick}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
      
      {/* Birthday Messages */}
      {gameState.collectibles.presents === 23 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-pink-500 text-white text-2xl font-bold px-6 py-3 rounded-lg animate-bounce shadow-lg">
            🎉 23 PRESENTS - BIRTHDAY BONUS! 🎉
          </div>
        </div>
      )}
      
      {gameState.collectibles.cakes === 23 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-yellow-500 text-white text-2xl font-bold px-6 py-3 rounded-lg animate-bounce shadow-lg">
            🎂 23 CAKE SLICES - SWEET VICTORY! 🎂
          </div>
        </div>
      )}
      
      {gameState.collectibles.balloons === 23 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-blue-500 text-white text-2xl font-bold px-6 py-3 rounded-lg animate-bounce shadow-lg">
            🎈 23 BALLOONS - SKY HIGH! 🎈
          </div>
        </div>
      )}
      
      {/* Instructions for first-time players */}
      {gameState.gameTime < 5000 && level === 1 && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black bg-opacity-80 text-white text-center p-4 rounded-lg animate-pulse">
            <div className="text-lg font-bold mb-2">🎮 Welcome to Jam's Birthday Adventure! 🎂</div>
            <div className="text-sm space-y-1">
              <p>🎁 Collect presents, cake slices, and balloons!</p>
              <p>⭐ Use ARROW KEYS or WASD to move, SPACEBAR to jump</p>
              <p>❤️ Avoid obstacles to keep your 3 lives</p>
              <p>🎉 Get 23 of any item for birthday bonus points!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}