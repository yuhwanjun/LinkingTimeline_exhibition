import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";

const canvas = document.querySelector('canvas.webgl')

/*
    scene
*/
const scene = new  THREE.Scene();



/*
    object
*/
// const geometry = new THREE.BoxGeometry(1,1,1)
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)


// create box****************************
// const w = 1000, h = 700;
// const Lx = 55, N1x = 435, Gx = 20;
// const Ly = 138.5, Ny = Ly-61, Gy= 174 ;
const w = 1000, h = 700;
const Lx = 0, N1x = 630, Gx = 0;
const Ly = 138.5, Ny = Ly-61, Gy= 174 ;


const shape = new THREE.Shape();
shape.moveTo( 0,0 );

shape.lineTo( Lx,0 );
shape.lineTo( Lx,Ly );
shape.lineTo( Lx+165,Ly );
shape.lineTo( Lx+165,Ny );

shape.lineTo( N1x,Ny );
shape.lineTo( N1x,Ly );
shape.lineTo( N1x+205,Ly );
shape.lineTo( N1x+205,Ny );

shape.lineTo( w-Gx-127-35,Ny );
shape.lineTo( w-Gx-127-35,Ly );
shape.lineTo( w-Gx-127,Ly );
shape.lineTo( w-Gx-127,Gy );
shape.lineTo( w-Gx,Gy );
shape.lineTo( w-Gx,0 );
shape.lineTo( w,0 );

shape.lineTo( w,h );
shape.lineTo( 0,h );
shape.lineTo( 0,0 );

const extrudeSettings = {
	steps: 2,
	depth: 16,
	bevelEnabled: true,
	bevelThickness: 1,
	bevelSize: 1,
	bevelOffset: 0,
	bevelSegments: 1
};

const geometry2 = new THREE.ExtrudeGeometry( shape, extrudeSettings );
const material2 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const mesh2 = new THREE.Mesh( geometry2, material2 ) ;
scene.add( mesh2 );

mesh2.rotation.x = Math.PI * 1;
mesh2.position.x = -500;
mesh2.position.y = 350;

/*
    camera
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100000)
camera.position.z = 1000
camera.lookAt(mesh2.position)
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


/*
    animaition
*/
// gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })
const clock = new THREE.Clock()

const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()

    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2
    // camera.position.y = cursor.y * 3
    controls.update()
    // camera.lookAt(mesh2.position)

    // mesh.rotation.y = elapsedTime
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