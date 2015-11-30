precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
vec3 W = vec3(0.2125, 0.7154, 0.0721);

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);
  float luminance = dot(texColor.rgb, W);
  gl_FragColor = vec4(vec3(luminance) * texColor.a, texColor.a);
}
