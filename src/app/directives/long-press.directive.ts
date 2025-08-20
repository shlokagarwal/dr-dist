import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';

@Directive({
    selector: '[appLongPress]',
    standalone: true, // Make the directive standalone
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
    onMouseDown() { this.mouseDown$.next(); }

    @HostListener('mouseup')
    onMouseUp() { this.mouseUp$.next(); }

    @HostListener('mouseleave')
    onMouseLeave() { this.mouseUp$.next(); }

    @HostListener('touchstart')
    onTouchStart() { this.mouseDown$.next(); }

    @HostListener('touchend')
    onTouchEnd() { this.mouseUp$.next(); }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}