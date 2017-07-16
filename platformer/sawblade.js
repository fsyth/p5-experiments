

class SawBlade {
  
  constructor (x, y){
    this.position = createVector(x, y);
    this.radius = 8;
    this.detectionRadius = this.radius * 3;
    
    // Sprite - not actually implemented yet
    this.sprite = new Sprite(x, y, 'assets/sawblade.png');
  }
  
  checkCollisionPointAndCircle(targetVec) {
    
    if((p5.Vector.sub(targetVec, this.position)).mag() < this.radius) {
      return true;
    } else {
      return false;
    }
  }
  
  /*
    Checks for a collision between this saw blade and the players pos
    
    @param players position
    @param players clipping width
    @param players clipping height
  */
  checkCollisionPlayer(vec, w, h) {
    /*
       _
      | |   __
      |_|  /  \
           \__/
    */
    
    // Quick calculations to determine if the player is close
    if(abs(vec.x - this.position.x) > this.detectionRadius) return false;
    if(abs(vec.y - this.position.y) > this.detectionRadius) return false;
    
    // If the player is close do more precise collisions
    // If any of the players corners are within the circle then a collision has been detected
    this.tmpVec = vec.copy();
    
    // Top Left
    if( this.checkCollisionPointAndCircle(this.tmpVec)) return true;
    
    // Top Right
    this.tmpVec.x += w;
    if( this.checkCollisionPointAndCircle(this.tmpVec)) return true;
    
    // Bottom Right
    this.tmpVec.y += h;
    if( this.checkCollisionPointAndCircle(this.tmpVec)) return true;
    
    // Bottom Left
    this.tmpVec.x -= w;
    if( this.checkCollisionPointAndCircle(this.tmpVec)) return true;
    
    // If none of the coordinates intersect the circle then return false
    return false;
  }
  
  draw() {
    ellipse(this.position.x - this.radius, 
            this.position.y - this.radius, 
            this.radius * 2, 
            this.radius * 2);
  }
}
