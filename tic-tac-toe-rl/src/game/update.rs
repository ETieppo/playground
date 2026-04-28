use crate::game::{AiModels, GameBoard, GameStateEnum, PlayerId};
use bevy::ecs::system::{Query, ResMut};
use bevy::state::state::NextState;
use bevy_ecs_tilemap::tiles::{TileStorage, TileTextureIndex};

pub fn update_system(
	tilemaps: Query<&TileStorage>,
	mut tiles: Query<&mut TileTextureIndex>,
	mut gb: ResMut<GameBoard>,
	mut next_state: ResMut<NextState<GameStateEnum>>,
	mut ai_models: ResMut<AiModels>,
) {
	if gb.game_state != GameStateEnum::GameOver {
		let storage = tilemaps.single().unwrap();

		if let Some(ai) = ai_models.models.get_mut(&gb.current_player) {
			if let Some(ai_move) = ai.think(gb.clone()) {
				let player_id = gb.current_player;

				gb.set_piece(storage, &mut tiles, ai_move.clone(), player_id as PlayerId, 1);
				next_state.set(GameStateEnum::Playing);
			}
		}

		match gb.check_win() {
			Some(p) => {
				println!("---- WINNER: {:?}", p);
				gb.game_state = GameStateEnum::GameOver;
				next_state.set(GameStateEnum::GameOver);
			}
			_ => {
				println!("======= change turn =======");
				gb.switch_turn();
				next_state.set(GameStateEnum::AiThinking);
			}
		}
	} else {
		return;
	}
}

