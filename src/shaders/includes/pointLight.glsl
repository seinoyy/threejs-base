vec3 pointLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay) {
  vec3 lightDelta = lightPosition - position;
  float lightDistance = length(lightDelta);
  vec3 lightDirection = normalize(lightDelta);
  vec3 planeNormal = normalize(normal);
  vec3 lightReflection = reflect(-lightDirection, normal);

    // shading
  float shading = dot(planeNormal, lightDirection);
  shading = max(shading, 0.0);

    // specular
  float specular = -dot(lightReflection, viewDirection);
  specular = max(specular, 0.0);
  specular = pow(specular, specularPower);

    // decay
  float decay = 1.0 - lightDistance * lightDecay;
  decay = max(decay, 0.0);

  return lightColor * lightIntensity * decay * (shading + specular);
}