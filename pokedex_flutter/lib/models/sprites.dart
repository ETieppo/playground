import 'package:flutter/material.dart';

class SpritesProps {
  String frontDefault;
  String frontShiny;
  String? backDefault;
  String? backShiny;
  OtherSpritesProps? other;

  SpritesProps({required this.frontDefault, required this.frontShiny, this.backDefault, this.backShiny, this.other});

  factory SpritesProps.fromJson(Map<String, dynamic> json) {

    return SpritesProps(frontDefault: json['front_default'], frontShiny: json['front_shiny'], other: OtherSpritesProps.fromJson(json['other']));
  }
}

class OtherSpritesProps {
  DreamWorldSprites? dreamWorld;
  HomeSprites? home;
  OfficialArtworkSprites? officialArtwork;
  ShowdownSprites? showdown;

  OtherSpritesProps({this.dreamWorld, this.home, this.officialArtwork, this.showdown});

  factory OtherSpritesProps.fromJson(Map<String, dynamic> json) {
    return OtherSpritesProps(dreamWorld: DreamWorldSprites.fromJson(json['dream_world']), home: HomeSprites.fromJson(json['home']));
  }
}

class DreamWorldSprites {
  String frontDefault;

  DreamWorldSprites({required this.frontDefault});
  factory DreamWorldSprites.fromJson(Map<String, dynamic> json) {
    return DreamWorldSprites(frontDefault: json['front_default']);
  }
}

class HomeSprites {
  String frontDefault;
  String? frontShiny;

  HomeSprites({required this.frontDefault, this.frontShiny});
  factory HomeSprites.fromJson(Map<String, dynamic> json){
  return HomeSprites(frontDefault: json['front_default'], frontShiny: json['front_shiny']);
  }
}

class OfficialArtworkSprites {
  String frontDefault;
  String? frontShiny;

  OfficialArtworkSprites({required this.frontDefault, this.frontShiny});
}

class ShowdownSprites {
  String frontDefault;
  String? backDefault;

  ShowdownSprites({required this.frontDefault, this.backDefault});
}

class SpriteVariationsProps {
  String frontDefault;
  String? frontShiny;
  String? backDefault;
  String? backShiny;

  SpriteVariationsProps({required this.frontDefault, this.frontShiny, this.backDefault, this.backShiny});
}
