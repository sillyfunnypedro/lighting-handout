

/**
 * A basic constant color fragment shader
 * */
const fragmentShader =
    `#version 300 es
    precision mediump float;
    out vec4 color;
    void main() {
        color = vec4(1.0, 0.0, 0.1, 1);
    }
    `;




/**
 * A shader that uses a texture
 * 
 */
const fragmentTextureShader =
    `#version 300 es
    precision mediump float;
    in vec2 textureCoordOut;
    uniform sampler2D textureSampler;
    out vec4 color;

    void main() {
        vec2 textureCoord = vec2(textureCoordOut.x, 1.0 - textureCoordOut.y);
        color = texture(textureSampler, textureCoord);
    }
    `;

/**
 * A shader that uses a texture
 * It also uses a normal map
 * 
 *  */
const fragmentTextureNormalShader =
    `#version 300 es
    precision highp float;
    in vec2 textureCoordOut;
    in vec3 normalOut;
    in vec3 fragOutPosition;
    in vec3 surfaceToLight;
    uniform sampler2D textureSampler;

    out vec4 color;

    void main() {
        vec3 normal = normalize(normalOut);
        vec3 lightDirection = normalize(vec3(1.0,1.0, 1.0));
        vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);

        vec3 surfaceToLightDirection = normalize(surfaceToLight);

        float light = dot(normal, surfaceToLightDirection);
        light = clamp(light, 0.0, 1.0);
        light = pow(light, 50.0);

        float ambientIntensity = 0.5;
        float lightIntensity = dot(normal, lightDirection);
 
        vec3 eyePosition = vec3(0, 0, 1);
        vec3 viewDirection = fragOutPosition - eyePosition;
        vec3 halfVector = normalize(lightDirection + viewDirection);
        float specularIntensity = dot(normal, halfVector);
        float shininess = 10.0;
        float specular = pow(specularIntensity, shininess);
        specular = clamp(specular, 0.0, 1.0);
        lightIntensity = clamp(lightIntensity, 0.0, 1.0);
    
        // clamp the light intensity to between 0 and 1
        lightIntensity = clamp(lightIntensity, 0.0, 1.0-ambientIntensity);

        // clamp the light intensity to between 0 and 1

        
        // scale the light color to the light intensity
        lightColor = lightColor * lightIntensity + vec4(ambientIntensity, ambientIntensity, ambientIntensity, 1.0);


        lightIntensity = clamp(lightIntensity, 0.0, 1.0);
        vec2 textureCoord = vec2(textureCoordOut.x, 1.0 - textureCoordOut.y);
        vec4 textureColor = texture(textureSampler, textureCoord);

        // multiply the color by the light intensity (after you get the texture value)

        color = vec4(textureColor.rgb*light, 1.0);
        //color = vec4((sin(fragOutPosition.x) + 1.0) * 0.5, abs(fragOutPosition.y),abs(fragOutPosition.z),0.0) ;


    }
    `;











const fragmentShaderMap = new Map<string, string>();
fragmentShaderMap.set('fragmentShader', fragmentShader);
fragmentShaderMap.set('fragmentTextureShader', fragmentTextureShader);
fragmentShaderMap.set('fragmentTextureNormalShader', fragmentTextureNormalShader);
export default fragmentShaderMap;