export interface Subscriber {
  id: string;
  fullName: string;
  plans: (
    | {
        type: 'per-month';
        orders: {
          price: number;
          span: number;
          guarantee: number;
          startsAt: number;
          expiresAt: number;
        }[];
        expiresAt: number;
      }
    | {
        type: 'per-message';
        messages: number;
      }
    | {
        type: 'vip-free';
      }
    | {
        type: 'free';
      }
    | {
        type: 'open';
      }
  )[];
  subscribedAt: number;
}

export interface PublishMessageParams {
  content: string;
  open?: boolean;
  images?: Buffer[];
  links?: string[];
  requestId?: string;
}
