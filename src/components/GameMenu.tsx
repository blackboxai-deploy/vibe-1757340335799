'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface GameMenuProps {
  type: 'start' | 'pause' | 'gameOver' | 'victory'
  onStart?: () => void
  onResume?: () => void
  onRestart?: () => void
  onNextLevel?: () => void
  currentScore?: number
  highScore?: number
  level?: number
}

const BirthdayMessage = ({ level }: { level?: number }) => {
  const messages = [
    "🎂 Happy 23rd Birthday Jam! Let the adventure begin! 🎉",
    "🌟 Another year of awesome awaits! Keep collecting! 🎈",
    "🎊 Level up in life and in the game! You're amazing! 🎁",
    "🎉 Twenty-three and thriving! The best is yet to come! 🎂"
  ]
  
  const messageIndex = level ? (level - 1) % messages.length : 0
  return (
    <div className="text-center p-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg mb-6">
      <p className="text-lg font-bold text-purple-800">{messages[messageIndex]}</p>
    </div>
  )
}

export default function GameMenu({ 
  type, 
  onStart, 
  onResume, 
  onRestart, 
  onNextLevel,
  currentScore = 0, 
  highScore = 0, 
  level = 1 
}: GameMenuProps) {
  
  if (type === 'start') {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-pink-50 to-purple-50 border-4 border-pink-300 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl mb-4">
            🎮 JAM'S BIRTHDAY GAME 🎂
          </CardTitle>
          <CardDescription className="text-lg">
            <BirthdayMessage />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-purple-700">🎯 How to Play:</h3>
            <div className="text-sm space-y-1 text-gray-700">
              <p>🎁 Collect 23 presents, cake slices & balloons</p>
              <p>⭐ Use ARROW KEYS or WASD to move</p>
              <p>🚀 SPACEBAR to jump</p>
              <p>❤️ Avoid obstacles to keep your 3 lives</p>
            </div>
          </div>
          
          {highScore > 0 && (
            <div className="text-center p-3 bg-yellow-100 rounded-lg">
              <p className="text-lg font-bold text-yellow-800">
                🏆 High Score: {highScore.toLocaleString()}
              </p>
            </div>
          )}
          
          <Button 
            onClick={onStart}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            🎉 START BIRTHDAY ADVENTURE! 🎉
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (type === 'pause') {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-300 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-4">⏸️ GAME PAUSED</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-3 bg-blue-100 rounded-lg">
            <p className="text-lg font-bold text-blue-800">
              Current Score: {currentScore.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={onResume}
              className="w-full h-10 bg-green-500 hover:bg-green-600"
            >
              ▶️ Resume Game
            </Button>
            <Button 
              onClick={onRestart}
              variant="outline"
              className="w-full h-10 border-red-300 text-red-600 hover:bg-red-50"
            >
              🔄 Restart Game
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'gameOver') {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-300 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-4">💔 GAME OVER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg">Don't worry Jam, birthdays are about having fun!</p>
            <div className="p-3 bg-red-100 rounded-lg">
              <p className="text-lg font-bold text-red-800">
                Final Score: {currentScore.toLocaleString()}
              </p>
            </div>
            {currentScore === highScore && currentScore > 0 && (
              <div className="p-3 bg-yellow-100 rounded-lg">
                <p className="text-lg font-bold text-yellow-800">
                  🎉 NEW HIGH SCORE! 🎉
                </p>
              </div>
            )}
          </div>
          
          <Button 
            onClick={onRestart}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            🎂 Try Again - It's Your Birthday!
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (type === 'victory') {
    return (
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-300 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl mb-4">🎉 LEVEL COMPLETE! 🎊</CardTitle>
          <BirthdayMessage level={level} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <p className="text-lg font-bold text-yellow-800">
                Score: {currentScore.toLocaleString()}
              </p>
              <p className="text-md text-yellow-700">
                Level {level} Complete!
              </p>
            </div>
            {currentScore === highScore && (
              <div className="p-3 bg-orange-100 rounded-lg">
                <p className="text-lg font-bold text-orange-800">
                  🏆 NEW HIGH SCORE! 🏆
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {level < 3 && (
              <Button 
                onClick={onNextLevel}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                🚀 Next Level - Keep Celebrating!
              </Button>
            )}
            {level >= 3 && (
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-purple-800">
                  🎂 HAPPY 23rd BIRTHDAY JAM! 🎂
                </p>
                <p className="text-lg text-purple-600">
                  You completed all levels! What an amazing celebration! 🎉
                </p>
              </div>
            )}
            <Button 
              onClick={onRestart}
              variant="outline"
              className="w-full h-10 border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              🎮 Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}