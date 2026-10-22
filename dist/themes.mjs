export const THEMES={
 afterglow:{name:'Afterglow',accent:'#c4a5ff',secondary:'#72e8de',sky:['#c4b5d9','#6b9ac7'],road:['#b8bac7','#b1b4c2','#a9afbd'],ground:['#91aa9b','#a1b49d','#97ad9c'],water:'#3b9ab3',tree:['#967fbe','#b09ad3','#d3b3ed'],bloom:['#d59ab5','#e5b0c6','#f4c8d6'],building:['#c2a2df','#8ebbd7','#edb09c','#a0c9b2'],window:'#ffe5b0',rain:'#c3b6ed22'},
 sakura:{name:'Sakura dusk',accent:'#ffb1c9',secondary:'#ffc98b',sky:['#634555','#241e37'],road:['#a492a2','#9c879b','#927e95'],ground:['#756d8b','#7f7492','#706680'],water:'#514c75',tree:['#a87f99','#c79db6','#e6bed0'],bloom:['#e5a4bb','#f2bdcc','#ffe0df'],building:['#d8a7b0','#a7a3c4','#c1a2a6','#a1b7ae'],window:'#ffddb0',rain:'#f4cfda22'},
 daybreak:{name:'Daybreak',accent:'#6de5d2',secondary:'#ffd586',sky:['#769aa4','#3b566f'],road:['#b1c1b9','#acbbb2','#a3b5af'],ground:['#87a89d','#91b2a4','#83a397'],water:'#4d91a7',tree:['#679f90','#85b29a','#a3c6a3'],bloom:['#dba8a7','#ecc1b9','#ffdfca'],building:['#d7b3a1','#a7b8c9','#c1afcc','#9ebbb1'],window:'#fff4cb',rain:'#f1f5df20'}
};
export function themeFor(id){return THEMES[id]||THEMES.afterglow;}
export function badgesFor(g){return [
 {id:'ticket',name:'First tomorrow',detail:'Recover your first ticket',earned:!!g.ticket},
 {id:'echo',name:'Better together',detail:'Create your first echo',earned:g.echoes.length>0},
 {id:'shards',name:'City listener',detail:'Collect all five memory lights',earned:(g.shards||[]).length===5},
 {id:'tram',name:'Right on time',detail:'Catch the last tram',earned:!!g.won},
 {id:'minimal',name:'A little is enough',detail:'Finish in three loops or fewer',earned:!!g.won&&g.loop<=3}
 ];}
