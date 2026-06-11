import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GUI from 'lil-gui'
import shadingVertexShader from '@/shaders/shading/vertex.glsl'
import shadingFragmentShader from '@/shaders/shading/fragment.glsl'

// 创建gui
const gui = new GUI({ width: 340 })

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const gltfLoader = new GLTFLoader()

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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(7, 7, 7)
scene.add(camera)

// 创建控制器
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Material
 */
const materialParameters = {}
materialParameters.color = '#ffffff'

const material = new THREE.ShaderMaterial({
  vertexShader: shadingVertexShader,
  fragmentShader: shadingFragmentShader,
  uniforms:
  {
    uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
  }
})

gui
  .addColor(materialParameters, 'color')
  .onChange(() => {
    material.uniforms.uColor.value.set(materialParameters.color)
  })

/**
 * Objects
 */
// Torus knot
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
  material
)
torusKnot.position.x = 3
scene.add(torusKnot)

// Sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(),
  material
)
sphere.position.x = - 3
scene.add(sphere)

// Suzanne
let suzanne = null
gltfLoader.load(
  '../../static/models/suzanne.glb',
  (gltf) => {
    suzanne = gltf.scene
    suzanne.traverse((child) => {
      if (child.isMesh)
        child.material = material
    })
    scene.add(suzanne)
  }
)

// light helper
const directionalLightHelper = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial()
)
directionalLightHelper.material.color.setRGB(0.1, 0.1, 1)
directionalLightHelper.material.side = THREE.DoubleSide
directionalLightHelper.position.set(0, 0, 3)
scene.add(directionalLightHelper)

const pointLightHelper1 = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
)
pointLightHelper1.material.color.setRGB(1.0, 0.1, 0.1)
pointLightHelper1.position.set(0, 2.5, 0)
scene.add(pointLightHelper1)

const pointLightHelper2 = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
)
pointLightHelper2.material.color.setRGB(0.1, 1.0, 0.5)
pointLightHelper2.position.set(2, 2, 2)
scene.add(pointLightHelper2)

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Rotate objects
  if (suzanne) {
    suzanne.rotation.x = - elapsedTime * 0.1
    suzanne.rotation.y = elapsedTime * 0.2
  }

  sphere.rotation.x = - elapsedTime * 0.1
  sphere.rotation.y = elapsedTime * 0.2

  torusKnot.rotation.x = - elapsedTime * 0.1
  torusKnot.rotation.y = elapsedTime * 0.2

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()