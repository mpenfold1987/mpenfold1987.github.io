// flocking.js

// Set up the scene, camera, and renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a ground plane
let planeGeometry = new THREE.PlaneGeometry(100, 100);
let planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
let groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.y = -5;
scene.add(groundPlane);

// Bird class
class Bird {
    constructor() {
        let geometry = new THREE.ConeGeometry(0.1, 0.3, 3);
        let material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Random starting position within a cube of side 10
        this.mesh.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        this.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        // Slower velocity
        this.velocity = new THREE.Vector3(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1);
        scene.add(this.mesh);
    }

    update(birds) {
        let alignment = this.align(birds);
        let cohesion = this.cohere(birds);
        let separation = this.separate(birds);

        this.velocity.add(alignment).add(cohesion).add(separation).clampLength(0, 0.2);
        this.mesh.position.add(this.velocity);

        // Boundary conditions
        if (this.mesh.position.x > 5) this.mesh.position.x = -5;
        if (this.mesh.position.x < -5) this.mesh.position.x = 5;
        if (this.mesh.position.y > 5) this.mesh.position.y = -5;
        if (this.mesh.position.y < -5) this.mesh.position.y = 5;
        if (this.mesh.position.z > 5) this.mesh.position.z = -5;
        if (this.mesh.position.z < -5) this.mesh.position.z = 5;
    }

    align(birds) {
        let avgVelocity = new THREE.Vector3();
        let count = 0;
        for (let bird of birds) {
            if (bird !== this) {
                avgVelocity.add(bird.velocity);
                count++;
            }
        }
        if (count > 0) {
            avgVelocity.divideScalar(count).normalize();
        }
        return avgVelocity.multiplyScalar(0.01);  // Adjusted force factor
    }

    cohere(birds) {
        let avgPosition = new THREE.Vector3();
        let count = 0;
        for (let bird of birds) {
            if (bird !== this) {
                avgPosition.add(bird.mesh.position);
                count++;
            }
        }
        if (count > 0) {
            avgPosition.divideScalar(count).sub(this.mesh.position).normalize();
        }
        return avgPosition.multiplyScalar(0.01);  // Adjusted force factor
    }

    separate(birds) {
        let separation = new THREE.Vector3();
        for (let bird of birds) {
            if (bird !== this) {
                let distance = this.mesh.position.distanceTo(bird.mesh.position);
                if (distance < 1) {
                    separation.add(this.mesh.position.clone().sub(bird.mesh.position).normalize().divideScalar(distance));
                }
            }
        }
        return separation.multiplyScalar(0.01);  // Adjusted force factor
    }
}

// Initialize flock
let flock = [];
for (let i = 0; i < 50; i++) {
    flock.push(new Bird());
}

camera.position.z = 10;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    for (let bird of flock) {
        bird.update(flock);
    }

    renderer.render(scene, camera);
}

animate();
