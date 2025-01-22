import Keycloak from "keycloak-js";
import { authConfig } from "@/config/auth";

export class KeycloakService {
  private static instance: KeycloakService;
  private keycloak: Keycloak;

  private constructor() {
    this.keycloak = new Keycloak({
      url: authConfig.keycloak.url,
      realm: authConfig.keycloak.realm,
      clientId: authConfig.keycloak.clientId,
    });
  }

  public static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
    }
    return KeycloakService.instance;
  }

  public async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
      });

      if (authenticated) {
        this.setupTokenRefresh();
      }

      return authenticated;
    } catch (error) {
      console.error("Failed to initialize Keycloak:", error);
      throw error;
    }
  }

  private setupTokenRefresh(): void {
    this.keycloak.onTokenExpired = () => {
      this.keycloak.updateToken(70).catch((error) => {
        console.error("Failed to refresh token:", error);
        this.keycloak.login();
      });
    };
  }

  public getToken(): string | undefined {
    return this.keycloak.token;
  }

  public getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.preferred_username;
  }

  public async login(): Promise<void> {
    await this.keycloak.login();
  }

  public async logout(): Promise<void> {
    await this.keycloak.logout();
  }

  public isAuthenticated(): boolean {
    return !!this.keycloak.authenticated;
  }

  public hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  public getKeycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
