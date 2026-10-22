
export const BLOCKS=[
 {id:'grass',name:'Meadow',color:'#79aa50',detail:'#5d8d3f'},
 {id:'wood',name:'Timber',color:'#ae8150',detail:'#795934'},
 {id:'stone',name:'Stone',color:'#a0a5aa',detail:'#777f87'},
 {id:'glass',name:'Sea glass',color:'#8cced4',detail:'#b1e6e5'},
 {id:'glow',name:'Glowstone',color:'#edc275',detail:'#ffdf99'}
];
const starter={grass:24,wood:16,stone:16,glass:8,glow:6};
const key=c=>c.x+','+c.y+','+c.z;
export function validCell(c){return c&&['x','y','z'].every(k=>Number.isInteger(c[k]))&&c.x>=0&&c.x<25&&c.y>=0&&c.y<20&&c.z>=0&&c.z<6;}
export function protectedCell(c){const x=c.x+.5,y=c.y+.5;
 return Math.abs(x-8)<1.3||y<5.7&&x>8||[[3,11],[3,6],[5,9],[12,10],[13.6,4.1],[4.6,12],[4,17],[20,7],[10,8.5],[21,15],[16.5,10]].some(p=>Math.hypot(x-p[0],y-p[1])<1.3);
}
function seeds(chapter){const out=[];for(const [x,y,type]of [[5,6,'wood'],[1,11,'stone'],[5,14,'wood'],[6,15,'stone'],[4,18,'grass'],[10,14,'stone'],[16,17,'glass'],[22,17,'glow']]){out.push({x,y,z:0,type});if((chapter||1)>1)out.push({x,y,z:1,type});}return out;}
export function voxelState(g){g.voxel??={cities:{},inventories:{},stats:{}};g.voxel.cities??={};g.voxel.inventories??={};g.voxel.stats??={};return g.voxel;}
export function inventoryFor(g,id){const state=voxelState(g);state.inventories[id]??={...starter};return state.inventories[id];}
export function voxelBlocks(g){const edits=g.voxel?.cities?.[g.chapter||1]||{},blocks=new Map(seeds(g.chapter).map(c=>[key(c),c]));for(const [k,type]of Object.entries(edits)){if(type===null)blocks.delete(k);else{const [x,y,z]=k.split(',').map(Number);blocks.set(k,{x,y,z,type});}}return [...blocks.values()];}
export function voxelSolid(g,x,y,z=0,height=1.4){return voxelBlocks(g).some(b=>x>b.x-.19&&x<b.x+1.19&&y>b.y-.19&&y<b.y+1.19&&z<b.z+1-.03&&z+height>b.z+.03);}
export function supportFloor(g,p){let floor=0;for(const b of voxelBlocks(g))if(p.x>b.x-.05&&p.x<b.x+1.05&&p.y>b.y-.05&&p.y<b.y+1.05&&b.z+1<=p.z+.16)floor=Math.max(floor,b.z+1);return floor;}
export function changeBlock(g,id,action,cell,type,blocked=()=>false){
 const p=g.players.find(p=>p.id===id);
 if(!g.started||g.paused||g.won||!p)return {ok:false,message:'Enter the city before building.'};
 if(!validCell(cell)||protectedCell(cell))return {ok:false,message:'The station and mission paths stay clear. Build in the open gardens.'};
 if(Math.hypot(p.x-cell.x-.5,p.y-cell.y-.5,(p.z||0)+.8-cell.z-.5)>5)return {ok:false,message:'Move closer. Your tools reach five blocks.'};
 const state=voxelState(g),inventory=inventoryFor(g,id),blocks=voxelBlocks(g),existing=blocks.find(b=>key(b)===key(cell));
 state.cities[g.chapter||1]??={};const edits=state.cities[g.chapter||1];
 if(action==='mine'){
   if(!existing)return {ok:false,message:'Aim at a resource cube or one of your placed blocks.'};
   inventory[existing.type]=Math.min(999,(inventory[existing.type]||0)+1);edits[key(cell)]=null;
 }else if(action==='place'){
   if(!BLOCKS.some(b=>b.id===type)||!(inventory[type]>0)||existing)return {ok:false,message:'Choose a stocked block and an empty face.'};
   if(Object.keys(edits).length>=600&&!Object.hasOwn(edits,key(cell)))return {ok:false,message:'This city has reached its 600-edit building limit.'};
   if(blocked(cell.x+.5,cell.y+.5))return {ok:false,message:'That space belongs to city architecture.'};
   if(g.players.some(a=>a.x>cell.x-.2&&a.x<cell.x+1.2&&a.y>cell.y-.2&&a.y<cell.y+1.2&&(a.z||0)<cell.z+1&&(a.z||0)+1.5>cell.z))return {ok:false,message:'Step aside before placing this block.'};
   if(cell.z>0&&!blocks.some(b=>b.x===cell.x&&b.y===cell.y&&b.z===cell.z-1)&&!blocks.some(b=>Math.abs(b.x-cell.x)+Math.abs(b.y-cell.y)+Math.abs(b.z-cell.z)===1))return {ok:false,message:'Attach the block to the ground or another cube.'};
   inventory[type]--;edits[key(cell)]=type;
 }else return {ok:false,message:'Unknown tool.'};
 state.stats[id]??={mined:0,placed:0};state.stats[id][action==='mine'?'mined':'placed']++;
 return {ok:true,message:action==='mine'?'+1 '+BLOCKS.find(b=>b.id===existing.type).name:'Block placed. Your build survives rewinds.'};
}
export function sanitizeVoxels(raw){const out={cities:{},inventories:{},stats:{}};if(!raw||typeof raw!=='object')return out;
 for(const ch of [1,2,3]){const entries=Object.entries(raw.cities?.[ch]||{}).slice(0,600);out.cities[ch]={};for(const [k,v]of entries){const a=k.split(',').map(Number),cell={x:a[0],y:a[1],z:a[2]};if(a.length===3&&validCell(cell)&&!protectedCell(cell)&&(v===null||BLOCKS.some(b=>b.id===v)))out.cities[ch][key(cell)]=v;}}
 for(const [id,inv]of Object.entries(raw.inventories||{}).slice(0,4)){out.inventories[id]=Object.fromEntries(BLOCKS.map(b=>[b.id,Number.isInteger(inv?.[b.id])?Math.max(0,Math.min(999,inv[b.id])):starter[b.id]]));}
 for(const [id,s]of Object.entries(raw.stats||{}).slice(0,4))out.stats[id]={mined:Math.max(0,Math.min(100000,Number(s?.mined)||0)),placed:Math.max(0,Math.min(100000,Number(s?.placed)||0))};return out;
}
export function raycastBlocks(origin,direction,blocks,isSolid=()=>false,range=12){
 const len=Math.hypot(...direction)||1,dir=direction.map(v=>v/len),occupied=new Map(blocks.map(b=>[key(b),b]));let prev=null;
 for(let t=.08;t<=range;t+=.04){const p=origin.map((v,i)=>v+dir[i]*t),c={x:Math.floor(p[0]),y:Math.floor(p[1]),z:Math.floor(p[2])},b=occupied.get(key(c)),solid=c.z<0||isSolid(p[0],p[1],p[2]);
 if(b||solid){let place;if(c.z<0)place={x:c.x,y:c.y,z:0};else{let axis=0,entry=-Infinity;for(let i=0;i<3;i++){if(Math.abs(dir[i])<1e-8)continue;const boundary=dir[i]>0?c[['x','y','z'][i]]:c[['x','y','z'][i]]+1;const value=(boundary-origin[i])/dir[i];if(value>entry+.00001){entry=value;axis=i;}}const name=['x','y','z'][axis];place={...c,[name]:c[name]-(dir[axis]>0?1:-1)};}return {hit:c,place,editable:!!b,type:b?.type||null,point:p};}prev=c;}return null;
}
