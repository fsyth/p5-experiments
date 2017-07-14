/*global Player*/

class Grapple {
  /*
   *  Construct it with a vector for the start point
   */
  constructor(startPt) {
    this.startPoint = startPt;
    this.endPoint = null;
    this.speed = 20;
  }

  onMousePressed() {
    this.endPoint = this.startPoint.copy();
  }

  onMouseDragged() {


    // ground detection
  }

  onMouseReleased() {
    this.endPoint = null;
  }

  draw() {
    if (this.endPoint) {
      this.endPoint.add(p5.Vector
        .sub(createVector(mouseX, mouseY), this.endPoint)
        .limit(this.speed));

      var displacement = p5.Vector.sub(this.endPoint, this.startPoint),
          distance = displacement.mag(),
          increment = 1,
          amp = 10,
          freq = 0.1,
          animationSpeed = 1;

      push();

      translate(this.startPoint.x, this.startPoint.y);
      rotate(atan2(displacement.y, displacement.x));

      noFill();
      stroke(0);

      beginShape();
      for (let d = 0; d < distance; d += increment) {
        curveVertex(d, amp * pow(d/distance, 0.1) * sin(d * d / distance * freq - frameCount * animationSpeed));
      }
      endShape();

      pop();

    }
  }
}
