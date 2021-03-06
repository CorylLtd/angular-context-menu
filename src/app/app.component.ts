import { Component, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { fromEvent, Subscription } from 'rxjs';
import { take, filter } from 'rxjs/operators';

export interface MenuItem {
  text: string;
  handler?: () => void;
  subItems?: Array<MenuItem>
}

const menuItems: Array<MenuItem> = [
  {
    text: 'Item 1',
  },
  {
    text: 'Item 2',
    subItems: [
      {
        text: 'Item 2.1'
      },
      {
        text: 'Item 2.2'
      },
      {
        text: 'Item 2.3',
        subItems: [
          {
            text: 'Item 2.3.1'
          },
          {
            text: 'Item 2.3.2'
          }
        ]
      },
    ]
  },
  {
    text: 'Item 3',
    subItems: [
      {
        text: 'Item 3.1'
      }
    ]
  },
  {
    text: 'Item 4'
  }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  menuItems = menuItems;

  sub: Subscription;

  users = Array.from({ length: 10 }, () => ({
    name: 'Wowser!!'
  }));

  @ViewChild('userMenu') userMenu: TemplateRef<any>;

  overlayRef: OverlayRef | null;

  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef) {
  }

  open({ x, y }: MouseEvent, user) {
    this.close();

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x, y })
      .withViewportMargin(8)
      .withGrowAfterOpen(true)
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef, {
      $implicit: this.menuItems
    }));

    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      ).subscribe(() => this.close())
  }

  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
