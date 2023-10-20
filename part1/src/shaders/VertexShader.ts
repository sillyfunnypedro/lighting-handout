
/**
 * Vertex shader for the 5310 Graphics course.
 * 
 * This shader applies a full transformation to the vertex position.
 * It also passes the texture coordinate through.
 * It also passes the normal through.
 */
const vertexLightingLecture =
    `#version 300 es
    layout(location=0) in vec3 position;
    layout(location=1) in vec2 textureCoord;

    uniform mat4 modelMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 eyePosition;
    uniform float shaderParameter;


    out vec2 textureCoordOut;
    out vec3 normalOut;
    out vec3 fragOutPosition;
    out vec3 viewDirection;
    
    void main() {
        gl_Position =   projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        
        vec3 surfaceWorldPosition = vec3(modelMatrix * vec4(position, 1.0));

        textureCoordOut = textureCoord;

        // calculate the matrix to transform the normal
        // TODO: 1.0 - add the code to calculate the normal matrix
        normalOut =  vec3(0,1,0);
        vec4 fragOutPosition4 = modelMatrix * vec4(position, 1.0);
        fragOutPosition = vec3(fragOutPosition4);
        viewDirection = normalize(eyePosition - surfaceWorldPosition );
    }
`



const vertexShaderMap = new Map<string, string>();

vertexShaderMap.set('vertexLightingLecture', vertexLightingLecture);

export default vertexShaderMap;