varying highp vec2 v_texCoord;
uniform sampler2D inputImageTexture;
uniform sampler2D artTexture;
uniform highp float intensity;
precision highp float;

void main() {
  vec4 texel = texture2D( inputImageTexture, v_texCoord );
  float luminance = dot( vec3 (0.2125, 0.7154, 0.0721), vec3(texel));
  float blend = 0.0;
  if (luminance > (1.0 - intensity)) {
    blend = 1.0;
  }
  vec4 color = vec4(0);
  vec4 artColor = texture2D( artTexture, v_texCoord );
  if(blend < 0.5) {
    color = 1.0 - 2.0 * (1.0 - artColor) * (1.0 - blend);
  } else {
    color = 2.0 * blend * artColor;
  }
  gl_FragColor = color * 0.6 + 0.4 * artColor;
}
