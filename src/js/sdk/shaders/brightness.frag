precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_brightness;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  gl_FragColor = vec4((texColor.rgb + vec3(u_brightness) * texColor.a), texColor.a);;
}
