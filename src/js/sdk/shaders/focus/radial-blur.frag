/*!
 * Based on evanw's glfx.js tilt shift shader:
 * https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js
 */

precision mediump float;
uniform sampler2D u_image;
uniform float blurRadius;
uniform float gradientRadius;
uniform vec2 position;
uniform vec2 delta;
uniform vec2 texSize;
varying vec2 v_texCoord;

float random(vec3 scale, float seed) {
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    vec4 color = vec4(0.0);
    float total = 0.0;

    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    float radius = smoothstep(0.0, 1.0, abs(distance(v_texCoord * texSize, position)) / (gradientRadius * 2.0)) * blurRadius;
    for (float t = -30.0; t <= 30.0; t++) {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec4 sample = texture2D(u_image, v_texCoord + delta * percent * radius / texSize);

        sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;
    }

    gl_FragColor = color / total;
    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}
