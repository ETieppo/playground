use game_lib::{BoidsMain, SCREEN_HEIGHT, SCREEN_WIDTH};
use ggez::{
	Context, ContextBuilder, GameResult,
	conf::WindowMode,
	event::{self, EventHandler},
	graphics::{Canvas, Color},
};

#[cfg(feature = "hot-reload")]
#[hot_lib_reloader::hot_module(dylib = "game_lib")]
mod hot_lib {
	use game_lib::BoidsMain;
	use ggez::{Context, graphics::Canvas};

	#[hot_function]
	pub fn update(state: &mut BoidsMain, dt: f32) {}

	#[hot_function]
	pub fn draw(state: &mut BoidsMain, ctx: &mut Context, canvas: &mut Canvas) {}
}

struct EntryPoint {
	state: BoidsMain,
}

impl EntryPoint {
	fn new(_ctx: &mut Context) -> Self {
		Self {
			state: game_lib::BoidsMain::new(),
		}
	}
}

impl EventHandler for EntryPoint {
	fn update(&mut self, ctx: &mut Context) -> GameResult {
		let dt = ctx.time.delta().as_secs_f32();

		#[cfg(feature = "hot-reload")]
		hot_lib::update(&mut self.state, dt);

		#[cfg(not(feature = "hot-reload"))]
		self.state.update(dt);
		Ok(())
	}

	fn draw(&mut self, ctx: &mut Context) -> GameResult {
		let mut canvas = Canvas::from_frame(ctx, Color::BLACK);

		#[cfg(feature = "hot-reload")]
		hot_lib::draw(&mut self.state, ctx, &mut canvas);

		#[cfg(not(feature = "hot-reload"))]
		self.state.draw(ctx, &mut canvas);

		canvas.finish(ctx)?;
		Ok(())
	}
}

fn main() -> GameResult {
	let (mut ctx, event_loop) = ContextBuilder::new("boids", "dev")
		.window_mode(WindowMode::default().dimensions(SCREEN_WIDTH, SCREEN_HEIGHT))
		.build()?;
	let entry = EntryPoint::new(&mut ctx);
	event::run(ctx, event_loop, entry)
}
