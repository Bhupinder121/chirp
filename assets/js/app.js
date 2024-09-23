// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "../vendor/topbar";

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;

class Track {
  constructor(pos, raidus, hue) {
    this.pos = pos;
    this.hue = hue;
    this.raidus = raidus;
    this.period = Math.PI;
  }

  getPosition(offset) {
    let x = this.pos.x + Math.cos(offset) * this.raidus;
    let y = this.pos.y - Math.abs(Math.sin(offset)) * this.raidus;
    let round = Math.floor(offset / this.period);
    let progress = (offset % this.period) / this.period;
    return { x: x, y: y, round: round, progress: progress };
  }

  draw(ctx) {
    ctx.beginPath();
    for (let i = 0; i < Math.PI * 2; i += 0.01) {
      let pos = this.getPosition(i);
      ctx.lineTo(pos.x, pos.y);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx.stroke();
  }
}

class Ball {
  constructor(track, radius, speed, frequency, hue) {
    this.track = track;
    this.radius = radius;
    this.hue;
    this.speed = speed;
    this.progress = 0;
    this.frequency = frequency;
    this.offset = 0;
    this.round = 1;
    this.pos = this.track.getPosition(this.offset);
  }

  move() {
    this.offset += this.speed;
    this.pos = this.track.getPosition(this.offset);
    this.progress = this.pos.progress;
    if (this.pos.round != this.round) {
      this.round = this.pos.round;
      // playSound(this.frequency);
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    const lightness = 50 * this.progress;
    ctx.fillStyle = `hsl(${this.hue}, 100%, ${50}%)`;
    ctx.fill();
    ctx.stroke();
  }
}

let canvas = document.querySelector("canvas");
let size = 1000;
canvas.width = size;
canvas.height = size;

let ctx = canvas.getContext("2d");
let tracks = [];
let balls = [];
let N = 20;

let trackpos = { x: size / 2, y: size / 2 };
let trackMinRadius = 100;
let trackStep = 15;

const soundFrequencies = [
  1760, 1567.98, 1396.91, 1318.51, 1174.66, 1046.5, 987.77, 880, 783.99, 698.46,
  659.25, 587.33, 523.25, 493.88, 440, 392, 349.23, 329.63, 293.66, 261.63,
];

let ballRadius = 6;
let ballMinSpeed = 0.01;
let ballSpeedStep = -0.0001;

for (let i = 0; i < N; i++) {
  let trackRadius = trackMinRadius + i * trackStep;
  let ballSpeed = ballMinSpeed + i * ballSpeedStep;
  hue = i * N + 360;
  let track = new Track(trackpos, trackRadius, hue);
  let soundFrequency = soundFrequencies[i];
  let ball = new Ball(track, ballRadius, ballSpeed, soundFrequency, hue);

  tracks.push(track);
  balls.push(ball);
}

animate();

function animate() {
  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < N; i++) {
    tracks[i].draw(ctx);
    balls[i].move();
    balls[i].draw(ctx);
  }

  requestAnimationFrame(animate);
}
