export const getRecordId = (record: { id?: string; _id?: string }) =>
  record.id || record._id || '';
