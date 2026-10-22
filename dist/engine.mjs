// Pure deterministic game rules, shared by the browser and optional room server.
export const WORLD={w:25,h:20,spawn:{x:3,y:11},ticket:{x:3,y:6},gate:{x:8,y:8},gatePad:{x:5,y:9},powerPad:{x:12,y:10},tram:{x:13.6,y:4.1},duration:90,speed:3.2};
export const LANDMARKS=[{id:'garden',x:20,y:7,name:'Lantern Garden',memory:'In the lantern garden, every light is a wish someone came back for.'},{id:'lookout',x:21,y:15,name:'Tomorrow Lookout',memory:'From the lookout, the city stretches beyond the rain. There is more than one way home.'},{id:'clock',x:4,y:17,name:'The Waiting Clock',memory:'The clock has stopped at midnight. Someone scratched: “We still have tomorrow.”'}];
export const BUILDINGS=[{x:1,y:1,w:3,h:2,z:84,color:'#bd8b70',name:'MORI BOOKS'},{x:5,y:1,w:2,h:3,z:110,color:'#678776',name:'NO. 04'},{x:1,y:8,w:1.2,h:2,z:46,color:'#b0a47f',name:'CAFÉ'},{x:10,y:1,w:2,h:2,z:66,color:'#9c8fbd',name:'STATION'},{x:14.5,y:8,w:1.5,h:3,z:80,color:'#6d8994',name:'RADIO'},{x:10,y:12,w:3,h:1,z:30,color:'#b69074',name:'FLOWERS'}];
export const CHARACTERS=[{name:'Sudip',color:'#e5f18c'},{name:'Sondor',color:'#9ce0dc'},{name:'Eric',color:'#e9aa8e'},{name:'Abinash',color:'#c1afe8'}];
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const SHARDS=[{id:'lane',x:5.2,y:11.5},{id:'bridge',x:6.4,y:6.2},{id:'station',x:10,y:8.5},{id:'lookout',x:17,y:14},{id:'garden',x:21,y:7.5}];
export function createGame(players=[{id:'solo',name:'Sudip',color:'#e5f18c'}]){return {version:1,chapter:1,tasks:[],rewards:[],coins:0,completedChapters:[],time:0,loop:1,echoes:[],recording:[],players:players.map((p,i)=>({...p,x:WORLD.spawn.x+i*.35,y:WORLD.spawn.y,target:null})),ticket:false,gateOpen:false,power:false,won:false,started:false,paused:false,rewinds:0,shards:[],memories:[],message:'',event:0};}
BUILDINGS.push({x:17,y:1,w:3,h:3,z:125,color:'#7d8f9c',name:'THE GRAND'},{x:21,y:3,w:2,h:2,z:68,color:'#b39981',name:'LANTERN'},{x:18,y:10,w:2,h:2,z:93,color:'#8b9e8b',name:'RECORDS'},{x:12,y:16,w:3,h:2,z:100,color:'#9b8b9f',name:'TOMORROW'},{x:1,y:14,w:2,h:2,z:58,color:'#b4917c',name:'ATELIER'});
export function blocked(x,y,gateOpen,chapter=1){if(x<.5||x>WORLD.w-.5||y<.5||y>WORLD.h-.5)return true;if(Math.abs(x-8)<.3&&!(gateOpen&&y>7&&y<9))return true;return buildingsFor({chapter}).some(b=>x>b.x-.15&&x<b.x+b.w+.15&&y>b.y-.15&&y<b.y+b.h+.15);}
export function echoAt(e,t){const samples=e.frames;if(!samples.length)return null;let lo=0,hi=samples.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(samples[mid].t<=t)lo=mid;else hi=mid-1;}const a=samples[lo],b=samples[Math.min(lo+1,samples.length-1)];const ratio=b.t>a.t?Math.max(0,Math.min(1,(t-a.t)/(b.t-a.t))):0;return {...e,x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio,z:(a.z||0)+((b.z||0)-(a.z||0))*ratio,stance:a.stance||"stand",yaw:a.yaw||0,holding:t>=samples.at(-1).t};}
export function actors(g){return [...g.players,...g.echoes.map(e=>echoAt(e,g.time)).filter(Boolean)];}
export function refresh(g){const all=actors(g);g.gateOpen=all.some(a=>(a.z||0)<.2&&dist(a,WORLD.gatePad)<.7);g.power=all.some(a=>(a.z||0)<.2&&dist(a,WORLD.powerPad)<.7);}
export function collectLights(g){g.shards??=[];for(const light of SHARDS){if(!g.shards.includes(light.id)&&g.players.some(p=>dist(p,light)<.65)){g.shards.push(light.id);tell(g,`Memory light ${g.shards.length}/5. The city remembers you.`);}}}
export function tell(g,message){g.message=message;g.event++;}
export function rewind(g){if(g.won||!g.started)return false;if(g.time<.6){tell(g,'Take a few steps first. Your echo needs a memory.');return false;}for(const p of g.players){const frames=g.recording.filter(f=>f.id===p.id).map(({t,x,y,z,stance,yaw})=>({t,x,y,z,stance,yaw}));frames.push({t:g.time,x:p.x,y:p.y,z:p.z||0,stance:p.stance,yaw:p.yaw});g.echoes.push({id:`echo-${g.loop}-${p.id}`,name:p.name,color:p.color,loop:g.loop,frames});}g.echoes=g.echoes.slice(-12);g.loop++;g.rewinds++;g.time=0;g.recording=[];for(const p of g.players){p.x=WORLD.spawn.x;p.y=WORLD.spawn.y;p.target=null;p.z=0;p.vz=0;p.jumpHeld=false;}refresh(g);tell(g,'Yesterday is on your side. Your echo repeats that route, then holds its last position.');return true;}
function baseInteract(g,id){if(!g.started||g.won||g.paused)return;const p=g.players.find(p=>p.id===id);if(!p)return;if(dist(p,WORLD.ticket)<1.2){if(!g.ticket){g.ticket=true;g.memories.push('A ticket marked 00:00. Someone has been waiting for you.');tell(g,'Ticket recovered. Memories survive every rewind. Now stand on the amber gate pad.');}else tell(g,'The ticket is safe. Even time cannot take it back.');}
 else if(dist(p,WORLD.tram)<1.6){if(!g.ticket)tell(g,'The conductor needs your ticket. Find the glowing kiosk across the canal.');else if(!g.power)tell(g,'No power. Someone—or an echo—must stay on the blue generator pad.');else if(g.time>85)tell(g,'The last tram has departed. Rewind and reach it before 00:05.');else{g.won=true;g.memories.push('The conductor is you, from a tomorrow you finally reached.');tell(g,'You made tomorrow possible.');}}
 else if(dist(p,WORLD.gatePad)<1)tell(g,'You are holding the gate open. Press R here: your echo will take this job next loop.');
 else if(dist(p,WORLD.powerPad)<1)tell(g,'Power restored while you stay here. Press R to leave an echo on this pad.');
 else {const place=LANDMARKS.find(l=>dist(p,l)<1.3);if(place){if(!g.memories.includes(place.memory))g.memories.push(place.memory);tell(g,place.memory);}else tell(g,'Find the ticket kiosk, glowing pads, tram, or a marked landmark. Walk close and press E.');}}
