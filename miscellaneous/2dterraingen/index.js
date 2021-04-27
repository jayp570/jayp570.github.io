const windowWidth = 500
const windowHeight = 500

//setting up threejs scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(90, windowWidth/windowHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(windowWidth, windowHeight)
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;

heightmap = getHeightmap()

let geometry = new THREE.PlaneGeometry(65, 65, 65, 65)
const material = new THREE.MeshPhongMaterial()
material.map = new THREE.TextureLoader().load(getTextureMap())
material.displacementMap = new THREE.TextureLoader().load(getDisplacementMap())
material.displacementScale = 20;
let terrainObject = new THREE.Mesh(geometry, material)
scene.add(terrainObject)

terrainObject.receiveShadow = true
terrainObject.rotation.x = -Math.PI/3

camera.position.z = 40
camera.position.y = 0

let waterGeometry = new THREE.BoxGeometry(400, 400, 20)
let waterMaterial = new THREE.MeshBasicMaterial({color: "#0012ff"})
let waterObject = new THREE.Mesh(waterGeometry, waterMaterial)
scene.add(waterObject)

waterObject.rotation.x = -Math.PI/3

waterObject.receiveShadow = true

const light = new THREE.PointLight("rgb(255, 255, 255)", 2.5)
scene.add(light)
light.position.set(100, 35, 0);
light.target = terrainObject
light.castShadow = true

function animate() {
    requestAnimationFrame(animate)
    terrainObject.rotation.z += 0.02
    renderer.render(scene, camera)
}

animate()