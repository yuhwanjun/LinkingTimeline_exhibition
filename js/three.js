import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from "gsap";

const canvas = document.querySelector('canvas.webgl');

const hdrEquirect = new RGBELoader().load(
    "./images/empty_warehouse_01_2k.hdr",  
    () => { 
      hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
    }
  );
const textureLoader = new THREE.TextureLoader();

const normalMapTexture = textureLoader.load("./images/normal.jpg");
normalMapTexture.wrapS = THREE.RepeatWrapping;
normalMapTexture.wrapT = THREE.RepeatWrapping;
normalMapTexture.repeat.set(.02, .02);


/*
    scene
*/
const scene = new THREE.Scene();

/*
    object
*/

function makeShapeArr(_w,_h,_Lx1,_Lx2,_Lx3,_Lx4,_Tx1,_Tx2,_Tx3){
    let shape = [
        [0, 0],
        [_Lx1,0],
        [_Lx1,138],
        [_Lx1+165,138],
        [_Lx1+165,77],
        
        [_Lx1+165+_Lx2,77],
        [_Lx1+165+_Lx2,138],
        [_Lx1+165+_Lx2+206,138],
        [_Lx1+165+_Lx2+206,77],
        
        [_w-_Lx4-127-35,77],
        [_w-_Lx4-127-35,138],
        [_w-_Lx4-127,138],
        [_w-_Lx4-127,174],
        [_w-_Lx4,174],
        [_w-_Lx4,0],
        [_w,0],
        
        [_w,_h],
        [_w-_Tx3, _h],
        [_w-_Tx3, _h-111],
        [_w-_Tx2 ,_h-111],
        [_w-_Tx2 ,_h-139],
        [_w-_Tx2-84 ,_h-139],
        [_w-_Tx2-84 ,_h-111],
        [_Tx1+137 ,_h-111],
        [_Tx1+137 ,_h-139],
        [_Tx1 ,_h-139],
        [_Tx1 ,_h],
        
        [0,_h]
    ]
    if(_Lx1 === 0){
        shape.splice(0,2,[_Lx1,138],[_Lx1,138]);
    }
    if(_Lx2 === 0) {
        shape.splice(3,3,[_Lx1+165,138],[_Lx1+165,138],[_Lx1+165,138]);
    }
    if(_Lx3 === 0) {
        shape.splice(8,2,[_Lx1+165+_Lx2+206,138],[_Lx1+165+_Lx2+206,138]);
    }
    if(_Lx4 === 0) {
        shape.splice(14,2,[_w-_Lx4,174],[_w-_Lx4,174]);
    }
    if(_Tx1 === 0) {
        shape.splice(26,2)
    }
    if(_Tx3 === 0) {
        shape.splice(16,2,[_w-_Tx3, _h-111],[_w-_Tx3, _h-111])
    }

    
    return shape
}

class Block{
    constructor(){
        this.extrudeSettings = {
            steps: 15,
            depth: 15,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 10,
            bevelOffset: 10,
            bevelSegments: 25
        };
        this.blockShape = new THREE.Shape();

        this.position = [0,0,0]
        this.rotation = [0,0,0]
    }
    addGroup(_group){
        this.blockGeo = new THREE.ExtrudeGeometry( this.blockShape, this.extrudeSettings );
        this.blockMat = new THREE.MeshPhysicalMaterial();
        this.blockMesh = new THREE.Mesh(this.blockGeo, this.blockMat)
        // this.blockMesh.castShadow = true
        // this.blockMesh.receiveShadow  = true
        this.blockMesh.scale.set(.1,.1,.1)
        _group.add(this.blockMesh)
    }
    editShapeLine(_shapeLine){
        this.blockShape.curves = [];
        this.blockShape.moveTo( _shapeLine[0][0], _shapeLine[0][1]);
        for (let i = 1; i <  _shapeLine.length; i++) {
            this.blockShape.lineTo( _shapeLine[i][0], _shapeLine[i][1])
        }
    }
    movePosition(x,y,z){
        this.position = [x,y,z];
        this.blockMesh.position.set(this.position[0],this.position[1],this.position[2]);
    }
    moveRotation(x,y,z){
        this.rotation = [x,y,z];
        this.blockMesh.rotation.set(this.rotation[0]*Math.PI,this.rotation[1]*Math.PI,this.rotation[2]*Math.PI);
    }
    editMaterial(_mat,_color){
 
        this.blockMat.color = new THREE.Color(_color)
        this.blockMat.roughness = _mat.roughness
        this.blockMat.metalness = _mat.metalness
        this.blockMat.transmission = _mat.transmission
        this.blockMat.ior = _mat.ior
        this.blockMat.reflectivity = _mat.reflectivity
        this.blockMat.thickness = _mat.thickness

        this.blockMat.envMap = hdrEquirect
        this.blockMat.envMapIntensity = _mat.envMapIntensity
        
        this.blockMat.normalMap = normalMapTexture
        this.blockMat.normalScale = new THREE.Vector2(_mat.clearcoatNormalScale)

        this.blockMat.clearcoatNormalMap = normalMapTexture
        this.blockMat.clearcoat = _mat.clearcoat
        this.blockMat.clearcoatRoughness = _mat.clearcoatRoughness
        
        this.blockMat.clearcoatNormalScale = new THREE.Vector2(_mat.clearcoatNormalScale)

        this.blockMat.generateMipmaps = false
        this.blockMat.minFilter = THREE.NearestFilter
        this.blockMesh = new THREE.Mesh(this.blockGeo, this.blockMat)
    }
}

const group = new THREE.Group();
scene.add(group)

const block_01 = makeShapeArr(
    1000,600,
    400, 0, 0, 0,
    300, 10, 0
);

