precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  float gray = texColor.r * 0.3 + texColor.g * 0.3 + texColor.b * 0.3;
  gray -= 0.2;
  gray = clamp(gray, 0.0, 1.0);
  gray += 0.15;
  gray *= 1.4;
  gl_FragColor = vec4(vec3(gray) * texColor.a, texColor.a);
}
