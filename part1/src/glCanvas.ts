/**
 * This file contains the code that sets up the canvas and WebGL context
 */
import Camera from './Camera';
import ModelGL from './ModelGL';
import PPMFileLoader from './PPMFileLoader';
import fragmentShaderMap from './shaders/FragmentShader'
import vertexShaderMap from './shaders/VertexShader'

import SceneData from './SceneData';


// measure the FPS
let fps = 0;
let lastTime = 0;
let frameNumber = 0;


const sceneData = new SceneData();

// Set up the canvas and WebGL context so that our rendering loop can draw on it
// We store the gl context in the sceneData object so that we can access it later
export const setupCanvas = function () {
    if (!sceneData) {
        return;
    }

    // React is calling this twice, we only want one glContext.
    if (sceneData.glContext !== null) {
        return;
    }

    var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    if (!canvas) {
        alert('Canvas not found');
        return;
    }

    // Get the WebGL context NOte we need WebGL2 for this application
    var gl = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) {
        alert('WebGL not supported');
        return;
    }

    sceneData.width = canvas.width;
    sceneData.height = canvas.height;

    // Store the WebGLRenderingContext on the sceneData object
    sceneData.glContext = gl;

    // Set up the viewport


    // Set the clear color to be purple
    gl.clearColor(1.0, 0.0, 1.0, 1.0);
    // Clear the color buffer with clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

}


export function updateSceneData(model: ModelGL | null, camera: Camera | null): void {

    sceneData.camera = camera;
    sceneData.model = model;
    if (model !== null && camera !== null) {
        renderLoop();
    }
}

function compileProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    if (!sceneData.model) {
        return null;
    }

    if (sceneData.model.renderingProgram !== null) {
        return sceneData.model.renderingProgram;
    }
    if (!sceneData.camera) {
        return null;
    }

    if (!gl) {
        return null;
    }


    const vertexShaderName = "vertexLightingLecture"
    const fragmentShaderName = "fragmentLightingLectureShader";

    console.log("Compiling " + vertexShaderName + " and " + fragmentShaderName);

    // ******************************************************
    // Create the vertex shader program
    // ******************************************************   
    const vertexShaderProgram = gl.createShader(gl.VERTEX_SHADER);

    if (!vertexShaderProgram) {
        throw new Error('Failed to create vertex shader');
    }

    // get the vertex shader source code from the shader map
    const vertexShader = vertexShaderMap.get(vertexShaderName) as string;

    // Now that we have the code let's compile it compile it
    // attach the shader source code to the vertex shader
    gl.shaderSource(vertexShaderProgram, vertexShader);

    // compile the vertex shader
    gl.compileShader(vertexShaderProgram);

    // check if the vertex shader compiled successfully
    const vertexShaderCompiled = gl.getShaderParameter(vertexShaderProgram, gl.COMPILE_STATUS);
    if (!vertexShaderCompiled) {
        console.log(vertexShader)
        console.log('tried to compile ' + vertexShaderName);
        console.log(gl.getShaderInfoLog(vertexShaderProgram));
        console.error('Failed to compile vertex shader');
        return null;
    }

    // ******************************************************
    // create the fragment shader
    // ******************************************************
    const fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShaderObject) {
        throw new Error('Failed to create fragment shader');
    }

    // get the fragment shader source code from the shader map 
    const fragmentShader = fragmentShaderMap.get(fragmentShaderName) as string;

    // attach the shader source code to the fragment shader
    gl.shaderSource(fragmentShaderObject, fragmentShader);

    // compile the fragment shader
    gl.compileShader(fragmentShaderObject);

    // check if the fragment shader compiled successfully
    const fragmentShaderCompiled = gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS);
    if (!fragmentShaderCompiled) {
        console.log(fragmentShader);
        console.log('tried to compile ' + fragmentShaderName);
        console.log(gl.getShaderInfoLog(fragmentShaderObject));
        console.error('Failed to compile fragment shader');
        return null;
    }

    // ******************************************************
    // create a shader program
    // ******************************************************
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) {
        throw new Error('Failed to create shader program');
    }

    // attach the vertex shader to the shader program
    gl.attachShader(shaderProgram, vertexShaderProgram);

    // attach the fragment shader to the shader program
    gl.attachShader(shaderProgram, fragmentShaderObject);

    // link all attached shaders
    gl.linkProgram(shaderProgram);

    // clean up the shaders
    gl.deleteShader(vertexShaderProgram);
    gl.deleteShader(fragmentShaderObject);


    // check if the shader program linked successfully
    const shaderProgramLinked = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
    if (!shaderProgramLinked) {
        console.log(gl.getProgramInfoLog(shaderProgram));
        console.error('Failed to link shader program');
        return null;
    }
    // cache the shader program
    sceneData.model.renderingProgram = shaderProgram;
    return shaderProgram;
}

function setUpTexture(gl: WebGLRenderingContext,
    model: ModelGL,
    shaderProgram: WebGLProgram): WebGLTexture | null {
    if (!gl) {
        return null;
    }



    if (!model) {
        return null;
    }
    return null;

}