export function tick(g,dt,inputs={}){if(!g.started||g.paused||g.won)return;dt=Math.min(.1,Math.max(0,dt));g.time+=dt;refresh(g);for(const p of g.players){const input=inputs[p.id]||{};stepBody(p,dt,input);let dx=Number(input.dx)||0,dy=Number(input.dy)||0;if(Math.abs(dx)+Math.abs(dy)>.01)p.target=null;else if(p.target){dx=p.target.x-p.x;dy=p.target.y-p.y;if(Math.hypot(dx,dy)<.15){p.target=null;dx=dy=0;}}const len=Math.hypot(dx,dy);p.moving=len>.01;if(len){dx=dx/len*(WORLD.speed+(g.rewards?.includes("Harbor boots") ? .35 : 0))*(p.stance==="prone"?.28:p.stance==="crouch"?.55:1)*dt;dy=dy/len*(WORLD.speed+(g.rewards?.includes("Harbor boots") ? .35 : 0))*(p.stance==="prone"?.28:p.stance==="crouch"?.55:1)*dt;const x=p.x+dx,y=p.y+dy;if(!blocked(x,p.y,g.gateOpen,g.chapter))p.x=x;if(!blocked(p.x,y,g.gateOpen,g.chapter))p.y=y;}if(!g.recording.length||g.time-(g.recording.at(-1)?.t??0)>=.075)for(const q of g.players)g.recording.push({id:q.id,t:g.time,x:q.x,y:q.y,z:q.z||0,stance:q.stance,yaw:q.yaw});}refresh(g);collectLights(g);if(g.time>=WORLD.duration)rewind(g);}
export function exportSave(g){return JSON.stringify({...g,started:false,paused:false,recording:[]});}
export function importSave(text){const g=JSON.parse(text);if(g.version!==1||!Array.isArray(g.players)||!Array.isArray(g.echoes)||!Number.isFinite(g.time)||!Number.isInteger(g.loop)||g.players.length<1||g.players.length>4||g.echoes.length>12)throw new Error('Invalid save');for(const p of g.players)if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new Error('Invalid position');for(const e of g.echoes)if(!Array.isArray(e.frames)||e.frames.length>6000||e.frames.some(f=>!Number.isFinite(f.t)||!Number.isFinite(f.x)||!Number.isFinite(f.y)))throw new Error('Invalid echo');g.chapter=[1,2,3].includes(g.chapter)?g.chapter:1;g.tasks=Array.isArray(g.tasks)?g.tasks.filter(id=>missionsFor(g).some(m=>m.id===id)):[];g.rewards=Array.isArray(g.rewards)?g.rewards.filter(r=>typeof r==='string'&&r.length<60):[];g.coins=Number.isFinite(g.coins)?Math.max(0,g.coins):0;g.completedChapters=Array.isArray(g.completedChapters)?g.completedChapters.filter(n=>[1,2,3].includes(n)):[];g.shards=Array.isArray(g.shards)?[...new Set(g.shards.filter(id=>SHARDS.some(s=>s.id===id)))]:[];return g;}

