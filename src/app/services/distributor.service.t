import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DistributorService {

  constructor(private firestore: Firestore, private authService: AuthService) { }

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const distributorCode = this.authService.getCurrentDistributorCode();
    if (!distributorCode) {
      return { success: false, message: 'No distributor is logged in.' };
    }

    try {
      const docRef = doc(this.firestore, 'distributors', distributorCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const distributorData = docSnap.data();
        const storedPasswordHash = distributorData['distributorPassword'];
        const oldPasswordHash = this.hashPassword(oldPassword);

        if (storedPasswordHash !== oldPasswordHash) {
          return { success: false, message: 'Old password does not match.' };
        }

        const newPasswordHash = this.hashPassword(newPassword);
        await updateDoc(docRef, {
          distributorPassword: newPasswordHash
        });
        
        return { success: true, message: 'Password updated successfully!' };
      } else {
        return { success: false, message: 'Distributor not found.' };
      }
    } catch (error) {
      console.error("Password Change Error: ", error);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  }
}