attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform mat3 u_projMatrix;

void main() {
  gl_Position = vec4((u_projMatrix * vec3(a_position, 1)).xy, 0, 1);
  v_texCoord = a_texCoord;
}
