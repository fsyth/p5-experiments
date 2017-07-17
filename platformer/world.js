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

    //this.groundColor = color(130, 100, 90);
    //this.skyColor = color(230, 250, 250);

    // Tile size actual is the size of the tile images.
    // Tiles may be scaled up to tile size drawn at lower pixel density.
    this.tileSizeActual = 8;
    this.tileSizeDrawn = 16;


    // Tile names and their x,y indices in the tile set
    this.tileIndex = {
      none: null,
      steel: [0,0],
      creepyBricks: [1,0],
      clay: [2,0],
      sandstone: [3,0],
      concrete: [4,0]
    };
  }

  /*
   *  Load in all the tiles required for the world
   */
  load() {
    this.tileSet = loadImage('Assets/worldBlocksRaw.png');
    this.tileNone = createImage(this.tileSizeDrawn, this.tileSizeDrawn);
    this.tileNone.loadPixels();
    this.tileNone.pixels.fill(0);
    this.tileNone.updatePixels();
  }

  /*
   *  Initialise the world image using tiles
   */
  init() {
    // Create a buffer to draw the tiles to.
    this.buffer = createGraphics(width, height);

    // Set background to transparent
    this.buffer.loadPixels();
    this.buffer.pixels.fill(0);
    this.buffer.updatePixels();

    // The defines which tiles go where and is smaller than the canvas
    this.mapWidth = ceil(width / this.tileSizeDrawn);
    this.mapHeight = ceil(height / this.tileSizeDrawn);

    // Generate a map of noise. These values will be mapped onto tiles
    this.noiseMap = new Array(this.mapWidth * this.mapHeight);
    this.groundMap = new Array(this.mapWidth * this.mapHeight).fill(false);

    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        let n = this.generateNoise(j, i);
        this.noiseMap[j + i * this.mapWidth] = n;

        // Get the index of the tile on the tileset
        // null will be returned for a none tile, so no drawing should be done.
        let index = this.noiseToTileIndex(n);

        if (index) {
          this.groundMap[j + i * this.mapWidth] = true;

          // Convert the index to pixel coordinates on the tileset
          let coord = this.tileIndexToCoord(index);

          this.buffer.image(this.tileSet,
                            this.tileSizeDrawn * j,
                            this.tileSizeDrawn * i,
                            this.tileSizeDrawn,
                            this.tileSizeDrawn,
                            coord[0],
                            coord[1],
                            this.tileSizeActual,
                            this.tileSizeActual);
        }
      }
    }
  }

  /*
   *  Converts a noise value (range 0-1) to a tile
   */
  noiseToTileIndex(n) {
    if (n < 0.30) return this.tileIndex.concrete;
    if (n < 0.32) return this.tileIndex.steel;
    if (n < 0.33) return this.tileIndex.creepyBricks;
    if (n < 0.35) return this.tileIndex.sandstone;
    if (n < 0.40) return this.tileIndex.clay;
    return this.tileIndex.none;
  }

  /*
   *  Maps a tile index onto its pixel coordinates on the tileset spritesheet
   */
  tileIndexToCoord(index) {
    return index.map(e => e * (this.tileSizeActual + 1));
  }

  /*
   *  Uses Perlin noise to determine which tile to place in a given tile coordinate.
   */
  generateNoise(i, j) {
    return noise(i * this.frequency, j * this.frequency);
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
    // This is far too slow and leaks a ton of memory:
    //return this.buffer.get(x, y).alpha === 0;

    // This is faster, but will become out of date if the terrain changes
    return this.groundMap[(x / this.tileSizeDrawn | 0) + (y / this.tileSizeDrawn | 0) * this.mapWidth];
  }

  /*
   *  Draws the underlying generated image.
   */
  draw() {
    background(230, 250, 250);
    image(this.buffer, 0, 0, width, height);
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
    var start = min(y1, y1 + dy),
        end = max(y1,  y1 + dy);

    for (let i = start; i <= end; i++) {
      if (this.isGround(x1, i)) {
        return true;
      }
    }

    return false;
  }

  lineHIntersectsGround(x1, y1, dx){
    var start = min(x1, x1 + dx),
        end = max(x1, x1 + dx);

    for (let i = start; i <= end; i++) {
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
