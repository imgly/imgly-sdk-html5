varying highp vec2 v_texCoord;
uniform highp float intensity;

precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_brushImage;

void main(void)
{
   vec4 brushColor = texture2D(u_brushImage, v_texCoord * 0.9 - (0.9 / 2.0) + 0.5);
   vec2 newCoords = texture2D(u_brushImage, v_texCoord).xy - 0.5;
   newCoords *= 64.0;
   newCoords += 0.5;
   vec2 coords = mix(v_texCoord, newCoords, intensity);

   gl_FragColor = texture2D(u_image, coords);
}
