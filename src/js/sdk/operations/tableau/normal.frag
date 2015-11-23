varying highp vec2 v_texCoord;
uniform sampler2D inputImageTexture;
uniform highp float intensity;
precision highp float;

uniform vec2 src_size;

void main() {
  float xPos = v_texCoord.x;
  float yPos = v_texCoord.y;

  float xOffset = src_size.x;
  float yOffset = src_size.y;

  float center      = texture2D( inputImageTexture, vec2(xPos          , yPos ) ).r;
  float topLeft     = texture2D( inputImageTexture, vec2(xPos - xOffset, yPos - yOffset) ).r;
  float left        = texture2D( inputImageTexture, vec2(xPos - xOffset, yPos)           ).r;
  float bottomLeft  = texture2D( inputImageTexture, vec2(xPos - xOffset, yPos+ yOffset)  ).r;
  float top         = texture2D( inputImageTexture, vec2(xPos          , yPos - yOffset) ).r;
  float bottom      = texture2D( inputImageTexture, vec2(xPos          , yPos + yOffset) ).r;
  float topRight    = texture2D( inputImageTexture, vec2(xPos + xOffset, yPos - yOffset) ).r;
  float right       = texture2D( inputImageTexture, vec2(xPos + xOffset, yPos)           ).r;
  float bottomRight = texture2D( inputImageTexture, vec2(xPos + xOffset, yPos+ yOffset)  ).r;

  float dX = topRight + 2.0 * right + bottomRight - topLeft - 2.0 * left - bottomLeft;
  float dY = bottomLeft + 2.0 * bottom + bottomRight - topLeft - 2.0 * top - topRight;

  vec3 N = normalize( vec3( dX, dY, 0.01) );

  N *= 0.5;
  N += 0.5;

  gl_FragColor.rgb = N;
  gl_FragColor.a = 1.0;
}
