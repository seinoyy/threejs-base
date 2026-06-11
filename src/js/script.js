import '../css/style.css'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import gsap from "gsap";
import GUI from "lil-gui";

// 创建gui
const gui = new GUI({
  width: 300,
  title: 'Nice debug UI',
  closeFolders: false
});
gui.hide();
window.addEventListener('keydown', (event) => {
  if (event.key === 'h') {
    gui.show(gui._hidden);
  }
});
const debugObject = {};

// 获取canvas标签
const canvas = document.querySelector("canvas.webgl");
// Object3D
// // 创建组
// const group = new THREE.Group();
// group.position.y = 1;
// group.scale.y = 2;
// group.rotation.y = 1;
// // 组添加到场景中
// scene.add(group);
// // 创建网格模型
// const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
// // 网格添加到组里
// group.add(cube1);
// const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
// cube2.position.x = -2;
// group.add(cube2);
// const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
// cube3.position.x = 2;
// group.add(cube3);
// 创建场景
const scene = new THREE.Scene();
// 创建模型
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
// const geometry = new THREE.BufferGeometry();
// const count = 50;
// const positionsArray = new Float32Array(count * 3 * 3);
// for (let i = 0; i < count * 3 * 3; i++) {
//   positionsArray[i] = (Math.random() - 0.5) * 4
// }
// const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
// geometry.setAttribute('position', positionsAttribute);
// 创建纹理
const loadingManager = new THREE.LoadingManager();
// loadingManager.onStart = () => {
//   console.log('loading onStart');
// }
// loadingManager.onLoad = () => {
//   console.log('loading onLoad');
// }
// loadingManager.onProgress = () => {
//   console.log('loading onProgress');
// }
// loadingManager.onError = () => {
//   console.log('loading onError');
// }
const textureLoader = new THREE.TextureLoader(loadingManager);
const doorColorTexture = textureLoader.load('../static/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('../static/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('../static/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('../static/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('../static/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('../static/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('../static/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('../static/textures/matcaps/3.png');
const gradientTexture = textureLoader.load('../static/textures/gradients/5.jpg');
doorColorTexture.colorSpace = THREE.SRGBColorSpace;
matcapTexture.colorSpace = THREE.SRGBColorSpace;
const backShadow = textureLoader.load('../static/textures/bakedShadow.jpg');
const simpleShadow = textureLoader.load('../static/textures/simpleShadow.jpg');
// // 创建字体
// const fontLoader = new FontLoader();
// fontLoader.load('../static/fonts/helvetiker_regular.typeface.json', (font) => {
//   const textGeometry = new TextGeometry('Hello Three.js', {
//     font: font,
//     size: 0.5,
//     depth: 0.2,
//     curveSegments: 6,
//     bevelEnabled: true,
//     bevelThickness: 0.03,
//     bevelSize: 0.02,
//     bevelOffset: 0,
//     bevelSegments: 3
//   });
//   // textGeometry.computeBoundingBox();
//   // textGeometry.translate(
//   //   (0.02 - textGeometry.boundingBox.max.x) * 0.5,
//   //   (0.02 - textGeometry.boundingBox.max.y) * 0.5,
//   //   (0.03 - textGeometry.boundingBox.max.z) * 0.5
//   // );
//   textGeometry.center();

//   const material = new THREE.MeshMatcapMaterial();
//   material.matcap = matcapTexture;
//   const text = new THREE.Mesh(textGeometry, material);
//   scene.add(text);

//   console.time('donuts');
//   const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

//   for (let i = 0; i < 100; i++) {
//     const donut = new THREE.Mesh(donutGeometry, material);

//     donut.position.x = (Math.random() - 0.5) * 10;
//     donut.position.y = (Math.random() - 0.5) * 10;
//     donut.position.z = (Math.random() - 0.5) * 10;

//     donut.rotation.x = Math.random() * Math.PI;
//     donut.rotation.y = Math.random() * Math.PI;

//     const scale = Math.random();
//     donut.scale.set(scale, scale, scale);
//     scene.add(donut);
//   }

//   console.timeEnd('donuts');
// })
// 创建材质
debugObject.color = '#3a6ea6';
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;
// material.map = doorColorTexture;
// material.transparent = true;
// material.opacity = 0.5;
// material.alphaMap = doorAlphaTexture;
// // NormalMaterial
// const material = new THREE.MeshNormalMaterial();
// // MatcapMaterial
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;
// // DepthMaterial
// const material = new THREE.MeshDepthMaterial();
// // LambertMaterial
// const material = new THREE.MeshLambertMaterial();
// // PhongMaterial
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 100;
// material.specular = new THREE.Color(0x1188ff);
// // ToonMaterial
// const material = new THREE.MeshToonMaterial();
// gradientTexture.magFilter = THREE.NearestFilter;
// gradientTexture.minFilter = THREE.NearestFilter;
// gradientTexture.generateMipmaps = false;
// material.gradientMap = gradientTexture;
// //StandardMaterial
// const material = new THREE.MeshStandardMaterial();
// material.metalness = 1;
// material.roughness = 1;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(0.5, 0.5);
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;

// gui.add(material, 'metalness').min(0).max(1).step(0.0001);
// gui.add(material, 'roughness').min(0).max(1).step(0.0001);
// // PhysicalMaterial
// const material = new THREE.MeshPhysicalMaterial();;
// material.metalness = 1;
// material.roughness = 1;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(0.5, 0.5);
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;

// gui.add(material, 'metalness').min(0).max(1).step(0.0001);
// gui.add(material, 'roughness').min(0).max(1).step(0.0001);

// // clearcoat
// material.clearcoat = 1;
// material.clearcoatRoughness = 0;

// gui.add(material, 'clearcoat').min(0).max(1).step(0.0001);
// gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.0001);
// // sheen
// material.sheen = 1;
// material.sheenRoughness = 0.25;
// material.sheenColor.set(1, 1, 1)

// gui.add(material, 'sheen').min(0).max(1).step(0.0001);
// gui.add(material, 'sheenRoughness').min(0).max(1).step(0.0001);
// gui.addColor(material, 'sheenColor')

// // iridescence
// material.iridescence = 1;
// material.iridescenceIOR = 1;
// material.iridescenceThicknessRange = [100, 800];

// gui.add(material, 'iridescence').min(0).max(1).step(0.0001);
// gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.0001);
// gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1);
// gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1);

// // transmission
// material.transmission = 1;
// material.ior = 1.5;
// material.thickness = 0.5;

// gui.add(material, 'transmission').min(0).max(1).step(0.0001);
// gui.add(material, 'ior').min(1).max(10).step(0.0001);
// gui.add(material, 'thickness').min(0).max(1).step(0.0001);

// // 创建网格模型
// const cube = new THREE.Mesh(geometry, material);
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  material
)
sphere.castShadow = true
// sphere.position.x = -1.5;
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(0.75, 0.75, 0.75),
  material
);
const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
)
torus.position.x = 1.5;
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5),
  material
)
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;

