use crate::game::GameBoard;
use crate::{BASE_ASSETS_URL, MAP_SIZE, MAP_SPLAT_SIZE, TILE_SIZE};
use bevy::prelude::*;

use bevy_ecs_tilemap::TilemapBundle;
use bevy_ecs_tilemap::anchor::TilemapAnchor;
use bevy_ecs_tilemap::map::{TilemapId, TilemapTexture, TilemapType};
use bevy_ecs_tilemap::tiles::{TileBundle, TilePos, TileStorage, TileTextureIndex};

pub fn setup_system(mut cmd: Commands, asset_server: Res<AssetServer>) {
	let tilemap_entity = cmd.spawn_empty().id();
	let mut tile_storage = TileStorage::empty(MAP_SIZE);
	let mut textures: Vec<Handle<Image>> = Vec::new();

	textures.push(asset_server.load(format!("{}/star_08.png", BASE_ASSETS_URL)));
	textures.push(asset_server.load(format!("{}/symbol_02.png", BASE_ASSETS_URL)));
	textures.push(asset_server.load(format!("{}/twirl_02.png", BASE_ASSETS_URL)));

	for y in 0..MAP_SPLAT_SIZE {
		for x in 0..MAP_SPLAT_SIZE {
			let pos = TilePos {
				x: x as u32,
				y: y as u32,
			};

			let tile = TileBundle {
				position: pos,
				tilemap_id: TilemapId(tilemap_entity),
				texture_index: TileTextureIndex(2),
				..Default::default()
			};

			let tile_entity = cmd.spawn(tile).id();
			tile_storage.set(&pos, tile_entity);
		}
	}

	cmd.insert_resource(GameBoard::default());
	cmd.entity(tilemap_entity).insert(TilemapBundle {
		grid_size: TILE_SIZE.into(),
		map_type: TilemapType::default(),
		size: MAP_SIZE,
		storage: tile_storage,
		texture: TilemapTexture::Vector(textures as Vec<Handle<Image>>),
		tile_size: TILE_SIZE,
		anchor: TilemapAnchor::Center,
		..Default::default()
	});

	cmd.spawn((
		Camera2d::default(),
		Projection::Orthographic(OrthographicProjection {
			scale: 2.,
			..OrthographicProjection::default_2d()
		}),
		Transform::from_xyz(0., 0., -100.),
		GlobalTransform::default(),
	));
}
