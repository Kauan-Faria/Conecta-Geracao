export declare const MVP_TOPIC_SLUGS: readonly ["fazer-pix", "codigo-govbr", "whatsapp-contato-localizacao", "wifi-qr-code", "segunda-via-boleto", "alerta-golpe"];
export type MvpTopicSlug = (typeof MVP_TOPIC_SLUGS)[number];
export declare class TopicSlug {
    readonly value: string;
    private constructor();
    static create(raw: string): TopicSlug;
    equals(other: TopicSlug): boolean;
}
