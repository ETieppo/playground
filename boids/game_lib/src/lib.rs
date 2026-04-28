use ggez::{
	Context,
	graphics::{Canvas, DrawParam, Image, ImageFormat, InstanceArray},
};
use rand::RngExt;

const AVOID_FACTOR: f32 = 0.08;
const CENTERING_FACTOR: f32 = 0.004;
const MATCHING_FACTOR: f32 = 0.07;
const NOISE_FACTOR: f32 = 1.4;
const ROW_ENTITIES: usize = 150;
const COL_ENTITIES: usize = 150;
const BASE_DISTANCE: f32 = 50.;
const BASE_THRESHOLD: f32 = 50.;
const MAX_SPEED: f32 = 160.;
const MIN_SPEED: f32 = 90.;
const PROTECTED_RANGE: f32 = 25.;
const VISUAL_RANGE: f32 = 50.;
const MARGIN: f32 = 80.;
const TURN_FACTOR: f32 = 5.0;
pub const SCREEN_WIDTH: f32 = 1860.;
pub const SCREEN_HEIGHT: f32 = 1000.;

const CELL_SIZE: f32 = VISUAL_RANGE;
const GRID_W: usize = (SCREEN_WIDTH / CELL_SIZE) as usize + 2;
const GRID_H: usize = (SCREEN_HEIGHT / CELL_SIZE) as usize + 2;

#[derive(Clone, Copy)]
pub struct TilePos {
	pub x: f32,
	pub y: f32,
}

#[derive(Clone, Copy)]
pub struct BoidEntity {
	position: TilePos,
	velocity: TilePos,
}

pub struct BoidsMain {
	boids: Vec<BoidEntity>,
	snapshot: Vec<BoidEntity>,
	grid: Vec<Vec<u16>>,
	instances: Option<InstanceArray>,
}

impl BoidEntity {
	pub fn new(x: f32, y: f32, vx: f32, vy: f32) -> Self {
		Self {
			position: TilePos { x, y },
			velocity: TilePos { x: vx, y: vy },
		}
	}
}

impl BoidsMain {
	pub fn new() -> Self {
		let capacity = ROW_ENTITIES * COL_ENTITIES;
		let mut boids: Vec<BoidEntity> = Vec::with_capacity(capacity);
		let mut snapshot: Vec<BoidEntity> = Vec::with_capacity(capacity);

		for y_row in 0..ROW_ENTITIES {
			for x_row in 0..COL_ENTITIES {
				let x = x_row as f32 * BASE_DISTANCE + BASE_THRESHOLD;
				let y = y_row as f32 * BASE_DISTANCE + BASE_THRESHOLD;
				let vx = (rand::rng().random::<f32>() * 2.0 - 1.0) * MAX_SPEED;
				let vy = (rand::rng().random::<f32>() * 2.0 - 1.0) * MAX_SPEED;
				let b = BoidEntity {
					position: TilePos { x, y },
					velocity: TilePos { x: vx, y: vy },
				};
				boids.push(b);
				snapshot.push(b);
			}
		}

		let grid = (0..GRID_W * GRID_H)
			.map(|_| Vec::with_capacity(8))
			.collect();

		Self {
			boids,
			snapshot,
			grid,
			instances: None,
		}
	}