export const CHAPTERS=[
 {name:'Kisaragi',subtitle:'The Last Tram',theme:'afterglow',reward:'Conductor pin',story:'Deliver a letter, repair the station clock, and catch your first tomorrow.'},
 {name:'Azure Harbor',subtitle:'The Lost Signal',theme:'daybreak',reward:'Harbor boots',story:'A silent harbor needs its signal back. Restore the beacon before the coastal express leaves.'},
 {name:'Sakura Heights',subtitle:'The Dawn Festival',theme:'sakura',reward:'Dawn crown',story:'Bring the festival back to life. Your final train carries the city into sunrise.'}
];
const MISSIONS=[
 [{id:'letter',x:4.6,y:12,title:'Deliver the forgotten letter',reward:25},{id:'clockwork',x:4,y:17,title:'Repair the waiting clock',reward:35},{id:'wish',x:20,y:7,title:'Hang a wish in Lantern Garden',reward:40}],
 [{id:'manifest',x:4.6,y:12,title:'Recover the harbor manifest',reward:35},{id:'relay',x:10,y:8.5,title:'Repair the coastal signal relay',reward:45},{id:'beacon',x:21,y:15,title:'Light the harbor beacon',reward:60}],
 [{id:'ribbons',x:4.6,y:12,title:'Collect the festival ribbons',reward:45},{id:'radio',x:16.5,y:10,title:'Broadcast the dawn invitation',reward:55},{id:'lantern',x:20,y:7,title:'Release the final sky lantern',reward:75}]
];
export const chapterFor=g=>CHAPTERS[(g.chapter||1)-1]||CHAPTERS[0];
export const missionsFor=g=>MISSIONS[(g.chapter||1)-1]||MISSIONS[0];
export function interact(g,id){
 if(!g.started||g.won||g.paused)return;
 const p=g.players.find(p=>p.id===id);if(!p)return;
 g.tasks??=[];g.rewards??=[];g.completedChapters??=[];g.coins??=0;
 const mission=missionsFor(g).find(m=>!g.tasks.includes(m.id)&&dist(p,m)<1.15);
 if(mission){const landmark=LANDMARKS.find(l=>dist(p,l)<1.3);if(landmark&&!g.memories.includes(landmark.memory))g.memories.push(landmark.memory);g.tasks.push(mission.id);g.coins+=mission.reward;if(!landmark)g.memories.push(chapterFor(g).name+': '+mission.title);tell(g,mission.title+' complete! +'+mission.reward+' starlight. Progress survives rewinds.');return;}
 if((g.chapter||1)>1&&dist(p,WORLD.tram)<1.6&&g.tasks.length<3){tell(g,'Complete the three city missions before boarding. Open the Journey board for directions.');return;}
 baseInteract(g,id);
 if(g.won&&!g.completedChapters.includes(g.chapter||1)){
   g.completedChapters.push(g.chapter||1);g.coins+=100;
   const prize=chapterFor(g).reward;if(!g.rewards.includes(prize))g.rewards.push(prize);
   tell(g,chapterFor(g).name+' complete! +100 starlight and '+prize+' unlocked.');
 }
}
export function nextChapter(g){
 if(!g.won||(g.chapter||1)>=3)return false;
 const chapter=(g.chapter||1)+1,players=g.players.map(({id,name,color})=>({id,name,color}));
 const keep={chapter,rewards:g.rewards||[],coins:g.coins||0,memories:g.memories,completedChapters:g.completedChapters||[],host:g.host,event:g.event};
 Object.assign(g,createGame(players),keep,{started:true});
 tell(g,'Welcome to '+chapterFor(g).name+'. Three new missions await.');return true;
}

