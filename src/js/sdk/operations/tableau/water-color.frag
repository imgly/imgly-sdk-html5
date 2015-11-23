varying highp vec2 v_texCoord;
uniform highp float intensity;

precision highp float;

uniform vec2 src_size;

uniform sampler2D u_image;
uniform sampler2D u_filteredImage;

void main(){
  vec4 newFrame = texture2D(u_image, v_texCoord);
  vec4 color = vec4(0., 0., 0., 0.);
  vec2 norm = ( texture2D(u_filteredImage, v_texCoord).rg - vec2(0.5) ) * 2.0;
  float inc = (abs(norm.x) + abs(norm.y)) * 0.5;

  vec2 offset[12];
  float fTotal = 12.0;

  float pi = 3.14159265358979323846;
  float step = (pi*2.0)/fTotal;
  float angle = 0.0;
  for (int i = 0; i < 12; i++) {
     offset[i].x = cos(angle) * src_size.x;
     offset[i].y = sin(angle) * src_size.y;
     angle += step;
  }

  float sources = 0.0;

  for (int i = 0; i < 12; i++) {
      vec4 goingTo = (texture2D( u_filteredImage, v_texCoord + offset[i] ) - vec4(0.5)) * 2.0;

      if (dot( goingTo.xy ,offset[i]) < 0.0/12.0) {
         sources += 1.0;
         color += texture2D(u_image, v_texCoord + offset[i]);
      }
  }

  if (sources > 0.) {
      color = color / sources;
  } else {
    color = newFrame;
  }

  gl_FragColor =  color*(1.0 - inc) + newFrame * inc;
}