function setUpVertexBuffer(gl: WebGLRenderingContext,
    model: ModelGL,
    shaderProgram: WebGLProgram) {
    // create a buffer for Vertex data
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.packedVertexBuffer, gl.STATIC_DRAW);



    // create an index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.vertexIndices, gl.STATIC_DRAW);

    // ******************************************************
    // Now we need to figure out where the input data is going to go
    // ******************************************************

    // get the position attribute location
    const positionLocation = gl.getAttribLocation(shaderProgram, 'position');

    // enable the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // tell the position attribute how to get data out of the position buffer
    // the position attribute is a vec3 (3 values per vertex) and then there are three
    // colors per vertex
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, model.vertexStride, 0);
}


function renderLoop(): void {

    // we might get called early. lets bail out if the information is incomplete.

    if (sceneData === null) {
        return;
    }

    let gl = sceneData.glContext;

    if (!gl) {
        return;
    }

    let model = sceneData.model;
    if (!model) {
        return;
    }

    let camera = sceneData.camera;
    if (!camera) {
        return;
    }

    // ******************************************************
    // Compile the shader program if it has not been compiled yet
    // the compileProgram will store the compiled program in the 
    // current model in sceneData
    // ******************************************************
    const shaderProgram = compileProgram(gl);

    if (!shaderProgram) {
        return;
    }
    // use the shader program
    gl.useProgram(shaderProgram);





    setUpVertexBuffer(gl, model, shaderProgram);





    if (model.vertexShaderName === "vertexTextureNormalFullTransformationShader") {
        // get the normal attribute location
        const normalLocation = gl.getAttribLocation(shaderProgram, 'normal');

        // enable the normal attribute

        gl.enableVertexAttribArray(normalLocation);

        // tell the normal attribute how to get data out of the normal buffer
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, model.vertexStride, model.normalOffset);
    }

    if (model.vertexShaderName === "vertexTextureFullTransformationShader"
        || model.vertexShaderName === "vertexFullTransformationShader" ||
        model.vertexShaderName === "vertexTextureNormalFullTransformationShader") {
        camera.setViewPortWidth(sceneData.width);
        camera.setViewPortHeight(sceneData.height);



        // get the projection matrix location
        const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'projectionMatrix');

        // set the projection matrix
        gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix);

        // get the view matrix location
        const viewMatrixLocation = gl.getUniformLocation(shaderProgram, 'viewMatrix');

        // set the view matrix
        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix);

    }

    gl.getUniformLocation(shaderProgram, 'eyePosition');
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, 'eyePosition'), camera.eyePosition);


    // Set the shaders for the lecture class.
    gl.getUniformLocation(shaderProgram, 'shaderParameter');
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'shaderParameter'), camera.shaderParameter);

    gl.getUniformLocation(shaderProgram, 'shininess');
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'shininess'), camera.shininess);

    gl.getUniformLocation(shaderProgram, 'Ks');
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'Ks'), camera.Ks);

    gl.getUniformLocation(shaderProgram, 'Kd');
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'Kd'), camera.Kd);

    gl.getUniformLocation(shaderProgram, 'Ka');
    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'Ka'), camera.Ka);
    // get the model matrix.
    const modelMatrix = model.getModelMatrix();


    // get the model matrix location
    const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'modelMatrix');

    // set the model matrix
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);


    // ******************************************************
    // Ok we are good to go.   Lets make some graphics
    // ****************************************************** 
    // Clear the whole canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // Clear the canvas to a purple color
    // currently in this code if you leave the clear in there
    // no image is seen.
    let color = (sceneData.frameNumber++ % 255) / 255.0;
    gl.clearColor(color, .2, .6, 0.1);
    //gl.clear(gl.COLOR_BUFFER_BIT);



    if (!sceneData.camera!.usePerspective) {
        // calculate the square that fits in the canvas make that the viewport
        let squareSize = gl.canvas.width;
        if (gl.canvas.width > gl.canvas.height) {
            squareSize = gl.canvas.height;
        }
        // calculate the offset for the square  
        const xOffset = (gl.canvas.width - squareSize) / 2;
        const yOffset = (gl.canvas.height - squareSize) / 2;


        gl.viewport(xOffset, yOffset, squareSize, squareSize);
    } else {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }

    // enable the z-buffer
    gl.enable(gl.DEPTH_TEST);



    // This is really slow but it is good for debugging.
    if (!camera.renderSolid) {
        for (let i = 0; i < model.numTriangles!; i++) {
            const index = i * 3;
            gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, index * 2);
        }
    } else {
        gl.drawElements(gl.TRIANGLES, model.vertexIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    // hack for lecture
    // if (texture !== null) {
    //     gl.deleteTexture(texture);
    // }
    gl.flush();
    gl.finish();


    // ******************************************************
    // Calculate the FPS
    // ******************************************************
    frameNumber++;
    const now = performance.now();

    if (now - lastTime > 1000) {
        fps = frameNumber;
        console.log("FPS: " + fps);
        frameNumber = 0;
        lastTime = now;
    }

    requestAnimationFrame(renderLoop);
}