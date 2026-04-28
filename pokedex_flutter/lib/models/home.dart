class HomeItemsProps {
  final int count;
  final String? next;
  final String? previous;
  final List<HomePokemon> results;

  HomeItemsProps({
    required this.count,
    required this.next,
    required this.previous,
    required this.results,
  });

  factory HomeItemsProps.fromJson(
    Map<String, dynamic> json,
  ) {
    List<HomePokemon> homePokemons = [];
    json['results'].forEach(
      (item) =>
          item != null
              ? homePokemons.add(
                HomePokemon.fromDynamic(item),
              )
              : null,
    );
    return HomeItemsProps(
      count: json['count'],
      next: json['next'],
      previous: json['previous'],
      results: homePokemons,
    );
  }
}

class HomePokemon {
  String? name;
  String? url;

  HomePokemon({required this.name, required this.url});

  factory HomePokemon.fromDynamic(dynamic pokemon) {
    return HomePokemon(
      name: pokemon['name'] ?? '',
      url: pokemon['url'] ?? '',
    );
  }
}
