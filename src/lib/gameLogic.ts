// Core game logic for Jam's Birthday Adventure

import { GameEntity, Player, Collectible, Obstacle, PowerUp, BoundingBox } from './gameEntities'

export interface GameState {
  score: number
  level: number
  lives: number
  collectibles: {
    presents: number
    cakes: number
    balloons: number
  }
  activePowerUps: ActivePowerUp[]
  gameTime: number
  paused: boolean
}

export interface ActivePowerUp {
  type: 'speed' | 'shield' | 'superjump'
  remainingTime: number
  totalDuration: number
}

export interface LevelConfig {
  levelNumber: number
  name: string
  backgroundSpeed: number
  obstacleFrequency: number
  collectibleFrequency: number
  powerUpFrequency: number
  requiredCollectibles: {
    presents: number
    cakes: number
    balloons: number
  }
  maxObstacles: number
  duration: number // in milliseconds
}

// Level configurations for birthday theme
export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: "Morning Surprise",
    backgroundSpeed: 1,
    obstacleFrequency: 3000, // Every 3 seconds
    collectibleFrequency: 1500, // Every 1.5 seconds
    powerUpFrequency: 8000, // Every 8 seconds
    requiredCollectibles: { presents: 8, cakes: 5, balloons: 5 },
    maxObstacles: 3,
    duration: 60000 // 1 minute
  },
  {
    levelNumber: 2,
    name: "Party Time",
    backgroundSpeed: 1.5,
    obstacleFrequency: 2500,
    collectibleFrequency: 1200,
    powerUpFrequency: 7000,
    requiredCollectibles: { presents: 10, cakes: 8, balloons: 8 },
    maxObstacles: 5,
    duration: 75000 // 1.25 minutes
  },
  {
    levelNumber: 3,
    name: "Midnight Celebration",
    backgroundSpeed: 2,
    obstacleFrequency: 2000,
    collectibleFrequency: 1000,
    powerUpFrequency: 6000,
    requiredCollectibles: { presents: 5, cakes: 10, balloons: 10 }, // More challenging with cake focus
    maxObstacles: 7,
    duration: 90000 // 1.5 minutes
  }
]

export class GameLogic {
  public gameState: GameState
  public entities: GameEntity[] = []
  public player: Player
  public currentLevel: LevelConfig
  private lastObstacleSpawn: number = 0
  private lastCollectibleSpawn: number = 0
  private lastPowerUpSpawn: number = 0
  private canvasWidth: number
  private canvasHeight: number
  
