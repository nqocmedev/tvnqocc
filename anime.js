/* =====================================================
   ANIME GROUND SPRITE ENGINE
   Rabbit vs Mouse – Sprite Animation – Bottom Strip
===================================================== */

const canvas = document.getElementById("animeBg");
const ctx = canvas.getContext("2d");

const GROUND_HEIGHT = 200;

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = GROUND_HEIGHT;
}
window.addEventListener("resize", resize);
resize();

/* ===== LOAD SPRITES ===== */
const rabbitImg = new Image();
rabbitImg.src = "assets/rabbit.png";

const mouseImg = new Image();
mouseImg.src = "assets/mouse.png";

/* ===== SPRITE CONFIG ===== */
const SPRITE = {
  rabbit: { frameCount: 8, w: 128, h: 128 },
  mouse:  { frameCount: 8, w: 128, h: 128 }
};

/* ===== ENTITIES ===== */
const rabbit = {
  x: -200,
  y: 120,
  speed: 1.2,
  frame: 0,
  tick: 0
};

const mouse = {
  x: 200,
  y: 130,
  speed: 1.8,
  frame: 0,
  tick: 0
};

/* ===== PARALLAX ===== */
let parallax = 0;
document.addEventListener("mousemove", e => {
  parallax = (e.clientX / window.innerWidth - 0.5) * 40;
});

/* ===== GRASS ===== */
const grass = [];
for(let i=0;i<80;i++){
  grass.push({
    x: i * 30,
    h: 20 + Math.random() * 30
  });
}

function drawGrass(){
  ctx.strokeStyle = "#22c55e";
  grass.forEach(g=>{
    g.x -= 1;
    if(g.x < 0) g.x = canvas.width;
    ctx.beginPath();
    ctx.moveTo(g.x, canvas.height);
    ctx.lineTo(g.x, canvas.height - g.h);
    ctx.stroke();
  });
}

/* ===== DRAW SPRITE ===== */
function drawSprite(img, sprite, ent){
  ent.tick++;
  if(ent.tick % 6 === 0){
    ent.frame = (ent.frame + 1) % sprite.frameCount;
  }

  ctx.drawImage(
    img,
    ent.frame * sprite.w, 0,
    sprite.w, sprite.h,
    ent.x + parallax,
    ent.y,
    sprite.w * 0.9,
    sprite.h * 0.9
  );
}

/* ===== GLOW ===== */
function glow(x,y,r){
  const g = ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,"rgba(139,92,246,.35)");
  g.addColorStop(1,"transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x,y,r,0,Math.PI*2);
  ctx.fill();
}

/* ===== LOOP ===== */
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  /* ground base */
  ctx.fillStyle = "rgba(34,197,94,.08)";
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  drawGrass();

  /* move */
  mouse.x += mouse.speed;
  rabbit.x += rabbit.speed;

  if(mouse.x > canvas.width + 100) mouse.x = -200;
  if(rabbit.x > canvas.width + 200) rabbit.x = -300;

  /* glow */
  glow(mouse.x + parallax + 40, mouse.y + 60, 40);
  glow(rabbit.x + parallax + 40, rabbit.y + 60, 55);

  /* draw */
  drawSprite(mouseImg, SPRITE.mouse, mouse);
  drawSprite(rabbitImg, SPRITE.rabbit, rabbit);

  requestAnimationFrame(animate);
}

Promise.all([
  new Promise(r=>rabbitImg.onload=r),
  new Promise(r=>mouseImg.onload=r)
]).then(animate);
