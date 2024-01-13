out vec3 vertexColor;

uniform float amplitude;
uniform float time;
uniform float mu;

void main() {
    vec3 pos = position;
    float x = pos.x;
    float y = pos.y;
    float o = 2400.0;
    // float m = 1000.0;
    float e = 2.71828;
    float pi = 3.14159;

    float a = 1.0 / (o * sqrt(2.0 * pi)); 
    float b = -0.5 * pow((x*x/100.0 + y*y/100.0 - mu)/o, 2.0);
    float c = pow(e, b);

    pos.z = a * c * pow(10.0, 6.0) * 3.0;
    
    float colorCoef = pos.z/1000.0;
    vertexColor = vec3(0.6 * colorCoef + 0.6); 

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}