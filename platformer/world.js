class World {
  constructor(threshold, frequency) {
    this.threshold = threshold;
    this.frequency = frequency;
    this.image = createImage(width, height);
    this.image.loadPixels();
    for (let row = 0; row < width; row++) {
      for (let col = 0; col < height; col++) {
        this.image.set(row, col,
          noise(row * this.frequency, col * this.frequency) > this.threshold ?
          color(230, 250, 250) : color(130, 100, 90));
      }
    }
    this.image.updatePixels();
  }

  draw() {
    image(this.image, 0, 0);
  }
}
