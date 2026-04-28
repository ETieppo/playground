import 'package:flutter/material.dart';

class Propriedades extends StatelessWidget {
  final Map<String, dynamic> itens;
  final String label;

  Propriedades({super.key, required this.label, required this.itens});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 270,
      padding: EdgeInsetsDirectional.symmetric(horizontal: 14, vertical: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.all(Radius.circular(4)),
        color: const Color.fromARGB(255, 54, 54, 54),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(fontWeight: FontWeight.w800),
            textAlign: TextAlign.start,
          ),
          SizedBox(
            child: Container(
              color: Color.fromARGB(255, 83, 83, 83),
              height: 2,
              width: 100,
              margin: EdgeInsets.symmetric(horizontal: 4),
            ),
          ),
          SizedBox(height: 20),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: itens.entries.map(
              (item) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text('${item.key}:')),
                      Expanded(
                        child: Text(
                          '${item.value}',
                          textAlign: TextAlign.end,
                          softWrap: true,
                          style: TextStyle(color: Colors.deepOrange),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ).toList(),
          ),
        ],
      ),
    );
  }
}