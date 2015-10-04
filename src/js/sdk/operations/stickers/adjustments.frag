precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
float u_brightness = 0.0;

float u_saturation = 1.0;
const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

float u_contrast = 1.0;

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
