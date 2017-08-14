/*global SawBlade*/

/*
 *  A class for randomly generated terrain, with methods for ground detection
 */
class World {
  /*
   *  Pass in the threshold below which ground is generated and the spatial frequency of the noise
   *  used in generation.
   */
  constructor() {
    //this.groundColor = color(130, 100, 90);
    //this.skyColor = color(230, 250, 250);

    // Tile size actual is the size of the tile images.
    // Tiles may be scaled up to tile size drawn at lower pixel density.
    this.tileSizeActual = 16;
    this.tilePadding = 2;
    this.tileSizeDrawn = 16;

    // Frequncies for the noise function. The higher the frequency, the smaller the patches formed.
    this.tileNoiseFrequency = 0.1;
    this.subFromNoise = 0.05;
    this.biomeNoiseFrequency = 0.01;

    // Tile names and their row,column indices in the tile set
    this.tileIndex = {
      none: null,
      default: {
        tileset: undefined,
        default: {
          clay:        [0, 0],
          concrete:    [0, 1]
        },
        building: {
          steel:       [1, 0],
          creepyBrick: [1, 1],
          sandstone:   [1, 2],
        }
      },
      jungle: {
        tileset: undefined,
        default: {
          grass:      [0, 0],
          swamp:      [0, 1],
          mud:        [0, 2],
          clay:       [0, 3],
          ash:        [0, 4],
        },
        building: {
          stoneBrick: [1, 0],
          stoneBlock: [1, 1],
          goldBrick:  [1, 2]
        }
      }
    };

    // Dirty flag to keep track of changes made to the buffer
    // Dirty will be set when a tile is created or destroyed, prompting pixel loads and updates.
    this.dirty = false;

    // List of objects in the world to check player for collision against
    this.colliders = [];
  }

  /*
   *  Load in all the tiles required for the world
   */
  load() {
    this.tileIndex.default.tileset = loadImage('tiles/biome-default-16.png');
    this.tileIndex.jungle.tileset  = loadImage('tiles/biome-jungle-16.png');

    // By default, the image will be transparent black
    this.tileNone = createImage(this.tileSizeDrawn, this.tileSizeDrawn);
    /*this.tileNone.loadPixels();
    this.tileNone.pixels.fill(255);
    this.tileNone.updatePixels();*/
  }

  /*
   *  Initialise the world image using tiles
   */
  init(seed) {
    // Seed the world
    if (!seed) {
      // If no seed was provided, produce a string of random chars
      seed = random(0, 1e5) | 0;
    }
    this.seed = seed;
    noiseSeed(seed);

    // Create a buffer to draw the tiles to. It will be transparent black by default
    this.buffer = createGraphics(width, height);

    // The defines which tiles go where and is smaller than the canvas
    this.mapWidth = ceil(width / this.tileSizeDrawn);
    this.mapHeight = ceil(height / this.tileSizeDrawn);

    // Generate a map of noise. These values will be mapped onto tiles
    this.noiseMap = new Array(this.mapWidth * this.mapHeight);
    this.groundMap = new Array(this.mapWidth * this.mapHeight).fill(false);

    for (let i = 0; i < this.mapHeight; i++) {
      for (let j = 0; j < this.mapWidth; j++) {
        // Make some noise
        let tileNoise = this.generateNoise(i, j, this.tileNoiseFrequency, 0),
            subNoise = this.generateNoise(i, j, this.subNoiseFrequency, 1),
            biomeNoise = this.generateNoise(i, j, this.biomeNoiseFrequency, 2);

        // Store the noise in a map
        this.noiseMap[this.lin_ij(i, j)] = [tileNoise, biomeNoise];

        // Use noise to select a biome
        let biome = this.biomeFromNoise(biomeNoise);

        // Use noise and the biome to select a sub-biome
        let subBiome = this.subBiomeFromNoise(subNoise, biome);

        // Get the index of the tile on the tileset
        // null will be returned for a none tile, so no drawing should be done.
        let index = this.tileIndexFromNoise(tileNoise, subBiome, biome);

        // Apply some crude lighting
        this.buffer.tint((tileNoise - 0.15) / 0.25 * 255);

        // Create the specified tile
        this.createTile(index, biome, i, j);

        // Create a collideable object based on noise too, if required
        this.createCollidable(tileNoise, i, j);
      }
    }

    this.buffer.noTint();
  }

