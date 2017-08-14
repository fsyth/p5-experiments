/*global Sprite, player, Geometry*/

class SawBlade {

  constructor(x, y, r) {
    this.position = createVector(x, y);
    this.radius = r;
    this.detectionRadius = this.radius * 3;
    this.isColliding = false;

    // Sprite - not actually implemented yet
    this.sprite = new Sprite(x, y, 'assets/sawblade.png');
  }

  get x() {
    return this.position.x;
  }

  set x(x) {
    this.position.x = x;
    this.sprite.x = x;
  }

  get y() {
    return this.position.y;
  }

  set y(y) {
    this.position.y = y;
    this.sprite.y = y;
  }

  get r() {
    return this.radius;
  }

  set r(r) {
    this.radius = r;
  }

  update() {
    this.isColliding = this.checkCollisionPlayer();
  }

  /*
   *  Checks if a point lies with this circle
   */
  checkCollisionPointAndCircle(targetVec) {
    return p5.Vector.sub(targetVec, this.position).magSq() < sq(this.radius);
  }



  /*
   *  Checks for a collision between this saw blade and the players pos
   */
  checkCollisionPlayer() {
    /*
       _
      | |   __
      |_|  /  \
           \__/
    */

    return Geometry.intersectionCircleRectangle(this, player);
  }

  draw() {
    if (this.isColliding) {
      fill(255, 0, 0);
    } else {
      fill(255);
    }

    ellipse(this.x,
            this.y,
            this.radius * 2,
            this.radius * 2);
  }
}
