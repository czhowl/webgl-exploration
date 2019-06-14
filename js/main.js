var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var camera = new THREE.OrthographicCamera( window.innerWidth / - 400, window.innerWidth / 400, window.innerHeight / 400, window.innerHeight / - 400, 1, 1000 );

var renderer = new THREE.WebGLRenderer();
// var winResize = new THREEx.WindowResize(renderer, camera)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material	= new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

var controls = new THREE.OrbitControls( camera, renderer.domElement );

function onWindowResize() {
    // notify the renderer of the size change
    renderer.setSize(window.innerWidth, window.innerHeight);
    // update the camera
    camera.left = -window.innerWidth / 400;
    camera.right = window.innerWidth / 400;
    camera.top = window.innerHeight / 400;
    camera.bottom = -window.innerHeight / 400;
    camera.updateProjectionMatrix();
};

function onMouseMove(event) {
};

window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousemove', onMouseMove, false);

var animate = function () {
    controls.update();
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();