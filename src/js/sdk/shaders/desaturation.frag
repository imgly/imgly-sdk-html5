precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_desaturation;

const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  vec3 grayXfer = vec3(0.3, 0.59, 0.11);
  vec3 gray = vec3(dot(grayXfer, texColor.xyz));
  gl_FragColor = vec4(mix(texColor.xyz, gray, u_desaturation) * texColor.a, texColor.a);
}
