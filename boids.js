const canvas = document.getElementById('boidsCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boid {
    constructor() {
        this.position = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
        this.velocity = {
            x: (Math.random() - 0.5) * 4, // Increased initial speed
            y: (Math.random() - 0.5) * 4  // Increased initial speed
        };
        this.acceleration = {
            x: 0,
            y: 0
        };
        this.maxSpeed = 4; // Increased max speed
        this.maxForce = 0.1; // Increased max force
    }

    edges() {
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.y > canvas.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
    }

    align(boids) {
        let perceptionRadius = 50;
        let steering = { x: 0, y: 0 };
        let total = 0;

        for (let other of boids) {
            let d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
            if (other !== this && d < perceptionRadius) {
                steering.x += other.velocity.x;
                steering.y += other.velocity.y;
                total++;
            }
        }

        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            let mag = Math.hypot(steering.x, steering.y);
            if (mag > 0) {
                steering.x = (steering.x / mag) * this.maxSpeed - this.velocity.x;
                steering.y = (steering.y / mag) * this.maxSpeed - this.velocity.y;
            }
        }

        return steering;
    }

    cohesion(boids) {
        let perceptionRadius = 50;
        let steering = { x: 0, y: 0 };
        let total = 0;

        for (let other of boids) {
            let d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
            if (other !== this && d < perceptionRadius) {
                steering.x += other.position.x;
                steering.y += other.position.y;
                total++;
            }
        }

        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            steering.x -= this.position.x;
            steering.y -= this.position.y;
            let mag = Math.hypot(steering.x, steering.y);
            if (mag > 0) {
                steering.x = (steering.x / mag) * this.maxSpeed - this.velocity.x;
                steering.y = (steering.y / mag) * this.maxSpeed - this.velocity.y;
            }
        }

        return steering;
    }

    separation(boids) {
        let perceptionRadius = 24;
        let steering = { x: 0, y: 0 };
        let total = 0;

        for (let other of boids) {
            let d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
            if (other !== this && d < perceptionRadius) {
                let diff = { x: this.position.x - other.position.x, y: this.position.y - other.position.y };
                let mag = Math.hypot(diff.x, diff.y);
                if (mag > 0) {
                    diff.x /= mag;
                    diff.y /= mag;
                }
                steering.x += diff.x;
                steering.y += diff.y;
                total++;
            }
        }

        if (total > 0) {
            steering.x /= total;
            steering.y /= total;
            let mag = Math.hypot(steering.x, steering.y);
            if (mag > 0) {
                steering.x = (steering.x / mag) * this.maxSpeed - this.velocity.x;
                steering.y = (steering.y / mag) * this.maxSpeed - this.velocity.y;
            }
        }

        return steering;
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        this.acceleration.x += alignment.x;
        this.acceleration.y += alignment.y;
        this.acceleration.x += cohesion.x;
        this.acceleration.y += cohesion.y;
        this.acceleration.x += separation.x;
        this.acceleration.y += separation.y;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        let mag = Math.hypot(this.velocity.x, this.velocity.y);
        if (mag > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / mag) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / mag) * this.maxSpeed;
        }
        this.acceleration.x *= 0;
        this.acceleration.y *= 0;
    }

    show() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

const flock = [];

for (let i = 0; i < 200; i++) { // Increased number of boids
    flock.push(new Boid());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let boid of flock) {
        boid.edges();
        boid.flock(flock);
        boid.update();
        boid.show();
    }

    requestAnimationFrame(animate);
}

animate();
