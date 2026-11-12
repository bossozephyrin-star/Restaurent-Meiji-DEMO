const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
const backup = process.argv[3];
if (!root || !backup) throw new Error('Usage: node normalize-model-scale.cjs models-directory backup-directory');
// Dimensions approximatives pour la démo, à ajuster avec les mesures du restaurant.
const targets = {
  'tokyo-special.glb': {axis:0, meters:.40},
  'meiji-langouste.glb': {axis:0, meters:.48},
  'yakisoba-boeuf.glb': {axis:0, meters:.28},
  'cocktail-orange.glb': {axis:1, meters:.26},
  'cocktail-soleil.glb': {axis:1, meters:.26}
};
for (const [name, target] of Object.entries(targets)) {
  const file = path.join(root,name), buffer = fs.readFileSync(file);
  if (buffer.readUInt32LE(0)!==0x46546c67 || buffer.readUInt32LE(4)!==2) throw new Error('Invalid GLB: '+name);
  const jsonLength=buffer.readUInt32LE(12);
  const gltf=JSON.parse(buffer.subarray(20,20+jsonLength).toString());
  if (gltf.extras?.meijiPhysicalDimensions) { console.log(name+': taille déjà corrigée'); continue; }
  if(gltf.nodes.some(n=>n.matrix || n.rotation || n.translation || n.scale)) throw new Error('Transformation existante à examiner: '+name);
  const min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  gltf.meshes.forEach(mesh=>mesh.primitives.forEach(primitive=>{
    const accessor=gltf.accessors[primitive.attributes.POSITION];
    for(let axis=0;axis<3;axis++){ min[axis]=Math.min(min[axis],accessor.min[axis]); max[axis]=Math.max(max[axis],accessor.max[axis]); }
  }));
  const factor=target.meters/(max[target.axis]-min[target.axis]);
  for(const scene of gltf.scenes){
    const index=gltf.nodes.length;
    gltf.nodes.push({name:'Dimensions physiques Meiji',children:scene.nodes,scale:[factor,factor,factor],translation:[-(min[0]+max[0])/2*factor,-min[1]*factor,-(min[2]+max[2])/2*factor]});
    scene.nodes=[index];
  }
  const dimensions=max.map((value,axis)=>(value-min[axis])*factor);
  gltf.extras={...gltf.extras,meijiPhysicalDimensions:{dimensionsMeters:dimensions,approximate:true}};
  const json=Buffer.from(JSON.stringify(gltf));
  const padded=Buffer.alloc(Math.ceil(json.length/4)*4,0x20); json.copy(padded);
  const remainder=buffer.subarray(20+jsonLength);
  const header=Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+padded.length+remainder.length,8);
  header.writeUInt32LE(padded.length,12);header.writeUInt32LE(0x4e4f534a,16);
  const output=Buffer.concat([header,padded,remainder]);
  fs.mkdirSync(backup,{recursive:true});
  if(!fs.existsSync(path.join(backup,name))) fs.copyFileSync(file,path.join(backup,name));
  fs.writeFileSync(file,output);
  console.log(name+': '+dimensions.map(n=>(n*100).toFixed(1)).join(' × ')+' cm');
}
