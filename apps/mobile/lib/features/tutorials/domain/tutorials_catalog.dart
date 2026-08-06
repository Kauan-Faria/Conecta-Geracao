import 'package:conecta_geracao/features/tutorials/domain/tutorial.dart';

/// Catálogo estático de tutoriais exibido na aba "Tutoriais" (MVP).
///
/// Para adicionar ou trocar um tutorial, basta editar esta lista — a UI não
/// precisa de alterações. Cada item precisa apenas de um [Tutorial.id] único,
/// um [Tutorial.title] e uma [Tutorial.youtubeUrl] de um vídeo que permita
/// incorporação (embed).
const List<Tutorial> tutorialsCatalog = <Tutorial>[
  Tutorial(
    id: 'tutorial-01',
    title: 'Primeiros passos: conhecendo o aplicativo',
    // TODO: trocar pela URL definitiva do vídeo-tutorial.
    youtubeUrl: 'https://youtube.com/shorts/58FxjivJh8Y',
  ),
  Tutorial(
    id: 'tutorial-02',
    title: 'Como usar o chat e tirar suas dúvidas',
    // TODO: trocar pela URL definitiva do vídeo-tutorial.
    youtubeUrl: 'https://youtube.com/shorts/CawoO46td-E',
  ),
];
