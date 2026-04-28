use bevy::prelude::*;

#[derive(Resource, Default)]
struct VelocityUpdates {
	updates: Vec<(u32, Vec2)>,
}

#[derive(Component, Default)]
struct ParticleTrail {
	positions: Vec<Vec2>,
	max_length: usize,
}

#[derive(Component)]
struct Particle {
	id: u32,
	velocity: Vec2,
	position_x: f32,
	position_y: f32,
	direction_x: f32,
	direction_y: f32,
	massa: f32,
	color: Color,
	diameter: f32,
}
// const CONSTANTE_GRAVITACIONAL: f32 = 6.6743;
const CONSTANTE_GRAVITACIONAL: f32 = 6674.3;

fn system_startup(
	mut commands: Commands,
	mut mashes: ResMut<Assets<Mesh>>,
	mut materials: ResMut<Assets<ColorMaterial>>,
) {
	let mut camera = Camera2dBundle::default();
	camera.projection.scale = 4.0; // proporcional ap campo
	commands.spawn(camera);
	let configurations = [
		(
			Vec2::new(-200.0, 0.0),
			Vec2::new(0.0, 50.0),
			1000.0,
			Color::srgb(0.0, 0.0, 1.0),
		),
		(
			Vec2::new(100.0, 173.2),
			Vec2::new(-43.3, -25.0),
			1000.0,
			Color::srgb(1.0, 0.0, 0.0),
		),
		(
			Vec2::new(100.0, -173.2),
			Vec2::new(43.3, -25.0),
			1000.0,
			Color::srgb(0.0, 1.0, 0.0),
		),
	];

	for (id, (position, initial_velocity, mass, color)) in configurations.iter().enumerate() {
		commands.spawn((
			Mesh2d(mashes.add(Circle::default())),
			MeshMaterial2d(materials.add(*color)),
			Transform::from_translation(Vec3::new(position.x, position.y, 1.))
				.with_scale(Vec2::splat(30.).extend(1.)),
			Particle {
				id: id as u32,
				velocity: *initial_velocity,
				position_x: position.x,
				position_y: position.y,
				direction_x: 0.0,
				direction_y: 0.0,
				massa: *mass,
				diameter: 30.,
				color: *color,
			},
			ParticleTrail {
				positions: Vec::new(),
				max_length: 300, // longevidade
			},
		));
	}
}

fn update_trails(mut particles: Query<(&Transform, &mut ParticleTrail)>) {
	for (transform, mut trail) in particles.iter_mut() {
		let current_pos = Vec2::new(transform.translation.x, transform.translation.y);

		if trail
			.positions
			.last()
			.map_or(true, |&last_pos| (last_pos - current_pos).length() > 1.0)
		{
			trail.positions.push(current_pos);

			// remove cauda
			if trail.positions.len() > trail.max_length {
				trail.positions.remove(0);
			}
		}
	}
}

fn draw_trails(particles: Query<(&ParticleTrail, &Particle)>, mut gizmos: Gizmos) {
	for (trail, particle) in particles.iter() {
		for positions in trail.positions.windows(2) {
			let start = positions[0];
			let end = positions[1];
			let color = match particle.id {
				0 => Color::srgba(0.0, 0.0, 1.0, 0.5),
				1 => Color::srgba(1.0, 0.0, 0.0, 0.3),
				2 => Color::srgba(0.0, 1.0, 0.0, 0.3),
				_ => Color::srgba(1.0, 1.0, 1.0, 0.3),
			};

			gizmos.line_2d(start, end, color);
		}
	}
}

fn calculate_velocities(
	particles: Query<(&Transform, &Particle)>,
	time: Res<Time>,
	mut velocity_updates: ResMut<VelocityUpdates>,
) {
	velocity_updates.updates.clear();

	for (transform1, particle1) in particles.iter() {
		let mut new_velocity = particle1.velocity;

		for (transform2, particle2) in particles.iter() {
			if particle1.id != particle2.id {
				let delta_x = transform2.translation.x - transform1.translation.x;
				let delta_y = transform2.translation.y - transform1.translation.y;
				let distance = (delta_x * delta_x + delta_y * delta_y).sqrt();

				if distance < 1.0 {
					continue;
				}

				let force = CONSTANTE_GRAVITACIONAL * (particle1.massa * particle2.massa)
					/ (distance * distance);
				let force_x = force * delta_x / distance;
				let force_y = force * delta_y / distance;
				let acceleration_x = force_x / particle1.massa;
				let acceleration_y = force_y / particle1.massa;

				new_velocity.x += acceleration_x * time.delta_secs();
				new_velocity.y += acceleration_y * time.delta_secs();
			}
		}

		velocity_updates.updates.push((particle1.id, new_velocity));
	}
}

fn apply_velocities(
	mut particles: Query<(&mut Transform, &mut Particle)>,
	velocity_updates: Res<VelocityUpdates>,
	time: Res<Time>,
) {
	for (mut transform, mut particle) in particles.iter_mut() {
		if let Some((_, new_velocity)) = velocity_updates
			.updates
			.iter()
			.find(|(id, _)| *id == particle.id)
		{
			particle.velocity = *new_velocity;
			transform.translation.x += particle.velocity.x * time.delta_secs();
			transform.translation.y += particle.velocity.y * time.delta_secs();
			particle.position_x = transform.translation.x;
			particle.position_y = transform.translation.y;
		}
	}
}

fn main() {
	App::new()
		.add_plugins(DefaultPlugins)
		.init_resource::<VelocityUpdates>()
		.add_systems(Startup, system_startup)
		.add_systems(
			Update,
			(
				calculate_velocities,
				apply_velocities,
				update_trails,
				draw_trails,
			)
				.chain(),
		)
		.run();
}
