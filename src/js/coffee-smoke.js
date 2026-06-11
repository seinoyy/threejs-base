import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GUI from 'lil-gui'
import coffeeSmokeVertexShader from '@/shaders/coffeeSmoke/vertex.glsl'
import coffeeSmokeFragmentShader from '@/shaders/coffeeSmoke/fragment.glsl'

// 创建gui
const gui = new GUI()

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

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
camera.position.set(8, 10, 12)
scene.add(camera)

// 创建控制器
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 导入模型
gltfLoader.load('../../static/coffee-smoke/bakedModel.glb', (gltf) => {
  gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
  scene.add(gltf.scene)
})

const perlinTexture = textureLoader.load('../../static/coffee-smoke/perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

// 创建烟雾
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
smokeGeometry.translate(0, 0.5, 0)
smokeGeometry.scale(1.5, 6, 1.5)

const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader: coffeeSmokeVertexShader,
  fragmentShader: coffeeSmokeFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPrelinTexture: new THREE.Uniform(perlinTexture)
  },
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false
})

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = 1.83
scene.add(smoke)

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update uniforms
  smokeMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()