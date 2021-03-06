/*global world, Sprite, Grapple*/

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
    this.jumpForce = 75;

    // Collisions
    this.grounded = false;
    this.wallL = false;
    this.wallR = false;
    this.walled = false;

    // Sprite - not actually implemented yet
    this.sprite = new Sprite(x, y, 'assets/player.png');

    // Grappling hook
    this.grapple = new Grapple(this);
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
    // Replace this with a sprite eventually
    rect(this.x, this.y, this.w, this.h);

    // Grapple
    this.grapple.draw();
  }


  update() {
    // Update grapple and apply force to player if required
    this.grapple.update();

    // Check keyboard inputs
    this.checkKeyboardInputs();

    // Apply the equations of motion to move the player
    this.move();

    // Check collisions with the world
    this.checkCollisions();

    // Finally update the position
    this.updatePosition();

    // Move screen if the player has gone offscreen
    this.moveScreen();
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

  checkKeyboardInputs() {
    // Left, A
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      if (!this.wallL) {
        this.addForce(-this.walkForce, 0);
        this.wall = false;
      }
    }

    // Right, D
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      if (!this.wallR) {
        this.addForce(this.walkForce, 0);
        this.wall = false;
      }
    }

    // Up, Space, W
    if (keyIsDown(UP_ARROW) || keyIsDown(32) || keyIsDown(87)) {
      if (this.grounded) {
        this.addForce(0, -this.jumpForce);
        this.grounded = false;
      }
    }
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
    /* EQUATIONS OF MOTION */

    // Calculate drag forces acting on the player
    if (!this.wall) this.dragForce.x = -this.velocity.x * this.dragFactor;
    if (this.grounded) {
      this.dragForce.x = -this.velocity.x * this.groundDragFactor;
    } else {
      this.dragForce.y = -this.velocity.y * this.dragFactor;
    }

    // Add the drag force to the player
    this.addForce(this.dragForce.x, this.dragForce.y);

    // Add gravity to the acceleration
    if(!this.grounded) this.addAcceleration(0, this.gravity);

    // Calculate the new velocities
    if (!this.wall) this.velocity.x += this.acceleration.x;
    if (!this.grounded) this.velocity.y += this.acceleration.y;

    // Calculate the new position
    this.positionNew.x = this.x + this.velocity.x;
    this.positionNew.y = this.y + this.velocity.y;

    // Clear accelerations for next time
    this.acceleration.x = this.acceleration.y = 0;

    // Clear velocities for next time
    if (this.grounded) this.velocity.y = 0;
    if (this.wall) this.velocity.x = 0;

  }

  moveScreen() {
    // If the player goes offscreen, move the screen and wraparound
    if (this.x + this.w < 0) {
      world.moveScreen('l');
      this.x += width;
      if (this.grapple.endPoint) this.grapple.endPoint.x += width;
    } else if (this.x > width) {
      world.moveScreen('r');
      this.x -= width;
      if (this.grapple.endPoint) this.grapple.endPoint.x -= width;
    }

    if (this.y + this.h < 0) {
      world.moveScreen('u');
      this.y += height - this.h;
      if (this.grapple.endPoint) this.grapple.endPoint.y += height - this.h;
    } else if (this.y > height) {
      world.moveScreen('d');
      this.y -= height;
      if (this.grapple.endPoint) this.grapple.endPoint.y -= height;
    }
  }
}
