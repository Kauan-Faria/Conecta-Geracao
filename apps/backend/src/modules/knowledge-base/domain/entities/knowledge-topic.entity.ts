import { KnowledgeStep, KnowledgeStepProps } from './knowledge-step.entity';

export interface KnowledgeTopicProps {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
  displayOrder: number;
  isActive?: boolean;
  steps: KnowledgeStepProps[];
}

export class KnowledgeTopic {
  readonly id?: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly keywords: string[];
  readonly displayOrder: number;
  readonly isActive: boolean;
  readonly steps: KnowledgeStep[];

  private constructor(props: KnowledgeTopicProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.summary = props.summary;
    this.keywords = props.keywords;
    this.displayOrder = props.displayOrder;
    this.isActive = props.isActive ?? true;
    this.steps = props.steps.map((s) => KnowledgeStep.create(s));
  }

  static create(props: KnowledgeTopicProps): KnowledgeTopic {
    if (!props.title.trim() || !props.summary.trim()) {
      throw new Error('title e summary são obrigatórios');
    }
    if (props.keywords.length === 0) {
      throw new Error('keywords não pode ser vazio');
    }
    if (props.steps.length < 3) {
      throw new Error('tópico deve ter pelo menos 3 passos');
    }
    return new KnowledgeTopic(props);
  }
}
