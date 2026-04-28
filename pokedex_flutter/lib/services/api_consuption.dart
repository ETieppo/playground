import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_pokedex/models/PokemonProps.dart';
import 'package:flutter_pokedex/models/home.dart';
import 'package:http/http.dart' as http;

class ApiConsuption {
  Future<HomeItemsProps> fetchHomeContent(String url) async {
    final res = await http.get(Uri.parse(url.toString()));
    Map<String, dynamic> response = jsonDecode(res.body);
    HomeItemsProps homeItemsProps = HomeItemsProps.fromJson(response);

    return homeItemsProps;
  }

  Future<PokemonProps> fetchPokemonContetn(String url) async {
    final res = await http.get(Uri.parse(url));
    final response = jsonDecode(res.body);
    return PokemonProps.fromJson(response);
  }
}
