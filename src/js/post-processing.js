import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/addons/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js'
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js'
import GUI from 'lil-gui'

// 创建gui
const gui = new GUI()

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.material.envMapIntensity = 2.5
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
 * Models
 */
gltfLoader.load(
  '../../static/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
  (gltf) => {
    gltf.scene.scale.set(2, 2, 2)
    gltf.scene.rotation.y = Math.PI * 0.5
    scene.add(gltf.scene)

    updateAllMaterials()
  }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
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

  // Update effect composer
  effectComposer.setSize(sizes.width, sizes.height)
  effectComposer.setPixelRatio(sizes.pixelRatio)
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
renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Post processing
 */
// Render target
const renderTarget = new THREE.WebGLRenderTarget(
  800,
  600,
  {
    samples: renderer.getPixelRatio() === 1 ? 2 : 0
  }
)

// Effect composer
const effectComposer = new EffectComposer(renderer)
effectComposer.setPixelRatio(sizes.pixelRatio)
effectComposer.setSize(sizes.width, sizes.height)

// Render pass
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// Dot screen pass
const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

// Glitch pass
const glitchPass = new GlitchPass()
glitchPass.goWild = false
glitchPass.enabled = false
effectComposer.addPass(glitchPass)

// RGB Shift pass
const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

// Unreal bloom pass
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.3
unrealBloomPass.radius = 1
unrealBloomPass.threshold = 0.6
effectComposer.addPass(unrealBloomPass)

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)

// Tint pass
const tintShader = {
  uniforms: {
    tDiffuse: new THREE.Uniform(null),
    uTint: new THREE.Uniform(new THREE.Vector3())
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      gl_Position = projectionMatrix * modelViewMatrix *  vec4(position, 1.0);

      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;

    varying vec2 vUv;

    void main() {
      vec4 color = texture(tDiffuse, vUv);
      color.rgb += uTint;
      gl_FragColor = color;
    }
  `
}
const tintPass = new ShaderPass(tintShader)
effectComposer.addPass(tintPass)

gui.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red')
gui.add(tintPass.material.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('green')
gui.add(tintPass.material.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('blue')

// Displacement pass
const displacementShader = {
  uniforms: {
    tDiffuse: new THREE.Uniform(null),
    uNormalMap: new THREE.Uniform(textureLoader.load('../../static/textures/interfaceNormalMap.png'))
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      gl_Position = modelMatrix * viewMatrix * projectionMatrix *  vec4(position, 1.0);

      vUv = uv;
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;

    varying vec2 vUv;

    void main() {
      vec3 normalColor = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;

      vec2 newUv = vUv + normalColor.rg * 0.1;
      vec4 color = texture(tDiffuse, newUv);

      vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
      float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
      color += lightness * 2.0;

      gl_FragColor = color;
    }
  `
}
const displacementPass = new ShaderPass(displacementShader)
effectComposer.addPass(displacementPass)

// Gamma correction pass
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
effectComposer.addPass(gammaCorrectionPass)

// SMAA pass
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass()
  effectComposer.addPass(smaaPass)
}

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update controls
  controls.update()

  // Render
  // renderer.render(scene, camera)
  effectComposer.render()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
