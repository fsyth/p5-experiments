class Player {

  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);

    this.acceleration = createVector(0, 0);
    this.w = 5;
    this.h = 10;
    this.speed = 5;

    this.mass = 10;
    this.dragForce = createVector(0, 0);
  }

  draw() {
    rect(this.position.x, this.position.y, this.w, this.h);
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) {
      this.position.x -= this.speed;
    }

    if (keyIsDown(RIGHT_ARROW)) {
      this.position.x += this.speed;
    }

    if (keyIsDown(UP_ARROW)) {
      this.position.y -= this.speed;
    }

    if (keyIsDown(DOWN_ARROW)) {
      this.position.y += this.speed;
    }

    this.position.x = (this.position.x + width)  % width;
    this.position.y = (this.position.y + height) % height;
  }

}
