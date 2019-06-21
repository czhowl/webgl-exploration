let vertexShader = `
uniform float time;
uniform vec2 resolution;
void main()	{
    gl_Position = vec4( position, 1.0 );
}
`;

// import customFragmentShader from './shaders/fragmentShader1.glsl';
let fragmentShader = `
uniform float time;
uniform vec2 resolution;
void main()	{
    float x = mod(time + gl_FragCoord.x, 20.) < 10. ? 1. : 0.;
    float y = mod(time + gl_FragCoord.y, 20.) < 10. ? 1. : 0.;
    gl_FragColor = vec4(vec3(min(x, y)), .6);
}
`;
var container;
var camera, scene, renderer;
var uniforms, material, mesh;
var mouseX = 0,
  mouseY = 0,
  lat = 0,
  lon = 0,
  phy = 0,
  theta = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
init();
var startTime = Date.now();
animate();

function init() {
  container = document.getElementById('three');
  camera = new THREE.Camera();
  camera.position.z = 1;
  scene = new THREE.Scene();
  uniforms = {
    time: {
      type: "f",
      value: 1.0
    },
    resolution: {
      type: "v2",
      value: new THREE.Vector2()
    }
  };
  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  });
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(mesh);
  renderer = new THREE.WebGLRenderer({
    antialias: true, // to get smoother output
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  container.appendChild(renderer.domElement);
  uniforms.resolution.value.x = window.innerWidth;
  uniforms.resolution.value.y = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  var elapsedMilliseconds = Date.now() - startTime;
  var elapsedSeconds = elapsedMilliseconds / 1000.;
  uniforms.time.value = 60. * elapsedSeconds;
  renderer.render(scene, camera);
}