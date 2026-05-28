import '../css/style.css'
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'
import GUI from "lil-gui"

// 创建gui
const gui = new GUI({
  width: 300,
  title: 'Nice debug UI',
  closeFolders: false
})

const global = {}

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建加载器
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const hdrLoader = new HDRLoader()
const exrLoader = new EXRLoader()
const textureLoader = new THREE.TextureLoader()

// 创建场景
const scene = new THREE.Scene()

// 环境贴图
// const environmentMap = cubeTextureLoader.load([
//   '../../static/environmentMaps/0/px.png',
//   '../../static/environmentMaps/0/nx.png',
//   '../../static/environmentMaps/0/py.png',
//   '../../static/environmentMaps/0/ny.png',
//   '../../static/environmentMaps/0/pz.png',
//   '../../static/environmentMaps/0/nz.png'
// ])

// scene.environment = environmentMap
// scene.background = environmentMap

// hdrLoader.load('../../static/environmentMaps/blender-2k.hdr', (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularRefractionMapping

//   scene.environment = environmentMap
//   scene.background = environmentMap
// })

// exrLoader.load('../../static/environmentMaps/nvidiaCanvas-4k.exr', (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularRefractionMapping

//   scene.environment = environmentMap
//   scene.background = environmentMap
// })

const environmentMap = textureLoader.load('../../static/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace

scene.background = environmentMap

// hdrLoader.load('../../static/environmentMaps/2/2k.hdr', (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularRefractionMapping
//   scene.environment = environmentMap

//   const skybox = new GroundedSkybox(environmentMap, 10, 50)
//   scene.add(skybox)
// })

scene.environmentIntensity = 1
scene.backgroundBlurriness = 0
scene.backgroundIntensity = 1

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.001)
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001)
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001)

//甜甜圈灯光
const holyDonut = new THREE.Mesh(
  new THREE.TorusGeometry(8, 0.5),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
)
holyDonut.layers.enable(1)
holyDonut.position.y = 3.5
scene.add(holyDonut)

// 立方体渲染目标
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
  256,
  {
    type: THREE.HalfFloatType
  }
)

scene.environment = cubeRenderTarget.texture

// 创建立方体相机
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
cubeCamera.layers.set(1)

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    roughness: 0,
    metalness: 1,
    color: 0xaaaaaa
  })
)
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

// 导入模型
gltfLoader.load('../../static/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
  gltf.scene.scale.set(10, 10, 10)
  scene.add(gltf.scene)
})

// 三维空间大小
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// 创建相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// 创建控制器
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  if (holyDonut) {
    holyDonut.rotation.x = Math.sin(elapsedTime) * 2

    cubeCamera.update(renderer, scene)
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()