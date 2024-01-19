out vec3 vertexColor;

varying vec2 v_uv;

#define MAX_ARR_LENGTH 128
uniform float time;

uniform int arr_length;
uniform float mu[MAX_ARR_LENGTH];

uniform float imageRatio;
uniform float planeRatio;

void main() {
    vec3 pos = position;
    float x = pos.x;
    float y = pos.y;
    float o = 1800.0;
    // float m = 1000.0;
    float e = 2.71828;
    float pi = 3.14159;
    
    float sum = 0.0;

    // for (int i = 0; i < arr_length; i++){
    //     float a = 1.0 / (o * sqrt(2.0 * pi)); 
    //     float b = -0.5 * pow((x*x/100.0 + y*y/100.0 - mu[i])/o, 2.0);
    //     float c = pow(e, b);
    //     sum = sum + a * c * pow(10.0, 5.0) * 5.0;
    // }

    // float w = sin((x + time)/300.0)*100.0;

    // pos.z = sum;
    // float colorCoef = pos.z/500.0;
    // // pos.z = pos.z + w;
    
    // vertexColor = vec3(0.0 + 6.0 * colorCoef, 0.0 + 6.0 * colorCoef, min(1.0, 10.0 * colorCoef + 0.0)); 

    // RATIO
    if (imageRatio < planeRatio){
        v_uv = vec2(uv.x, uv.y / planeRatio * imageRatio + (1.0 - imageRatio / planeRatio) / 2.0 );
    } else {
        v_uv = vec2(uv.x / imageRatio * planeRatio + (1.0 - planeRatio / imageRatio) / 2.0, uv.y);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}