import init, * as wasm from './pkg/collision_simulation.js';


let wasmModule;


async function initWasm() {
    wasmModule = await init();
}


initWasm();


function updateBenchmarkDescription() {
    const description = `
Benchmark Description:


This benchmark compares the performance of JavaScript and WebAssembly in calculating elastic collisions between balls.


Number of collisions: 1,000,000


Formula used for elastic collision:
v1_new = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
v2_new = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)


Where:
m1, m2 = masses of the balls
v1, v2 = initial velocities of the balls
v1_new, v2_new = new velocities after collision


The benchmark measures the time taken to calculate these collisions for 1,000,000 pairs of balls with random masses and initial velocities.


The animation demonstrates real-time performance differences between JS and WASM for collision calculations.
`;


    document.getElementById('benchmarkDescription').textContent = description;
}


updateBenchmarkDescription();


function batchCollideJS(masses, velocities, count) {
    let newVelocities = new Array(count * 2);
    for (let i = 0; i < count; i++) {
        const m1 = masses[i * 2];
        const m2 = masses[i * 2 + 1];
        const v1 = velocities[i * 2];
        const v2 = velocities[i * 2 + 1];


        const new_v1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        const new_v2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);


        newVelocities[i * 2] = new_v1;
        newVelocities[i * 2 + 1] = new_v2;
    }
    return newVelocities;
}


function runBenchmark() {
    const COUNT = 1000000; // Number of collisions to calculate
    const masses = new Array(COUNT * 2).fill(0).map(() => Math.random() * 10);
    const velocities = new Array(COUNT * 2).fill(0).map(() => Math.random() * 20 - 10);


    let results = "Benchmark Results:\n\n";


    console.log("Running JS Benchmark...");
    const jsStart = performance.now();
    batchCollideJS(masses, velocities, COUNT);
    const jsEnd = performance.now();
    const jsTime = jsEnd - jsStart;


    console.log("Running WASM Benchmark...");
    const wasmStart = performance.now();
    wasm.batch_collide(masses, velocities, COUNT);
    const wasmEnd = performance.now();
    const wasmTime = wasmEnd - wasmStart;


    results += `JavaScript Time: ${jsTime.toFixed(2)} ms\n`;
    results += `WebAssembly Time: ${wasmTime.toFixed(2)} ms\n`;
    results += `WebAssembly is ${(jsTime / wasmTime).toFixed(2)}x faster\n`;
    results += `\nNumber of collisions calculated: ${COUNT.toLocaleString()}`;


    document.getElementById('results').textContent = results;
}


const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
const BALL_RADIUS = 2; 
let animationId;
let lastTime = 0;
let fps = 0;
let frameCount = 0;
let lastMetricUpdate = 0;
let collisionTime = 0;
let collisionCount = 0;


class Ball {
    constructor(x, y, mass, velocity, color) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.velocity = velocity;
        this.color = color;
    }


    update(deltaTime) {
        this.x += this.velocity * deltaTime / 1000;
        if (this.x + BALL_RADIUS > canvas.width || this.x - BALL_RADIUS < 0) {
            this.velocity = -this.velocity;
        }
    }
}


function createRandomBall() {
    const x = Math.random() * (canvas.width - 2 * BALL_RADIUS) + BALL_RADIUS;
    const y = Math.random() * (canvas.height - 2 * BALL_RADIUS) + BALL_RADIUS;
    const mass = Math.random() * 5 + 1;
    const velocity = (Math.random() - 0.5) * 5;
    const color = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
    return new Ball(x, y, mass, velocity, color);
}


function checkCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    return dx * dx + dy * dy <= 4 * BALL_RADIUS * BALL_RADIUS;
}


function runAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }


    const ballCount = parseInt(document.getElementById('ballCount').value);
    const useWasm = confirm("Use WebAssembly for collision calculations? (OK for Yes, Cancel for JavaScript)");
    const balls = Array(ballCount).fill().map(() => createRandomBall());
    lastTime = performance.now();
    lastMetricUpdate = performance.now();
    frameCount = 0;
    collisionTime = 0;
    collisionCount = 0;
    animate(balls, useWasm);
}


function animate(balls, useWasm) {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;


    // Update FPS
    fps = 1000 / deltaTime;
   
    const physicsSteps = 10;
    const physicsTimeStep = deltaTime / physicsSteps;


    let collisionTimeStart = performance.now();
    for (let step = 0; step < physicsSteps; step++) {
        for (let i = 0; i < balls.length; i++) {
            balls[i].update(physicsTimeStep);
           
            for (let j = i + 1; j < balls.length; j++) {
                if (checkCollision(balls[i], balls[j])) {
                    collisionCount++;
                    if (useWasm) {
                        const wasmBall1 = wasm.Ball.new(balls[i].mass, balls[i].velocity);
                        const wasmBall2 = wasm.Ball.new(balls[j].mass, balls[j].velocity);
                        const newVelocities = wasm.collide(wasmBall1, wasmBall2);
                        balls[i].velocity = newVelocities[0];
                        balls[j].velocity = newVelocities[1];
                        wasmBall1.free();
                        wasmBall2.free();
                    } else {
                        const m1 = balls[i].mass;
                        const m2 = balls[j].mass;
                        const v1 = balls[i].velocity;
                        const v2 = balls[j].velocity;
                        balls[i].velocity = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
                        balls[j].velocity = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
                    }
                }
            }
        }
    }
    collisionTime += performance.now() - collisionTimeStart;


    // Only render every 5th frame
    if (frameCount % 5 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < balls.length; i++) {
            ctx.beginPath();
            ctx.arc(balls[i].x, balls[i].y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = balls[i].color;
            ctx.fill();
        }
    }
    frameCount++;


    if (currentTime - lastMetricUpdate > 1000) {
        document.getElementById('fpsCounter').textContent =
            `FPS: ${fps.toFixed(2)}\n` +
            `Collisions/sec: ${(collisionCount / (currentTime - lastMetricUpdate) * 1000).toFixed(2)}\n` +
            `Avg. Collision Calc Time: ${(collisionTime / collisionCount).toFixed(3)} ms`;
        collisionCount = 0;
        collisionTime = 0;
        lastMetricUpdate = currentTime;
    }


    animationId = requestAnimationFrame(() => animate(balls, useWasm));
}


document.getElementById('run-benchmark').addEventListener('click', runBenchmark);
document.getElementById('run-animation').addEventListener('click', runAnimation);
