// Game entity classes for Jam's Birthday Adventure

export interface Position {
  x: number
  y: number
}

export interface Velocity {
  x: number
  y: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface GameEntity {
  position: Position
  velocity: Velocity
  boundingBox: BoundingBox
  active: boolean
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void
  render(ctx: CanvasRenderingContext2D): void
  getBoundingBox(): BoundingBox
}

// Player class - represents Jam
export class Player implements GameEntity {
  position: Position
  velocity: Velocity
  boundingBox: BoundingBox
  active: boolean = true
  
  // Player states
  lives: number = 3
  isGrounded: boolean = false
  isJumping: boolean = false
  facingRight: boolean = true
  invulnerable: boolean = false
  invulnerabilityTime: number = 0
  animationFrame: number = 0
  animationTime: number = 0
  
  // Physics constants
  private jumpPower: number = -12
  private gravity: number = 0.5
  private groundY: number
  private moveSpeed: number = 5
  
  constructor(x: number, y: number, groundY: number) {
    this.position = { x, y }
    this.velocity = { x: 0, y: 0 }
    this.boundingBox = { x, y, width: 32, height: 32 }
    this.groundY = groundY
  }
  
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    // Handle invulnerability timer
    if (this.invulnerable) {
      this.invulnerabilityTime -= deltaTime
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false
      }
    }
    
    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity
    }
    
    // Update position
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    
    // Ground collision
    if (this.position.y >= this.groundY) {
      this.position.y = this.groundY
      this.velocity.y = 0
      this.isGrounded = true
      this.isJumping = false
    } else {
      this.isGrounded = false
    }
    
    // Keep player within canvas bounds
    this.position.x = Math.max(0, Math.min(this.position.x, canvasWidth - this.boundingBox.width))
    
    // Update bounding box
    this.boundingBox.x = this.position.x
    this.boundingBox.y = this.position.y
    
    // Update animation
    this.animationTime += deltaTime
    if (this.animationTime > 200) { // Change frame every 200ms
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTime = 0
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    
    // Flicker effect when invulnerable
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5
    }
    
    // Draw player as a retro character (simple pixel art style)
    const centerX = this.position.x + this.boundingBox.width / 2
    const centerY = this.position.y + this.boundingBox.height / 2
    
    // Body (main color)
    ctx.fillStyle = '#FF69B4' // Hot pink for Jam
    ctx.fillRect(this.position.x + 8, this.position.y + 8, 16, 20)
    
    // Head
    ctx.fillStyle = '#FFB6C1' // Light pink
    ctx.fillRect(this.position.x + 6, this.position.y + 2, 20, 16)
    
    // Eyes
    ctx.fillStyle = '#000000'
    ctx.fillRect(this.position.x + 10, this.position.y + 6, 2, 2)
    ctx.fillRect(this.position.x + 20, this.position.y + 6, 2, 2)
    
    // Smile
    ctx.fillRect(this.position.x + 12, this.position.y + 12, 8, 1)
    
    // Legs (simple animation)
    ctx.fillStyle = '#FF69B4'
    const legOffset = this.velocity.x !== 0 ? (this.animationFrame % 2) * 2 - 1 : 0
    ctx.fillRect(this.position.x + 10 + legOffset, this.position.y + 28, 4, 4)
    ctx.fillRect(this.position.x + 18 - legOffset, this.position.y + 28, 4, 4)
    
    // Birthday hat
    ctx.fillStyle = '#9370DB' // Medium slate blue
    ctx.fillRect(this.position.x + 8, this.position.y, 16, 6)
    ctx.fillStyle = '#FFD700' // Gold star on top
    ctx.fillRect(this.position.x + 14, this.position.y - 2, 4, 4)
    
    ctx.restore()
  }
  
  jump(): void {
    if (this.isGrounded) {
      this.velocity.y = this.jumpPower
      this.isGrounded = false
      this.isJumping = true
    }
  }
  
  moveLeft(): void {
    this.velocity.x = -this.moveSpeed
    this.facingRight = false
  }
  
  moveRight(): void {
    this.velocity.x = this.moveSpeed
    this.facingRight = true
  }
  
  stop(): void {
    this.velocity.x = 0
  }
  
  takeDamage(): boolean {
    if (!this.invulnerable) {
      this.lives--
      this.invulnerable = true
      this.invulnerabilityTime = 2000 // 2 seconds of invulnerability
      return true
    }
    return false
  }
  
  getBoundingBox(): BoundingBox {
    return { ...this.boundingBox }
  }
}

