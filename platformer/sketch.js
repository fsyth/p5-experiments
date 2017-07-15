/*global Player, World, Grapple*/

var player,
    world,
    grapple;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(200, 200);
  world = new World(0.4, 0.01);
  grapple = new Grapple(player.position);
}

function draw() {
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
