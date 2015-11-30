precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_filteredImage;
uniform float u_intensity;

void main() {
  vec4 color0 = texture2D(u_image, v_texCoord);
  vec4 color1 = texture2D(u_filteredImage, v_texCoord);
  gl_FragColor = mix(color0, color1, u_intensity);
}
