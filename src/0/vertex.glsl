out vec3 vertexColor;

uniform float amplitude;
uniform float time;

void main() {
    vec3 pos = position;

    float coef = sin((time + pos.x / 1.5) / 10.0);
    float coef2 = coef/7.5 + 0.8;

    pos.z = amplitude * coef * 7.5;

    vertexColor = vec3(coef2, coef2, coef2); 

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}