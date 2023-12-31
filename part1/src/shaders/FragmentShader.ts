




/**
 * A shader that uses a texture
 * It also uses a normal map
 * 
 *  */
const fragmentLightingLectureShader =
    `#version 300 es
    precision highp float;
    in vec2 textureCoordOut;
    in vec3 normalOut;
    in vec3 fragOutPosition;
    in vec3 viewDirection;

    uniform float shaderParameter;
    uniform float shininess;
    uniform float Ks;
    uniform float Kd;
    uniform float Ka;
    

    out vec4 color;

    vec4 phongShader(vec3 normal, 
        vec3 surfaceToLightDirection, 
        vec3 viewDirection, 
        vec4 lightColor, 
        vec4 surfaceColor, 
        float Kd, 
        float Ka, 
        float Ks) {
        // phong lighting for light one

        // calculate the diffuse intensity
        float lightIntensity = 1.0;

        // calculate the specular intensity
        // calculate the light reflected vector

        vec3 lightReflection;

        // calculate the cosine of the angle between the light reflection vector and the view direction
        float specularIntensity = 1.0;
       

        // clamp the specular intensity to between 0 and 1
       


        // apply shininess to the specular intensity

        

        // calculate the final specular intensity
        specularIntensity = specularIntensity * Ks;

        // calculate the final diffuse intensity
        lightIntensity = lightIntensity * Kd;

        // calculate the final ambient intensity
        vec4 ambient = lightColor * surfaceColor * Ka;  

        // calculate the final light
        vec4 phongColor = ambient + (lightIntensity * surfaceColor) + (specularIntensity * lightColor);
        return phongColor/(Ka+Kd+Ks);
        
    }

    vec4 blinnPhongShader(vec3 normal,
        vec3 surfaceToLightDirection,
        vec3 viewDirection,
        vec4 lightColor,
        vec4 surfaceColor,
        float Kd,
        float Ka,
        float Ks, float shine) {
        // phong lighting for light one

        // calculate the diffuse intensity
        float lightIntensity = 1.0;
        

        // calculate the specular intensity
        // calculate the halfway vector
        

        // calculate the cosine of the angle between the half vector and the normal
        float specularIntensity = 1.0;

        // raise the specular intensity to the power of the shine
        

        // clamp the specular intensity to between 0 and 1
        

        // calculate the final specular intensity
        specularIntensity = specularIntensity * Ks;

        // calculate the final diffuse intensity
        lightIntensity = lightIntensity * Kd;

        // calculate the final ambient intensity
        vec4 ambient = lightColor * surfaceColor * Ka;

        // calculate the final light
        vec4 blinnColor = ambient + (lightIntensity * surfaceColor) + (specularIntensity * lightColor);
        return blinnColor/(Ka+Kd+Ks);
        
        }



    void main() {


        vec3 phongLightPosition = vec3(5.0, 2.0, 5.0);
        vec3 blinnLightPosition = vec3(-5.0, 2.0, -5.0);
        vec3 phongSurfaceToLightDirection = normalize(phongLightPosition - fragOutPosition);
        vec3 blinnSurfaceToLightDirection = normalize(blinnLightPosition - fragOutPosition);
        

        vec3 normal = normalize(normalOut);
        
        vec4 phongLightColor = vec4(1.0, 1.0, 0.0, 1.0);
        vec4 blinnLightColor = vec4(1.0, 1.0, 0.0, 1.0);


        vec4 surfaceColor = vec4(1.0, 1.0, 1.0, 1.0);


        // phong lighting for light one

        vec4 blinnColor = blinnPhongShader(normal,
            blinnSurfaceToLightDirection,
            viewDirection,
            blinnLightColor,
            surfaceColor, Kd, Ka, Ks, shininess);

        vec4 phongColor = phongShader(normal, 
            phongSurfaceToLightDirection, 
            viewDirection, 
            phongLightColor, 
            surfaceColor, Kd, Ka, Ks);
        
        

        color = (shaderParameter * phongColor + (1.0-shaderParameter)*blinnColor) ;
        

    }
    `;









const fragmentShaderMap = new Map<string, string>();

fragmentShaderMap.set('fragmentLightingLectureShader', fragmentLightingLectureShader)
export default fragmentShaderMap;