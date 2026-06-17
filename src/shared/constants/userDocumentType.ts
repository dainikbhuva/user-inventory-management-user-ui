export const USER_DOCUMENT_TYPES = [
  'id_proof',
  'address_proof',
  'offer_letter',
  'appointment_letter',
  'resume',
  'education',
  'other',
] as const;

export type UserDocumentType = (typeof USER_DOCUMENT_TYPES)[number];

export const USER_DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  id_proof: 'Government ID',
  address_proof: 'Address proof',
  offer_letter: 'Offer letter',
  appointment_letter: 'Appointment letter',
  resume: 'Resume / CV',
  education: 'Education certificates',
  other: 'Other',
};
