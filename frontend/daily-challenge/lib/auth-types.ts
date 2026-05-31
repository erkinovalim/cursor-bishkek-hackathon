/** Registration types — mirror future FastAPI auth models. */

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisteredUser {
  name: string;
  email: string;
  registeredAt: string;
}
