// var scene = new THREE.Scene();
// // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// var camera = new THREE.OrthographicCamera(window.innerWidth / -400, window.innerWidth / 400, window.innerHeight / 400, window.innerHeight / -400, 0, 1000);

// var renderer = new THREE.WebGLRenderer({
//     antialias: true,
//     alpha: true
// });
// // var winResize = new THREEx.WindowResize(renderer, camera)
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x000000, 0);
// document.body.appendChild(renderer.domElement);

// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshNormalMaterial();


// // var texture = THREE.TextureLoader( "../img/moon.png" );
// // console.log(texture);

// // plane.material.side = THREE.DoubleSide;

// var loader = new THREE.TextureLoader();
// loader.load("../img/ethreal.jpg", function (texture) {
//     console.log(texture);
//     texture.wrapS = THREE.ClampToEdgeWrapping;
//     texture.wrapT = THREE.ClampToEdgeWrapping;
//     texture.offset.set(0, -1.8);
//     texture.repeat.set(2, 2);
//     var mat = new THREE.MeshPhongMaterial({
//         map: texture,
//         ambient: 0xfffffff,
//         // emissive: 0x777777,
//         // color: 0xdddddd,
//         specular: 0x777777,
//         shininess: 20,
//         shading: THREE.SmoothShading,
//         transparent: true
//     });
//     var plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
//     scene.add(plane);
// });

// // var cube = new THREE.Mesh(geometry, material);
// // scene.add(cube);
// var pLight = new THREE.PointLight(0xffffff, 1.0);
// //pLight.castShadow = true;
// pLight.position.set(0, 4, 4);
// scene.add(pLight);

// camera.position.z = 5;

// var controls = new THREE.OrbitControls(camera, renderer.domElement);
// // controls.autoRotate = true;
// controls.enableDamping = true;
// controls.dampingFactor = 0.07;
// controls.rotateSpeed = 0.03;
// controls.dispose();
// controls.update();

// function onWindowResize() {
//     // notify the renderer of the size change
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     // update the camera
//     camera.left = -window.innerWidth / 400;
//     camera.right = window.innerWidth / 400;
//     camera.top = window.innerHeight / 400;
//     camera.bottom = -window.innerHeight / 400;
//     camera.updateProjectionMatrix();
//     controls.handleMouseMoveRotate(window.innerWidth / 2, window.innerHeight / 2);
// };

// function onMouseMove(event) {
//     controls.handleMouseMoveRotate(event.clientX, event.clientY);
// };



// window.addEventListener('resize', onWindowResize, false);
// document.addEventListener('mousemove', onMouseMove, false);

// var animate = function () {
//     controls.update();
//     requestAnimationFrame(animate);

//     renderer.render(scene, camera);
// };

// animate();
// // var tween = TweenMax.to(cube.position, 2, {
// //     x: 4,
// //     ease: Power1.easeInOut,
// //     delay: 0
// //    });

// //    var tween = TweenMax.to(cube.rotation, 2, {
// //     y: 3,
// //     ease: Elastic.easeOut,
// //     delay: 1
// //    });



///////////////////////////////////////////////////

window.addEventListener('load', init)
let scene
let camera
let renderer
let sceneObjects = []
let uniforms = {}

function init() {
  scene = new THREE.Scene()
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5
  
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  
  document.body.appendChild(renderer.domElement)
  adjustLighting()
  addBasicCube()
//   addExperimentalCube()
  addExperimentalLightCube()
  animationLoop()
}

function adjustLighting() {
    let pointLight = new THREE.PointLight(0xdddddd)
    //pointLight.position.set(-5, -3, 3)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)
  
    let ambientLight = new THREE.AmbientLight(0x505050)
    scene.add(ambientLight)
}

function addBasicCube() {
  let geometry = new THREE.BoxGeometry(1, 1, 1)
  let material = new THREE.MeshLambertMaterial()  
  
  let mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = -2
  mesh.position.y = 2
  scene.add(mesh)
  sceneObjects.push(mesh)
}

function vertexShader() {
  return `
    varying vec3 vUv; 
    varying vec4 modelViewPosition; 
    varying vec3 vecNormal;

    void main() {
      vUv = position; 
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      vecNormal = vec3(modelViewMatrix * vec4(normal, 0.0));
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}

function fragmentShader() {
  return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }
  `
}

function addExperimentalCube() {
  uniforms.colorA = {type: 'vec3', value: new THREE.Color(0x74ebd5)}
  uniforms.colorB = {type: 'vec3', value: new THREE.Color(0xACB6E5)}
  
  let geometry = new THREE.BoxGeometry(1, 1, 1)
  let material =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
    vertexShader: vertexShader(),
  })
  
  let mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = 0
  scene.add(mesh)
  sceneObjects.push(mesh)
}

function lambertLightFragmentShader() {
    return `
      struct PointLight {
        vec3 color;
        vec3 position;
        float distance; 
      };  

      uniform vec3 colorA; 
      uniform vec3 colorB; 
      uniform PointLight pointLights[NUM_POINT_LIGHTS];
      varying vec3 vUv;
      varying vec4 modelViewPosition; 
      varying vec3 vecNormal; 

      void main() {
        vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);

        for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
            vec3 lightDirection = normalize(pointLights[l].position - modelViewPosition.xyz);
            addedLights.rgb += max(dot(lightDirection, vecNormal), 0.0) * pointLights[l].color
               * 1.0; //'light intensity' 
        }

        vec3 colorAndPointLight = mix(colorA, colorB, vUv.z) * addedLights.rgb + mix(colorA, colorB, vUv.z) * 0.1;
        vec3 finalColor = colorAndPointLight;

        gl_FragColor = vec4(finalColor, 1.0);
      }
  `
}

function addExperimentalLightCube() {
  uniforms.colorA = {type: 'vec3', value: new THREE.Color(0x74ebd5)}
  uniforms.colorB = {type: 'vec3', value: new THREE.Color(0xACB6E5)}
  uniforms = THREE.UniformsUtils.merge([
      uniforms,
      THREE.UniformsLib['lights']
    ])
  
  let geometry = new THREE.BoxGeometry(1, 1, 1)
  let material =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: lambertLightFragmentShader(),
    vertexShader: vertexShader(),
    lights: true
  })
  
  let mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = -2
  mesh.position.y = -2
  scene.add(mesh)
  sceneObjects.push(mesh)
}


function animationLoop() {
  renderer.render(scene, camera)
  
  for(let object of sceneObjects) {
    object.rotation.x += 0.01
    object.rotation.y += 0.03
  }
  
  requestAnimationFrame(animationLoop)
}