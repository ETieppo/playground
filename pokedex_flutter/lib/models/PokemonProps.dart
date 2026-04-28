import 'package:flutter/material.dart';
import 'package:flutter_pokedex/models/others.dart';
import 'package:flutter_pokedex/models/sprites.dart';

class PokemonProps {
  int id;
  String name;
  int baseExperience;
  int height;
  int weight;
  List<AbilityProps> abilities;
  String locationAreaEncounters;
  IndexProps species;
  SpritesProps sprites;
  List<TypeSlotProps> types;

  PokemonProps({
    required this.id,
    required this.name,
    required this.baseExperience,
    required this.height,
    required this.weight,
    required this.abilities,
    required this.locationAreaEncounters,
    required this.species,
    required this.sprites,
    required this.types,
  });

  factory PokemonProps.fromJson(json) {
    List<AbilityProps> abilities =
        (json['abilities'] as List)
            .map((ablt) => AbilityProps.fromJson(ablt))
            .toList();
    List<TypeSlotProps> tipos =
        (json['types'] as List)
            .map((tipo) => TypeSlotProps.fromJson(tipo))
            .toList();


    return PokemonProps(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      baseExperience: json['base_experience'] ?? 0,
      height: json['height'] ?? 0,
      weight: json['weight'] ?? 0,
      abilities: abilities,
      locationAreaEncounters:
          json['location_area_encounters'],
      species: IndexProps.fromJson(json['species']),
      sprites: SpritesProps.fromJson(json['sprites']),
      types: tipos,
    );
  }
}

class AbilityProps {
  IndexProps ability;
  bool isHidden;
  int slot;

  AbilityProps({
    required this.ability,
    required this.isHidden,
    required this.slot,
  });

  factory AbilityProps.fromJson(Map<String, dynamic> json) {
    IndexProps indexProps = IndexProps.fromJson(
      json['ability'],
    );
    return AbilityProps(
      ability: indexProps,
      isHidden: json['is_hidden'],
      slot: json['slot'],
    );
  }
}
