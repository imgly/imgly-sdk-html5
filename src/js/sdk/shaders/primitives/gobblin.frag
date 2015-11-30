precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  texColor.b = texColor.g * 0.33;
  texColor.r = texColor.r * 0.6;
  texColor.b += texColor.r * 0.33;
  texColor.g = texColor.g * 0.7;
  gl_FragColor = texColor;
}
