import '../css/style.css'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui"
import { round } from 'three/src/nodes/TSL.js'

// 创建gui
const gui = new GUI({
  width: 300,
  title: 'Nice debug UI',
  closeFolders: false
})

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建雾
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog

// 创建纹理
// 创建纹理加载器
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load('../../static/haunted-house/door/color.webp')
const doorAlphaTexture = textureLoader.load('../../static/haunted-house/door/alpha.webp')
const doorAmbientOcclusionTexture = textureLoader.load('../../static/haunted-house/door/ambientOcclusion.webp')
const doorHeightTexture = textureLoader.load('../../static/haunted-house/door/height.webp')
const doorNormalTexture = textureLoader.load('../../static/haunted-house/door/normal.webp')
const doorMetalnessTexture = textureLoader.load('../../static/haunted-house/door/metalness.webp')
const doorRoughnessTexture = textureLoader.load('../../static/haunted-house/door/roughness.webp')

const wallColorTexture = textureLoader.load('../../static/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp')
const wallNormalTexture = textureLoader.load('../../static/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp')
const wallARMTexture = textureLoader.load('../../static/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp')

const roofColorTexture = textureLoader.load('../../static/haunted-house/roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp')
const roofNormalTexture = textureLoader.load('../../static/haunted-house/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp')
const roofARMTexture = textureLoader.load('../../static/haunted-house/roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp')

const floorColorTexture = textureLoader.load('../../static/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp')
const floorAlphaTexture = textureLoader.load('../../static/haunted-house/floor/alpha.webp')
const floorNormalTexture = textureLoader.load('../../static/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp')
const floorARMTexture = textureLoader.load('../../static/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp')
const floorHeightTexture = textureLoader.load('../../static/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp')

const bushColorTexture = textureLoader.load('../../static/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp')
const bushNormalTexture = textureLoader.load('../../static/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp')
const bushARMTexture = textureLoader.load('../../static/haunted-house/bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp')

const graveColorTexture = textureLoader.load('../../static/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp')
const graveNormalTexture = textureLoader.load('../../static/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp')
const graveARMTexture = textureLoader.load('../../static/haunted-house/grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp')

// 创建屋子
const house = new THREE.Group()
scene.add(house)

// 创建墙壁
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    aoMap: wallARMTexture,
    metalnessMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    normalMap: wallNormalTexture
  })
)
walls.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
walls.position.y = 2.5 / 2
house.add(walls)

// 创建屋顶
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1, 4),
  new THREE.MeshStandardMaterial({
    map: roofColorTexture,
    aoMap: roofARMTexture,
    metalnessMap: roofARMTexture,
    roughnessMap: roofARMTexture,
    normalMap: roofNormalTexture
  })
)
roof.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(roof.geometry.attributes.uv.array, 2)
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// 创建门
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    transparent: true,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture
  })
)
door.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// 创建灌木丛
// 创建模型
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
  map: bushColorTexture,
  aoMap: bushARMTexture,
  normalMap: bushNormalTexture,
  metalnessMap: bushARMTexture,
  roughnessMap: bushARMTexture
})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(bush1.geometry.attributes.uv.array, 2)
)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(bush2.geometry.attributes.uv.array, 2)
)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(bush3.geometry.attributes.uv.array, 2)
)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(bush4.geometry.attributes.uv.array, 2)
)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)

house.add(bush1, bush2, bush3, bush4)

// 创建墓碑
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshPhysicalMaterial({
  map: graveColorTexture,
  aoMap: graveARMTexture,
  normalMap: graveNormalTexture,
  metalnessMap: graveARMTexture,
  roughnessMap: graveARMTexture
})

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2
  const radius = 3 + Math.random() * 6
  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius

  const grave = new THREE.Mesh(graveGeometry, graveMaterial)
  grave.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(grave.geometry.attributes.uv.array, 2)
  )
  grave.position.set(x, 0.3, z)
  grave.rotation.y = (Math.random() - 0.5) * 0.4
  grave.rotation.z = (Math.random() - 0.5) * 0.4
  grave.castShadow = true
  graves.add(grave)
}

// 创建地面
const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorColorTexture,
  aoMap: floorARMTexture,
  displacementMap: floorHeightTexture,
  displacementScale: 0.1,
  normalMap: floorNormalTexture,
  metalnessMap: floorARMTexture,
  roughnessMap: floorARMTexture
})
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20, 100, 100),
  floorMaterial
)
floor.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

// 创建光源
// 环境光
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.24)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
// 月光
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.24)
moonLight.position.set(4, 5, -2)
scene.add(moonLight)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001)
// 门的灯
const doorLight = new THREE.PointLight('#ff7d46', 4, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)
// 创建鬼魂
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
ghost1.position.y = 0.1
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost3)

// 三维空间大小
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// 创建相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
// 相机添加到场景中
scene.add(camera)

// 创建控制器
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')

// 创建阴影
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

floor.receiveShadow = true

doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener("dblclick", () => {
  const fullscreen = document.fullscreenElement || document.webkitFullscreenElement
  if (!fullscreen) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen()
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
})

// 动画
// 创建时钟
const timer = new THREE.Timer()
const tick = () => {
  // Timer
  timer.update()
  const elapsedTime = timer.getElapsed()

  const ghost1Angle = elapsedTime * 0.5
  ghost1.position.x = Math.cos(ghost1Angle) * 4
  ghost1.position.z = Math.sin(ghost1Angle) * 4

  const ghost2Angle = -elapsedTime * 0.32
  ghost2.position.x = Math.cos(ghost2Angle) * 5
  ghost2.position.z = Math.sin(ghost2Angle) * 5
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

  const ghost3Angle = -elapsedTime * 0.18
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
  ghost3.position.y = Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 2)

  // 更新控制器
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}
tick()