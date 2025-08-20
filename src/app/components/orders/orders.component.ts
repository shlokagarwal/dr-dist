import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { LongPressDirective } from '../../directives/long-press.directive';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, FormsModule, LongPressDirective],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
    orders: any[] = [];
    selectedDate: string;
    isLoading: boolean = true;

    constructor(private orderService: OrderService, private authService: AuthService) {
        const today = new Date();
        this.selectedDate = today.toISOString().split('T')[0];
    }

    ngOnInit(): void {
        this.loadOrders();
    }

    async loadOrders() {
        this.isLoading = true;
        try {
            const date = new Date(this.selectedDate);
            this.orders = await this.orderService.getOrdersByDate(date);
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            this.isLoading = false;
        }
    }
    callNumber(phoneNumber: string): void {
        window.location.href = `tel:${phoneNumber}`;
    }

    private getCurrentISTTimestamp(): string {
        const now = new Date();
        // Convert to IST (UTC+5:30)
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const istTime = new Date(now.getTime() + istOffset);
        return istTime.toISOString().replace('T', ' ').substring(0, 19) + ' IST';
    }

    updateStatus(order: any, newState: 'In Transit' | 'Delivered') {
        if (confirm(`Are you sure you want to mark this order as "${newState}"?`)) {
            // Create the new log entry
            const timestamp = this.getCurrentISTTimestamp();
            const oldState = this.ORDER_STATES[order.currentState - 1] || 'NA';
            const userCode = this.authService.getCurrentDistributorCode();
            const newLogEntry = `[${timestamp}] State changed from "${oldState}" to "${newState}" by ${userCode}`;

            // Ensure order.logs is an array before pushing
            if (!order.logs) {
                order.logs = [];
            }
            let newStatus = '';
            const newStateId = this.ORDER_STATES.indexOf(newState) + 1;
            if (newStateId == this.ORDER_STATES.length) {
                newStatus = 'complete';
            }
            else {
                newStatus = 'pending';
            }

            // Add the new log entry to the logs array
            order.logs.push(newLogEntry);


            // Continue with the update
            if (order.logs.length > 0) {
                this.orderService.updateOrderStatus(order.id, newStateId, newStatus, order.logs)
                    .then(() => { this.loadOrders(); })
                    .catch(err => console.error("Error updating status:", err));
            }
        }
    }
    getRcode(order: any): string {
        if (order.rcode.split('-')[1]) {
            return order.rcode.split('-')[1];
        }
        else {
            return order.rcode;
        }

    }


    ORDER_STATES = ['Order Received', 'In Transit', 'Delivered']
    getOrderState(order: any): string {
        const currentState: number = order.currentState
        const status = order.status;
        const baseState = this.ORDER_STATES[currentState - 1] || 'NA';
        return baseState
    }

    getOrderStateClass(order: any): string {
        const currentState: string = this.getOrderState(order);
        switch (currentState) {
            case 'Order Received':
                return 'pending';
            case 'In Transit':
                return 'in transit';
            case 'Delivered':
                return 'delivered';
            default:
                return 'unknown';
        }

    }
}