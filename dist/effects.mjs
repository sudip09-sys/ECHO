// Original animated world props. All motion is derived from time and can freeze.
export function drawCityLife(c,iso,t,theme,{reduced=false,shards=[],collected=[]}={}){
 const time=reduced?0:t;
 const dot=(p,r,color)=>{c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fillStyle=color;c.fill();};
 const stroke=(points,color,width=1)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.stroke();};
 // A little fountain, with ripples expanding across the plaza.
 const fountain=iso(20.7,14.7);c.save();c.translate(fountain.x,fountain.y);c.scale(1,.5);dot({x:0,y:0},28,'#21394f');dot({x:0,y:0},23,theme.water);for(let i=0;i<3;i++){const r=5+((time*10+i*7)%21);c.globalAlpha=(1-r/28)*.5;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.strokeStyle=theme.secondary;c.lineWidth=1;c.stroke();}c.restore();stroke([{x:fountain.x,y:fountain.y-18},{x:fountain.x,y:fountain.y}],theme.secondary,3);
 // Warm paper lanterns hover above a walkable garden path.
 for(let i=0;i<8;i++){const p=iso(18.8+(i%4)*.8,6.2+Math.floor(i/4)*1.5,42+Math.sin(time*1.3+i)*5);const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,23);glow.addColorStop(0,'#ffc98b40');glow.addColorStop(1,'transparent');dot(p,23,glow);c.fillStyle=i%2?theme.accent:'#ffcc97';c.beginPath();c.roundRect(p.x-4,p.y-7,8,12,3);c.fill();stroke([{x:p.x,y:p.y+5},{x:p.x,y:p.y+14}],theme.accent+'66');}
 // A cat naps on the station approach. Its tail and ears make a small silhouette.
 const cat=iso(11.1,6.1);const tail=Math.sin(time*2)*3;c.save();c.translate(cat.x,cat.y);c.fillStyle='#e7bb9c';c.beginPath();c.ellipse(0,-3,8,4,0,0,Math.PI*2);c.fill();dot({x:6,y:-7},4,'#e7bb9c');c.beginPath();c.moveTo(3,-9);c.lineTo(4,-14);c.lineTo(7,-10);c.lineTo(10,-13);c.lineTo(10,-7);c.fill();stroke([{x:-6,y:-3},{x:-12,y:-6},{x:-13,y:-10+tail}],'#e7bb9c',2);c.restore();
 // Pedestrians stay on decorative paths and never block puzzle movement.
 for(let i=0;i<3;i++){const x=10.3+i*3.1+Math.sin(time*.15+i)*.7,y=7.3;const p=iso(x,y),walk=Math.sin(time*5+i)*2;dot({x:p.x,y:p.y-17},4,'#d3b89e');c.fillStyle=[theme.accent,'#e6b68e',theme.secondary][i];c.fillRect(p.x-4,p.y-13,8,10);stroke([{x:p.x-2,y:p.y-3},{x:p.x-3+walk,y:p.y+2}],'#273749',2);stroke([{x:p.x+2,y:p.y-3},{x:p.x+3-walk,y:p.y+2}],'#273749',2);}
 // Memory lights are real collectibles, not decorative particles.
 for(const shard of shards){if(collected.includes(shard.id))continue;const p=iso(shard.x,shard.y,18+Math.sin(time*2.2+shard.x)*5),r=5+Math.sin(time*3)*.8;const glow=c.createRadialGradient(p.x,p.y,0,p.x,p.y,28);glow.addColorStop(0,theme.accent+'66');glow.addColorStop(1,'transparent');dot(p,28,glow);c.save();c.translate(p.x,p.y);c.rotate(time*.6);c.fillStyle=theme.accent;c.beginPath();c.moveTo(0,-r);c.lineTo(r,0);c.lineTo(0,r);c.lineTo(-r,0);c.closePath();c.fill();c.restore();}
}
