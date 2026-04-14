export interface AuthUser {
  userId: number;
  username: string;
  role: 'ADMIN' | 'MEMBER';
}

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export const authStore = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  save(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn(): boolean { return !!this.getToken(); },
  isAdmin():    boolean { return this.getUser()?.role === 'ADMIN'; },
  isMember():   boolean { return this.getUser()?.role === 'MEMBER'; },
};
