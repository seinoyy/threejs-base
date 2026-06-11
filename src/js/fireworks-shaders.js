import '../css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Sky } from 'three/addons/objects/Sky.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import fireworkVertexShader from '@/shaders/firework/vertex.glsl'
import fireworkFragmentShader from '@/shaders/firework/fragment.glsl'

// 创建gui
const gui = new GUI({ width: 340 })

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl")

// 创建场景
const scene = new THREE.Scene()

// 创建加载器
const textureLoader = new THREE.TextureLoader()

// 三维空间大小
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
  sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

// 创建相机
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
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
 * 烟花
 */
const textures = [
  textureLoader.load('../../static/particles/1.png'),
  textureLoader.load('../../static/particles/2.png'),
  textureLoader.load('../../static/particles/4.png'),
  textureLoader.load('../../static/particles/5.png'),
  textureLoader.load('../../static/particles/8.png'),
  textureLoader.load('../../static/particles/9.png'),
  textureLoader.load('../../static/particles/10.png'),
  textureLoader.load('../../static/particles/11.png')
]

/**
 * 创建烟花
 * @param {*数量} count 
 * @param {*位置} position 
 * @param {*大小} size 
 * @param {*纹理} texture 
 * @param {*半径} radius 
 * @param {*颜色} color 
 */
const createFireworks = (count, position, size, texture, radius, color) => {
  // geometry
  const positionArray = new Float32Array(count * 3)
  const sizeArray = new Float32Array(count)
  const timeMultipliersArray = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    )
    const positionRandom = new THREE.Vector3()
    positionRandom.setFromSpherical(spherical)

    positionArray[i3] = positionRandom.x
    positionArray[i3 + 1] = positionRandom.y
    positionArray[i3 + 2] = positionRandom.z

    sizeArray[i] = Math.random()

    timeMultipliersArray[i] = 1 + Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1))
  geometry.setAttribute('aTimeMultiplier', new THREE.BufferAttribute(timeMultipliersArray, 1))

  // material
  texture.flipY = false
  const material = new THREE.ShaderMaterial({
    vertexShader: fireworkVertexShader,
    fragmentShader: fireworkFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0)
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  // points
  const firework = new THREE.Points(geometry, material)
  firework.position.copy(position)
  scene.add(firework)

  // destroy
  const destroy = () => {
    scene.remove(firework)
    geometry.dispose()
    material.dispose()
  }

  // animate
  gsap.to(
    material.uniforms.uProgress,
    {
      value: 1,
      duration: 3,
      ease: 'linear',
      onComplete: destroy
    }
  )
}

const createRandomFireworks = () => {
  const count = Math.round(400 + Math.random() * 1000)
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    Math.random(),
    (Math.random() - 0.5) * 2
  )
  const size = 0.1 + Math.random() * 0.1
  const texture = textures[Math.floor(Math.random() * textures.length)]
  const radius = 0.5 + Math.random()
  const color = new THREE.Color()
  color.setHSL(Math.random(), 1, 0.7)
  createFireworks(count, position, size, texture, radius, color)
}

createRandomFireworks()

window.addEventListener('click', createRandomFireworks)

// 创建天空
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();

/// GUI

const skyParameters = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.95,
  elevation: -2.2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5,
  showSunDisc: true
};

const updateSky = () => {
  const uniforms = sky.material.uniforms;
  uniforms['turbidity'].value = skyParameters.turbidity;
  uniforms['rayleigh'].value = skyParameters.rayleigh;
  uniforms['mieCoefficient'].value = skyParameters.mieCoefficient;
  uniforms['mieDirectionalG'].value = skyParameters.mieDirectionalG;
  uniforms['cloudCoverage'].value = skyParameters.cloudCoverage;
  uniforms['cloudDensity'].value = skyParameters.cloudDensity;
  uniforms['cloudElevation'].value = skyParameters.cloudElevation;
  uniforms['showSunDisc'].value = skyParameters.showSunDisc;

  const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation);
  const theta = THREE.MathUtils.degToRad(skyParameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms['sunPosition'].value.copy(sun);

  renderer.toneMappingExposure = skyParameters.exposure;
}

gui.add(skyParameters, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSky);
gui.add(skyParameters, 'rayleigh', 0.0, 4, 0.001).onChange(updateSky);
gui.add(skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSky);
gui.add(skyParameters, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSky);
gui.add(skyParameters, 'elevation', -3, 90, 0.01).onChange(updateSky);
gui.add(skyParameters, 'azimuth', - 180, 180, 0.1).onChange(updateSky);
gui.add(skyParameters, 'exposure', 0, 1, 0.0001).onChange(updateSky);
gui.add(skyParameters, 'showSunDisc').onChange(updateSky);

const folderClouds = gui.addFolder('Clouds');
folderClouds.add(skyParameters, 'cloudCoverage', 0, 1, 0.01).name('coverage').onChange(updateSky);
folderClouds.add(skyParameters, 'cloudDensity', 0, 1, 0.01).name('density').onChange(updateSky);
folderClouds.add(skyParameters, 'cloudElevation', 0, 1, 0.01).name('elevation').onChange(updateSky);

updateSky();

// 动画
const timer = new THREE.Timer()

const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  const deltaTime = timer.getDelta()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()