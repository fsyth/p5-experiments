/*global World*/

class Player {

  constructor(x, y) {
    // Motion
    this.positionNew = createVector(0,0);
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    
    // Drag
    this.dragForce = createVector(0, 0);
    this.dragFactor = 0.02;
    
    // Properties
    this.mass = 10;
    this.gravity = 0.2;
    
    // Draw
    this.w = 5;
    this.h = 10;
    this.WalkForce = 2;
    this.JumpForce = 50;
    
    // Collisions
    this.grounded = false;
    this.wallL = false;
    this.wallR = false;
    this.walled = false;
    
  }

  draw() {
    rect(this.position.x, this.position.y, this.w, this.h);
  }
  
  
  update(){
    this.move();
    this.checkCollisions();
    this.updatePosition();
  }
  
  updatePosition(){
    if(!this.grounded){
      this.position.y = this.positionNew.y;
    }
    if(!this.wall){
      this.position.x = this.positionNew.x;
    }
  }
  
  checkCollisions(){
    // Check for Ground Collisions
    if(this.positionNew.y + this.h >= height){
      this.grounded = true;
    } else {
      this.grounded = world.lineHIntersectsGround(this.positionNew.x, this.positionNew.y + this.h, this.w);
    }
    
    // Check for Wall Collisions
    this.wallL = world.lineVIntersectsGround(this.positionNew.x, this.positionNew.y, this.h) 
    this.wallR = world.lineVIntersectsGround(this.positionNew.x + this.w, this.positionNew.y, this.h);
    this.wall = this.wallL || this.wallR;
    
    console.log(this.wall);
  }

  move() {
    this.acceleration.x = this.acceleration.y = 0;
    
    if(this.grounded) this.velocity.y = 0;
    if(this.wall) this.velocity.x = 0;
    
    if (keyIsDown(LEFT_ARROW)) {
      if(!this.wallL){
        this.acceleration.x -= this.WalkForce / this.mass;
        this.wall = false;
      }
    }

    if (keyIsDown(RIGHT_ARROW)) {
      if(!this.wallR){
        this.acceleration.x += this.WalkForce / this.mass;
        this.wall = false;
      }
    }

    if (keyIsDown(UP_ARROW)) {
      if(this.grounded){
        this.acceleration.y -= this.JumpForce / this.mass;
        this.grounded = false;
      }
    }
    
    /* EQUATIONS OF MOTION */
    
    // Drag
    if(!this.wall)this.dragForce.x = this.velocity.x * this.dragFactor; 
    if(!this.grounded)this.dragForce.y = this.velocity.y * this.dragFactor;
    
    if(!this.wall)this.acceleration.x -= this.dragForce.x;
    if(!this.grounded)this.acceleration.y -= this.dragForce.y;
    
    // Gravity
    if(!this.grounded)this.acceleration.y += this.gravity;
    
    // Basic Euler
    if(!this.wall)this.velocity.x += this.acceleration.x;
    if(!this.grounded)this.velocity.y += this.acceleration.y;
    
    this.positionNew.x += this.velocity.x;
    this.positionNew.y += this.velocity.y;
    
    // If the player goes offscreen wrap around
     this.positionNew.x = ( this.positionNew.x + width)  % width;
    if( this.positionNew.y > (height - this.h)){
        this.positionNew.y = height - this.h;
    }
  }

}


