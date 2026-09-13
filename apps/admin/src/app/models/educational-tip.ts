export interface EducationalTip {
  id: string;
  title: string;
  body: string;
  deepLink: string;
  topicTag: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface EducationalTipPayload {
  title: string;
  body: string;
  deepLink: string;
  topicTag?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}