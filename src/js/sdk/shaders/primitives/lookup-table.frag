precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_lookupTable;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  float r = texture2D(u_lookupTable, vec2(texColor.r, 0.0)).r;
  float g = texture2D(u_lookupTable, vec2(texColor.g, 0.0)).g;
  float b = texture2D(u_lookupTable, vec2(texColor.b, 0.0)).b;

  gl_FragColor = vec4(vec3(r, g, b) * texColor.a, texColor.a);
}