const block_02 = makeShapeArr(
    1000,700,
    0, 0, 10, 320,
    300, 160, 0
);

const block_03 = makeShapeArr(
    1000, 700,
    0, 100, 100, 0,
    0, 160, 0
);

const block_04 = makeShapeArr(
    1000,600,
    0, 200, 0, 0,
    400, 10, 0
);

const block_05 = makeShapeArr(
    1000,600,
    400, 0, 0, 0,
    0, 500, 400
);

const colorMat = {
    roughness : 0.1,
    metalness : 0,
    transmission : 0,
    ior : 1.63,
    reflectivity : 0.36,
    thickness : 3.5,
    envMapIntensity : .1,
    clearcoat : 4,
    clearcoatRoughness : 0.1,
    normalScale : 0.1,
    clearcoatNormalScale : 0.2
}

const glassMat = {
    roughness : 0.52,
    metalness : 0,
    transmission : 1,
    ior : 0.33,
    reflectivity : 0.86,
    thickness : 4.5,
    envMapIntensity : .3,
    clearcoat : 5,
    clearcoatRoughness : 0.1,
    normalScale : .1,
    clearcoatNormalScale : 1
}

const b1 = new Block();
b1.editShapeLine(block_01);
b1.addGroup(group);
b1.movePosition(168,28,36);
b1.moveRotation(-.7,0,0.5);
b1.editMaterial(glassMat,'#ffffff');

const b2 = new Block();
b2.editShapeLine(block_02);
b2.addGroup(group);
b2.movePosition(141,50,-40);
b2.moveRotation(.8,1,0.5);
b2.editMaterial(colorMat,'#7c001b');

const b3 = new Block();
b3.editShapeLine(block_03);
b3.addGroup(group);
b3.movePosition(128,32,-20);
b3.moveRotation(.9,0,0.5);
b3.editMaterial(colorMat,'#093500');

const b4 = new Block();
b4.editShapeLine(block_04);
b4.addGroup(group);
b4.movePosition(78,16,-52);
b4.moveRotation(.6,0,0.5);
b4.editMaterial(colorMat,'#7c001b');

const b5 = new Block();
b5.editShapeLine(block_01);
b5.addGroup(group);
b5.movePosition(40,-52,30);
b5.moveRotation(-.2,0,0.5);
b5.editMaterial(glassMat,'#ffffff');

const b6 = new Block();
b6.editShapeLine(block_05);
b6.addGroup(group);
b6.movePosition(-60,-52,-6);
b6.moveRotation(0.15,1,0.5);
b6.editMaterial(colorMat,'#001e7c');

const b7 = new Block();
b7.editShapeLine(block_03);
b7.addGroup(group);
b7.movePosition(-43,-40,58);
b7.moveRotation(0.68,1,1.5);
b7.editMaterial(colorMat,'#7c1700');


group.position.x = -15;
group.scale.set(.22,.22,.22)

/*
    camera
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(20, sizes.width / sizes.height, 1, 100000)
camera.position.set(200,-120,360)
// camera.rotation.y = Math.PI*0.5
scene.add(camera)

/*
    mousemove
*/
const cursor = {
    x: 0,
    y: 0
}

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)

    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    // console.log(mouse)
})

/*
    renderer
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3

/*
    controls
*/
// const controls = new OrbitControls(camera, canvas)
// controls.target.y = 2
// controls.enableDamping = true

/*
    Light
*/

const ambientLight = new THREE.AmbientLight(0xffffff, .3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
scene.add(directionalLight)
directionalLight.position.set(50, 10, 40)
directionalLight.castShadow = true
directionalLight.shadow.normalBias = 0.05

// const axesHelper = new THREE.AxesHelper( 100 );
// scene.add( axesHelper );


/**
 * Post processing
 */
const effectComposer = new EffectComposer(renderer)
effectComposer.setSize(sizes.width, sizes.height)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

 
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.enabled = false
effectComposer.addPass(unrealBloomPass)
unrealBloomPass.strength = 0.01
unrealBloomPass.radius = 0.01
unrealBloomPass.threshold = 0.01

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)


const raycaster = new THREE.Raycaster()
let currentIntersect = null

/*
    animaition
*/
// gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    raycaster.setFromCamera(mouse, camera)
    
    const objectsToTest = [
        group.children[0],
        group.children[1],
        group.children[2],
        group.children[3],
        group.children[4],
        group.children[5],
        group.children[6]
    ]
    const intersects = raycaster.intersectObjects(objectsToTest)
    // console.log(objectsToTest)
    
    if(intersects.length)
    {
        if(!currentIntersect)
        {
            // console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            // console.log('mouse leave')
        }
        
        currentIntersect = null
    }

    // controls.update()
    // camera.lookAt(group.position)
    camera.position.x = Math.sin(cursor.x * Math.PI * .25) * 95 + 50
    camera.position.z = Math.cos(cursor.x * Math.PI * .25) * 95 - 20
    camera.position.y = cursor.y * 100 - 30
    camera.lookAt(0,0,0)

    group.rotation.x = elapsedTime*0.04
    // renderer.render(scene, camera)
    effectComposer.render()
    
    window.requestAnimationFrame(tick)
}

tick()


/*
    resize
*/
window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        switch(currentIntersect.object)
        {
            case  group.children[0]:
                console.log('click on object 1')
                break

            case  group.children[1]:
                console.log('click on object 2')
                break

            case  group.children[2]:
                console.log('click on object 3')
                break

            case  group.children[3]:
                console.log('click on object 4')
                break

            case  group.children[4]:
                console.log('click on object 5')
                break

            case  group.children[5]:
                console.log('click on object 6')
                break       

            case  group.children[6]:
                console.log('click on object 7')
                break
        
        }
    }
})