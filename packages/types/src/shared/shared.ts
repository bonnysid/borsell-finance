export type DateString = string;
export type UUID = string;
export type ID = UUID;
export type NumberString = string;

export type WithCreatedAt = {
  createdAt: DateString;
};

export type WithUpdatedAt = {
  updatedAt: DateString;
};

export type WithId = {
  id: ID;
};

export type WithDateFields = WithCreatedAt & WithUpdatedAt;
