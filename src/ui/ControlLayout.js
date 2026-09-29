function makeRect(x,y,w,h){ return {x,y,w,h}; }

function buildControlLayout(canvas){
  const w=canvas.width;
  const h=canvas.height;

  return {
    left: makeRect(14, h-64, 54, 44),
    right: makeRect(74, h-64, 54, 44),
    jump: makeRect(w-132, h-64, 52, 44),
    shoot: makeRect(w-70, h-64, 52, 44),
    pause: makeRect(w-48, 10, 38, 34)
  };
}

function contains(rect,x,y){
  return x>=rect.x && x<=rect.x+rect.w &&
         y>=rect.y && y<=rect.y+rect.h;
}

module.exports={buildControlLayout,contains};
