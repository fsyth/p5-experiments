class Player {

  constructor(x, y) {
    // Motion
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.dragForce = createVector(0, 0);
    this.dragFactor = 0.2;
    this.mass = 10;
    this.gravity = 1;
    
    // Draw
    this.w = 5;
    this.h = 10;
    this.speed = 50;

    
  }

  draw() {
    rect(this.position.x, this.position.y, this.w, this.h);
  }

  move() {
    this.acceleration.x = this.acceleration.y = 0;
    
    if (keyIsDown(LEFT_ARROW)) {
      this.acceleration.x -= this.speed / this.mass;
    }

    if (keyIsDown(RIGHT_ARROW)) {
      this.acceleration.x += this.speed / this.mass;
    }

    if (keyIsDown(UP_ARROW)) {
      this.acceleration.y -= this.speed / this.mass;
    }

    if (keyIsDown(DOWN_ARROW)) {
      this.acceleration.y += this.speed / this.mass;
    }
    
    /* EQUATIONS OF MOTION */
    
    // Drag
    this.dragForce.x = this.velocity.x * this.dragFactor; 
    this.dragForce.y = this.velocity.y * this.dragFactor;
    
    this.acceleration.x -= this.dragForce.x;
    this.acceleration.y -= this.dragForce.y;
    
    // Gravity
    this.acceleration.y += this.gravity;
    
    // Basic Euler
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // If the player goes offscreen wrap around
    this.position.x = (this.position.x + width)  % width;
    if(this.position.y > (height - this.h)){
       this.position.y = height - this.h;
    }
  }

}