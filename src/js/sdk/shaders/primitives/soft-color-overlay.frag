precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform vec3 u_overlay;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  vec4 overlayVec4 = vec4(u_overlay, texColor.a);
  gl_FragColor = max(overlayVec4 * texColor.a, texColor);
}
