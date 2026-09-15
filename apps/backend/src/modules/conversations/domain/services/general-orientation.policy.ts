export interface GeneralOrientationBrief {
  isOfficialCatalog: false;
  mayOfferAppTopics: true;
  systemAppendix: string;
}

const SYSTEM_APPENDIX = [
  'Você está em modo orientação geral — NÃO use a base oficial de tutoriais do app.',
  'Não copie nem invente passos dos tutoriais de Wi-Fi, Gov.br, PIX, boleto, WhatsApp ou golpe.',
  'Use linguagem simples, uma instrução principal por mensagem, frases curtas.',
  'NUNCA peça senha, PIN, OTP, token, código de verificação ou dado bancário.',
  'Se o assunto for senha ou código, oriente a pessoa a usar só o app ou site oficial.',
  'No final, no máximo UMA frase oferecendo que o app também ajuda com Wi-Fi, Gov.br, PIX, boleto, WhatsApp e golpes — sem mudar o tema da resposta.',
].join('\n');

export class GeneralOrientationPolicy {
  brief(): GeneralOrientationBrief {
    return {
      isOfficialCatalog: false,
      mayOfferAppTopics: true,
      systemAppendix: SYSTEM_APPENDIX,
    };
  }
}
