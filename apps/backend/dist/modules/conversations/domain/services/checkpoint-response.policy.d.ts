export type CheckpointDecision = 'advance' | 'repeat' | 'unchanged';
export declare class CheckpointResponsePolicy {
    evaluate(userMessage: string): CheckpointDecision;
    resolveNextStep(currentStep: number, decision: CheckpointDecision, maxSteps: number): number;
}
