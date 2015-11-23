varying highp vec2 v_texCoord;
uniform sampler2D inputImageTexture;
precision highp float;

void main() {
  vec4 texel = texture2D( inputImageTexture, v_texCoord );
  float luminance = dot( vec3 (0.2125, 0.7154, 0.0721), vec3(texel));
  gl_FragColor = vec4(luminance, luminance, luminance, texel.a);
}
