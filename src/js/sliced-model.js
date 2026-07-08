import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui'
import slicedVertexShader from '@/shaders/sliced/vertex.glsl'
import slicedFragmentShader from '@/shaders/sliced/fragment.glsl'

// 创建gui
const gui = new GUI({ width: 340 })
const debugObject = {}

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const hdrLoader = new HDRLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('../../static/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Environment map
 */
hdrLoader.load('../../static/environmentMaps/aerodynamics_workshop.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = environmentMap
  scene.backgroundBlurriness = 0.5
  scene.environment = environmentMap
})

/**
 * Sliced model
 */
const uniforms = {
  uSliceStart: new THREE.Uniform(1.75),
  uSliceArc: new THREE.Uniform(1.25),
}

gui.add(uniforms.uSliceStart, 'value', -Math.PI, Math.PI, 0.001).name('uSliceStart')
gui.add(uniforms.uSliceArc, 'value', 0, Math.PI * 2, 0.001).name('uSliceArc')

const patchMap = {
  csm_Slice: {
    '#include <colorspace_fragment>':
      `
      #include <colorspace_fragment>
      
      if(!gl_FrontFacing) {
        gl_FragColor = vec4(0.75, 0.15, 0.3, 1.0);
      }
    `
  }
}

// Material
const material = new THREE.MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: '#858080'
})

const slicedmaterial = new CustomShaderMaterial({
  // SCM
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader: slicedVertexShader,
  fragmentShader: slicedFragmentShader,
  uniforms: uniforms,
  patchMap: patchMap,
  silent: true,

  // MeshStandardMaterial
  metalness: 0.5,
  roughness: 0.25,
  envMapIntensity: 0.5,
  color: '#858080',
  side: THREE.DoubleSide
})

const slicedDepthmaterial = new CustomShaderMaterial({
  // SCM
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader: slicedVertexShader,
  fragmentShader: slicedFragmentShader,
  uniforms: uniforms,
  patchMap: patchMap,
  silent: true,

  // MeshStandardMaterial
  depthPacking: THREE.RGBADepthPacking
})

// Model
let model = null
gltfLoader.load('../../static/models/gears.glb', (gltf) => {
  model = gltf.scene

  model.traverse((child) => {
    if (child.isMesh) {
      if (child.name === 'outerHull') {
        child.material = slicedmaterial
        child.customDepthMaterial = slicedDepthmaterial
      } else {
        child.material = material
      }
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  scene.add(model)
})

/**
 * Plane
 */
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshStandardMaterial({ color: '#aaaaaa' })
)
plane.receiveShadow = true
plane.position.x = - 4
plane.position.y = - 3
plane.position.z = - 4
plane.lookAt(new THREE.Vector3(0, 0, 0))
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

// 三维空间大小
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

// 创建相机
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-5, 5, 12)
scene.add(camera)

// 创建控制器
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update model
  if (model) {
    model.rotation.y = elapsedTime * 0.1
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()