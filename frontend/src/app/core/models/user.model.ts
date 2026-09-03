import { UserRole } from './role.enum';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  address?: string;
  profilePicture?: string;
  token?: string;
}

// Matches backend UserRead schema (camelCase)
export interface UserRead {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  role: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  address?: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}
