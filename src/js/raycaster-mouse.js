import '../css/style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

// 创建射线
const raycaster = new THREE.Raycaster()

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

// 获取鼠标坐标
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = 1 - (event.clientY / sizes.height) * 2
})

window.addEventListener('click', () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log('Click on object1')
        break
      case object2:
        console.log('Click on object2')
        break
      case object3:
        console.log('Click on object3')
        break
    }
  }
})

// 创建相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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

// 创建导入模型
const gltfLoader = new GLTFLoader()

let duck = null
gltfLoader.load(
  '../../static/models/Duck/glTF-Binary/Duck.glb',
  (gltf) => {
    duck = gltf.scene
    duck.position.y = -1.2
    scene.add(duck)
  }
)

// 创建光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

// 动画
const timer = new THREE.Timer()

let currentIntersect = null

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // 给物体添加动画
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

  //  投射射线
  raycaster.setFromCamera(mouse, camera)

  const objectToTest = [object1, object2, object3]
  const intersects = raycaster.intersectObjects(objectToTest)

  for (const object of objectToTest) {
    object.material.color.set('#ff0000')
  }

  for (const intersect of intersects) {
    intersect.object.material.color.set('#0000ff')
  }

  if (intersects.length) {
    if (!currentIntersect) {
      console.log('mouse enter')
    }
    currentIntersect = intersects[0]
  } else {
    if (currentIntersect) {
      console.log('mouse leave')
    }
    currentIntersect = null
  }

  if (duck) {
    const duckIntersects = raycaster.intersectObject(duck)
    if (duckIntersects.length) {
      duck.scale.set(1.1, 1.1, 1.1)
    } else {
      duck.scale.set(1, 1, 1)
    }
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()