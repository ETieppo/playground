import 'package:flutter/material.dart';
import 'package:flutter_pokedex/models/PokemonProps.dart';
import 'package:flutter_pokedex/models/home.dart';
import 'package:flutter_pokedex/views/pokemon.dart';
import 'package:flutter_pokedex/services/api_consuption.dart';

///////// CASCA ///////////////////////////////////////////////////////////////////////
class PokemonCard extends StatefulWidget {
  final HomePokemon homePokemon;
  const PokemonCard({super.key, required this.homePokemon});

  @override
  State<StatefulWidget> createState() => _PokemonCard();
}

///////// PRIVATE STATE //////////////////////////////////////////////////////////////
class _PokemonCard extends State<PokemonCard> {
  PokemonProps? pokemonProps;

  Color selectColor(String mainAbility) {
    Color color = Color(0xfffffff);
    switch (mainAbility) {
      case "water":
        color = Color.fromARGB(255, 0, 166, 255);
      case "grass":
        color = Color.fromARGB(255, 0, 255, 17);
      case "fire":
        color = Color.fromARGB(255, 255, 0, 0);
      case "bug":
        color = Colors.amber;
      case "normal":
        color = Colors.deepPurple;
		case "":

		color = Color.fromARGB(0, 247, 0, 255);
    }
    return color;
  }

  @override
  void initState() {
    super.initState();

    ApiConsuption apiConsuption = ApiConsuption();
    apiConsuption
        .fetchPokemonContetn(widget.homePokemon.url!)
        .then(
          (response) => setState(() {
            pokemonProps = response;
          }),
        )
        .catchError((err) {
          throw Exception("Erro ao processar dados em PokemonCard: $err");
        });
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('--${pokemonProps?.types[0].type.name}');
    if (pokemonProps == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return InkWell(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => PokemonView(pokemon: pokemonProps))),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: const BorderRadius.all(Radius.circular(10)),
          color: selectColor(pokemonProps?.types[0].type.name ?? ""),

          border: Border.all(width: 1, color: const Color.fromARGB(255, 66, 66, 66)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.network(pokemonProps!.sprites.frontDefault, width: 140, height: 140, fit: BoxFit.contain),
            if (pokemonProps!.name.isNotEmpty) Text(pokemonProps!.name.toUpperCase()),
          ],
        ),
      ),
    );
  }
}
