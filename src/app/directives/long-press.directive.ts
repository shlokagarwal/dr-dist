import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';

@Directive({
    selector: '[appLongPress]',
    standalone: true,
})
export class LongPressDirective {
    @Output() longPress = new EventEmitter<void>();

    private mouseDown$ = new Subject<void>();
    private mouseUp$ = new Subject<void>();
    private subscription: Subscription;

    constructor() {
        this.subscription = this.mouseDown$.pipe(
            switchMap(() => timer(700).pipe(takeUntil(this.mouseUp$))),
            filter(value => value !== undefined)
        ).subscribe(() => {
            this.longPress.emit();
        });
    }

    @HostListener('mousedown')
    @HostListener('touchstart', ['$event'])
    onMouseDown(event?: Event) {
        if (event) {
            event.preventDefault(); // Prevent default touch behavior
        }
        this.mouseDown$.next();
    }

    @HostListener('mouseup')
    @HostListener('mouseleave')
    @HostListener('touchend')
    onMouseUp() {
        this.mouseUp$.next();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}