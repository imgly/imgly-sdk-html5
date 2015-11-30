precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
uniform bool u_flipVertical;
uniform bool u_flipHorizontal;

void main() {
  vec2 texCoord = vec2(v_texCoord);
  if (u_flipVertical) {
    texCoord.y = 1.0 - texCoord.y;
  }
  if (u_flipHorizontal) {
    texCoord.x = 1.0 - texCoord.x;
  }
  gl_FragColor = texture2D(u_image, texCoord);
}