  constructor(level: number, canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.currentLevel = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)]
    
    // Initialize player
    const groundY = canvasHeight - 50
    this.player = new Player(50, groundY - 32, groundY)
    
    // Initialize game state
    this.gameState = {
      score: 0,
      level: level,
      lives: 3,
      collectibles: { presents: 0, cakes: 0, balloons: 0 },
      activePowerUps: [],
      gameTime: 0,
      paused: false
    }
    
    this.entities = [this.player]
  }
  
  update(deltaTime: number): { 
    gameOver: boolean, 
    levelComplete: boolean, 
    scoreUpdate: number 
  } {
    if (this.gameState.paused) {
      return { gameOver: false, levelComplete: false, scoreUpdate: this.gameState.score }
    }
    
    this.gameState.gameTime += deltaTime
    
    // Update power-ups
    this.updatePowerUps(deltaTime)
    
    // Spawn entities based on level configuration
    this.spawnEntities(deltaTime)
    
    // Update all entities
    this.entities = this.entities.filter(entity => {
      if (entity.active) {
        entity.update(deltaTime, this.canvasWidth, this.canvasHeight)
        return true
      }
      return false
    })
    
    // Handle collisions
    this.handleCollisions()
    
    // Update lives in game state
    this.gameState.lives = this.player.lives
    
    // Check win/lose conditions
    const gameOver = this.player.lives <= 0
    const levelComplete = this.checkLevelComplete()
    
    return { 
      gameOver, 
      levelComplete, 
      scoreUpdate: this.gameState.score 
    }
  }
  
  private updatePowerUps(deltaTime: number): void {
    this.gameState.activePowerUps = this.gameState.activePowerUps.filter(powerUp => {
      powerUp.remainingTime -= deltaTime
      return powerUp.remainingTime > 0
    })
  }
  
  private spawnEntities(deltaTime: number): void {
    const currentTime = this.gameState.gameTime
    
    // Spawn collectibles
    if (currentTime - this.lastCollectibleSpawn > this.currentLevel.collectibleFrequency) {
      this.spawnCollectible()
      this.lastCollectibleSpawn = currentTime
    }
    
    // Spawn obstacles
    if (currentTime - this.lastObstacleSpawn > this.currentLevel.obstacleFrequency) {
      const currentObstacles = this.entities.filter(e => e instanceof Obstacle).length
      if (currentObstacles < this.currentLevel.maxObstacles) {
        this.spawnObstacle()
        this.lastObstacleSpawn = currentTime
      }
    }
    
    // Spawn power-ups
    if (currentTime - this.lastPowerUpSpawn > this.currentLevel.powerUpFrequency) {
      this.spawnPowerUp()
      this.lastPowerUpSpawn = currentTime
    }
  }
  
  private spawnCollectible(): void {
    const types: ('present' | 'cake' | 'balloon')[] = ['present', 'cake', 'balloon']
    const type = types[Math.floor(Math.random() * types.length)]
    const y = Math.random() * (this.canvasHeight - 200) + 100 // Random height
    const collectible = new Collectible(this.canvasWidth, y, type)
    this.entities.push(collectible)
  }
  
  private spawnObstacle(): void {
    const types: ('confetti' | 'bouncer' | 'pit')[] = ['confetti', 'bouncer', 'pit']
    const type = types[Math.floor(Math.random() * types.length)]
    const y = type === 'pit' ? this.canvasHeight - 50 : Math.random() * (this.canvasHeight - 200) + 100
    const obstacle = new Obstacle(this.canvasWidth, y, type)
    this.entities.push(obstacle)
  }
  
  private spawnPowerUp(): void {
    const types: ('speed' | 'shield' | 'superjump')[] = ['speed', 'shield', 'superjump']
    const type = types[Math.floor(Math.random() * types.length)]
    const y = Math.random() * (this.canvasHeight - 200) + 100
    const powerUp = new PowerUp(this.canvasWidth, y, type)
    this.entities.push(powerUp)
  }
  
  private handleCollisions(): void {
    const playerBox = this.player.getBoundingBox()
    
    for (const entity of this.entities) {
      if (entity === this.player || !entity.active) continue
      
      const entityBox = entity.getBoundingBox()
      
      if (this.checkCollision(playerBox, entityBox)) {
        if (entity instanceof Collectible) {
          this.collectItem(entity)
        } else if (entity instanceof Obstacle) {
          this.handleObstacleCollision()
        } else if (entity instanceof PowerUp) {
          this.activatePowerUp(entity)
        }
      }
    }
  }
  
  private checkCollision(box1: BoundingBox, box2: BoundingBox): boolean {
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y
  }
  
  private collectItem(collectible: Collectible): void {
    // Update score and collectibles count
    this.gameState.score += collectible.points
    
    if (collectible.type === 'present') {
      this.gameState.collectibles.presents++
    } else if (collectible.type === 'cake') {
      this.gameState.collectibles.cakes++
    } else if (collectible.type === 'balloon') {
      this.gameState.collectibles.balloons++
    }
    
    // Bonus points for collecting 23 of any type (birthday theme)
    const count = this.gameState.collectibles[collectible.type === 'present' ? 'presents' : 
                                              collectible.type === 'cake' ? 'cakes' : 'balloons']
    if (count === 23) {
      this.gameState.score += 230 // Bonus for reaching 23!
    }
    
    collectible.active = false
  }
  
  private handleObstacleCollision(): void {
    // Check if player has shield power-up
    const hasShield = this.gameState.activePowerUps.some(p => p.type === 'shield')
    if (!hasShield) {
      if (this.player.takeDamage()) {
        // Damage was taken, maybe play sound effect here
      }
    }
  }
  
  private activatePowerUp(powerUp: PowerUp): void {
    // Remove existing power-up of same type
    this.gameState.activePowerUps = this.gameState.activePowerUps.filter(p => p.type !== powerUp.type)
    
    // Add new power-up
    this.gameState.activePowerUps.push({
      type: powerUp.type,
      remainingTime: powerUp.duration,
      totalDuration: powerUp.duration
    })
    
    this.gameState.score += 50 // Bonus points for power-up
    powerUp.active = false
  }
  
  private checkLevelComplete(): boolean {
    const required = this.currentLevel.requiredCollectibles
    const collected = this.gameState.collectibles
    
    return collected.presents >= required.presents &&
           collected.cakes >= required.cakes &&
           collected.balloons >= required.balloons
  }
  
  // Input handling methods
  handleInput(keys: Set<string>): void {
    if (this.gameState.paused) return
    
    // Apply speed power-up
    const hasSpeed = this.gameState.activePowerUps.some(p => p.type === 'speed')
    const speedMultiplier = hasSpeed ? 1.5 : 1
    
    // Handle horizontal movement
    if (keys.has('ArrowLeft') || keys.has('KeyA')) {
      this.player.moveLeft()
      if (hasSpeed) {
        this.player.velocity.x *= speedMultiplier
      }
    } else if (keys.has('ArrowRight') || keys.has('KeyD')) {
      this.player.moveRight()
      if (hasSpeed) {
        this.player.velocity.x *= speedMultiplier
      }
    } else {
      this.player.stop()
    }
    
    // Handle jumping
    if (keys.has('Space') || keys.has('ArrowUp') || keys.has('KeyW')) {
      const hasSuperJump = this.gameState.activePowerUps.some(p => p.type === 'superjump')
      if (hasSuperJump && this.player.isGrounded) {
        this.player.velocity.y = -18 // Super jump is stronger
        this.player.isGrounded = false
        this.player.isJumping = true
      } else {
        this.player.jump()
      }
    }
  }
  
  pause(): void {
    this.gameState.paused = true
  }
  
  resume(): void {
    this.gameState.paused = false
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Clear canvas with birthday-themed gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight)
    
    if (this.currentLevel.levelNumber === 1) {
      // Morning colors - soft sunrise
      gradient.addColorStop(0, '#FFE4E1') // Misty rose
      gradient.addColorStop(1, '#87CEEB') // Sky blue
    } else if (this.currentLevel.levelNumber === 2) {
      // Party colors - vibrant celebration
      gradient.addColorStop(0, '#FF69B4') // Hot pink
      gradient.addColorStop(0.5, '#9370DB') // Medium slate blue
      gradient.addColorStop(1, '#FFD700') // Gold
    } else {
      // Midnight colors - deep celebration
      gradient.addColorStop(0, '#191970') // Midnight blue
      gradient.addColorStop(0.5, '#9370DB') // Medium slate blue
      gradient.addColorStop(1, '#FF69B4') // Hot pink
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    
    // Draw ground
    ctx.fillStyle = '#32CD32' // Lime green
    ctx.fillRect(0, this.canvasHeight - 50, this.canvasWidth, 50)
    
    // Add some decorative elements
    this.drawDecorations(ctx)
    
    // Render all entities
    for (const entity of this.entities) {
      if (entity.active) {
        entity.render(ctx)
      }
    }
  }
  
  private drawDecorations(ctx: CanvasRenderingContext2D): void {
    // Draw floating birthday decorations based on level
    const time = Date.now()
    
    // Party streamers
    for (let i = 0; i < 5; i++) {
      const x = (time / 50 + i * 200) % (this.canvasWidth + 100) - 50
      const y = 30 + Math.sin(time / 1000 + i) * 20
      const colors = ['#FF69B4', '#87CEEB', '#FFD700', '#98FB98', '#DDA0DD']
      
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(x, y, 30, 8)
    }
    
    // Floating balloons in background
    for (let i = 0; i < 3; i++) {
      const x = (time / 30 + i * 300) % (this.canvasWidth + 100) - 50
      const y = 60 + Math.sin(time / 800 + i * 2) * 15
      
      ctx.globalAlpha = 0.3
      ctx.fillStyle = ['#FF1493', '#00BFFF', '#FFD700'][i]
      ctx.beginPath()
      ctx.ellipse(x, y, 15, 20, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.globalAlpha = 1
    }
    
    // Birthday confetti falling
    for (let i = 0; i < 10; i++) {
      const x = (time / 20 + i * 120) % this.canvasWidth
      const y = (time / 40 + i * 100) % this.canvasHeight
      const colors = ['#FF69B4', '#87CEEB', '#FFD700', '#98FB98']
      
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(x, y, 3, 3)
    }
  }
}