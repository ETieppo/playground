use crate::MAP_SPLAT_SIZE;
use crate::game::{GameBoard, GameStateEnum};
use bevy::ecs::resource::Resource;
use bevy_ecs_tilemap::tiles::TilePos;
use rand::Rng;
use std::collections::HashMap;

const CYCLES: i8 = 8;
const BOARD_SPLAT_SIZE: i8 = 3;

#[derive(Resource)]
pub struct AiModel {
	pub q_table: HashMap<GameBoard, HashMap<TilePos, f32>>,
	pub actual_board: GameBoard,
	pub epsilon: f32,
}

// #[derive(Debug, Clone, PartialEq, Eq, Hash)]
// pub struct Move {
// 	pub piece_pos: TilePos,
// 	pub target_pos: TilePos,
// }

impl AiModel {
	pub fn new() -> Self {
		Self {
			q_table: HashMap::new(),
			actual_board: GameBoard::default(),
			epsilon: 0.12112,
		}
	}

	pub fn think(&mut self, state: GameBoard) -> Option<TilePos> {
		self.policy(state).clone()
	}

	fn get_possible_moves(&self, gb: &GameBoard) -> Vec<TilePos> {
		let mut out: Vec<TilePos> = vec![];

		for (x, row) in gb.pieces.iter().enumerate() {
			for (y, item) in row.iter().enumerate() {
				if item.is_none() {
					out.push(TilePos {
						x: x as u32,
						y: y as u32,
					});
				}
			}
		}

		out
	}

	fn policy(&mut self, state: GameBoard) -> Option<TilePos> {
		let possible_moves: Vec<TilePos> = self.get_possible_moves(&state);
		println!("possibles:::::::::: {:?}", state);
		if possible_moves.is_empty() {
			println!("No possible movments.");
			return None;
		}

		let mut rng = rand::rng();
		let roll: f32 = rng.random();

		if roll < self.epsilon {
			// --- EXPLORAÇÃO (Com probabilidade `epsilon`) ---
			// Escolhe um movimento aleatório uniformemente.
			let random_index = rng.random_range(0..possible_moves.len());
			Some(possible_moves[random_index].clone())
		} else {
			// --- EXPLOTAÇÃO (Com probabilidade `1 - epsilon`) ---
			// Escolhe o movimento que maximiza o valor Q.

			// Inicializa com o primeiro movimento para ter um ponto de partida.
			let mut best_move: TilePos = possible_moves[0].clone();
			let mut max_q_value: f32 = self.get_q_value(&state, &best_move);

			// Itera sobre todos os movimentos possíveis para encontrar o melhor.
			for action in possible_moves.iter().skip(1) {
				let q_value = self.get_q_value(&state, action);

				if q_value > max_q_value {
					max_q_value = q_value;
					best_move = action.clone();
				}
				// Nota: Em caso de valores Q iguais (empate), a primeira ação encontrada é mantida,
				// o que é aceitável para o ε-greedy básico.
			}

			Some(best_move)
		}
	}

	fn reward_signal(reward: i8) {}
	fn get_q_value(&self, state: &GameBoard, action: &TilePos) -> f32 {
		if let Some(actions_map) = self.q_table.get(state) {
			*actions_map.get(action).unwrap_or(&0.)
		} else {
			0.
		}
	}

	// fn value_function() {}

	// fn build_key() {}

	// fn end_turn(&mut self) {
	// 	// build.key()
	// 	// if let Some(k) = key.clone() {
	// 	// 		println!("{}: {:?}", k.clone(), value.clone());
	// 	// 	}
	// 	// 	self.q_table.push(GameBoardProps { key, value });
	// }
}
