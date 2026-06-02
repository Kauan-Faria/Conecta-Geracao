# Conecta Geração — Mobile

App Flutter do Conecta Geração (auth, shell e acessibilidade).

## Pré-requisitos

- Flutter 3.44+
- Conta Firebase com Google Sign-In habilitado

## Setup Firebase

1. Instale o FlutterFire CLI: `dart pub global activate flutterfire_cli`
2. Na pasta `apps/mobile`, execute: `flutterfire configure`
3. Isso substitui `lib/firebase_options.dart` com credenciais reais
4. Android: adicione SHA-1/SHA-256 no console Firebase
5. iOS: configure URL schemes do Google Sign-In

## Executar

```bash
cd apps/mobile
flutter pub get
flutter run
```

## Testes

```bash
flutter analyze
flutter test
```

## Estrutura

- `lib/core/` — tema, roteamento, rede, widgets base
- `lib/features/auth/` — login Google
- `lib/features/shell/` — navegação principal
- `lib/features/accessibility/` — preferências de acessibilidade
