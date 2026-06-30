import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { element } from 'three/tsl'

let sceneReady = false
const debugObject = {}

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const loadingBarElement = document.querySelector(".loading-bar")

const loadingManager = new THREE.LoadingManager(
  // 加载完成
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
      if (loadingBarElement) {
        loadingBarElement.classList.add('ended')
        loadingBarElement.style.transform = ''
      }
    })
    gsap.delayedCall(3, () => {
      sceneReady = true
    })
  },
  // 加载中
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
    if (loadingBarElement) {
      loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
  }
)
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uAlpha: new THREE.Uniform(1)
  },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uAlpha;

    void main() {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
  `,
  transparent: true
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  '../../static/textures/environmentMaps/5/px.jpg',
  '../../static/textures/environmentMaps/5/nx.jpg',
  '../../static/textures/environmentMaps/5/py.jpg',
  '../../static/textures/environmentMaps/5/ny.jpg',
  '../../static/textures/environmentMaps/5/pz.jpg',
  '../../static/textures/environmentMaps/5/nz.jpg'
])

environmentMap.colorSpace = THREE.SRGBColorSpace

scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 2.5

/**
 * Models
 */
gltfLoader.load(
  '../../static/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
  (gltf) => {
    gltf.scene.scale.set(2.5, 2.5, 2.5)
    gltf.scene.rotation.y = Math.PI * 0.5
    scene.add(gltf.scene)

    updateAllMaterials()
  }
)

/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster()
const points = [
  {
    position: new THREE.Vector3(1.55, 0.3, -0.6),
    element: document.querySelector('.point-0')
  },
  {
    position: new THREE.Vector3(0.5, 0.8, -1.6),
    element: document.querySelector('.point-1')
  },
  {
    position: new THREE.Vector3(1.6, -1.3, -0.7),
    element: document.querySelector('.point-2')
  }
]

const updatePoints = () => {
  for (const point of points) {
    const screenPosition = point.position.clone()
    screenPosition.project(camera)

    raycaster.setFromCamera(screenPosition, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length) {
      const intersectionDistance = intersects[0].distance
      const pointDistance = point.position.distanceTo(camera.position)
      if (pointDistance < intersectionDistance) {
        point.element.classList.add('visible')
      } else {
        point.element.classList.remove('visible')
      }
    } else {
      point.element.classList.add('visible')
    }

    const translateX = screenPosition.x * sizes.width * 0.5
    const translateY = - screenPosition.y * sizes.height * 0.5
    point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
  }
}

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, -6)
scene.add(camera)

// 创建控制器
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update controls
  controls.update()

  // Go through each point
  if (sceneReady) {
    updatePoints()
  }

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()