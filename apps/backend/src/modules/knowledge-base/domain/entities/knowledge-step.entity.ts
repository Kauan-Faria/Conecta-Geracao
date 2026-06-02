export interface KnowledgeStepProps {
  id?: string;
  topicId?: string;
  order: number;
  instruction: string;
  checkpointQuestion?: string | null;
  checkpointHints?: string[];
}

export class KnowledgeStep {
  readonly id?: string;
  readonly topicId?: string;
  readonly order: number;
  readonly instruction: string;
  readonly checkpointQuestion?: string | null;
  readonly checkpointHints: string[];

  private constructor(props: KnowledgeStepProps) {
    this.id = props.id;
    this.topicId = props.topicId;
    this.order = props.order;
    this.instruction = props.instruction;
    this.checkpointQuestion = props.checkpointQuestion ?? null;
    this.checkpointHints = props.checkpointHints ?? [];
  }

  static create(props: KnowledgeStepProps): KnowledgeStep {
    if (props.order < 1) {
      throw new Error('order deve ser >= 1');
    }
    if (!props.instruction.trim()) {
      throw new Error('instruction é obrigatória');
    }
    return new KnowledgeStep(props);
  }
}
