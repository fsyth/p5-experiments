/*global Player, World*/

var player,
    world;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(200, 200);
  world = new World(0.4, 0.01);
}

function draw() {
  world.draw();
  player.move();
  player.grounded = world.rectIntersectsGround(
    player.position.x, player.position.y, player.w, player.h);
  player.draw();
}

