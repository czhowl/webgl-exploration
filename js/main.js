var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var camera = new THREE.OrthographicCamera(window.innerWidth / -400, window.innerWidth / 400, window.innerHeight / 400, window.innerHeight / -400, 0, 1000);

var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
// var winResize = new THREEx.WindowResize(renderer, camera)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0xffffff, 0);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshNormalMaterial();


var texture = THREE.TextureLoader( "../img/moon.png" );
var mat = new THREE.MeshLambertMaterial({ map : texture });
console.log(texture);
var plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
plane.material.side = THREE.DoubleSide;

var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);
scene.add(plane);
camera.position.z = 5;

var controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.rotateSpeed = 0.03;
controls.dispose();
controls.update();

function onWindowResize() {
    // notify the renderer of the size change
    renderer.setSize(window.innerWidth, window.innerHeight);
    // update the camera
    camera.left = -window.innerWidth / 400;
    camera.right = window.innerWidth / 400;
    camera.top = window.innerHeight / 400;
    camera.bottom = -window.innerHeight / 400;
    camera.updateProjectionMatrix();
    controls.handleMouseMoveRotate(window.innerWidth/2, window.innerHeight/2);
};

function onMouseMove(event) {
    controls.handleMouseMoveRotate(event.clientX, event.clientY);
};



window.addEventListener('resize', onWindowResize, false);
document.addEventListener('mousemove', onMouseMove, false);

var animate = function () {
    controls.update();
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};

animate();

// var tween = TweenMax.to(cube.position, 2, {
//     x: 4,
//     ease: Power1.easeInOut,
//     delay: 0
//    });

//    var tween = TweenMax.to(cube.rotation, 2, {
//     y: 3,
//     ease: Elastic.easeOut,
//     delay: 1
//    });