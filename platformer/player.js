/*global world, Sprite*/

class Player {

  constructor(x, y) {
    // Motion
    this.positionNew = createVector(0,0);
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

    // Drag
    this.dragForce = createVector(0, 0);
    this.dragFactor = 0.2;

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

    // Sprite - not actually implemented yet
    this.sprite = new Sprite(x, y, 'assets/player.png');
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  set x(x) {
    this.position.x = x;
    this.sprite.x = x;
  }

  set y(y) {
    this.position.y = y;
    this.sprite.y = y;
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
    this.wallL = world.lineVIntersectsGround(this.positionNew.x, this.positionNew.y, this.h);
    this.wallR = world.lineVIntersectsGround(this.positionNew.x + this.w, this.positionNew.y, this.h);
    this.wall = this.wallL || this.wallR;
  }
  
  addAcceleration(vec){
    this.acceleration.add(vec);
  }
  
  addAcceleration(ddx, ddy){
    this.acceleration.x += ddx;
    this.acceleration.y += ddy;
  }
  
  addForce(vec){
    vec.div(this.mass);
    this.acceleration.add(forceVector);
  }
  
  addForce(Fx, Fy){
    this.acceleration.x += Fx / this.mass;
    this.acceleration.y += Fy / this.mass;
  }

  move() {
    
    if(this.grounded) this.velocity.y = 0;
    if(this.wall) this.velocity.x = 0;

    if (keyIsDown(LEFT_ARROW)) {
      if(!this.wallL){
        this.addForce(-this.WalkForce, 0);
        this.wall = false;
      }
    }

    if (keyIsDown(RIGHT_ARROW)) {
      if(!this.wallR){
        this.addForce(this.WalkForce, 0);
        this.wall = false;
      }
    }

    if (keyIsDown(UP_ARROW)) {
      if(this.grounded){
        this.addForce(0, -this.JumpForce);
        this.grounded = false;
      }
    }

    /* EQUATIONS OF MOTION */

    // Drag
    if(!this.wall)this.dragForce.x = -this.velocity.x * this.dragFactor;
    if(!this.grounded)this.dragForce.y = -this.velocity.y * this.dragFactor;
    
    this.addForce(this.dragForce.x, this.dragForce.y);
    
    // Gravity
    if(!this.grounded) this.addAcceleration(0, this.gravity);

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
    
    // Clear accelerations for next time
    this.acceleration.x = this.acceleration.y = 0;
  }
}
