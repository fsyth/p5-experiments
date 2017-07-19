/*
 *  Geometry utility functions
 */
const Geometry = {
  /*
   *  Checks a circle object { x, y, r } against a rectangle object { x, y, w, h } for
   *  intersection.
   *  Instead of calculating the intersection between a circle and rectangle, this can be
   *  considered as the intersection of a point and a slightly larger rectangle with rounded
   *  corners.
   */
  intersectionCircleRectangle: (circle, rect) => {
    // Find the distance between the centres of the rectangle and circle in x,y directions
    var dx = abs(rect.x + rect.w/2 - circle.x),
        dy = abs(rect.y + rect.h/2 - circle.y);

    // Check if circle touches the edges of the rectangle
    // If the centre distance is bigger than their combined radii/half-widths,
    // they are out of range of each other not intersecting
    if (dx > rect.w/2 + circle.r ||
        dy > rect.h/2 + circle.r) return false;

    // Check if the circle's centre lies within the rectangle
    if (dx <= rect.w/2 &&
        dy <= rect.h/2) return true;

    // Special case for the corners of the rectangle intersecting the circle.
    // Compare the distance from the reactangle's corner to the centre of the circle with the
    // radius of the circle. Both sides of this operation can be squared to eliminate the
    // square root operation in measuring distances.
    return sq(dx - rect.w/2) + sq(dy - rect.h/2) <= sq(circle.r);
  }
};
