pub mod game_board;
pub mod setup;
pub mod update;

use crate::MAP_SPLAT_SIZE;
use crate::ai::ai_model::AiModel;
use bevy::ecs::{component::Component, resource::Resource};
use bevy::state::state::States;
use bevy_ecs_tilemap::tiles::TilePos;
use std::collections::HashMap;

pub type PlayerId = i32;
pub type WeightType = i32;
pub type PiecesProps = [[Option<BoardPieceProps>; MAP_SPLAT_SIZE]; MAP_SPLAT_SIZE];

#[derive(Resource)]
pub struct AiModels {
	pub models: HashMap<PlayerId, AiModel>,
}

#[derive(Resource, Debug, Eq, Hash, PartialEq, Clone)]
pub struct GameBoard {
	pub pieces: PiecesProps,
	pub current_player: PlayerId,
	pub players: Vec<PlayerId>,
	pub selected_piece_weight: Option<i8>,
	pub game_state: GameStateEnum,
}

#[derive(States, Debug, Clone, Copy, Eq, PartialEq, Hash, Default)]
pub enum GameStateEnum {
	#[default]
	AiThinking,
	Playing,
	GameOver,
	Velha
}

#[derive(Component, Resource, Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub struct BoardPieceProps {
	pub image_index: i32,
	pub weight: WeightType,
	pub pos: TilePos,
	pub player: PlayerId,
}
