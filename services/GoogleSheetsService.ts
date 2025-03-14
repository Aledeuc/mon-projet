import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Constantes pour le stockage
const GOOGLE_ACCESS_TOKEN_KEY = '@flight_logger_google_access_token';
const GOOGLE_REFRESH_TOKEN_KEY = '@flight_logger_google_refresh_token';
const GOOGLE_TOKEN_EXPIRY_KEY = '@flight_logger_google_token_expiry';
const GOOGLE_SHEET_ID_KEY = '@flight_logger_google_sheet_id';

// Configuration OAuth
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Remplacer par votre ID client Google
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

export interface GoogleAuthState {
  isConnected: boolean;
  sheetId: string | null;
  sheetName: string | null;
}

export interface FlightData {
  id: string;
  date: string;
  fromIATA: string;
  toIATA: string;
  departureTime: string;
  arrivalTime: string;
  flightTime: string;
  registration: string;
  model: string;
  pilot: string;
  holder: string;
  roundTripId?: string;
  isReturn?: boolean;
}

/**
 * Service pour gérer l'authentification et les opérations avec Google Sheets
 */
class GoogleSheetsService {
  /**
   * Récupère l'état actuel de l'authentification Google
   */
  async getAuthState(): Promise<GoogleAuthState> {
    try {
      const [accessToken, sheetId] = await Promise.all([
        AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(GOOGLE_SHEET_ID_KEY)
      ]);
      
      // Vérifier si le token est expiré
      const isConnected = await this.validateToken();
      const sheetName = sheetId ? await this.getSheetName(sheetId) : null;
      
      return {
        isConnected,
        sheetId,
        sheetName
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état d\'authentification Google:', error);
      return {
        isConnected: false,
        sheetId: null,
        sheetName: null
      };
    }
  }

