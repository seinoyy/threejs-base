import '../css/style.css'
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from "lil-gui"

// 创建gui
const gui = new GUI({
  width: 300,
  title: 'Nice debug UI',
  closeFolders: false
})

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建加载器
const gltfLoader = new GLTFLoader()
const hdrLoader = new HDRLoader()
const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('../../static/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// 创建场景
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

// 创建环境贴图
// Intensity
scene.environmentIntensity = 1
gui
  .add(scene, 'environmentIntensity')
  .min(0)
  .max(10)
  .step(0.001)

// HDR (RGBE) equirectangular
hdrLoader.load('../../static/environmentMaps/0/2k.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = environmentMap
  scene.environment = environmentMap
})

// 创建平行光
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(-4, 6.5, 2.5)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('LightIntensity')
gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.001).name('LightX')
gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.001).name('LightY')
gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.001).name('LightZ')

// 设置光源阴影
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.027
directionalLight.shadow.bias = -0.004
directionalLight.shadow.mapSize.set(512, 512)

gui.add(directionalLight, 'castShadow').name('LightCastShadow')
gui.add(directionalLight.shadow, 'normalBias').min(-0.05).max(0.05).step(0.001).name('LightShadowNormalBias')
gui.add(directionalLight.shadow, 'bias').min(-0.05).max(0.05).step(0.001).name('LightShadowBias')

// // 创建助手
// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

// 设置平行光目标
directionalLight.target.position.set(0, 4, 0)
directionalLight.target.updateWorldMatrix()

// 导入模型
// Helmet
gltfLoader.load(
  '../../static/models/hamburger.glb',
  (gltf) => {
    gltf.scene.scale.set(0.4, 0.4, 0.4)
    gltf.scene.position.set(0, 2.5, 0)
    scene.add(gltf.scene)

    updateAllMaterials()
  }
)

// 创建地板
const floorColorTexture = textureLoader.load('../../static/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg')
const floorARMTexture = textureLoader.load('../../static/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('../../static/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png')

floorColorTexture.colorSpace = THREE.SRGBColorSpace

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    aoMap: floorARMTexture,
    roughnessMap: floorARMTexture,
    metalnessMap: floorARMTexture,
    normalMap: floorNormalTexture
  })
)
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

// 创建墙
const wallColorTexture = textureLoader.load('../../static/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp')
const wallARMTexture = textureLoader.load('../../static/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp')
const wallNormalTexture = textureLoader.load('../../static/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp')

wallColorTexture.colorSpace = THREE.SRGBColorSpace

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 8),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    normalMap: wallNormalTexture
  })
)
wall.position.y = 4
wall.position.z = -4
scene.add(wall)

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
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 设置纹理色调映射
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3

gui.add(renderer, 'toneMapping', {
  'No Tone Mapping': THREE.NoToneMapping,
  'Linear Tone Mapping': THREE.LinearToneMapping,
  'Reinhard Tone Mapping': THREE.ReinhardToneMapping,
  'Cineon Tone Mapping': THREE.CineonToneMapping,
  'ACESFilmicToneMapping': THREE.ACESFilmicToneMapping
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

// 设置阴影
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()