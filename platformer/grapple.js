/*global player, world*/

class Grapple {

  /*
   *  Construct it with a vector for the start point
   */
  constructor(startPt) {
    this.startPoint = startPt;
    this.endPoint = null;
    this.targetPoint = null;
    this.velocity = null;
    this.maxSpeed = 13;
    this.stiffness = 0.1;
    this.maxForce = 6;
    this.maxLength = 350;
    this.drawState = this.drawRetracted;
  }


  onMousePressed() {
    this.endPoint = this.startPoint.copy();
    this.targetPoint = createVector(mouseX, mouseY);
    this.velocity = p5.Vector.sub(this.targetPoint, this.startPoint).limit(this.maxSpeed);
  }

  onMouseReleased() {
    this.targetPoint = null;
  }

  update() {
    // Check if a target point is set. If so, it is extending or extended.
    if (this.targetPoint) {
      if (world.pointIntersectsGround(this.endPoint)) {
        // Hit ground -> fully extended

        this.drawState = this.drawExtended;

        // Apply a force to the player in towards endpoint
        player.addForceVec(
          p5.Vector.sub(this.endPoint, this.startPoint).mult(this.stiffness).limit(this.maxForce));

      } else if (p5.Vector.sub(this.endPoint, this.startPoint).magSq() > sq(this.maxLength)) {
        // If the grapple reaches its maximum length without hitting anything, retract it
        this.targetPoint = null;
        this.drawState = this.drawRetracting;

      } else {
        // The grapple has not hit ground, so is still extending. Move the end towards the target.
        this.drawState = this.drawExtending;
        this.endPoint.add(this.velocity);
      }

    } else if (this.endPoint) {
      // If there there is an end point but no target, the grapple must be retracting
      this.drawState = this.drawRetracting;
      this.velocity = p5.Vector.sub(this.startPoint, this.endPoint).limit(this.maxSpeed);
      this.endPoint.add(this.velocity);

      // The grapple is no longer in flight once it fully retracts
      if (this.endPoint.equals(this.startPoint)) {
        this.endPoint = null;
        this.drawState = this.drawRetracted;
      }
    }
  }

  draw() {
    this.drawState();
  }

  drawRetracted() {
    ellipse(this.startPoint.x, this.startPoint.y, 4, 4);
  }

  drawExtending() {
    let displacement = p5.Vector.sub(this.endPoint, this.startPoint),
        distance = displacement.mag(),
        increment = 10 / distance;

    const amp = 30,
          freq = 0.1,
          animSpeed = 1;

    push();
    translate(this.startPoint.x, this.startPoint.y);
    rotate(atan2(displacement.y, displacement.x));
    beginShape();
    curveVertex(0, 0);
    for (let d = 0; d <= 1; d += increment) {
      curveVertex(d * distance,
                  amp * d * (1 - d) * sin(sq(d) * distance * freq - frameCount * animSpeed));
    }
    endShape();
    pop();
  }

  drawExtended() {
    line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
    ellipse(this.endPoint.x, this.endPoint.y, 4, 4);
  }

  drawRetracting() {
    line(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
  }
}
