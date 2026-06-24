uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallWavesIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation(vec3 position) {
  float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
    sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
    uBigWavesElevation;

  for(float i = 1.0; i <= uSmallWavesIterations; i++) {
    elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
  }

  return elevation;
}

void main() {
  // base position
  float shift = 0.01;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
  vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

  float elevation = waveElevation(modelPosition.xyz);
  modelPosition.y += elevation;
  modelPositionA.y += waveElevation(modelPositionA.xyz);
  modelPositionB.y += waveElevation(modelPositionB.xyz);

  // compute normal
  vec3 toA = normalize(modelPositionA - modelPosition.xyz);
  vec3 toB = normalize(modelPositionB - modelPosition.xyz);
  vec3 computeNormal = cross(toA, toB);

  // final position
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // varying
  vElevation = elevation;
  vNormal = computeNormal;
  vPosition = modelPosition.xyz;
}