export function stepBody(p,dt,input={}){
 p.z=Number.isFinite(p.z)?Math.max(0,p.z):0;p.vz=Number.isFinite(p.vz)?p.vz:0;
 p.stance=['stand','crouch','prone'].includes(input.stance)?input.stance:p.stance||'stand';
 if(Number.isFinite(input.yaw))p.yaw=input.yaw;
 if(input.jump&&!p.jumpHeld&&p.z===0&&p.stance==='stand')p.vz=5;
 p.jumpHeld=!!input.jump;
 if(p.vz||p.z){p.z=Math.max(0,p.z+p.vz*dt-5.5*dt*dt);p.vz-=11*dt;if(p.z===0)p.vz=0;}
}
export function buildingsFor(g){
 if((g.chapter||1)===1)return BUILDINGS;
 const harbor=[
 [1,1,4,2,52,'PORT AUTHORITY'],[5.4,1,1.5,3.2,65,'COAST RADIO'],
 [1,8,1.2,2,40,'DOCK CAFÉ'],[10,1,5,2,54,'AZURE TERMINAL'],
 [17,1,4,3,43,'CUSTOMS'],[22,2,1,2,100,'BEACON'],
 [14.5,8,1.5,3,40,'SAIL LOFT'],[10,12,3,1,32,'FISH MARKET'],
 [18,10,2,2,47,'WAREHOUSE 02'],[12,16,3,2,38,'DRY DOCK'],[1,14,2,2,36,'NET WORKSHOP']
 ];
 const heights=[
 [1,1,3,2,140,'SKY ARCHIVE'],[5,1,2,3,180,'THE SPIRE'],
 [1,8,1.2,2,65,'TEA HOUSE'],[10,1,2,2,95,'DAWN STATION'],
 [17,1,3,3,220,'SAKURA TOWER'],[21,3,2,2,155,'SKY HOTEL'],
 [14.5,8,1.5,3,135,'FESTIVAL FM'],[10,12,3,1,55,'FLOWER HALL'],
 [18,10,2,2,165,'MOON GALLERY'],[12,16,3,2,180,'SUNRISE'],[1,14,2,2,90,'PAPER STUDIO']
 ];
 return (g.chapter===2?harbor:heights).map(([x,y,w,h,z,name])=>({x,y,w,h,z,name}));
}
