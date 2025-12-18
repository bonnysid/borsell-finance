export type SuccessResponse = { message: string };

export type ErrorPropertyObject = {
  args: any;
  code: string;
  message: string;
};

export type ErrorProperty = {
  property: string;
  errors: ErrorPropertyObject[];
};

export type ValidationErrorResponse = {
  statusCode: number;
  error: string;
  properties: ErrorProperty[];
};

export type TableResponse<T> = {
  data: T[];
  totalItems: number;
  page: number;
};

export type PaginationDtoShape = {
  page?: number;
  limit?: number;
};