// Collectible base class
export class Collectible implements GameEntity {
  position: Position
  velocity: Velocity
  boundingBox: BoundingBox
  active: boolean = true
  
  type: 'present' | 'cake' | 'balloon'
  points: number
  animationFrame: number = 0
  animationTime: number = 0
  
  constructor(x: number, y: number, type: 'present' | 'cake' | 'balloon') {
    this.position = { x, y }
    this.velocity = { x: -2, y: 0 } // Move left at constant speed
    this.boundingBox = { x, y, width: 24, height: 24 }
    this.type = type
    this.points = type === 'present' ? 10 : type === 'cake' ? 25 : 15
  }
  
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    
    // Remove if off screen
    if (this.position.x < -this.boundingBox.width) {
      this.active = false
    }
    
    // Update bounding box
    this.boundingBox.x = this.position.x
    this.boundingBox.y = this.position.y
    
    // Update animation
    this.animationTime += deltaTime
    if (this.animationTime > 300) {
      this.animationFrame = (this.animationFrame + 1) % 3
      this.animationTime = 0
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    const centerX = this.position.x + this.boundingBox.width / 2
    const centerY = this.position.y + this.boundingBox.height / 2
    const pulse = Math.sin(Date.now() / 200) * 2 // Gentle pulsing effect
    
    if (this.type === 'present') {
      // Present box
      ctx.fillStyle = '#FF1493' // Deep pink
      ctx.fillRect(this.position.x + 2, this.position.y + 4, 20, 16)
      
      // Ribbon
      ctx.fillStyle = '#FFD700' // Gold
      ctx.fillRect(this.position.x + 10, this.position.y + 2, 4, 20)
      ctx.fillRect(this.position.x + 2, this.position.y + 10, 20, 4)
      
      // Bow
      ctx.fillRect(this.position.x + 8, this.position.y + 2, 8, 4)
      
    } else if (this.type === 'cake') {
      // Cake slice
      ctx.fillStyle = '#FFFFE0' // Light yellow (cake)
      ctx.fillRect(this.position.x + 4, this.position.y + 8, 16, 12)
      
      // Frosting
      ctx.fillStyle = '#FF69B4' // Hot pink
      ctx.fillRect(this.position.x + 4, this.position.y + 6, 16, 4)
      
      // Candle
      ctx.fillStyle = '#87CEEB' // Sky blue
      ctx.fillRect(this.position.x + 11, this.position.y + 2, 2, 6)
      
      // Flame
      ctx.fillStyle = '#FF4500' // Orange red
      ctx.fillRect(this.position.x + 11, this.position.y + 1, 2, 2)
      
    } else if (this.type === 'balloon') {
      // Balloon
      ctx.fillStyle = '#87CEEB' // Sky blue
      ctx.beginPath()
      ctx.ellipse(centerX, this.position.y + 8 + pulse, 10, 12, 0, 0, 2 * Math.PI)
      ctx.fill()
      
      // String
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX, this.position.y + 20)
      ctx.lineTo(centerX, this.position.y + 24)
      ctx.stroke()
      
      // Highlight
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(centerX - 6, this.position.y + 4 + pulse, 3, 3)
    }
  }
  
  getBoundingBox(): BoundingBox {
    return { ...this.boundingBox }
  }
}

// Obstacle class
export class Obstacle implements GameEntity {
  position: Position
  velocity: Velocity
  boundingBox: BoundingBox
  active: boolean = true
  
  type: 'confetti' | 'bouncer' | 'pit'
  animationFrame: number = 0
  animationTime: number = 0
  
  constructor(x: number, y: number, type: 'confetti' | 'bouncer' | 'pit') {
    this.position = { x, y }
    this.velocity = { x: -3, y: type === 'confetti' ? Math.sin(Date.now()) * 2 : 0 }
    this.boundingBox = { x, y, width: type === 'pit' ? 48 : 20, height: type === 'pit' ? 8 : 20 }
    this.type = type
  }
  
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    // Special movement patterns
    if (this.type === 'confetti') {
      this.velocity.y = Math.sin(Date.now() / 300) * 3 // Floating motion
    } else if (this.type === 'bouncer') {
      this.velocity.y = Math.sin(Date.now() / 500) * 4 // Bouncing motion
    }
    
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    
    // Keep bouncers and confetti in bounds vertically
    if (this.type !== 'pit') {
      this.position.y = Math.max(50, Math.min(this.position.y, canvasHeight - 100))
    }
    
    // Remove if off screen
    if (this.position.x < -this.boundingBox.width) {
      this.active = false
    }
    
