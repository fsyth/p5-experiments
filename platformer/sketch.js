/*global Player, World, Grapple, SawBlade*/

var player,
    world,
    grapple,
    sawblade;

function preload() {
  world = new World(0.4, 0.1);
  world.load();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world.init();
  player = new Player(200, 200);
  grapple = new Grapple(player.position);
  sawblade = new SawBlade(300,300);
}

function draw() {
  world.draw();
  grapple.update();
  player.update();
  player.draw();
  grapple.draw();
  sawblade.draw();
  if (sawblade.checkCollisionPlayer()) {
    fill(255, 0, 0);
  } else {
    fill(255);
  }
}

function mousePressed() {
  grapple.onMousePressed();
}

function mouseReleased() {
  grapple.onMouseReleased();
}
