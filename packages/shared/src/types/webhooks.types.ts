export interface XenditWebhookPayload {
  data?: {
    id?: string;
    reference_id?: string;
    external_id?: string;
    status?: string;
    failure_code?: string;
    failure_message?: string;
    failure_reason?: string;
  };

  id?: string;
  reference_id?: string;
  external_id?: string;
  status?: string;
  failure_code?: string;
  failure_message?: string;
  failure_reason?: string;
};