    // Update bounding box
    this.boundingBox.x = this.position.x
    this.boundingBox.y = this.position.y
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (this.type === 'confetti') {
      // Colorful confetti pieces
      const colors = ['#FF69B4', '#87CEEB', '#FFD700', '#98FB98', '#DDA0DD']
      ctx.fillStyle = colors[Math.floor(Date.now() / 500) % colors.length]
      ctx.fillRect(this.position.x, this.position.y, 4, 4)
      ctx.fillRect(this.position.x + 6, this.position.y + 6, 4, 4)
      ctx.fillRect(this.position.x + 12, this.position.y + 3, 4, 4)
      
    } else if (this.type === 'bouncer') {
      // Bouncing balloon obstacle
      ctx.fillStyle = '#FF4500' // Orange red
      ctx.beginPath()
      ctx.ellipse(
        this.position.x + this.boundingBox.width / 2,
        this.position.y + this.boundingBox.height / 2,
        10, 12, 0, 0, 2 * Math.PI
      )
      ctx.fill()
      
      // Angry face
      ctx.fillStyle = '#000000'
      ctx.fillRect(this.position.x + 6, this.position.y + 6, 2, 2)
      ctx.fillRect(this.position.x + 12, this.position.y + 6, 2, 2)
      ctx.fillRect(this.position.x + 8, this.position.y + 12, 4, 1)
      
    } else if (this.type === 'pit') {
      // Cake crumb pit
      ctx.fillStyle = '#8B4513' // Saddle brown
      ctx.fillRect(this.position.x, this.position.y, this.boundingBox.width, this.boundingBox.height)
      
      // Crumbs
      ctx.fillStyle = '#DEB887' // Burlywood
      for (let i = 0; i < 8; i++) {
        const crumbX = this.position.x + (i * 6) + 2
        const crumbY = this.position.y + 2
        ctx.fillRect(crumbX, crumbY, 3, 3)
      }
    }
  }
  
  getBoundingBox(): BoundingBox {
    return { ...this.boundingBox }
  }
}

// Power-up class
export class PowerUp implements GameEntity {
  position: Position
  velocity: Velocity
  boundingBox: BoundingBox
  active: boolean = true
  
  type: 'speed' | 'shield' | 'superjump'
  duration: number
  animationFrame: number = 0
  animationTime: number = 0
  
  constructor(x: number, y: number, type: 'speed' | 'shield' | 'superjump') {
    this.position = { x, y }
    this.velocity = { x: -2, y: Math.sin(Date.now()) }
    this.boundingBox = { x, y, width: 20, height: 20 }
    this.type = type
    this.duration = type === 'speed' ? 5000 : type === 'shield' ? 8000 : 3000
  }
  
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    this.velocity.y = Math.sin(Date.now() / 400) * 2 // Floating motion
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    
    // Remove if off screen
    if (this.position.x < -this.boundingBox.width) {
      this.active = false
    }
    
    // Update bounding box
    this.boundingBox.x = this.position.x
    this.boundingBox.y = this.position.y
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    const glow = Math.sin(Date.now() / 200) * 0.3 + 0.7 // Glowing effect
    ctx.globalAlpha = glow
    
    if (this.type === 'speed') {
      // Speed boost - lightning bolt
      ctx.fillStyle = '#FFFF00' // Yellow
      ctx.fillRect(this.position.x + 8, this.position.y + 2, 4, 8)
      ctx.fillRect(this.position.x + 4, this.position.y + 8, 8, 2)
      ctx.fillRect(this.position.x + 8, this.position.y + 10, 4, 8)
      
    } else if (this.type === 'shield') {
      // Shield - protective circle
      ctx.fillStyle = '#00BFFF' // Deep sky blue
      ctx.beginPath()
      ctx.ellipse(
        this.position.x + this.boundingBox.width / 2,
        this.position.y + this.boundingBox.height / 2,
        8, 8, 0, 0, 2 * Math.PI
      )
      ctx.fill()
      
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(this.position.x + 8, this.position.y + 6, 4, 8)
      ctx.fillRect(this.position.x + 6, this.position.y + 8, 8, 4)
      
    } else if (this.type === 'superjump') {
      // Super jump - up arrow
      ctx.fillStyle = '#00FF00' // Lime
      ctx.fillRect(this.position.x + 8, this.position.y + 4, 4, 12)
      ctx.fillRect(this.position.x + 4, this.position.y + 8, 12, 4)
      ctx.fillRect(this.position.x + 6, this.position.y + 6, 8, 4)
    }
    
    ctx.globalAlpha = 1
  }
  
  getBoundingBox(): BoundingBox {
    return { ...this.boundingBox }
  }
}