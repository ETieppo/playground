import 'package:flutter/material.dart';
import 'package:flutter_pokedex/models/home.dart';
import 'package:flutter_pokedex/services/api_consuption.dart';
import 'package:flutter_pokedex/widgets/pokemon_card.dart';

class Home extends StatefulWidget {
  HomeItemsProps? homeItemsProps;
  List<HomePokemon>? show;
  int windowColumns = 1;
  double padding = 20.0;
  Home({super.key});

  @override
  State<StatefulWidget> createState() => _Home();
}

class _Home extends State<Home> {
  @override
  void initState() {
    super.initState();

    fetch("https://pokeapi.co/api/v2/pokemon");
  }

  void fetch(String url) {
    ApiConsuption apiConsuption = ApiConsuption();
    apiConsuption
        .fetchHomeContent(url)
        .then((response) {
          setState(() {
            widget.homeItemsProps = response;
          });
        })
        .catchError((onError) {
          throw Exception("Erro ao processar api na home $onError");
        });
  }

  void searchForPokemon(String name) {
    final filteredList = widget.homeItemsProps?.results.where((pkm) => pkm.name?.startsWith(name.toLowerCase()) ?? false).toList();

    setState(() {
      if (name == "") {
        widget.show = null;
      } else {
        widget.show = filteredList;
      }
    });
  }

  void handleColumnSizeSelect() {
    int newColumnSize = 1;
    double newPadding = 80.0;
    switch (MediaQuery.of(context).size.width) {
      case < 520:
        newColumnSize = 1;
        newPadding = 20.0;
        break;
      case > 520 && < 650:
        newColumnSize = 2;
        newPadding = 20.0;
        break;
      case > 520 && < 950:
        newColumnSize = 2;
        break;
      case > 950 && < 2000:
        newColumnSize = 3;
      case > 2000:
        newColumnSize = 4;
        break;
    }
    setState(() {
      widget.windowColumns = newColumnSize;
      widget.padding = newPadding;
    });
  }

  @override
  Widget build(BuildContext context) {
    handleColumnSizeSelect();

    return Scaffold(
      body: Container(
        padding: EdgeInsets.only(top: 50),
        width: MediaQuery.of(context).size.width,
        child: Column(
          children: [
            Text("Pokedex", style: TextStyle(fontSize: 24)),
            Container(
              width: 320,
              margin: EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                decoration: InputDecoration(labelText: 'Buscar pelo nome', border: OutlineInputBorder()),
                onChanged: (name) => searchForPokemon(name),
              ),
            ),

            if (widget.show != null)
              Expanded(
                child: GridView.count(
                  padding: EdgeInsets.all(80),
                  crossAxisCount: widget.windowColumns,
                  crossAxisSpacing: 20,
                  mainAxisSpacing: 20,
                  children:
                      widget.show?.isEmpty ?? true
                          ? [
                            Text("Não encontramos o pokemon!", textAlign: TextAlign.center, style: TextStyle(fontSize: 30)),
                            Image.asset('lib/public/imgs/psyduc.png'),
                          ]
                          : widget.show!.map((e) => PokemonCard(homePokemon: e)).toList(),
                ),
              ),

            if (widget.show == null)
              Expanded(
                child: GridView.count(
                  padding: EdgeInsets.all(widget.padding.toDouble()),
                  crossAxisCount: widget.windowColumns,
                  crossAxisSpacing: 20,
                  mainAxisSpacing: 20,
                  children: widget.homeItemsProps?.results.map((e) => PokemonCard(homePokemon: e)).toList() ?? [],
                ),
              ),

            Container(
              padding: EdgeInsets.all(20),
              child: Row(
                spacing: 8,

                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed:
                        widget.homeItemsProps?.previous == null
                            ? null
                            : () {
                              fetch(widget.homeItemsProps!.previous!);
                            },
                    child: Icon(Icons.arrow_back),
                  ),
                  ElevatedButton(
                    onPressed:
                        widget.homeItemsProps?.next == null
                            ? null
                            : () {
                              fetch(widget.homeItemsProps!.next!);
                            },
                    child: Icon(Icons.arrow_forward),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
