import {iso} from './render.mjs';
import {WORLD} from './engine.mjs';
export const clampZoom=z=>Math.max(1.1,Math.min(3.4,z));
export function cameraTarget(player,{started=false,overview=false,zoom=2.15,width=1200,height=760}={}){
 const point=started&&!overview&&player?iso(player.x,player.y):iso(WORLD.w/2,WORLD.h/2,50);
 const scale=overview?.72:started?clampZoom(zoom):1;
 return {x:point.x,y:point.y-(started&&!overview?75:0),zoom:scale,zoomX:scale*(1200/760)/(width/height),zoomY:scale};
}
export function smoothCamera(current,target,dt,reduced=false){if(!current||reduced)return {...target};const amount=1-Math.exp(-Math.max(0,dt)*6);return Object.fromEntries(Object.entries(target).map(([key,value])=>[key,current[key]+(value-current[key])*amount]));}
export function screenToScene(x,y,camera){return {x:(x-600)/camera.zoomX+camera.x,y:(y-380)/camera.zoomY+camera.y};}
export function sceneToScreen(x,y,camera){return {x:(x-camera.x)*camera.zoomX+600,y:(y-camera.y)*camera.zoomY+380};}
