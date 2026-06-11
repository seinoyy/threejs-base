uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;

#include ../includes/remap.glsl

void main() {
  float progress = aTimeMultiplier * uProgress;
  vec3 custPosition = position;

  // explosion
  float explosionProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
  explosionProgress = clamp(explosionProgress, 0.0, 1.0);
  explosionProgress = 1.0 - pow(1.0 - explosionProgress, 3.0);
  custPosition *= explosionProgress;

  // falling
  float fallProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
  fallProgress = clamp(fallProgress, 0.0, 1.0);
  fallProgress = 1.0 - pow(1.0 - fallProgress, 3.0);
  custPosition.y -= fallProgress * 0.2;

  // scaling
  float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
  float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
  float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
  sizeProgress = clamp(sizeProgress, 0.0, 1.0);

  // twinkling
  float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
  twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
  float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
  sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;

  // final position
  vec4 modelPosition = modelMatrix * vec4(custPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // final size
  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
  gl_PointSize *= 1.0 / -viewPosition.z;

  if(gl_PointSize < 1.0) {
    gl_Position = vec4(9999.9);
  }
}