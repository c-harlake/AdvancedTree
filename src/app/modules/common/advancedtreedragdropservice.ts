import { Injectable } from '@angular/core';
import { Subject ,  Observable } from 'rxjs';
import { AdvancedTreeNode } from './advancedtreenode';
import { AdvancedTreeNodeDragEvent } from './advancedtreenodedragevent';

@Injectable()
export class AdvancedTreeDragDropService {

    private dragStartSource = new Subject<AdvancedTreeNodeDragEvent>();
    private dragStopSource = new Subject<AdvancedTreeNodeDragEvent>();

    dragStart$ = this.dragStartSource.asObservable();
    dragStop$ = this.dragStopSource.asObservable();

    startDrag(event: AdvancedTreeNodeDragEvent) {
        this.dragStartSource.next(event);
    }

    stopDrag(event: AdvancedTreeNodeDragEvent) {
        this.dragStopSource.next(event);
    }
}
