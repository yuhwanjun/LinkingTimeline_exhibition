import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";

const canvas = document.querySelector('canvas.webgl')

/*
    scene
*/
const scene = new THREE.Scene();

/*
    object
*/

// create box****************************
// const w = 1000, h = 700;
// const Lx = 55, N1x = 435, Gx = 20;
// const Ly = 138.5, Ny = Ly-61, Gy= 174 ;
const w = 1000, h = 700;
const Lx = 55, N1x = 435, Gx = 20;
const Ly = 138.5, Ny = Ly-61, Gy= 174 ;

const shape_01 = [
    [0, 0],
    [Lx,0],
    [Lx,Ly],
    [Lx+165,Ly],
    [Lx+165,Ny],

    [N1x,Ny],
    [N1x,Ly],
    [N1x+205,Ly],
    [N1x+205,Ny],

    [w-Gx-127-35,Ny],
    [w-Gx-127-35,Ly],
    [w-Gx-127,Ly],
    [w-Gx-127,Gy],
    [w-Gx,Gy],
    [w-Gx,0],
    [w,0],

    [w,h],
    [0,h],
    [0,0]
]

const shape_02 = [
    [0, 0],
    [5, 0],
    [5, 5],
    [0, 5],
    [0, 0]
]

class Block{
    constructor(){
        this.extrudeSettings = {
            steps: 5,
            depth: 20,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 5,
            bevelOffset: 0,
            bevelSegments: 5
        };

        this.blockShape = new THREE.Shape();

        this.position = [0,0,0]
        this.rotation = [0,0,0]

    }
    addScene(_scene){
        this.blockGeo = new THREE.ExtrudeGeometry( this.blockShape, this.extrudeSettings );
        this.blockMat = new THREE.MeshPhongMaterial();
        this.blockMat.shininess = 100
        this.blockMat.specular = new THREE.Color(0x1188ff)
        

        this.blockMesh = new THREE.Mesh(this.blockGeo, this.blockMat)
        _scene.add(this.blockMesh)
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
        this.blockMesh.position.x = this.position[0];
        this.blockMesh.position.y = this.position[1];
        this.blockMesh.position.z = this.position[2];
    }
    moveRotation(x,y,z){
        this.rotation = [x,y,z];
        this.blockMesh.rotation.x = this.rotation[0]*Math.PI;
        this.blockMesh.rotation.y = this.rotation[1]*Math.PI;
        this.blockMesh.rotation.z = this.rotation[2]*Math.PI;
    }
}

const b1 = new Block();

b1.editShapeLine(shape_01);
b1.addScene(scene);
b1.movePosition(0,-500,0);
b1.moveRotation(0,0,0.5);

// const b2 = new Block();
// b2.editShapeLine(shape_01);
// b2.addScene(scene);
// b2.movePosition(0,-450,100);
// b2.moveRotation(0,0,0.5);



/*
    camera
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100000)
camera.position.z = 1000;
// camera.lookAt(b1.position)
scene.add(camera)

/*
    mousemove
*/
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)
    // console.log(event.x, event.y)
})

/*
    renderer
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

/*
    controls
*/
const controls = new OrbitControls(camera, canvas)
controls.target.y = 2
controls.enableDamping = true

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)
// ...

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2000
pointLight.position.y = 3000
pointLight.position.z = 4000
scene.add(pointLight)

const axesHelper = new THREE.AxesHelper( 500 );
scene.add( axesHelper );
/*
    animaition
*/
// gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2
    // camera.position.y = cursor.y * 3
    controls.update()
    camera.lookAt(b1.blockMesh.position)

    b1.blockMesh.rotation.x = elapsedTime
    renderer.render(scene, camera)

    
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