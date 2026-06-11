export type LeadPayload = {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  projectType?: string;
  message: string;
  source?: string;
};

export const NEXRENA_API_URL =
  (import.meta.env.PUBLIC_API_URL as string | undefined)?.trim() ||
  'https://nexrena-api-5dc54effaa9f.herokuapp.com';

export async function submitLead(payload: LeadPayload): Promise<void> {
  const res = await fetch(`${NEXRENA_API_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Submission failed');
  }
}
