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
  addExperimentalCube()
  //addExperimentalLightCube()
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
      vecNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz; //????????
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
  mesh.position.x = 2
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
        //I need to learn theory behind this right now my understanding is: looping through all the point light and than apply magic lol.
        //https://csantosbh.wordpress.com/2014/01/09/custom-shaders-with-three-js-uniforms-textures-and-lighting/
        vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);

        for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
            vec3 lightDirection = normalize(modelViewPosition.xyz - pointLights[l].position);
            addedLights.rgb += clamp(dot(-lightDirection, vecNormal), 0.0, 1.0) * pointLights[l].color
               * 1.0; //'light intensity' 
        }

        //tried a bunch of stuff but I'm not sure how to retrieve the ambient light from THREE.js which would be super neat 
        //logic at this point is: always add a constant float since ambient light is evenly distributed in the scene
        //something ain't it with the lighting overall, the direction is defintely not the same as the labert marial from three
        //time to learn the theory behind ligthing :') 

        vec3 redAndPoint = vec3(1.0 * addedLights.r, 0.0, 0.0);
        vec3 finalRed = vec3(redAndPoint.r + 0.3, 0.0, 0.0); 

        vec3 colorAndPointLight = mix(colorA, colorB, vUv.z) * addedLights.rgb;
        vec3 finalColor = vec3(colorAndPointLight.r + 0.3, colorAndPointLight.g + 0.3, colorAndPointLight.b + 0.3);

        gl_FragColor = vec4(finalRed, 1.0);
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
  mesh.position.x = 2
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