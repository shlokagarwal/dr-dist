import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, Timestamp, orderBy, arrayUnion } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { user } from '@angular/fire/auth';


interface Order {
    id: string;
    status: 'pending' | 'cancelled' | 'complete' | string; // Use a union type for known statuses
    currentState: number;
    orderTimestamp: any; // Use a more specific type if possible, e.g., Timestamp
    // Add other properties as needed
}


@Injectable({
    providedIn: 'root'
})
export class OrderService {

    constructor(private firestore: Firestore, private authService: AuthService) { }

    async getOrdersByDate(selectedDate: Date): Promise<any[]> {
        const distributorCode = this.authService.getCurrentDistributorCode();
        if (!distributorCode) return [];

        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const ordersRef = collection(this.firestore, 'orders');

        const dateQuery = query(ordersRef,
            where('dcode', '==', distributorCode),
            where('orderTimestamp', '>=', Timestamp.fromDate(startOfDay)),
            where('orderTimestamp', '<=', Timestamp.fromDate(endOfDay)),
            orderBy('orderTimestamp', 'asc')
        );

        const pendingQuery = query(ordersRef,
            where('dcode', '==', distributorCode),
            where('status', '==', 'pending'),
            orderBy('orderTimestamp', 'asc')
        );

        const [dateQuerySnapshot, pendingQuerySnapshot] = await Promise.all([
            getDocs(dateQuery),
            getDocs(pendingQuery)
        ]);

        const ordersMap = new Map();

        dateQuerySnapshot.forEach(doc => {
            ordersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        pendingQuerySnapshot.forEach(doc => {
            if (!ordersMap.has(doc.id)) {
                ordersMap.set(doc.id, { id: doc.id, ...doc.data() });
            }
        });


        const combinedOrders = Array.from(ordersMap.values()) as Order[]; // Type cast the array

        const filteredOrders = combinedOrders.filter(order =>
            [1, 2, 3, 4].includes(order.currentState)
        );

        filteredOrders.sort((a, b) => {
            
            // The type of a.status is now known, so this is safe
            const statusA = a.status === 'pending' ? 0 : a.status === 'cancelled' ? 1 : a.status === 'complete' ? 2 : 99;
            const statusB = b.status === 'pending' ? 0 : b.status === 'cancelled' ? 1 : b.status === 'complete' ? 2 : 99;
         

            if (statusA !== statusB) {
                return statusA - statusB;
            }

            return a.orderTimestamp.toMillis() - b.orderTimestamp.toMillis();
        });

        console.log(filteredOrders);

        const ordersWithUserDetails = await this.enrichOrdersWithUserDetails(filteredOrders);

        return ordersWithUserDetails;

    }

    private async enrichOrdersWithUserDetails(orders: any[]): Promise<any[]> {
        const userDetailsPromises = orders.map(async (order) => {
            // From your screenshot, rcode seems to be 'distributorCode-retailerCode'
            const retailerCode = order.rcode;

            const usersRef = collection(this.firestore, 'userDatabase');
            const userQuery = query(usersRef, where('retailer_code', '==', retailerCode));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const phoneInfo = userData['phoneNumber'];
                const name = userData['name']
                const addressInfo = userData['address'] ? userData['address'][0] : {};
                return {
                    ...order,
                    name: name || 'N/A',
                    phoneNumber: phoneInfo || 'N/A',
                    address: addressInfo.address || 'N/A'
                };
            }
            return { ...order, phoneNumber: 'N/A', address: 'N/A', name: 'N/A' };
        });

        return Promise.all(userDetailsPromises);
    }



    async updateOrderStatus(orderId: string, newStateId: number, newStatus: string, logs: string[]): Promise<void> {
        const orderRef = doc(this.firestore, 'orders', orderId);
        await updateDoc(orderRef, {
            status: newStatus,
            currentState: newStateId,
            logs: logs // Add a new log entry
        });
    }
}