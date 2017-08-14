/*global Player, World*/

var player,
    world;

function preload() {
  world = new World();
  world.load();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world.init();
  player = new Player(200, 200);

  createSeedUi();
}

function draw() {
  world.update();
  world.draw();

  player.update();
  player.draw();
}

function mousePressed() {
  player.grapple.onMousePressed();
}

function mouseReleased() {
  player.grapple.onMouseReleased();
}


function createSeedUi() {
  let regen = createButton('Random'),
      seed = createInput(world.seed, 'number');

  regen.position(20, 20);
  regen.size(64, 20);
  seed.position(20, 40);
  seed.size(60, 20);

  regen.mousePressed(e => {
    world.init();
    seed.value(world.seed);
  });

  seed.changed(e => {
    world.init(seed.value());
  });
}
