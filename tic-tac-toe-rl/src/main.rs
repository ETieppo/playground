mod ai;
mod game;

use std::collections::HashMap;

use bevy::DefaultPlugins;
use bevy::app::{App, Startup, Update};
use bevy::ecs::schedule::IntoScheduleConfigs;
use bevy::state::app::AppExtStates;
use bevy::state::condition::in_state;
use bevy_ecs_tilemap::TilemapPlugin;
use bevy_ecs_tilemap::map::{TilemapSize, TilemapTileSize};

use crate::ai::ai_model::AiModel;
use crate::game::{AiModels, GameStateEnum, PlayerId};
use crate::game::{setup::setup_system, update::update_system};

pub const MIN_PIECES_TO_WIN: u8 = 4;
pub const PLAYERS_LENGTH: PlayerId = 2;
pub const MAX_AI_TRY_MOVES: i8 = 6;
pub const BASE_ASSETS_URL: &'static str = "imgs";
pub const PIECES_LENGTH: usize = 3;
pub const MAP_SPLAT_SIZE: usize = 3;
pub const TILE_SIZE: TilemapTileSize = TilemapTileSize { x: 512., y: 512. };
pub const MAP_SIZE: TilemapSize = TilemapSize {
	x: MAP_SPLAT_SIZE as u32,
	y: MAP_SPLAT_SIZE as u32,
};

fn main() {
	App::new()
		.add_plugins((DefaultPlugins, TilemapPlugin))
		.init_state::<GameStateEnum>()
		.insert_resource(AiModels {
			models: HashMap::from([(0, AiModel::new()), (1, AiModel::new())]),
		})
		.add_systems(Startup, setup_system)
		.add_systems(Update, update_system.run_if(in_state(GameStateEnum::AiThinking)))
		.run();
}