plane.receiveShadow = true;

scene.add(sphere, plane);

// const sphereShadow = new THREE.Mesh(
//   new THREE.PlaneGeometry(1.5, 1.5),
//   new THREE.MeshBasicMaterial({
//     color: 0x000000,
//     transparent: true,
//     alphaMap: simpleShadow
//   })
// )
// sphereShadow.rotation.x = -Math.PI * 0.5;
// sphereShadow.position.y = plane.position.y + 0.01;
// scene.add(sphereShadow);

// 网格模型添加到场景中
// scene.add(cube);
// cube.position.set(0.7, -0.6, 1)
// cube.scale.set(2, 0.5, 0.5)
// cube.rotation.reorder('YXZ')
// cube.rotation.y = Math.PI * 0.25
// cube.rotation.x = Math.PI * 0.25
// 创建辅助坐标轴
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);
const cubeTweaks = gui.addFolder('Awesome cube')
cubeTweaks.close()
cubeTweaks
  .add(cube.position, 'y')
  .min(-3).max(3)
  .step(0.01)
  .name('cubePositionY');
cubeTweaks.add(cube, 'visible')
cubeTweaks.add(cube.material, 'wireframe')
cubeTweaks.addColor(debugObject, 'color').name('cubeColor').onChange(() => {
  cube.material.color.set(debugObject.color)
})
debugObject.spin = () => {
  gsap.to(cube.rotation, { y: cube.rotation.y + 2 * Math.PI })
};
cubeTweaks.add(debugObject, 'spin')
debugObject.subdivisions = 2;
cubeTweaks
  .add(debugObject, 'subdivisions')
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(() => {
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(
      1, 1, 1,
      debugObject.subdivisions, debugObject.subdivisions, debugObject.subdivisions
    );
  })
