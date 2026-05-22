import '../css/style.css'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui"

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

// // 创建纹理
// // 创建纹理加载器
// const textureLoader = new THREE.TextureLoader()

// const particleTexture = textureLoader.load('../../static/particles/2.png')

// // 创建粒子
// const particlesGeometry = new THREE.BufferGeometry()
// const count = 20000

// const positions = new Float32Array(count * 3)
// const colors = new Float32Array(count * 3)
// for (let i = 0; i < count * 3; i++) {
//   positions[i] = (Math.random() - 0.5) * 10
//   colors[i] = Math.random()
// }
// particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// const particlesMaterial = new THREE.PointsMaterial()
// particlesMaterial.size = 0.1
// particlesMaterial.sizeAttenuation = true
// // particlesMaterial.color = new THREE.Color(0xff00ff)
// particlesMaterial.transparent = true
// particlesMaterial.alphaMap = particleTexture
// // particlesMaterial.alphaTest = 0.001
// // particlesMaterial.depthTest = false
// particlesMaterial.depthWrite = false
// particlesMaterial.blending = THREE.AdditiveBlending
// particlesMaterial.vertexColors = true

// const particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

// 创建银河系
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
  // 销毁旧数据
  if (points) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
    geometry = null
    material = null
    points = null
  }
  // 创建模型
  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const insideColor = new THREE.Color(parameters.insideColor)
  const outsideColor = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3
    // 位置
    const radius = parameters.radius * Math.random()
    const spinAngle = radius * parameters.spin
    const brancheAngle = i % parameters.branches * (Math.PI * 2) / parameters.branches

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    positions[i3] = radius * Math.cos(brancheAngle + spinAngle) + randomX
    positions[i3 + 1] = randomY
    positions[i3 + 2] = radius * Math.sin(brancheAngle + spinAngle) + randomZ

    // 颜色
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  )

  // 创建材质
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  })

  // 创建星星
  points = new THREE.Points(geometry, material)
  scene.add(points)
}
generateGalaxy()

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.01).max(0.1).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.01).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

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
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
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

// 动画
// 创建时钟
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // // Update particles
  // for (let i = 0; i < count; i++) {
  //   const i3 = i * 3
  //   const x = particlesGeometry.attributes.position.array[i3]
  //   particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
  // }
  // particlesGeometry.attributes.position.needsUpdate = true

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()