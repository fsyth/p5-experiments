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
    this.groundDragFactor = 0.2;

    // Properties
    this.mass = 10;
    this.gravity = 0.2;

    // Draw
    this.w = 5;
    this.h = 10;
    this.walkForce = 2;
    this.jumpForce = 50;

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
    rect(this.x, this.y, this.w, this.h);
  }


  update() {
    this.move();
    this.checkCollisions();
    this.updatePosition();
  }

  updatePosition() {
    if (!this.grounded) {
      this.y = this.positionNew.y;
    }
    if (!this.wall) {
      this.x = this.positionNew.x;
    }
  }

  checkGroundCollision() {
    // If the player is an the bottom of the map set grounded to true
    if (this.positionNew.y + this.h >= height) {
      this.grounded = true;
    } else {
      // Somewhere between positionNew and Old the ground exists

      /*
            X     X   <-PLAYER
            X     X
            OOOOOOO
                            Air
          ###   ######      Ground
      ##################### Ground
      */

      for (let y = this.y; y < this.positionNew.y; y++) {
        if (world.lineHIntersectsGround(this.positionNew.x, y + this.h, this.w)) {
          // Set the new y position
          this.positionNew.y = y;
          this.grounded = true;
          return;
        }
      }

      this.grounded = false;
    }

  }

  checkWallCollision() {

    this.wallL = world.lineVIntersectsGround(this.positionNew.x, this.positionNew.y, this.h - 1);
    this.wallR = world.lineVIntersectsGround(this.positionNew.x + this.w, this.positionNew.y, this.h - 1);
    this.wall = this.wallL || this.wallR;
  }

  checkCeilingCollision() {
    if (world.lineHIntersectsGround(this.positionNew.x, this.positionNew.y, this.w)) {
      // If there will be a collision reduce the speed by a factor 0.5 and ensure the velocity is positive
      this.velocity.y = 0.5 * abs(this.velocity.y);
    }
  }

  checkCollisions() {
    // Check for Ground Collisions
    this.checkGroundCollision();

    // Check for Wall Collisions
    this.checkWallCollision();

    // Check for Collisions with the ceiling
    this.checkCeilingCollision();
  }

  addAcceleration(ddx, ddy) {
    this.acceleration.x += ddx;
    this.acceleration.y += ddy;
  }

  addAccelerationVec(vec) {
    this.acceleration.add(vec);
  }

  addForce(Fx, Fy) {
    this.acceleration.x += Fx / this.mass;
    this.acceleration.y += Fy / this.mass;
  }

  addForceVec(vec) {
    vec.div(this.mass);
    this.acceleration.add(vec);
  }

  move() {

    if (this.grounded) this.velocity.y = 0;
    if (this.wall) this.velocity.x = 0;

    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // 65 -> a
      if (!this.wallL) {
        this.addForce(-this.walkForce, 0);
        this.wall = false;
      }
    }

    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // 68 -> d
      if (!this.wallR) {
        this.addForce(this.walkForce, 0);
        this.wall = false;
      }
    }

    if (keyIsDown(UP_ARROW) || keyIsDown(32) || keyIsDown(87)) { // 87 -> w, 32 -> space
      if (this.grounded) {
        this.addForce(0, -this.jumpForce);
        this.grounded = false;
      }
    }

    /* EQUATIONS OF MOTION */

    // Drag
    if (!this.wall) this.dragForce.x = -this.velocity.x * this.dragFactor;
    if (this.grounded) {
      this.dragForce.x = -this.velocity.x * this.groundDragFactor;
    } else {
      this.dragForce.y = -this.velocity.y * this.dragFactor;
    }

    this.addForce(this.dragForce.x, this.dragForce.y);

    // Gravity
    if(!this.grounded) this.addAcceleration(0, this.gravity);

    // Basic Euler
    if (!this.wall) this.velocity.x += this.acceleration.x;
    if (!this.grounded) this.velocity.y += this.acceleration.y;

    this.positionNew.x = this.x + this.velocity.x;
    this.positionNew.y = this.y + this.velocity.y;

    // If the player goes offscreen wrap around
     this.positionNew.x = (this.positionNew.x + width)  % width;
    if (this.positionNew.y > (height - this.h)) {
        this.positionNew.y = height - this.h;
    }

    // Clear accelerations for next time
    this.acceleration.x = this.acceleration.y = 0;
  }
}