// 创建光源
// 环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01);
// // 平行光
// const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
// directionalLight.position.set(1, 0.25, 0);
// scene.add(directionalLight);
// // 半球光
// const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
// scene.add(hemisphereLight);
// // 点光源
// const pointLight = new THREE.PointLight(0xff9000, 0.5, 3);
// pointLight.position.set(1, -0.5, 1);
// scene.add(pointLight);
// // 矩形区域光
// const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
// rectAreaLight.position.set(-1.5, 0, 1.5);
// rectAreaLight.lookAt(new THREE.Vector3());
// scene.add(rectAreaLight);
// // 聚光灯
// const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
// spotLight.position.set(0, 2, 3);
// scene.add(spotLight);
// spotLight.target.position.x = -0.75;
// scene.add(spotLight.target);

// // 光源辅助对象
// const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
// scene.add(hemisphereLightHelper);
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
// scene.add(directionalLightHelper);
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
// scene.add(pointLightHelper);
// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);
// const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
// scene.add(rectAreaLightHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001);
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001);
scene.add(directionalLight);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.radius = 10;

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

// const spotLight = new THREE.SpotLight(0xffffff, 0.6, 10, Math.PI * 0.3);

// spotLight.castShadow = true;
// spotLight.shadow.mapSize.width = 1024;
// spotLight.shadow.mapSize.height = 1024;
// spotLight.shadow.camera.fov = 30;
// spotLight.shadow.camera.near = 1;
// spotLight.shadow.camera.far = 6;

// spotLight.position.set(0, 2, 2);
// scene.add(spotLight);
// scene.add(spotLight.target);

// const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
// spotLightCameraHelper.visible = false;
// scene.add(spotLightCameraHelper);

// const pointLight = new THREE.PointLight(0xffffff, 1);

// pointLight.castShadow = true;
// pointLight.shadow.mapSize.width = 1024;
// pointLight.shadow.mapSize.height = 1024;
// pointLight.shadow.camera.near = 0.1;
// pointLight.shadow.camera.far = 5;

// pointLight.position.set(-1, 1, 0);
// scene.add(pointLight);

// const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
// pointLightCameraHelper.visible = false;
// scene.add(pointLightCameraHelper);

// 创建环境贴图
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load('../static/textures/environmentMap/2k.hdr', (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = environmentMap;
//   scene.environment = environmentMap;
// })
// 三维空间大小
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener("dblclick", () => {
  const fullscreen = document.fullscreenElement || document.webkitFullscreenElement;
  if (!fullscreen) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
})
// 创建相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
// const camera = new THREE.OrthographicCamera(
//   -1 * aspectRatio,
//   1 * aspectRatio,
//   1,
//   -1,
//   0.1,
//   100
// );
camera.position.x = 2;
camera.position.y = 2;
camera.position.z = 3;
// camera.lookAt(cube.position);
// 相机添加到场景中
scene.add(camera);
// 创建控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFShadowMap;

// gsap.to(cube.position, {
//   duration: 1,
//   delay: 1,
//   x: 2
// })
// gsap.to(cube.position, {
//   duration: 1,
//   delay: 2,
//   x: 0
// })
// 创建时钟
const timer = new THREE.Timer()
// 动画
const tick = () => {
  timer.update()
  const elapsedTime = timer.getElapsed()
  // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
  // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
  // camera.position.y = cursor.y * 5;
  // camera.lookAt(cube.position);

  // sphere.position.x = Math.cos(elapsedTime) * 1.5;
  // sphere.position.z = Math.sin(elapsedTime) * 1.5;
  // sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

  // sphereShadow.position.x = sphere.position.x;
  // sphereShadow.position.z = sphere.position.z;
  // sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3;

  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = -0.15 * elapsedTime;
  cube.rotation.x = -0.15 * elapsedTime;
  torus.rotation.x = -0.15 * elapsedTime;
  // 更新控制器
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();