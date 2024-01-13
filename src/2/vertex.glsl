out vec3 vertexColor;

#define MAX_ARR_LENGTH 128
// uniform float mu;

uniform int arr_length;
uniform float mu[MAX_ARR_LENGTH];

void main() {
    vec3 pos = position;
    float x = pos.x;
    float y = pos.y;
    float o = 1300.0;
    // float m = 1000.0;
    float e = 2.71828;
    float pi = 3.14159;
    
    float sum = 0.0;

    for (int i = 0; i < arr_length; i++){
        float a = 1.0 / (o * sqrt(2.0 * pi)); 
        float b = -0.5 * pow((x*x/100.0 + y*y/100.0 - mu[i])/o, 2.0);
        float c = pow(e, b);
        sum = sum + a * c * pow(10.0, 5.0) * 2.0;
    }

    pos.z = sum;

    // pos.z = pos.z + a * c * pow(10.0, 5.0) * 2.0;
    
    float colorCoef = pos.z/1000.0;
    vertexColor = vec3(0.6 * colorCoef + 0.6); 

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}