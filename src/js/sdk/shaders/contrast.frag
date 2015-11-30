precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_contrast;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  gl_FragColor = vec4(((texColor.rgb - vec3(0.5)) * u_contrast + vec3(0.5) * texColor.a), texColor.a);
}
