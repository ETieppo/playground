use crate::game::{BoardPieceProps, GameBoard, GameStateEnum, PlayerId, WeightType};
use crate::{MAP_SPLAT_SIZE, PLAYERS_LENGTH};
use bevy::ecs::system::Query;
use bevy_ecs_tilemap::tiles::{TilePos, TileStorage, TileTextureIndex};

impl GameBoard {
	pub fn switch_turn(&mut self) {
		let cp = self.current_player;
		self.current_player = if cp == 1 { 0 } else { 1 };
	}

	pub fn set_piece(
		&mut self,
		tile_storage: &TileStorage,
		tiles: &mut Query<&mut TileTextureIndex>,
		pos: TilePos,
		new_asset_index: i32,
		weight: WeightType,
	) -> bool {
		// if let Some(actual) = self.pieces[pos.x as usize].clone()
		// 	&& actual.weight >= weight
		// {
		// 	return false;
		// };
		// pos.x+(pos.y*MAP_SPLAT_SIZE)
		if let Some(tile_entity) = tile_storage.get(&pos) {
			if let Ok(mut idx) = tiles.get_mut(tile_entity) {
				idx.0 = new_asset_index as u32;
				self.update_self_pieces(new_asset_index, pos.clone(), weight);
			}
		}

		true
	}

	pub fn check_win(&self) -> Option<PlayerId> {
		let n = MAP_SPLAT_SIZE as usize;
		let b = &self.pieces;

		let winner_in_line = |coords: &[(usize, usize)]| -> Option<PlayerId> {
			let first = b[coords[0].0][coords[0].1].as_ref()?.player;

			if coords.iter().all(|&(x, y)| b[x][y].as_ref().map(|p| p.player) == Some(first)) {
				Some(first)
			} else {
				None
			}
		};

		for y in 0..n {
			let coords: Vec<(usize, usize)> = (0..n).map(|x| (x, y)).collect();
			if let Some(p) = winner_in_line(&coords) {
				return Some(p);
			}
		}

		for x in 0..n {
			let coords: Vec<(usize, usize)> = (0..n).map(|y| (x, y)).collect();
			if let Some(p) = winner_in_line(&coords) {
				return Some(p);
			}
		}

		{
			let coords: Vec<(usize, usize)> = (0..n).map(|k| (k, k)).collect();
			if let Some(p) = winner_in_line(&coords) {
				return Some(p);
			}
		}

		{
			let coords: Vec<(usize, usize)> = (0..n).map(|k| (n - 1 - k, k)).collect();
			if let Some(p) = winner_in_line(&coords) {
				return Some(p);
			}
		}

		if b.iter().all(|row| row.iter().all(|cell| cell.is_some())) {
			return Some(2);
		}

		None
	}

	fn update_self_pieces(&mut self, image_index: i32, pos: TilePos, weight: WeightType) {
		{
			self.pieces[pos.x as usize][pos.y as usize] = Some(BoardPieceProps {
				image_index,
				weight,
				pos,
				player: self.current_player,
			});
		}

		println!("[PIECES================]{:?}", self.pieces);
	}

	pub fn default() -> Self {
		Self {
			pieces: [[None; MAP_SPLAT_SIZE]; MAP_SPLAT_SIZE],
			current_player: 1,
			selected_piece_weight: None,
			game_state: GameStateEnum::AiThinking,
			players: (0..PLAYERS_LENGTH).collect::<Vec<PlayerId>>(),
		}
	}
}
