use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Ball {
    mass: f64,
    velocity: f64,
}

#[wasm_bindgen]
impl Ball {
    pub fn new(mass: f64, velocity: f64) -> Ball {
        Ball { mass, velocity }
    }

    pub fn velocity(&self) -> f64 {
        self.velocity
    }
}

#[wasm_bindgen]
pub fn collide(ball1: &mut Ball, ball2: &mut Ball) -> Vec<f64> {
    let m1 = ball1.mass;
    let m2 = ball2.mass;
    let v1 = ball1.velocity;
    let v2 = ball2.velocity;

    let new_v1 = ((m1 - m2) * v1 + 2.0 * m2 * v2) / (m1 + m2);
    let new_v2 = ((m2 - m1) * v2 + 2.0 * m1 * v1) / (m1 + m2);

    ball1.velocity = new_v1;
    ball2.velocity = new_v2;

    vec![new_v1, new_v2]
}

#[wasm_bindgen]
pub fn batch_collide(masses: &[f64], velocities: &[f64], count: usize) -> Vec<f64> {
    let mut new_velocities = vec![0.0; count * 2];
    for i in 0..count {
        let m1 = masses[i * 2];
        let m2 = masses[i * 2 + 1];
        let v1 = velocities[i * 2];
        let v2 = velocities[i * 2 + 1];

        let new_v1 = ((m1 - m2) * v1 + 2.0 * m2 * v2) / (m1 + m2);
        let new_v2 = ((m2 - m1) * v2 + 2.0 * m1 * v1) / (m1 + m2);

        new_velocities[i * 2] = new_v1;
        new_velocities[i * 2 + 1] = new_v2;
    }
    new_velocities
}
