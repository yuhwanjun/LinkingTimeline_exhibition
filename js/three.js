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
const geometry = new THREE.BoxGeometry(1,1,1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)


/*
    camera
*/
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000)
camera.position.z = 3
camera.lookAt(mesh.position)
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
    const elapsedTime = clock.getElapsedTime()

    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2
    // camera.position.y = cursor.y * 3
    controls.update()
    camera.lookAt(mesh.position)

    mesh.rotation.y = elapsedTime
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