	pub fn update(&mut self, dt: f32) {
		std::mem::swap(&mut self.boids, &mut self.snapshot);

		let n = self.snapshot.len();

		for cell in &mut self.grid {
			cell.clear();
		}
		for (i, b) in self.snapshot.iter().enumerate() {
			let cx = ((b.position.x / CELL_SIZE) as i32).clamp(0, GRID_W as i32 - 1) as usize;
			let cy = ((b.position.y / CELL_SIZE) as i32).clamp(0, GRID_H as i32 - 1) as usize;
			self.grid[cy * GRID_W + cx].push(i as u16);
		}

		let protected_sq = PROTECTED_RANGE * PROTECTED_RANGE;
		let visual_sq = VISUAL_RANGE * VISUAL_RANGE;
		let max_sq = MAX_SPEED * MAX_SPEED;
		let min_sq = MIN_SPEED * MIN_SPEED;
		let mut rng = rand::rng();

		for i in 0..n {
			let current = self.snapshot[i];

			let cx = ((current.position.x / CELL_SIZE) as i32).clamp(0, GRID_W as i32 - 1);
			let cy = ((current.position.y / CELL_SIZE) as i32).clamp(0, GRID_H as i32 - 1);

			let mut close_dx = 0.;
			let mut close_dy = 0.;
			let mut xvel_avg = 0.;
			let mut yvel_avg = 0.;
			let mut xpos_avg = 0.;
			let mut ypos_avg = 0.;
			let mut neighboring_boids = 0u32;

			let x0 = (cx - 1).max(0);
			let x1 = (cx + 1).min(GRID_W as i32 - 1);
			let y0 = (cy - 1).max(0);
			let y1 = (cy + 1).min(GRID_H as i32 - 1);

			for gy in y0..=y1 {
				for gx in x0..=x1 {
					let cell = &self.grid[(gy as usize) * GRID_W + gx as usize];
					for &j in cell {
						let j = j as usize;
						if j == i {
							continue;
						}
						let neighbor = &self.snapshot[j];
						let dx = current.position.x - neighbor.position.x;
						let dy = current.position.y - neighbor.position.y;
						let dsq = dx * dx + dy * dy;

						if dsq < protected_sq {
							close_dx += dx;
							close_dy += dy;
						} else if dsq < visual_sq {
							xvel_avg += neighbor.velocity.x;
							yvel_avg += neighbor.velocity.y;
							xpos_avg += neighbor.position.x;
							ypos_avg += neighbor.position.y;
							neighboring_boids += 1;
						}
					}
				}
			}

			let b = &mut self.boids[i];
			b.position = current.position;
			b.velocity = current.velocity;

			b.velocity.x += close_dx * AVOID_FACTOR;
			b.velocity.y += close_dy * AVOID_FACTOR;

			if neighboring_boids > 0 {
				let inv = 1.0 / neighboring_boids as f32;
				let xv = xvel_avg * inv;
				let yv = yvel_avg * inv;
				let xp = xpos_avg * inv;
				let yp = ypos_avg * inv;
				b.velocity.x += (xv - b.velocity.x) * MATCHING_FACTOR;
				b.velocity.y += (yv - b.velocity.y) * MATCHING_FACTOR;
				b.velocity.x += (xp - b.position.x) * CENTERING_FACTOR;
				b.velocity.y += (yp - b.position.y) * CENTERING_FACTOR;
			}

			b.velocity.x += (rng.random::<f32>() * 2.0 - 1.0) * NOISE_FACTOR;
			b.velocity.y += (rng.random::<f32>() * 2.0 - 1.0) * NOISE_FACTOR;

			if b.position.x < MARGIN {
				b.velocity.x += TURN_FACTOR;
			}
			if b.position.x > SCREEN_WIDTH - MARGIN {
				b.velocity.x -= TURN_FACTOR;
			}
			if b.position.y < MARGIN {
				b.velocity.y += TURN_FACTOR;
			}
			if b.position.y > SCREEN_HEIGHT - MARGIN {
				b.velocity.y -= TURN_FACTOR;
			}

			let speed_sq = b.velocity.x * b.velocity.x + b.velocity.y * b.velocity.y;
			if speed_sq > max_sq {
				let inv = MAX_SPEED / speed_sq.sqrt();
				b.velocity.x *= inv;
				b.velocity.y *= inv;
			} else if speed_sq < min_sq && speed_sq > 0.0 {
				let inv = MIN_SPEED / speed_sq.sqrt();
				b.velocity.x *= inv;
				b.velocity.y *= inv;
			}

			b.position.x += b.velocity.x * dt;
			b.position.y += b.velocity.y * dt;
		}
	}

	pub fn draw(&mut self, ctx: &mut Context, canvas: &mut Canvas) {
		let instances = self.instances.get_or_insert_with(|| {
			let size = 1u32;
			let pixels: Vec<u8> = (0..size * size).flat_map(|_| [255u8, 0, 0, 255]).collect();
			let img = Image::from_pixels(ctx, &pixels, ImageFormat::Rgba8UnormSrgb, size, size);
			InstanceArray::new(ctx, img)
		});

		instances.set(
			self.boids
				.iter()
				.map(|b| DrawParam::default().dest([b.position.x - 2.0, b.position.y - 2.0])),
		);

		canvas.draw(instances, DrawParam::default());
	}
}

impl Default for BoidsMain {
	fn default() -> Self {
		Self::new()
	}
}

#[unsafe(no_mangle)]
pub fn update(state: &mut BoidsMain, dt: f32) {
	state.update(dt);
}

#[unsafe(no_mangle)]
pub fn draw(state: &mut BoidsMain, ctx: &mut ggez::Context, canvas: &mut ggez::graphics::Canvas) {
	state.draw(ctx, canvas);
}