  /*
   *  Gets row i, column j tile coordinates from the tile's x,y pixel position
   */
  ij_xy(x, y) {
    if (Array.isArray(x)) [x, y] = x;

    return [y / this.tileSizeDrawn | 0,
            x / this.tileSizeDrawn | 0];
  }

  /*
   *  Gets x,y pixel coordinates from row i, column j tile coordinates
   */
  xy_ij(i, j) {
    if (Array.isArray(i)) [i, j] = i;

    return [j * this.tileSizeDrawn,
            i * this.tileSizeDrawn];
  }

  /*
   *  Gets a linear map index from tile coordinates row i, column j
   */
  lin_ij(i, j) {
    if (Array.isArray(i)) [i, j] = i;

    return j + i * this.mapWidth;
  }

  /*
   *  Gets row i, column j tile coordinates from a linear map index
   */
  ij_lin(lin) {
    return [lin / this.mapWidth | 0,
            lin % this.mapWidth | 0];
  }

  /*
   *  Gets a linear map index from pixel coordinates x,y
   */
  lin_xy(x, y) {
    if (Array.isArray(x)) [x, y] = x;

    return (x / this.tileSizeDrawn | 0) + (y / this.tileSizeDrawn | 0) * this.mapWidth;
  }

  /*
   *  Gets pixel coordinates x,y from a linear map index
   */
  xy_lin(lin) {
    return [(lin / this.mapWidth | 0) * this.tileSizeDrawn,
            (lin % this.mapWidth | 0) * this.tileSizeDrawn];
  }

  /*
   *  Gets a Uint8 address in a pixel buffer from x,y pixel coordinates
   *  and channel c of 'r', 'g', 'b' or 'a'.
   */
  byteAddress_xyc(x, y, c) {
    return 'rgba'.indexOf(c) + 4 * (x + y * this.buffer.width);
  }

  /*
   *  Uses Perlin noise to determine which tile or biome to place in a given tile coordinate.
   *  Pass in the i,j coordinates of the tile, as well as the frequency of the noise to generate.
   *  Optionally pass in an abitrary number for the type of noise. This allows disparate noises to
   *  be generated from the same seed.
   */
  generateNoise(i, j = 0, f = 1, t = 0) {
    return noise(i * f,
                 j * f,
                 t);
  }

  /*
   *  Converts a noise value (range 0-1) to the name of a biome as a string
   */
  biomeFromNoise(n) {
    return n > 0.5 ? 'jungle' : 'default';
  }

  subBiomeFromNoise(n) {
    return n > 0.7 ? 'building': 'default';
  }

  /*
   *  Converts a noise value (range 0-1) to a tile index as [i, j] coordinates on the tileset
   */
  tileIndexFromNoise(n, subBiome, biome) {
    // Air threshold, no further checks needed
    if (n >= 0.4) {
      return this.tileIndex.none;
    }

    // Get the tileset for the biome
    var tileset = this.tileIndex[biome][subBiome];

    // Map the noise value onto a tile
    switch (biome) {
      case 'jungle':
        switch (subBiome) {
          case 'building':
            if (n < 0.30) return tileset.goldBrick;
            if (n < 0.35) return tileset.stoneBlock;
            if (n < 0.40) return tileset.stoneBrick;
            break;

          default:
            if (n < 0.28) return tileset.ash;
            if (n < 0.32) return tileset.clay;
            if (n < 0.36) return tileset.mud;
            if (n < 0.38) return tileset.swamp;
            if (n < 0.40) return tileset.grass;
        }
        break;

      default:
        switch (subBiome) {
          case 'building':
            if (n < 0.32) return tileset.steel;
            if (n < 0.34) return tileset.creepyBrick;
            if (n < 0.36) return tileset.sandstone;
            break;

          default:
            if (n < 0.30) return tileset.concrete;
            if (n < 0.40) return tileset.clay;

        }
    }

    // No specified tile -> air
    return this.tileIndex.none;
  }

  /*
   *  Maps a tile index onto its pixel coordinates on the tileset spritesheet
   */
  coordFromTileIndex(index) {
    var [i, j] = index;
    return [j * (this.tileSizeActual + this.tilePadding),
            i * (this.tileSizeActual + this.tilePadding)];
  }

