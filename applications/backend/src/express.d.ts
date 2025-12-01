export interface UserJWT {
  userId: string;
  username: string;
}

export interface AuthorizedRequest extends Request {
  user: UserJWT;
}

declare module 'express' {
  export interface Request {
    user?: UserJWT;
  }
}
