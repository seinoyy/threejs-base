import * as THREE from 'three'
import EventEmitter from './EventEmitter'

export default class Time extends EventEmitter {
  constructor() {
    super()

    this._timer = new THREE.Timer()
    this.elapsed = 0
    this.delta = 0

    this.tick()
  }

  tick () {
    this._timer.update()
    this.elapsed = this._timer.getElapsed()
    this.delta = this._timer.getDelta()
    this.trigger('tick')
    window.requestAnimationFrame(() => this.tick())
  }
}