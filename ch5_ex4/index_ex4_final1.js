main();

function main() {
    // create context
    const canvas = document.querySelector("#c");
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    // create camera
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    // create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0.3, 0.5, 0.8);
    const fog = new THREE.Fog("grey", 1, 90);
    scene.fog = fog;


    // Create the upright plane
    const planeWidth = 256;
    const planeHeight = 128;
    const planeGeometry = new THREE.PlaneGeometry(
        planeWidth,
        planeHeight
    );

    // MATERIALS
    const textureLoader = new THREE.TextureLoader();

    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 'pink'
    });


    const planeTextureMap = textureLoader.load('textures/pebbles.jpg');
    planeTextureMap.wrapS = THREE.RepeatWrapping;
    planeTextureMap.wrapT = THREE.RepeatWrapping;
    planeTextureMap.repeat.set(16, 16);
    //planeTextureMap.magFilter = THREE.NearestFilter;
    planeTextureMap.minFilter = THREE.NearestFilter;
    planeTextureMap.anisotropy = gl.getMaxAnisotropy();
    const planeNorm = textureLoader.load('textures/pebbles_normal.png');
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide,
        normalMap: planeNorm
    });
    var texture = textureLoader.load('textures/stone.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    var loader = new THREE.OBJLoader();

    loader.load('teapot.obj',
        function (mesh) {
            var material = new THREE.MeshPhongMaterial({ map: texture });

            mesh.children.forEach(function (child) {
                child.material = material;
                child.castShadow = true;
            });

            mesh.position.set(-15, 2, 0);
            mesh.rotation.set(-Math.PI / 2, 0, 0);
            mesh.scale.set(0.005, 0.005, 0.005);

            scene.add(mesh);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log(error);
            console.log('An error happened');
        }
    );

    function addSeg(parent, height, posY) {
        var axisSphere = new THREE.Group();
        axisSphere.position.y = posY
        parent.add(axisSphere);

        var sphereGeometry = new THREE.SphereGeometry(1, 20, 20); // radius 1 -> diameter 2
        var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x7777ff });
        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // position the sphere
        sphere.scale.x = 1
        sphere.scale.y = height
        sphere.scale.z = 1
        sphere.position.x = 0
        sphere.position.y = height
        sphere.position.z = 0
        sphere.castShadow = true;

        sphere.receiveShadow = true;

        axisSphere.add(sphere);

        const tripod = new THREE.AxesHelper(5);
        axisSphere.add(tripod);

        return axisSphere;
    }


    const seg1 = addSeg(scene, 8, 0)
    const seg2 = addSeg(seg1, 6, 8)
    const seg3 = addSeg(seg2, 4, 6)

    // MESHES

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.set(0, 0, 0)
    scene.add(plane);

    //LIGHTS
    const color = 0xffffff;
    const intensity = .7;
    const light = new THREE.DirectionalLight(color, intensity);
    light.target = plane;
    light.position.set(0, 30, 30);
    scene.add(light);
    scene.add(light.target);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);


    var stats = initStats();
    var step = 0;

    var controls = new function () {
        this.rotY1 = 0;
        this.rotZ1 = 0;
        this.rotZ2 = 0;
        this.rotZ3 = 0;
    };

    var gui = new dat.GUI();
    gui.add(controls, 'rotY1', -Math.PI, Math.PI);
    gui.add(controls, 'rotZ1', -Math.PI, Math.PI);
    gui.add(controls, 'rotZ2', -Math.PI, Math.PI);
    gui.add(controls, 'rotZ3', -Math.PI, Math.PI);


    // attach them here, since appendChild needs to be called first
    var trackballControls = initTrackballControls(camera, gl);
    var clock = new THREE.Clock();

    render();

    function render() {
        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        // update the stats and the controls
        trackballControls.update(clock.getDelta());
        stats.update();
        seg1.rotation.y = controls.rotY1;
        seg1.rotation.z = controls.rotZ1;
        seg2.rotation.z = controls.rotZ2;
        seg3.rotation.z = controls.rotZ3;
        // rotate the cube around its axes
        //cube.rotation.x += controls.rotationSpeed;
        //cube.rotation.y += controls.rotationSpeed;
        //cube.rotation.z += controls.rotationSpeed;

        //sphere.rotation.x += controls.rotationSpeed;
        //sphere.rotation.y += controls.rotationSpeed;
        //sphere.rotation.z += controls.rotationSpeed;

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        gl.render(scene, camera);
    }
}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}