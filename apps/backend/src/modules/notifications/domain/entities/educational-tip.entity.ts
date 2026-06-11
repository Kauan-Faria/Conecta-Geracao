export interface EducationalTipProps {
  id?: string;
  title: string;
  body: string;
  deepLink: string;
  topicTag?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export class EducationalTip {
  readonly id?: string;
  readonly title: string;
  readonly body: string;
  readonly deepLink: string;
  readonly topicTag: string | null;
  readonly isActive: boolean;
  readonly sortOrder: number;

  private constructor(props: EducationalTipProps & { topicTag: string | null }) {
    this.id = props.id;
    this.title = props.title;
    this.body = props.body;
    this.deepLink = props.deepLink;
    this.topicTag = props.topicTag;
    this.isActive = props.isActive;
    this.sortOrder = props.sortOrder;
  }

  static reconstitute(props: EducationalTipProps): EducationalTip {
    return new EducationalTip({
      ...props,
      topicTag: props.topicTag ?? null,
    });
  }
}
