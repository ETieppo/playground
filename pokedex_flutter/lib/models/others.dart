class TypeSlotProps {
  int slot;
  IndexProps type;

  TypeSlotProps({required this.slot, required this.type});
  factory TypeSlotProps.fromJson(
    Map<String, dynamic> json,
  ) {
    return TypeSlotProps(
      slot: json['slot'],
      type: IndexProps.fromJson(json['type']),
    );
  }
}

class IndexProps {
  String name;
  String url;

  IndexProps({required this.name, required this.url});

  factory IndexProps.fromJson(Map<String, dynamic> json) {
    return IndexProps(name: json['name'], url: json['url']);
  }
}