  /**
   * Déclenche le processus d'authentification Google
   */
  async signIn(): Promise<boolean> {
    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${REDIRECT_URI}` +
        `&response_type=code` +
        `&scope=${SCOPES.join(' ')}` +
        `&access_type=offline` +
        `&prompt=consent`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
      
      if (result.type === 'success') {
        const { url } = result;
        const code = url.split('code=')[1]?.split('&')[0];
        
        if (code) {
          // Échanger le code contre des tokens
          const tokenResult = await this.exchangeCodeForTokens(code);
          return tokenResult;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      return false;
    }
  }

  /**
   * Échange le code d'autorisation contre des tokens d'accès et de rafraîchissement
   */
  private async exchangeCodeForTokens(code: string): Promise<boolean> {
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }).toString(),
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        // Calculer l'expiration du token
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);
        
        // Sauvegarder les tokens
        await Promise.all([
          AsyncStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, data.access_token),
          AsyncStorage.setItem(GOOGLE_REFRESH_TOKEN_KEY, data.refresh_token || ''),
          AsyncStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, expiryDate.toISOString()),
        ]);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'échange de code contre des tokens:', error);
      return false;
    }
  }

  /**
   * Valide si le token d'accès actuel est toujours valide
   */
  private async validateToken(): Promise<boolean> {
    try {
      const [accessToken, expiryDateStr] = await Promise.all([
        AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(GOOGLE_TOKEN_EXPIRY_KEY),
      ]);
      
      if (!accessToken || !expiryDateStr) {
        return false;
      }
      
      const expiryDate = new Date(expiryDateStr);
      const now = new Date();
      
      // Si le token est expiré, essayer de le rafraîchir
      if (now >= expiryDate) {
        return await this.refreshAccessToken();
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  }

  /**
   * Rafraîchit le token d'accès en utilisant le token de rafraîchissement
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(GOOGLE_REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return false;
      }
      
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          grant_type: 'refresh_token',
        }).toString(),
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        // Calculer l'expiration du token
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + data.expires_in);
        
        // Sauvegarder le nouveau token
        await Promise.all([
          AsyncStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, data.access_token),
          AsyncStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, expiryDate.toISOString()),
        ]);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur de Google
   */
  async signOut(): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(GOOGLE_ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(GOOGLE_REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(GOOGLE_TOKEN_EXPIRY_KEY),
        // Ne pas supprimer l'ID de la sheet pour faciliter la reconnexion future
      ]);
      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion Google:', error);
      return false;
    }
  }

  /**
   * Crée une nouvelle feuille Google Sheets pour les données de vol
   */
  async createSheet(): Promise<string | null> {
    try {
      const isConnected = await this.validateToken();
      
      if (!isConnected) {
        return null;
      }
      
      const accessToken = await AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
      const date = new Date().toLocaleDateString().replace(/\//g, '-');
      const title = `Flight Logger - ${date}`;
      
      // Créer une nouvelle feuille
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title,
          },
          sheets: [
            {
              properties: {
                title: 'Flights',
              }
            }
          ]
        }),
      });
      
      const data = await response.json();
      
      if (data.spreadsheetId) {
        // Configurer les en-têtes
        await this.setupSheetHeaders(data.spreadsheetId);
        
        // Sauvegarder l'ID de la feuille
        await AsyncStorage.setItem(GOOGLE_SHEET_ID_KEY, data.spreadsheetId);
        
        return data.spreadsheetId;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la création de la feuille Google Sheets:', error);
      return null;
    }
  }

  /**
   * Configure les en-têtes de la feuille
   */
  private async setupSheetHeaders(sheetId: string): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
      
      const headers = [
        'ID', 'Date', 'From', 'To', 'Departure Time', 'Arrival Time',
        'Flight Time', 'Registration', 'Model', 'Pilot', 'Role',
        'Round Trip ID', 'Is Return'
      ];
      
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Flights!A1:M1?valueInputOption=RAW`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'Flights!A1:M1',
          majorDimension: 'ROWS',
          values: [headers],
        }),
      });
      
      const data = await response.json();
      return !!data.updatedCells;
    } catch (error) {
      console.error('Erreur lors de la configuration des en-têtes:', error);
      return false;
    }
  }

  /**
   * Définit l'ID de la feuille Google Sheets à utiliser
   */
  async setSheetId(sheetId: string): Promise<boolean> {
    try {
      // Vérifier que l'ID est valide
      const isValid = await this.validateSheetId(sheetId);
      
      if (isValid) {
        await AsyncStorage.setItem(GOOGLE_SHEET_ID_KEY, sheetId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la définition de l\'ID de la feuille:', error);
      return false;
    }
  }

  /**
   * Valide un ID de feuille Google Sheets
   */
  private async validateSheetId(sheetId: string): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
      
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'ID de la feuille:', error);
      return false;
    }
  }

  /**
   * Récupère le nom d'une feuille Google Sheets
   */
  async getSheetName(sheetId: string): Promise<string | null> {
    try {
      const accessToken = await AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
      
      if (!accessToken) {
        return null;
      }
      
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.properties.title;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du nom de la feuille:', error);
      return null;
    }
  }

  /**
   * Synchronise les données de vol avec Google Sheets
   */
  async syncFlights(flights: FlightData[]): Promise<boolean> {
    try {
      const [isConnected, sheetId] = await Promise.all([
        this.validateToken(),
        AsyncStorage.getItem(GOOGLE_SHEET_ID_KEY),
      ]);
      
      if (!isConnected || !sheetId) {
        return false;
      }
      
      const accessToken = await AsyncStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
      
      // Formatter les données pour Google Sheets
      const values = flights.map(flight => [
        flight.id,
        flight.date,
        flight.fromIATA,
        flight.toIATA,
        flight.departureTime,
        flight.arrivalTime,
        flight.flightTime,
        flight.registration,
        flight.model,
        flight.pilot,
        flight.holder,
        flight.roundTripId || '',
        flight.isReturn ? 'Yes' : 'No',
      ]);
      
      // Effacer les données existantes (sauf les en-têtes)
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Flights!A2:M?clear=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Ajouter les nouvelles données
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Flights!A2:M?valueInputOption=RAW`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: 'Flights!A2:M',
          majorDimension: 'ROWS',
          values,
        }),
      });
      
      const data = await response.json();
      return !!data.updatedCells;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des vols:', error);
      return false;
    }
  }
}

export default new GoogleSheetsService();
