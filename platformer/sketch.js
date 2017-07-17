/*global Player, World, Grapple*/

var player,
    world,
    grapple;

function preload() {
  world = new World(0.4, 0.1);
  world.load();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world.init();
  player = new Player(200, 200);
  grapple = new Grapple(player.position);
}

function draw() {
  background(230, 250, 250);
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
