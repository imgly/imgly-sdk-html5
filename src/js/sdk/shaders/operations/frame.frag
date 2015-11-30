precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform sampler2D u_frameImage;
uniform vec4 u_color;
uniform vec2 u_thickness;

void main() {
  vec4 fragColor = texture2D(u_image, v_texCoord);
  if (v_texCoord.x < u_thickness.x || v_texCoord.x > 1.0 - u_thickness.x ||
    v_texCoord.y < u_thickness.y || v_texCoord.y > 1.0 - u_thickness.y) {
      fragColor = mix(fragColor, u_color, u_color.a);
    }

  gl_FragColor = fragColor;
}
