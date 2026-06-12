# Test Walkthrough: 025-auth-prototype-corrections

## Executed

```bash
cd apps/mobile
flutter test test/features/auth/auth_phone_screens_test.dart test/features/auth/auth_routing_test.dart
```

## Results

- ✅ Phone login shows `Continuar`, `Entra com Email e senha`, Google, `Entrar sem Cadastro`
- ✅ Advance disabled until phone complete
- ✅ Non-Brazil SMS message references new CTA copy
- ✅ Email sign-in route from phone screen
- ✅ Legacy `/login/alternative` → signup email
- ✅ Guest from phone and welcome screens

## Manual checklist

- [ ] `login_emailsenha.png`: login dedicado com `Não possuo Cadastro` → cadastro
- [ ] `cadastro_email.png`: `Entrar sem Cadastro` → home convidado
- [ ] Labels `Digite seu Email:` / `Digite sua senha:` / `Confirme sua senha:`
