precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_textImage;
uniform vec2 u_position;
uniform vec2 u_size;

void main() {
  vec4 color0 = texture2D(u_image, v_texCoord);
  vec2 relative = (v_texCoord - u_position) / u_size;

  if (relative.x >= 0.0 && relative.x <= 1.0 &&
    relative.y >= 0.0 && relative.y <= 1.0) {
      vec4 color1 = texture2D(u_textImage, relative);
      // GL_SOURCE_ALPHA, GL_ONE_MINUS_SOURCE_ALPHA
      gl_FragColor = color1 + color0 * (1.0 - color1.a);
  } else {
    gl_FragColor = color0;
  }
}
