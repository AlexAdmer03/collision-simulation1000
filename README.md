Elastic Collision Benchmark: JavaScript vs WebAssembly
Overview
This project benchmarks the performance of JavaScript and WebAssembly (WASM)—implemented in Rust—in calculating elastic collisions between balls. By simulating 1,000,000 collision events, the benchmark highlights the efficiency differences between the two technologies in handling computationally intensive tasks.

Benchmark Details
Number of Collisions: 1,000,000

Collision Formulas:
Velocity of Ball 1 After Collision:
v1_new = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)

Velocity of Ball 2 After Collision:
v2_new = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)

Variables:

m1, m2: Masses of the balls
v1, v2: Initial velocities
v1_new, v2_new: Velocities after collision

Random masses and initial velocities are generated for each pair of balls to ensure a comprehensive performance evaluation.

Features
Performance Measurement: Records the time taken to compute 1,000,000 elastic collisions using both JavaScript and WASM.
Real-Time Animation: Visualizes the collision calculations, demonstrating the real-time performance differences between JS and WASM implementations.
Rust-Powered WebAssembly: Utilizes Rust for writing the WASM module, leveraging Rust’s performance and safety features.
Getting Started
Prerequisites
Node.js and npm installed on your machine.
Rust and wasm-pack for building the WebAssembly module.

Technologies Used
JavaScript: For the main application logic and animation.
Rust: For writing the high-performance WebAssembly module.
WebAssembly (WASM): Enables near-native execution speed for collision calculations.
Webpack: Bundling the project for deployment.
HTML/CSS: For structuring and styling the web interface.
Results
The benchmark demonstrates significant performance improvements when using WebAssembly over JavaScript for intensive calculations like elastic collisions. Detailed results and performance metrics can be viewed in the animation section of the application.

Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

Acknowledgments
Inspired by performance benchmarking needs in physics simulations.
Thanks to the Rust and WebAssembly communities for their excellent tools and resources.