  /*
   *  Draws a given tile index (e.g. world.tileIndex.clay) at row i, column j in the map grid.
   *  The function also ensures that the ground map used for collision detection is updated.
   */
  createTile(index, biome, i, j) {
    // Don't draw none or undefined tiles
    if (index === null) {
      return;
    }

    // Update dirty pixels before drawing to the buffer
    if (this.dirty) {
      this.buffer.updatePixels();
      this.dirty = false;
    }

    this.groundMap[this.lin_ij(i, j)] = true;

    // Convert the index to pixel coordinates on the tileset
    let [sx, sy] = this.coordFromTileIndex(index);

    // Get the tilset image based on the biome
    let tileset = this.tileIndex[biome].tileset;

    this.buffer.image(tileset,
                      this.tileSizeDrawn * j,
                      this.tileSizeDrawn * i,
                      this.tileSizeDrawn,
                      this.tileSizeDrawn,
                      sx,
                      sy,
                      this.tileSizeActual,
                      this.tileSizeActual);
  }

  /*
   *  Destroys the tile at row i, column j in the map grid, and removes it from the ground collision
   *  detection map.
   */
  destroyTile(i, j) {
    // This method will make the buffer dirty since it needs to load pixels
    if (!this.dirty) {
      this.dirty = true;
      this.buffer.loadPixels();
    }

    this.groundMap[this.lin_ij(i, j)] = false;

    // Manually set the alpha channel of pixels to transparent. This seems a bit overkill, but
    // replace blending a transparent image over the top doesn't seem to work.
    for (let y = i * this.tileSizeDrawn; y < (i + 1) * this.tileSizeDrawn; y++) {
      for (let x = j * this.tileSizeDrawn; x < (j + 1) * this.tileSizeDrawn; x++) {
        this.buffer.pixels[this.byteAddress_xyc(x, y, 'a')] = 0;
      }
    }

    // These methods should work, but there may be something wrong with p5's current implementation

    /*
    this.buffer.blendMode(REPLACE);
    this.buffer.image(this.tileNone,
                      this.tileSizeDrawn * j,
                      this.tileSizeDrawn * i);
    */

    /*
    this.buffer.blend(this.tileNone,
                      0,
                      0,
                      this.tileSizeDrawn,
                      this.tileSizeDrawn,
                      this.tileSizeDrawn * j,
                      this.tileSizeDrawn * i,
                      this.tileSizeDrawn,
                      this.tileSizeDrawn,
                      REPLACE);
    */
  }

  /*
   *  Given a pixel coordinate x, y, returns whether that tile is ground and collideable or not.
   */
  isGround(x, y) {
    // This is far too slow and leaks a ton of memory:
    //return this.buffer.get(x, y).alpha === 0;

    // This is faster, but requires the ground map to be kept up to date
    return this.groundMap[this.lin_xy(x, y)];
  }

  /*
   *  Creates a collidable object based on the noise value at the given tile coordinates
   */
  createCollidable(noise, i, j) {
    // Convert from tile coordinates to pixel coordinates (top-left corner)
    let [x, y] = this.xy_ij(i, j);

    if (noise > 0.8) {
      // Sawblade
      this.addCollider(new SawBlade(
        x + 0.5 * this.tileSizeDrawn,
        y + 0.5 * this.tileSizeDrawn,
        this.tileSizeDrawn / 2
      ));
    }
  }

  /*
   *  Calls update on the world's collidables
   */
  update() {
    for (let c of this.colliders) {
      c.update();
    }
  }

  /*
   *  Draws the underlying generated image.
   */
  draw() {
    if (this.dirty) {
      // Update pixels if any changes were made
      this.buffer.updatePixels();
      this.dirty = false;
    }

    background(230, 250, 250);
    image(this.buffer, 0, 0, width, height);

    // Draw all the collideable objects too
    for (let c of this.colliders) {
      c.draw();
    }
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

  /*
   *  Adds an object to the list of collidables. Collisions can be checked for by calling
   *  world.update
   */
  addCollider(obj) {
    this.colliders.push(obj);
  }

  /*
   *  Removes an object from the list of colliders
   */
  removeCollider(obj) {
    let i = this.colliders.indexOf(obj);
    if (i === -1) {
      console.error('Collider not found: ', obj);
    } else {
      this.colliders.splice(i, 1);
    }
  }
}
