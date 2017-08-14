/*global Player, World, Grapple, SawBlade*/

var player,
    world,
    grapple;

function preload() {
  world = new World();
  world.load();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world.init();
  player = new Player(200, 200);
  grapple = new Grapple(player.position);

  createSeedUi();
}

function draw() {
  world.update();
  world.draw();
  grapple.update();
  player.update();
  player.draw();
  grapple.draw();
}

function mousePressed() {
  grapple.onMousePressed();
}

function mouseReleased() {
  grapple.onMouseReleased();
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
