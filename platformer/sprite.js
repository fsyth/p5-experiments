/*
 *  Sprite class, defining an image positioned in a rectangle
 */
class Sprite {
  constructor(x, y, imagePath) {
    this.x = x;
    this.y = y;
    this.imagePath = imagePath;
  }

  /*
   *  Call load during the preload stage to load in image data
   */
  load() {
    loadImage(this.imagePath, img => {
      this.image = img;
      this.w = img.width;
      this.h = img.height;
      console.log(`Loaded ${this.imagePath}`);
    }, err => console.log);
  }

  /*
   *  Draw the image in the defined rectangle
   */
  draw() {
    image(this.image, this.x, this.y, this.w, this.h);
  }
}
