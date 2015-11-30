precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_brightness;
uniform float u_saturation;
uniform float u_contrast;
const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);

  vec4 color = texColor;

  // Apply brightness
  color = vec4((color.rgb + vec3(u_brightness) * color.a), color.a);

  // Apply saturation
  float luminance = dot(color.rgb, luminanceWeighting);
  vec3 greyScaleColor = vec3(luminance);
  color = vec4(mix(greyScaleColor, color.rgb, u_saturation) * color.a, color.a);

  // Apply contrast
  color = vec4(((color.rgb - vec3(0.5)) * u_contrast + vec3(0.5) * color.a), color.a);

  gl_FragColor = color;
}
