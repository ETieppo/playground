import 'package:flutter/material.dart';
import 'package:flutter_pokedex/models/PokemonProps.dart';
import 'package:flutter_pokedex/widgets/propriedades.dart';
import 'package:flutter_svg/flutter_svg.dart';

class PokemonView extends StatelessWidget {
  final PokemonProps? pokemon;
  const PokemonView({super.key, this.pokemon});

  @override
  Widget build(BuildContext context) {
    final imageUrl = pokemon?.sprites.other?.dreamWorld?.frontDefault ?? pokemon?.sprites.frontDefault;

    if (pokemon == null) {
      return Scaffold(
        body: Container(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [CircularProgressIndicator(), Text("Carregando...")],
          ),
        ),
      );
    }

    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.all(40),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              BackButton(),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Column(
                    spacing: 30,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Container(
                        width: 180,
                        height: 180,
                        child:
                            imageUrl != null
                                ? imageUrl.split('.').last == "svg"
                                    ? SvgPicture.network(imageUrl, fit: BoxFit.contain)
                                    : Image.network(imageUrl, fit: BoxFit.contain)
                                : Text("Não foi possível carregar a imagem do pokemon!"),
                      ),

                      Column(
                        spacing: 20,
                        children: [
                          Container(
                            padding: EdgeInsetsDirectional.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(borderRadius: BorderRadius.all(Radius.circular(4)), color: Colors.white),
                            child: Text(
                              "${pokemon?.name.toUpperCase()}",
                              style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Column(
                            spacing: 20,
                            children: [
                              Propriedades(
                                label: "Físico",
                                itens: {
                                  "Specie": pokemon?.species.name,
                                  "Height": pokemon?.height,
                                  "Weigth": pokemon?.weight,
                                  "Base experience": pokemon?.baseExperience,
                                },
                              ),
                              Propriedades(
                                label: "Propriedades",
                                itens: {
                                  "Abilidades": pokemon?.abilities.map((ablt) =>ablt.ability.name),
                                  "Tipos": pokemon?.types.map((tipo)=>tipo.type.name),
                                  "Weigth": pokemon?.weight,
                                  "BaseExperience": pokemon?.baseExperience,
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
