import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GUI from 'lil-gui'

// 创建gui
const gui = new GUI()

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.material.envMapIntensity = 1
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

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('../../static/models/LeePerrySmith/color.jpg')
mapTexture.colorSpace = THREE.SRGBColorSpace
const normalTexture = textureLoader.load('../../static/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture
})

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking
})

const custUniforms = {
  uTime: { value: 0 }
}

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = custUniforms.uTime

  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
      #include <common>

      uniform float uTime;
      
      mat2 get2dRotationMatrix(float _angle) {
        return mat2(
          cos(_angle), -sin(_angle),
          sin(_angle), cos(_angle)
        );
      }
    `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <beginnormal_vertex>',
    `
      #include <beginnormal_vertex>

      float angle = sin(position.y + uTime) * 0.4;
      mat2 rotateMatrix = get2dRotationMatrix(angle);

      objectNormal.xz = rotateMatrix * objectNormal.xz;
    `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
      #include <begin_vertex>

      transformed.xz = rotateMatrix * transformed.xz;
    `
  )
}

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = custUniforms.uTime

  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
      #include <common>

      uniform float uTime;
      
      mat2 get2dRotationMatrix(float _angle) {
        return mat2(
          cos(_angle), -sin(_angle),
          sin(_angle), cos(_angle)
        );
      }
    `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
      #include <begin_vertex>
      
      float angle = sin(position.y + uTime) * 0.4;
      mat2 rotateMatrix = get2dRotationMatrix(angle);

      transformed.xz = rotateMatrix * transformed.xz;
    `
  )
}

/**
 * Models
 */
gltfLoader.load(
  '../../static/models/LeePerrySmith/LeePerrySmith.glb',
  (gltf) => {
    // Model
    const mesh = gltf.scene.children[0]
    mesh.rotation.y = Math.PI * 0.5
    mesh.material = material
    mesh.customDepthMaterial = depthMaterial
    scene.add(mesh)

    // Update materials
    updateAllMaterials()
  }
)

// 平面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  new THREE.MeshStandardMaterial()
)
plane.rotation.y = Math.PI
plane.position.y = - 5
plane.position.z = 5
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
scene.add(directionalLight)

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
camera.position.set(4, 1, -4)
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update uniforms
  custUniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()