'use client'

import { GameState, ActivePowerUp, LevelConfig } from '@/lib/gameLogic'

interface GameHUDProps {
  gameState: GameState
  levelConfig: LevelConfig
  onPause: () => void
  soundEnabled: boolean
  onToggleSound: () => void
}

export default function GameHUD({ 
  gameState, 
  levelConfig, 
  onPause, 
  soundEnabled, 
  onToggleSound 
}: GameHUDProps) {
  
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const PowerUpIndicator = ({ powerUp }: { powerUp: ActivePowerUp }) => {
    const progress = (powerUp.remainingTime / powerUp.totalDuration) * 100
    const timeLeft = Math.ceil(powerUp.remainingTime / 1000)
    
    const getIcon = (type: string) => {
      switch (type) {
        case 'speed': return '⚡'
        case 'shield': return '🛡️'
        case 'superjump': return '🚀'
        default: return '✨'
      }
    }
    
    const getColor = (type: string) => {
      switch (type) {
        case 'speed': return 'bg-yellow-500'
        case 'shield': return 'bg-blue-500'
        case 'superjump': return 'bg-green-500'
        default: return 'bg-purple-500'
      }
    }
    
    return (
      <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-2 py-1">
        <span className="text-lg">{getIcon(powerUp.type)}</span>
        <div className="flex flex-col">
          <div className="text-xs font-bold text-white uppercase">{powerUp.type}</div>
          <div className="w-16 h-1 bg-gray-600 rounded">
            <div 
              className={`h-full rounded ${getColor(powerUp.type)} transition-all duration-100`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-white">{timeLeft}s</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD Bar */}
      <div className="flex justify-between items-start p-4 pointer-events-auto">
        {/* Left Side - Score and Lives */}
        <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white font-mono">
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-xs text-gray-300">SCORE</div>
              <div className="text-2xl font-bold text-yellow-400">
                {gameState.score.toLocaleString()}
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-600"></div>
            
            <div>
              <div className="text-xs text-gray-300">LIVES</div>
              <div className="flex space-x-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <span 
                    key={i}
                    className={`text-2xl ${i < gameState.lives ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Level and Controls */}
        <div className="flex flex-col space-y-2">
          {/* Level Info */}
          <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white font-mono text-center">
            <div className="text-xs text-gray-300">LEVEL {gameState.level}</div>
            <div className="text-lg font-bold text-purple-400">{levelConfig.name}</div>
            <div className="text-xs text-gray-300">
              TIME: {formatTime(gameState.gameTime)}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={onPause}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              ⏸️ PAUSE
            </button>
            
            <button
              onClick={onToggleSound}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                soundEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom HUD Bar - Collectibles Progress */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-80 rounded-lg p-4 text-white font-mono">
          <div className="text-center text-sm text-gray-300 mb-2">🎂 BIRTHDAY COLLECTION PROGRESS 🎂</div>
          
          <div className="flex space-x-6 justify-center">
            {/* Presents */}
            <div className="text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="text-sm text-gray-300">PRESENTS</div>
              <div className="text-lg font-bold">
                <span className={gameState.collectibles.presents >= levelConfig.requiredCollectibles.presents ? 'text-green-400' : 'text-yellow-400'}>
                  {gameState.collectibles.presents}
                </span>
                <span className="text-gray-500">/{levelConfig.requiredCollectibles.presents}</span>
              </div>
              {gameState.collectibles.presents === 23 && (
                <div className="text-xs text-pink-400 font-bold animate-pulse">🎉 BIRTHDAY BONUS! 🎉</div>
              )}
            </div>
            
            {/* Cakes */}
            <div className="text-center">
              <div className="text-2xl mb-1">🍰</div>
              <div className="text-sm text-gray-300">CAKE SLICES</div>
              <div className="text-lg font-bold">
                <span className={gameState.collectibles.cakes >= levelConfig.requiredCollectibles.cakes ? 'text-green-400' : 'text-yellow-400'}>
                  {gameState.collectibles.cakes}
                </span>
                <span className="text-gray-500">/{levelConfig.requiredCollectibles.cakes}</span>
              </div>
              {gameState.collectibles.cakes === 23 && (
                <div className="text-xs text-pink-400 font-bold animate-pulse">🎂 BIRTHDAY BONUS! 🎂</div>
              )}
            </div>
            
            {/* Balloons */}
            <div className="text-center">
              <div className="text-2xl mb-1">🎈</div>
              <div className="text-sm text-gray-300">BALLOONS</div>
              <div className="text-lg font-bold">
                <span className={gameState.collectibles.balloons >= levelConfig.requiredCollectibles.balloons ? 'text-green-400' : 'text-yellow-400'}>
                  {gameState.collectibles.balloons}
                </span>
                <span className="text-gray-500">/{levelConfig.requiredCollectibles.balloons}</span>
              </div>
              {gameState.collectibles.balloons === 23 && (
                <div className="text-xs text-pink-400 font-bold animate-pulse">🎈 BIRTHDAY BONUS! 🎈</div>
              )}
            </div>
          </div>
          
          {/* Level Complete Check */}
          {gameState.collectibles.presents >= levelConfig.requiredCollectibles.presents &&
           gameState.collectibles.cakes >= levelConfig.requiredCollectibles.cakes &&
           gameState.collectibles.balloons >= levelConfig.requiredCollectibles.balloons && (
             <div className="text-center mt-2 text-green-400 font-bold animate-bounce">
               ✨ LEVEL OBJECTIVES COMPLETE! ✨
             </div>
           )}
        </div>
      </div>
      
      {/* Power-ups Display */}
      {gameState.activePowerUps.length > 0 && (
        <div className="absolute top-1/4 right-4 space-y-2 pointer-events-none">
          <div className="text-white text-sm font-bold text-center bg-black bg-opacity-50 rounded px-2 py-1">
            ACTIVE POWER-UPS
          </div>
          {gameState.activePowerUps.map((powerUp, index) => (
            <PowerUpIndicator key={`${powerUp.type}-${index}`} powerUp={powerUp} />
          ))}
        </div>
      )}
      
      {/* Birthday Age Display */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 pointer-events-none">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">23</div>
            <div className="text-xs">YRS</div>
          </div>
        </div>
      </div>
      
      {/* Mobile Controls Hint */}
      <div className="absolute bottom-20 left-4 pointer-events-none md:hidden">
        <div className="bg-black bg-opacity-70 text-white text-xs rounded-lg p-2">
          <div>📱 TAP SCREEN TO JUMP</div>
          <div>⬅️➡️ TILT TO MOVE</div>
        </div>
      </div>
      
      {/* Desktop Controls Hint */}
      <div className="absolute bottom-20 right-4 pointer-events-none hidden md:block">
        <div className="bg-black bg-opacity-70 text-white text-xs rounded-lg p-2">
          <div>⌨️ ARROW KEYS / WASD TO MOVE</div>
          <div>🎮 SPACEBAR TO JUMP</div>
        </div>
      </div>
    </div>
  )
}