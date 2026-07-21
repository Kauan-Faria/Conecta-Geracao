import 'package:conecta_geracao/features/tutorials/domain/tutorial.dart';
import 'package:conecta_geracao/features/tutorials/presentation/tutorials_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

// URLs inválidas propositalmente: fazem o TutorialVideoPlayer cair no estado de
// erro (sem criar a WebView), permitindo testar a UI da lista sem plataforma.
const _tutorials = [
  Tutorial(id: 't1', title: 'Primeiro tutorial', youtubeUrl: 'invalido-1'),
  Tutorial(id: 't2', title: 'Segundo tutorial', youtubeUrl: 'invalido-2'),
];

void main() {
  Widget wrap(Widget child) => MaterialApp(home: child);

  testWidgets('renderiza um card por tutorial com o título', (tester) async {
    await tester.pumpWidget(
      wrap(const TutorialsPage(tutorials: _tutorials)),
    );
    await tester.pump();

    expect(find.text('Primeiro tutorial'), findsOneWidget);
    expect(find.text('Segundo tutorial'), findsOneWidget);
    expect(find.text('Tutoriais'), findsOneWidget); // título da AppBar
  });

  testWidgets('a lista é rolável (ListView presente)', (tester) async {
    await tester.pumpWidget(
      wrap(const TutorialsPage(tutorials: _tutorials)),
    );
    await tester.pump();

    expect(find.byType(ListView), findsOneWidget);
  });

  testWidgets('exibe estado vazio quando não há tutoriais', (tester) async {
    await tester.pumpWidget(
      wrap(const TutorialsPage(tutorials: [])),
    );
    await tester.pump();

    expect(find.text('Nenhum tutorial disponível no momento.'), findsOneWidget);
    expect(find.byType(ListView), findsNothing);
  });

  testWidgets('URL inválida mostra mensagem de erro amigável', (tester) async {
    await tester.pumpWidget(
      wrap(const TutorialsPage(tutorials: _tutorials)),
    );
    await tester.pump();

    expect(
      find.text('Não foi possível carregar este vídeo.'),
      findsNWidgets(2),
    );
  });
}
