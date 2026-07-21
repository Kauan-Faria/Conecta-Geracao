import 'package:conecta_geracao/features/tutorials/domain/tutorial.dart';
import 'package:conecta_geracao/features/tutorials/domain/tutorials_catalog.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('extractYoutubeVideoId', () {
    test('extrai ID de URL watch?v=', () {
      expect(
        extractYoutubeVideoId('https://www.youtube.com/watch?v=aqz-KE-bpKQ'),
        'aqz-KE-bpKQ',
      );
    });

    test('extrai ID de URL watch?v= com parâmetros extras', () {
      expect(
        extractYoutubeVideoId(
          'https://www.youtube.com/watch?list=PL123&v=aqz-KE-bpKQ&t=30s',
        ),
        'aqz-KE-bpKQ',
      );
    });

    test('extrai ID de URL youtu.be/', () {
      expect(
        extractYoutubeVideoId('https://youtu.be/K18cpp_-gP8'),
        'K18cpp_-gP8',
      );
    });

    test('extrai ID de URL embed/', () {
      expect(
        extractYoutubeVideoId('https://www.youtube.com/embed/K18cpp_-gP8'),
        'K18cpp_-gP8',
      );
    });

    test('extrai ID de URL shorts/', () {
      expect(
        extractYoutubeVideoId('https://www.youtube.com/shorts/K18cpp_-gP8'),
        'K18cpp_-gP8',
      );
    });

    test('aceita um ID cru de 11 caracteres', () {
      expect(extractYoutubeVideoId('aqz-KE-bpKQ'), 'aqz-KE-bpKQ');
    });

    test('retorna null para URL sem ID', () {
      expect(extractYoutubeVideoId('https://www.youtube.com'), isNull);
    });

    test('retorna null para string vazia', () {
      expect(extractYoutubeVideoId('   '), isNull);
    });

    test('retorna null para URL inválida', () {
      expect(extractYoutubeVideoId('not a url'), isNull);
    });
  });

  group('Tutorial', () {
    test('videoId reflete a URL do YouTube', () {
      const tutorial = Tutorial(
        id: 't1',
        title: 'Título',
        youtubeUrl: 'https://youtu.be/K18cpp_-gP8',
      );
      expect(tutorial.videoId, 'K18cpp_-gP8');
    });

    test('videoId é null quando a URL é inválida', () {
      const tutorial = Tutorial(
        id: 't1',
        title: 'Título',
        youtubeUrl: 'url-invalida',
      );
      expect(tutorial.videoId, isNull);
    });
  });

  group('tutorialsCatalog', () {
    test('contém exatamente 2 tutoriais (MVP)', () {
      expect(tutorialsCatalog, hasLength(2));
    });

    test('todos os itens têm ID único, título e videoId válido', () {
      final ids = <String>{};
      for (final tutorial in tutorialsCatalog) {
        expect(tutorial.title, isNotEmpty);
        expect(tutorial.videoId, isNotNull, reason: '${tutorial.id} sem ID de vídeo');
        expect(ids.add(tutorial.id), isTrue, reason: 'ID duplicado: ${tutorial.id}');
      }
    });
  });
}
