precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_saturation;

const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  float luminance = dot(texColor.rgb, luminanceWeighting);

  vec3 greyScaleColor = vec3(luminance);

  gl_FragColor = vec4(mix(greyScaleColor, texColor.rgb, u_saturation) * texColor.a, texColor.a);
}
