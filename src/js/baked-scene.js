import '../css/style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from "lil-gui"
import firefliesVertexShader from '@/shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from '@/shaders/fireflies/fragment.glsl'
import portalVertexShader from '@/shaders/portal/vertex.glsl'
import portalFragmentShader from '@/shaders/portal/fragment.glsl'

// 创建gui
const gui = new GUI({
  width: 400
})
const debugObject = {}

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建模型
const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('../../static/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('../../static/textures/baked.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

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
  firefliesMaterial.uniforms.uPixelRatio.value = sizes.pixelRatio
})

// 创建相机
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 2, 4)
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

debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Polrtal light material
debugObject.portalColorStart = '#000000'
debugObject.portalColorEnd = '#ffffff'

const portalLightMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColorStart: new THREE.Uniform(new THREE.Color(debugObject.portalColorStart)),
    uColorEnd: new THREE.Uniform(new THREE.Color(debugObject.portalColorEnd))
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader
})

gui.addColor(portalLightMaterial.uniforms.uColorStart, 'value').name('portalColorStart').onChange(() => {
  portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})
gui.addColor(portalLightMaterial.uniforms.uColorEnd, 'value').name('portalColorEnd').onChange(() => {
  portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})

// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: '#ffffe5' })

/**
 * Model
 */
gltfLoader.load('../../static/models/bake-scene.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.startsWith('portalLight')) {
        child.material = portalLightMaterial
      } else if (child.name.startsWith('poleLight')) {
        child.material = poleLightMaterial
      } else {
        child.material = bakedMaterial
      }
    }
  })
  scene.add(gltf.scene)
})

/**
 * Fireflies
 */
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
  const i3 = i * 3
  positionArray[i3 + 0] = (Math.random() - 0.5) * 4
  positionArray[i3 + 1] = Math.random() * 1.5
  positionArray[i3 + 2] = (Math.random() - 0.5) * 4

  scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

// Material
const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPixelRatio: new THREE.Uniform(sizes.pixelRatio),
    uSize: new THREE.Uniform(100)
  },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update uTime
  firefliesMaterial.uniforms.uTime.value = elapsedTime
  portalLightMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

