/*
 *  A class for randomly generated terrain, with methods for ground detection
 */
class World {
  /*
   *  Pass in the threshold below which ground is generated and the spatial frequency of the noise
   *  used in generation.
   */
  constructor(threshold, frequency) {
    this.threshold = threshold;
    this.frequency = frequency;

    this.groundColor = color(130, 100, 90);
    this.skyColor = color(230, 250, 250);

    this.image = createImage(width, height);
    this.image.loadPixels();

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        this.image.set(i, j, this.isGround(i, j) ? this.groundColor : this.skyColor);
      }
    }

    this.image.updatePixels();
  }

  /*
   *  Uses Perlin noise to determine whether a given pixel coordinate should be ground or sky.
   *  This is used both in generated the underlying image, and in ground detection with other
   *  geometry.
   *  If the noise is below the threshold, it is ground. Else, it is sky. Therefore, reduce the
   *  threshold to create sparser worlds. Increase the threshold to create denser worlds.
   *  world.isGround(player.position.x, player.position.y)
   */
  isGround(x, y) {
    return noise(x * this.frequency, y * this.frequency) < this.threshold;
  }

  /*
   *  Draws the underlying generated image.
   */
  draw() {
    image(this.image, 0, 0);
  }

  /*
   *  Tests whether the given point is a ground pixel.
   *  Test case:
   *  world.pointIntersectsGround(player.position)
   */
  pointIntersectsGround(point) {
    return this.isGround(point.x, point.y);
  }
  
  /*
   *  Tests if any pixels along the length of a line are grounded
   *  These lines are required to be either horizontal or vertical
   */
  lineVIntersectsGround(x1, y1, dy){
    this.start = dy > 0 ? y1: y1 + dy;
    this.end = dy > 0 ? y1 + dy: y1;
    for(let i = this.start; i <= this.end; i ++){
      if (this.isGround(x1, i)) {
        return true;
      }
    }
    
    return false;
  }
  
  lineHIntersectsGround(x1, y1, dx){
    this.start = dx > 0 ? x1: x1 + dx;
    this.end = dx > 0 ? x1 + dx: x1;
    for(let i = this.start; i <= this.end; i ++){
      if (this.isGround(i, y1)) {
        return true;
      }
    }
    
    return false;
  }
  

  /*
   *  Tests whether any of the pixels in a given rectangle are ground.
   *  Test case:
   *  world.rectIntersectsGround(
   *    player.position.x, player.position.y,
   *    player.w, player.h)
   */
  rectIntersectsGround(x, y, w, h) {
    for (let i = x; i < x + w; i++) {
      for (let j = y; j < y + h; j++) {
        if (this.isGround(i, j)) {
          return true;
        }
      }
    }
    return false;
  }

  /*
   *  Tests whether a sprite's rectangle intersects with the ground
   *  Test case:
   *  world.spriteIntersectsGround(sprite)
   */
  spriteIntersectsGround(sprite) {
    return this.rectIntersectsGround(sprite.x, sprite.y, sprite.w, sprite.h);
  }
}
