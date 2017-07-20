/*global Player, World, Grapple, SawBlade*/

var player,
    world,
    grapple,
    sawblade;

function preload() {
  world = new World();
  world.load();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world.init();
  player = new Player(200, 200);
  grapple = new Grapple(player.position);
  sawblade = new SawBlade(300, 300, 16);
}

function draw() {
  world.draw();
  grapple.update();
  player.update();
  sawblade.update();
  player.draw();
  grapple.draw();
  sawblade.draw();
}

function mousePressed() {
  grapple.onMousePressed();
}

function mouseReleased() {
  grapple.onMouseReleased();
}
