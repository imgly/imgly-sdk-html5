precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;

uniform vec3 u_color;

void main() {
  vec4 texColor = texture2D(u_image, v_texCoord);

  vec2 textureCoord = v_texCoord - vec2(0.5, 0.5);
  textureCoord /= 0.75;

  float d = 1.0 - dot(textureCoord, textureCoord);
  d = clamp(d, 0.2, 1.0);
  vec3 newColor = texColor.rgb * d * u_color.rgb;
  gl_FragColor = vec4(vec3(newColor) * texColor.a, texColor.a);
}
