import * as THREE from 'three'
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import Debug from './Utils/Debug.js'
import sources from './sources.js'

let instance = null

export default class Experience {
  constructor(canvas) {
    if (instance) {
      return instance
    }

    instance = this
    window.experience = this
    // 设置画布
    this.canvas = canvas
    // 创建调试类
    this.debug = new Debug()
    // 实例化尺寸类
    this.sizes = new Sizes()
    // 实例化时间类
    this.time = new Time()
    // 创建场景
    this.scene = new THREE.Scene()
    // 创建资源类
    this.resources = new Resources(sources)
    // 创建相机类
    this.camera = new Camera()
    // 创建渲染器类
    this.renderer = new Renderer()
    // 创建世界类 
    this.world = new World()

    this.sizes.on("resize", () => {
      this.resize()
    })

    this.time.on("tick", () => {
      this.update()
    })
  }

  resize () {
    this.camera.resize()
    this.renderer.resize()
  }
  update () {
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }

  destroy () {
    this.sizes.off("resize")
    this.time.off("tick")
    // 移除所有事件监听
    this.scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose()

        for (const key in child.material) {
          const value = child.material[key]

          if (value && typeof value.dispose === "function") {
            value.dispose()
          }
        }
      }
    })

    this.camera.controls.dispose()
    this.renderer.instance.dispose()

    if (this.debug.active) {
      this.debug.ui.destroy()
    }
  }
}