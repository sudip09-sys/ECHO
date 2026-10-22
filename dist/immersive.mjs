import {BLOCKS,voxelBlocks,raycastBlocks} from './blocks.mjs';

import {WORLD,SHARDS,buildingsFor,missionsFor,echoAt,blocked} from './engine.mjs';
import {createStreetRenderer} from './street3d.mjs';
const norm=a=>{const d=Math.hypot(...a)||1;return a.map(v=>v/d)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export function immersiveCamera(p,{mode='tpp',yaw=-Math.PI*.75,pitch=-.12,overview=false,aspect=1200/760,chapter=1,gateOpen=false}={}){
 const dir=[Math.cos(yaw),Math.sin(yaw)],stance=p.stance==='prone'?.38:p.stance==='crouch'?.82:1.45;
 let eye,target;
 if(overview){eye=[31,30,29];target=[12,10,0];}
 else if(mode==='fpp'){eye=[p.x,p.y,stance+(p.z||0)];target=[eye[0]+dir[0]*10,eye[1]+dir[1]*10,eye[2]+Math.sin(pitch)*10];}
 else {let distance=4.8;for(let d=.5;d<4.8;d+=.2)if(blocked(p.x-dir[0]*d,p.y-dir[1]*d,gateOpen,chapter)){distance=Math.max(.5,d-.3);break;}eye=[p.x-dir[0]*distance,p.y-dir[1]*distance,2.6+(p.z||0)];target=[p.x+dir[0]*1.8,p.y+dir[1]*1.8,stance*.75+(p.z||0)+pitch*3];}
 const forward=norm(target.map((v,i)=>v-eye[i])),right=norm(cross([0,0,1],forward)),up=cross(forward,right);
 return {eye,forward,right,up,aspect,f:1.28};
}
export function projectImmersive(x,y,z,cam){const v=[x-cam.eye[0],y-cam.eye[1],z-cam.eye[2]],depth=dot(v,cam.forward);return {x:600+dot(v,cam.right)*cam.f/cam.aspect/depth*600,y:380-dot(v,cam.up)*cam.f/depth*380,depth};}
export function pickImmersive(x,y,cam){const u=(x/600-1)*cam.aspect/cam.f,v=(1-y/380)/cam.f,ray=cam.forward.map((n,i)=>n+cam.right[i]*u+cam.up[i]*v);if(ray[2]>=-.0001)return null;const d=-cam.eye[2]/ray[2];if(d>90)return null;return {x:cam.eye[0]+ray[0]*d,y:cam.eye[1]+ray[1]*d};}
export const CITY_ART=[
 {sky:[.47,.71,.91],floor:'#74a751',road:'#a18f70',wall:['#5b647d','#8c7e8b','#5d8190','#a48279'],light:'#ffc98a',leaf:'#66958b',water:'#254c65'},
 {sky:[.55,.78,.9],floor:'#d6c28e',road:'#abb5b2',wall:['#d4dedb','#799dba','#e1b48e','#8bada8'],light:'#ffe1a6',leaf:'#587d67',water:'#398da4'},
 {sky:[.39,.34,.59],floor:'#8caa76',road:'#9b8a9f',wall:['#8c6da6','#7484a6','#b38d9c','#587994'],light:'#ffb7d2',leaf:'#d6a1b9',water:'#595383'}
];
export function createImmersiveRenderer(canvas){
 const gl=canvas.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:true});
 if(!gl)return createStreetRenderer(canvas);
 const shader=(kind,src)=>{const s=gl.createShader(kind);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`
 attribute vec3 aPos,aNormal,aColor;attribute float aAlpha;
 uniform vec3 uEye,uForward,uRight,uUp,uFog;uniform vec2 uLens;
 varying vec4 vColor;varying vec3 vWorld;varying vec3 vNormal;
 void main(){vWorld=aPos;vNormal=aNormal;vec3 delta=aPos-uEye;float depth=dot(delta,uForward);vec3 sun=normalize(vec3(-.5,-.4,1.));float lighting=.52+.48*max(0.,dot(aNormal,sun));vec3 color=aColor*lighting;float fog=1.-exp(-length(delta)*.022);vColor=vec4(mix(color,uFog,fog),aAlpha);gl_Position=vec4(dot(delta,uRight)*uLens.x,dot(delta,uUp)*uLens.y,1.001334*depth-.2001334,depth);}
 `));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec4 vColor;varying vec3 vWorld;varying vec3 vNormal;void main(){vec3 tile=floor(vWorld*12.);float grain=fract(sin(dot(tile,vec3(12.9898,78.233,37.719)))*43758.5453);vec3 edge=fract(vWorld+vec3(.001));float seam=1.;if(abs(vNormal.z)>.5){if(edge.x<.022||edge.y<.022)seam=.84;}else if(edge.z<.025)seam=.86;gl_FragColor=vec4(vColor.rgb*(.9+grain*.18)*seam,vColor.a);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);for(const [name,size,offset]of [['aPos',3,0],['aNormal',3,12],['aColor',3,24],['aAlpha',1,36]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,40,offset);}
 const uniforms=Object.fromEntries(['uEye','uForward','uRight','uUp','uFog','uLens'].map(n=>[n,gl.getUniformLocation(program,n)]));
 gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 let vertices=[],cam,art,time=0,actorTransform=null,targetBlock=null;
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
 function tri(a,b,c,color,alpha=1){if(actorTransform){const {x,y,angle}=actorTransform,cs=Math.cos(angle),sn=Math.sin(angle);[a,b,c]=[a,b,c].map(p=>[x+(p[0]-x)*cs-(p[1]-y)*sn,y+(p[0]-x)*sn+(p[1]-y)*cs,p[2]]);}const n=norm(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i]))),col=rgb(color);for(const p of [a,b,c])vertices.push(...p,...n,...col,alpha);}
 function quad(a,b,c,d,color,alpha=1){tri(a,b,c,color,alpha);tri(a,c,d,color,alpha);}
 function box(x,y,z,w,d,h,color,alpha=1){const a=[x,y,z],b=[x+w,y,z],c=[x+w,y+d,z],d0=[x,y+d,z],A=[x,y,z+h],B=[x+w,y,z+h],C=[x+w,y+d,z+h],D=[x,y+d,z+h];quad(A,B,C,D,color,alpha);quad(a,A,D,d0,color,alpha);quad(b,c,C,B,color,alpha);quad(a,b,B,A,color,alpha);quad(d0,D,C,c,color,alpha);}
 function disc(x,y,z,r,color,n=16){for(let i=0;i<n;i++){let a=i/n*6.283,b=(i+1)/n*6.283;tri([x,y,z],[x+Math.cos(a)*r,y+Math.sin(a)*r,z],[x+Math.cos(b)*r,y+Math.sin(b)*r,z],color);}}
 function cone(x,y,z,r,h,color){const bottom=Math.min(z,z+h),height=Math.abs(h);box(x-r,y-r,bottom,r*2,r*2,height*.5,color);box(x-r*.6,y-r*.6,bottom+height*.5,r*1.2,r*1.2,height*.5,color);}
 function tree(x,y,pink=false){box(x-.16,y-.16,0,.32,.32,1.8,'#8b673f');const col=pink?'#e7a8c7':art.leaf;box(x-.85,y-.85,1.3,1.7,1.7,.85,col);box(x-.65,y-.65,2.15,1.3,1.3,.6,col);box(x-.35,y-.35,2.75,.7,.7,.35,pink?'#f3c5d9':'#84af69');}
 function building(b,i,ch){const h=b.z/32,color=art.wall[i%4];box(b.x+.18,b.y+.16,.012,b.w+.3,b.h+.35,.018,'#282f3b');box(b.x,b.y,0,b.w,b.h,h,color);box(b.x-.08,b.y-.08,h,b.w+.16,b.h+.16,.15,'#424a5b');
 for(let z=.6;z<h-.4;z+=.85){for(let x=.28;x<b.w-.25;x+=.65)box(b.x+x,b.y+b.h+.015,z,.33,.025,.43,(i+Math.round(z*4))%3?art.light:'#5b7185');for(let y=.25;y<b.h-.2;y+=.65)box(b.x+b.w+.015,b.y+y,z,.025,.33,.43,art.light);}
 box(b.x+b.w*.45,b.y+b.h+.04,0,.5,.08,.86,'#273949');
 if(ch===1){box(b.x,b.y+b.h+.12,1.25,b.w,.35,.15,i%2?'#60bac9':'#e89b9d');box(b.x+.1,b.y+b.h+.16,1.42,.1,.05,1.25,'#f6b3bd');}
 if(ch===2){for(let y=.2;y<b.h;y+=.4)box(b.x-.015,b.y+y,.2,.025,.025,h-.3,'#99aeb2');box(b.x+.25,b.y+b.h+.04,.1,Math.max(.4,b.w-.5),.04,.8,'#537487');}
 if(ch===3){box(b.x+.1,b.y+.1,h+.15,b.w-.2,b.h-.2,.35,'#66718c');cone(b.x+b.w*.5,b.y+b.h*.5,h+.5,Math.min(b.w,b.h)*.65,.75,'#d7a0b9');for(let z=1;z<h;z+=1.7)box(b.x-.04,b.y+b.h+.06,z,b.w+.08,.05,.08,'#e2a9d4');}
 }
 function person(p,ghost=false){actorTransform={x:p.x,y:p.y,angle:(p.yaw||0)-Math.PI/2};const z=p.z||0,yaw=p.yaw||0,moving=p.target||p.moving||(ghost&&!p.holding),step=moving?Math.sin(time*11)*.13:Math.sin(time*2)*.015,col=ghost?'#86e7e4':p.color||'#f6be7f',alpha=ghost?.55:1;
 disc(p.x,p.y,.024,.3,'#303746');if(p.stance==='prone'){box(p.x-.23,p.y-.5,z+.12,.46,.9,.24,col,alpha);box(p.x-.18,p.y-.75,z+.15,.36,.3,.27,'#dfb293',alpha);for(const s of [-1,1])box(p.x+s*.18-.07,p.y+.25+step,z+.08,.14,.6,.15,'#36405c',alpha);actorTransform=null;return;}
 const k=p.stance==='crouch'?.63:1;
 for(const s of [-1,1]){box(p.x+s*.13-.07,p.y-.08+s*step,z+.05,.14,.18,.44*k,'#313b54',alpha);box(p.x+s*.29-.06,p.y-.08-s*step,z+.44*k,.12,.18,.46*k,col,alpha);}
 box(p.x-.24,p.y-.17,z+.43*k,.48,.34,.55*k,col,alpha);box(p.x-.24,p.y-.24,z+1.0*k,.48,.48,.43,'#e4b596',alpha);box(p.x-.25,p.y-.25,z+1.35*k,.5,.5,.13,'#29394a',alpha);box(p.x-.25,p.y+.16,z+.91*k,.5,.06,.1,'#f59183',alpha);for(const dx of [-.13,.09])box(p.x+dx,p.y+.245,z+1.21*k,.07,.015,.065,'#27374a',alpha);actorTransform=null;
 }
 function world(g,myId,mode,overview,route){
 const ch=g.chapter||1;for(let i=0;i<9;i++){const x=-12+i*7,y=-12+(i%3)*4;box(x,y,17+(i%2)*3,4,2,1,'#f4f1df');box(x+1,y,18+(i%2)*3,2,2,1,'#fff8e8');}box(-8,-20,16,3,1,3,ch===3?'#edbfd0':'#ffe8a3');for(let i=0;i<18;i++){const x=-5+(i%9)*4,y=i<9?-7:23,h=1+(i*7%4);box(x,y,-1,3,3,h,'#857b61');box(x,y,h-1,3,3,.18,art.floor);}
 for(let y=0;y<20;y++)for(let x=0;x<25;x++){const road=(x>=2&&x<=4)||(y>=5&&y<=7)||(y>=10&&y<=11)||(y>=16&&y<=17)||(x>=19&&x<=20);box(x,y,-1,1,1,.87,'#8d6947');box(x,y,-.13,1,1,.13,road?art.road:art.floor);if(road&&(x+y)%2===0)box(x+.08,y+.08,.005,.84,.84,.008,ch===2?'#b4bba9':ch===3?'#b4a4b3':'#b6a27e');}
 box(7.5,-2,-.22,1,24,.18,art.water);for(let i=0;i<35;i++)box(7.65,((i*.65+time*.12)%22)-1,-.025,.65,.025,.01,'#78b1bd');
 box(7.25,7,.025,1.5,2,.12,'#c0b39c');for(let y=7;y<9;y+=.18)box(7.25,y,.16,1.5,.03,.015,'#807c79');
 box(7.95,7.08,g.gateOpen?2.7:0,.1,1.85,.85,g.gateOpen?'#6ed4c2':'#e9a365');
 for(const [p,on,color] of [[WORLD.gatePad,g.gateOpen,'#efb36f'],[WORLD.powerPad,g.power,'#7bd6e3']]){box(p.x-.62,p.y-.62,.025,1.24,1.24,.05,'#293d50');disc(p.x,p.y,.09,.5,color);if(on)disc(p.x,p.y,.095,.32,'#e2f6dc');}
 buildingsFor(g).forEach((b,i)=>building(b,i,ch));
 for(const [x,y]of [[.8,5],[6,5],[.8,12],[6,13],[10,6.4],[16.5,7],[16,13],[19,6],[22,13],[20,16],[5,18],[18,18]])tree(x,y,ch===3);
 for(const [x,y]of [[4.8,5],[6.3,11],[10.2,5.8],[14,6.2],[13.5,11.7],[19,14]]){box(x,y,0,.065,.065,2.7,'#4c5a6b');box(x-.16,y-.16,2.6,.4,.4,.12,art.light);disc(x,y,.016,.65,ch===2?'#c9c2a2':'#66606c');}
 box(2.7,5.8,0,.6,.5,1.1,'#d6a591');box(2.75,6.31,.5,.5,.03,.45,g.ticket?'#78d9c3':art.light);
 const tx=12.2+(g.time>85?(g.time-85)*2:0);
 box(tx,3.85,.25,3,1.05,1.2,ch===2?'#6eacae':ch===3?'#b991bd':'#d88771');box(tx+.08,3.9,1.45,2.84,.95,.12,'#e8dac7');
 for(let x=.2;x<2.8;x+=.5)box(tx+x,4.91,.8,.34,.025,.45,g.power?art.light:'#435f72');
 for(const x of [.4,2.4])for(const y of [3.9,4.65])box(tx+x,y,.04,.32,.22,.24,'#29384b');
 for(const y of [3.75,4.8])box(9,y,.018,16,.045,.025,'#3b4957');
 if(ch===1){for(let i=0;i<12;i++){const x=3+i*1.6,y=19.2;box(x,y,0,.8,.5,.75,i%2?'#a88992':'#6a8e94');box(x-.1,y-.1,.8,1,.7,.12,'#c99886');}for(let i=0;i<8;i++){const x=18.5+i*.5;box(x,6,2+Math.sin(time+i)*.05,.16,.16,.24,art.light);}}
 if(ch===2){box(23.5,-4,-.25,18,30,.2,art.water);for(let i=0;i<4;i++){const y=6+i*3;box(21,y,.05,5,.6,.15,'#8f8775');box(24,y+.8,.08+Math.sin(time+i)*.06,2,.7,.3,'#e6e1ce');box(24.7,y+1,.4,.04,.04,1.8,'#4f6777');quad([24.7,y+1,2.2],[24.7,y+1,.7],[25.5,y+1,.7],[25.5,y+1,2.2],'#fff3d9');}box(21.7,15.4,0,.65,.65,3.8,'#eee2c9');cone(22,15.7,3.8,.55,.65,'#b06b62');box(21.75,15.45,3.2,.55,.55,.2,art.light);
 for(let i=0;i<5;i++){box(17+i*.9,18,.1,.8,.7,.7,i%2?'#b77967':'#637f96');}box(22,9,0,.12,.12,5,'#547381');box(20,9,4.8,3.3,.14,.14,'#547381');box(20,9,3,.06,.06,1.8,'#b2c5c4');}
 if(ch===3){for(let i=0;i<20;i++){const x=10+(i%10)*1.2,y=14+Math.floor(i/10)*1.5;box(x,y,2.6+Math.sin(time+i)*.08,.17,.17,.28,i%2?'#ffd1a0':'#edaac7');}for(const x of [18,22]){box(x,7,0,.17,.17,2.5,'#c87683');box(x-.3,6.9,2.4,.75,.35,.15,'#533f5b');}box(17.8,7,2.2,4.6,.18,.17,'#c87683');disc(20,8,.02,1.1,'#a68ba8');cone(20,8,.03,.6,.3,'#b6a4b9');}
 for(const m of missionsFor(g)){const done=(g.tasks||[]).includes(m.id);disc(m.x,m.y,.035,.35,done?'#7bc8a8':'#e2b66d');if(!done){const h=1.1+Math.sin(time*2+m.x)*.1;cone(m.x,m.y,h,.13,.26,'#ffe6a6',4);cone(m.x,m.y,h,.13,-.26,'#e8a86e',4);}}
 for(const s of SHARDS)if(!(g.shards||[]).includes(s.id)){cone(s.x,s.y,.8+Math.sin(time*2)*.1,.1,.24,'#b8e6e2',4);}
 for(const p of route.filter((_,i)=>i%3===0))disc(p.x,p.y,.035,.06,'#eedca0',8);
 for(const b of voxelBlocks(g)){const material=BLOCKS.find(t=>t.id===b.type)||BLOCKS[0];box(b.x,b.y,b.z,.99,.99,.99,material.color);if(b.type==='grass')box(b.x,b.y,b.z+.82,.99,.99,.17,'#91bf64');if(b.type==='wood')for(let i=0;i<3;i++)box(b.x+.1+i*.3,b.y-.003,b.z,.035,.012,.99,material.detail);if(b.type==='glow')box(b.x+.18,b.y-.01,b.z+.18,.64,.015,.64,material.detail);}
 if(targetBlock){const b=targetBlock.editable?targetBlock.hit:targetBlock.place;if(b&&b.z>=0&&b.x>=0&&b.x<25&&b.y>=0&&b.y<20){const w=1.02,s=.025,z=b.z-.01,x=b.x-.01,y=b.y-.01;for(const dz of [0,1]){box(x,y,z+dz,w,s,s,'#fff0be');box(x,y+w-s,z+dz,w,s,s,'#fff0be');box(x,y,z+dz,s,w,s,'#fff0be');box(x+w-s,y,z+dz,s,w,s,'#fff0be');}for(const dx of [0,1])for(const dy of [0,1])box(x+dx,y+dy,z,s,s,w,'#fff0be');}}
 for(const p of g.players)if(overview||mode!=='fpp'||p.id!==myId)person(p);
 for(const e of g.echoes){const p=echoAt(e,g.time);if(p)person(p,true);}
 }
 const render=(g,now,myId='solo',route=[],oldCamera,visuals={},overview=false)=>{
 const p=g.players.find(p=>p.id===myId)||g.players[0]||WORLD.spawn;art=CITY_ART[(g.chapter||1)-1];time=visuals.motion===false?0:now;
 cam=immersiveCamera(p,{mode:visuals.view||'tpp',yaw:visuals.yaw??-Math.PI*.75,pitch:visuals.pitch??-.12,overview,aspect:1200/760,chapter:g.chapter,gateOpen:g.gateOpen});
 targetBlock=visuals.targetBlock||null;vertices=[];world(g,myId,visuals.view||'tpp',overview,route);
 gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(...art.sky,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
 for(const [u,value]of [['uEye',cam.eye],['uForward',cam.forward],['uRight',cam.right],['uUp',cam.up],['uFog',art.sky]])gl.uniform3fv(uniforms[u],value);
 gl.uniform2f(uniforms.uLens,cam.f/cam.aspect,cam.f);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/10);
 };
 render.target=(g,sx=600,sy=380)=>{if(!cam)return null;const u=(sx/600-1)*cam.aspect/cam.f,v=(1-sy/380)/cam.f,ray=cam.forward.map((n,i)=>n+cam.right[i]*u+cam.up[i]*v);return raycastBlocks(cam.eye,ray,voxelBlocks(g),(x,y,z)=>buildingsFor(g).some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h&&z>=0&&z<b.z/32));};
 render.pick=(x,y)=>cam?pickImmersive(x,y,cam):null;render.project=(x,y,z=.5)=>cam?projectImmersive(x,y,z,cam):null;return render;
}
