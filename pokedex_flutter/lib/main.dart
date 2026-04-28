import 'package:flutter/material.dart';
import 'package:flutter_pokedex/views/home.dart';
import 'package:flutter_pokedex/views/pokemon.dart';

void main() {
  runApp(const App());
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.dark(),
      initialRoute: '/',
      routes: {
        '/': (context) => Home(),
        '/pokemon': (context) => PokemonView(),
      },
    );
  }
}
