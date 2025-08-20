import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js';

const DISTRIBUTOR_CODE_KEY = 'distributor_code';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private firestore: Firestore, private router: Router) { }

  // Hash the password using SHA256 for comparison
  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

  async login(distributorCode: string, password: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, 'distributors', distributorCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const distributorData = docSnap.data();
        const storedPasswordHash = distributorData['distributorPassword']; // The hashed password in Firestore
        const providedPasswordHash = this.hashPassword(password);
        console.log(providedPasswordHash)
        if (storedPasswordHash === providedPasswordHash) {
          localStorage.setItem(DISTRIBUTOR_CODE_KEY, distributorCode);
          return true;
        }
      }
      return false; // User not found or password incorrect
    } catch (error) {
      console.error("Login Error: ", error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(DISTRIBUTOR_CODE_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(DISTRIBUTOR_CODE_KEY);
  }

  getCurrentDistributorCode(): string | null {
    return localStorage.getItem(DISTRIBUTOR_CODE_KEY);
  }
}