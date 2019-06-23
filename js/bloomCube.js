let finalVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

let finalFragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 vUv;
vec4 getTexture( sampler2D texture ) {
    return mapTexelToLinear( texture2D( texture , vUv ) );
}
void main() {
    gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );
}
`;

let vertexShader2 = `
uniform float time;
varying vec3 vUv; 
varying vec3 vNormal;
varying vec3 modelViewPosition;
void main() {
    vUv = position; 
    vNormal           = normalMatrix * normal;
    vec4 viewPos      = modelViewMatrix * vec4(position, 1.0);
    modelViewPosition = viewPos.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

// import customFragmentShader from './shaders/fragmentShader1.glsl';
let fragmentShader1 = `
struct PointLight {
    vec3 color;
    vec3 position;
    float distance; 
};  
uniform float time;
uniform PointLight pointLights[NUM_POINT_LIGHTS];
uniform vec3 colorA; 
uniform vec3 colorB; 
varying vec3 vUv;     
varying vec3 vNormal;
varying vec3 modelViewPosition;
void main() {
    vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);
    for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 lightDirection = normalize(pointLights[l].position - modelViewPosition.xyz);
        addedLights.rgb += max(dot(lightDirection, vNormal), 0.0) * pointLights[l].color
           * 1.0; //'light intensity' 
           vec3 R = reflect(-lightDirection, vNormal);
        vec3 V = normalize(-modelViewPosition.xyz);
        float specular = 0.0;
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, 100.0);
        addedLights.rgb += specular;
    }
    // vec3 color = mix(colorA, colorB, 1.0 - vUv.z - 0.5);
    float division = smoothstep(0.07, 0.06, vUv.z + 0.5);
    vec3 color = vec3(0.9 * division + 0.005, 3.0 * division + 0.005, 0.0 + 0.005);
    vec3 c = color * addedLights.rgb + color * 0.2;
    gl_FragColor = vec4(c, 1.0);
}
`;

// -----------------------------------------------------------------------------------------------------

let renderer, camera, scene = null;
const container = document.getElementById('three');
let controls;
let startTime, time;
let cube;
let rotSpeed = new THREE.Vector3(0.01, 0.01, 0.01);
let axesHelper;
let uniforms;
let customPointLight;
let pointLight = new THREE.PointLight(0xffffff);
var mouseX = 0,
    mouseY = 0;
var target = new THREE.Vector3();
var zoom = 300;

var bloomLayer;
var renderScene, bloomPass, finalPass;
var bloomComposer, finalComposer;

// -----------------------------------------------------------------------------------------------------

function initialize() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
        antialias: true, // to get smoother output
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = Math.pow(1.4, 4.0);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    camera = new THREE.OrthographicCamera(window.innerWidth / -zoom, window.innerWidth / zoom, window.innerHeight / zoom, window.innerHeight / -zoom, 0, 1000);

    // postprocessing
    renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 1.0, 0);
    bloomPass.threshold = 0;
    bloomPass.strength = 2.7;
    bloomPass.radius = 1.0;
    bloomComposer = new THREE.EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    finalPass = new THREE.ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: {
                    value: null
                },
                bloomTexture: {
                    value: bloomComposer.renderTarget2.texture
                }
            },
            vertexShader: finalVertexShader,
            fragmentShader: finalFragmentShader,
            defines: {}
        }), "baseTexture"
    );
    finalPass.needsSwap = true;
    finalComposer = new THREE.EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    // axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    addCube();

    pointLight.position.x = cube.position.x + 2;
    pointLight.position.y = cube.position.y;
    pointLight.position.z = 3;
    scene.add(pointLight)

    scene.add(camera);
    camera.position.z = 10;

    // and then just look at it!
    camera.lookAt(scene.position);

    animate();
}

initialize();

// -----------------------------------------------------------------------------------------------------

function onWindowResize() {
    // notify the renderer of the size change
    var y = window.innerHeight;
    var x = window.innerWidth;
    renderer.setSize(x, y);
    bloomComposer.setSize(x, y);
    finalComposer.setSize(x, y);
    // update the camera
    camera.left = -x / zoom;
    camera.right = x / zoom;
    camera.top = y / zoom;
    camera.bottom = -y / zoom;
    camera.updateProjectionMatrix();
    //   controls.handleMouseMoveRotate(x / 2, y / 2);

    var pos = screenToWorld(new THREE.Vector3(200, y - 200, 0));
    cube.position.x = pos.x;
    cube.position.y = pos.y;
    pointLight.position.x = cube.position.x + 2;
    pointLight.position.y = cube.position.y;
};

function onMouseMove(event) {
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    mouseX = (event.clientX - x);
    mouseY = (event.clientY - y);
    // controls.handleMouseMoveRotate(mouseX, mouseY);

    const boundX = mouseX * 0.0005 - x * 0.5 * 0.0005;
    const boundY = mouseY * 0.0005 - y * 0.5 * 0.0005;
    cube.lookAt(new THREE.Vector3(boundX, -boundY, 10));
};

window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousemove', onMouseMove, false);

// -----------------------------------------------------------------------------------------------------

function addCube() {
    // let geometry = new THREE.SphereGeometry(1, 32, 32);
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    uniforms = {
        time: {
            type: 'f',
            value: 0
        },
        colorA: {
            type: 'vec3',
            value: new THREE.Color(0xff89d9)
        },
        colorB: {
            type: 'vec3',
            value: new THREE.Color(0x74ebd5)
        }
    };
    uniforms = THREE.UniformsUtils.merge([
        uniforms,
        THREE.UniformsLib['lights']
    ])

    const shaderMaterialParams = {
        uniforms: uniforms,
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader1,
        lights: true,
        side: THREE.DoubleSide,
        transparent: true,
        // blending: THREE.AdditiveBlending,
        // depthTest: true,
        // depthWrite: true,
    };

    const customMaterial = new THREE.ShaderMaterial(shaderMaterialParams);

    cube = new THREE.Mesh(geometry, customMaterial);
    var y = window.innerHeight;
    var pos = screenToWorld(new THREE.Vector3(200, y - 200, 0));
    cube.position.x = pos.x;
    cube.position.y = pos.y;
    scene.add(cube);
}

function screenToWorld(_screenPos) {
    var worldPos = _screenPos.clone();
    var windowHalfX = window.innerWidth / 2.0;
    var windowHalfY = window.innerHeight / 2.0;
    worldPos.x = worldPos.x / windowHalfX - 1;
    worldPos.y = -worldPos.y / windowHalfY + 1;
    worldPos = worldPos.unproject(camera);
    return worldPos;
}

// -----------------------------------------------------------------------------------------------------

function animate() {
    //   controls.update();
    requestAnimationFrame(animate);

    time = performance.now() / 1000;
    cube.material.uniforms.time.value = time;

    target.x += (mouseX * 0.001 - target.x) * 0.1;
    target.y += (-mouseY * 0.001 - target.y) * 0.1;
    var shiftedTarget = new THREE.Vector3(target.x + cube.position.x, target.y + cube.position.y, 10);
    cube.lookAt(shiftedTarget);
    cube.rotateY(THREE.Math.degToRad(45));
    cube.rotateX(THREE.Math.degToRad(-45));
    // cube.rotation.x += rotSpeed.x;
    // cube.rotation.y += rotSpeed.y;

    

    // renderer.render(scene, camera);
    bloomComposer.render();
    finalComposer.render();
}

// -----------------------------------------------------------------------------------------------------