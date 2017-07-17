/*global Sprite, player*/

class SawBlade {

  constructor (x, y){
    this.position = createVector(x, y);
    this.radius = 16;
    this.detectionRadius = this.radius * 3;

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

    // Quick calculations to determine if the player is close
    //if(abs(player.x - this.position.x) > this.detectionRadius) return false;
    //if(abs(player.y - this.position.y) > this.detectionRadius) return false;

    return Sprite.intersectionCircleRectangle(this, player);

    /* This method has some issues. The circle can nestle between points while intersecting
     * the rectangle. Use Sptire.intersectionCircleRectangle instead, as above

    // If the player is close do more precise collisions
    // If any of the players corners are within the circle then a collision has been detected
    this.tmpVec = player.position.copy();

    // Top Left
    if (this.checkCollisionPointAndCircle(this.tmpVec)) return true;

    // Top Right
    this.tmpVec.x += player.w;
    if (this.checkCollisionPointAndCircle(this.tmpVec)) return true;

    // Bottom Right
    this.tmpVec.y += player.h;
    if (this.checkCollisionPointAndCircle(this.tmpVec)) return true;

    // Bottom Left
    this.tmpVec.x -= player.w;
    if (this.checkCollisionPointAndCircle(this.tmpVec)) return true;

    // If none of the coordinates intersect the circle then return false
    return false;
    */
  }

  draw() {
    ellipse(this.position.x,
            this.position.y,
            this.radius * 2,
            this.radius * 2);
  }
}
