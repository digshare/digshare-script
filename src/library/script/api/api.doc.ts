export interface PublishMessageOptions {
  content: string;
  open?: boolean;
  images?: Buffer[];
  links?: string[];
  clientId?: string;
}
