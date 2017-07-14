/*global Player*/

var player;

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(200, 200);
}

function draw() {
  background(51);
  player.move();
  player.draw();
}

