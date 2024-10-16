function rotateDivWithCursor(Id, easeValue) {
    var rotatingDiv = document.getElementById(Id);
    var currentRotation = 0;
    var targetRotation = 0;
    var ease = easeValue || 0.1;

    document.addEventListener('mousemove', function (e) {
        var mouseX = e.clientX;
        var mouseY = e.clientY;

        var rect = rotatingDiv.getBoundingClientRect();
        var divX = rect.left + rect.width / 2;
        var divY = rect.top + rect.height / 2;

        var radians = Math.atan2(mouseY - divY, mouseX - divX);
        var degrees = radians * (180/Math.PI);

        targetRotation = degrees;
    });
    document.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        var touchX = touch.clientX;
        var touchY = touch.clientY;
      
        var rect = rotatingDiv.getBoundingClientRect();
        var divX = rect.left + rect.width / 2;
        var divY = rect.top + rect.height / 2;
      
        var radians = Math.atan2(-touchY - divY, -touchX - divX);
        var degrees = radians * (180 / Math.PI);
      
        targetRotation = degrees;
      });

    function rotate() {
        var delta = targetRotation - currentRotation;
        currentRotation += delta * ease;

        rotatingDiv.style.transform = 'translate(-50%, -50%) rotate(' + currentRotation + 'deg)';

        requestAnimationFrame(rotate);
    }

    rotate();
}
rotateDivWithCursor('astronauta', 0.01);

/*
function generateRandomPosition() {
    var container = document.getElementById("container");
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");


    var containerWidth = container.offsetWidth;
    var containerHeight = container.offsetHeight;

    // Definir el tamaño del SVG
    svg.setAttribute("width", containerWidth);
    svg.setAttribute("height", containerHeight);
    // Generar posiciones aleatorias



    // Definir el tamaño de la imagen SVG

    for (var i = 0; i < 40; i++) {
        var posX = Math.floor(Math.random() * (container.offsetWidth - 100));
        var posY = Math.floor(Math.random() * (container.offsetHeight - 100));
        var widthR = Math.random() * 100;
        var heightR = Math.random() * 100;
        var img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        // Definir atributos de la imagen
        img.setAttribute("class", "stars");
        img.setAttribute("x", posX);
        img.setAttribute("y", posY);
        img.setAttribute("width", widthR);
        img.setAttribute("height", heightR);
        img.setAttributeNS("http://www.w3.org/1999/xlink", "href", "estrella.svg");

        // Añadir la imagen al SVG y el SVG al contenedor
        svg.appendChild(img);
    }
    container.appendChild(svg);
}
generateRandomPosition()
*/















var STAR_COUNT = (window.innerWidth + window.innerHeight) / 24,
STAR_SIZE = 10,
STAR_MIN_SCALE = 0.2,
OVERFLOW_THRESHOLD = 50;

var canvas = document.querySelector('canvas'),
context = canvas.getContext('2d');

var scale = 1, // device pixel ratio
width = void 0,
height = void 0;

var stars = [];

var pointerX = void 0,
pointerY = void 0;

var velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };

var touchInput = false;

generate();
resize();
step();

window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

function generate() {

  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: 0,
      y: 0,
      z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE) });

  }

}

function placeStar(star) {

  star.x = Math.random() * width;
  star.y = Math.random() * height;

}

function recycleStar(star) {

  var direction = 'z';

  var vx = Math.abs(velocity.x),
  vy = Math.abs(velocity.y);

  if (vx > 1 || vy > 1) {
    var axis = void 0;

    if (vx > vy) {
      axis = Math.random() < vx / (vx + vy) ? 'h' : 'v';
    } else
    {
      axis = Math.random() < vy / (vx + vy) ? 'v' : 'h';
    }

    if (axis === 'h') {
      direction = velocity.x > 0 ? 'l' : 'r';
    } else
    {
      direction = velocity.y > 0 ? 't' : 'b';
    }
  }

  star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

  if (direction === 'z') {
    star.z = 0.1;
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  } else
  if (direction === 'l') {
    star.x = -OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else
  if (direction === 'r') {
    star.x = width + OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else
  if (direction === 't') {
    star.x = width * Math.random();
    star.y = -OVERFLOW_THRESHOLD;
  } else
  if (direction === 'b') {
    star.x = width * Math.random();
    star.y = height + OVERFLOW_THRESHOLD;
  }

}

function resize() {

  scale = window.devicePixelRatio || 1;

  width = window.innerWidth * scale;
  height = window.innerHeight * scale;

  canvas.width = width;
  canvas.height = height;

  stars.forEach(placeStar);

}

function step() {

  context.clearRect(0, 0, width, height);

  update();
  render();

  requestAnimationFrame(step);

}

function update() {

  velocity.tx *= 0.96;
  velocity.ty *= 0.96;

  velocity.x += (velocity.tx - velocity.x) * 0.8;
  velocity.y += (velocity.ty - velocity.y) * 0.8;

  stars.forEach(function (star) {

    star.x += velocity.x * star.z;
    star.y += velocity.y * star.z;

    star.x += (star.x - width / 2) * velocity.z * star.z;
    star.y += (star.y - height / 2) * velocity.z * star.z;
    star.z += velocity.z;

    // recycle when out of bounds
    if (star.x < -OVERFLOW_THRESHOLD || star.x > width + OVERFLOW_THRESHOLD || star.y < -OVERFLOW_THRESHOLD || star.y > height + OVERFLOW_THRESHOLD) {
      recycleStar(star);
    }

  });

}

function render() {

  stars.forEach(function (star) {

    context.beginPath();
    context.shadowColor = 'rgb(243, 129, 178' + (0.5+0.5*Math.random()) + ')';
    //context.shadowBlur = 12+ (5*Math.random());
    context.lineCap = 'round';
    context.lineWidth = STAR_SIZE * star.z * scale;
    context.strokeStyle = 'rgba(255,255,255,' + (0.2+0.8*Math.random()) + ')';
    
    context.beginPath();
    context.moveTo(star.x, star.y);

    var tailX = velocity.x *2,
    tailY = velocity.y *2;      

    // stroke() wont work on an invisible line
    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    context.lineTo(star.x + tailX, star.y + tailY);

    context.stroke();

  });

}

function movePointer(x, y) {

  if (typeof pointerX === 'number' && typeof pointerY === 'number') {

    var ox = x - pointerX,
    oy = y - pointerY;

    velocity.tx = velocity.tx + ox /  8 * scale * (touchInput ? 1 : -1);
    velocity.ty = velocity.ty + oy / 8 * scale * (touchInput ? 1 : -1);
  }

  pointerX = x;
  pointerY = y;

}

function onMouseMove(event) {

  touchInput = false;

  movePointer(event.clientX, event.clientY);

}

function onTouchMove(event) {

  touchInput = true;

  movePointer(event.touches[0].clientX, event.touches[0].clientY, true);

  event.preventDefault();

}

function onMouseLeave() {

  pointerX = null;
  pointerY = null;

}
