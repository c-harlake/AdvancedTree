import {
    NgModule, Component, Input, AfterContentInit, OnDestroy, Output, EventEmitter, OnInit,
    ContentChildren, QueryList, TemplateRef, Inject, ElementRef, forwardRef
} from '@angular/core';
import { Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedTreeNode } from '../common/advancedtreenode';
import { AdvancedSharedModule } from '../common/advancedshared';
import { PrimeAdvancedTemplate } from '../common/advancedshared';
import { AdvancedBlockableUI } from '../common/advancedblockableui';
import { AdvancedTreeDragDropService } from '../common/advancedtreedragdropservice';
import { Subscription } from 'rxjs/Subscription';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-atreeNode',
    templateUrl: 'advancedtree.component.html',
    styles: ['.editableInput { box-sizing: border-box; border-radius: 0.2em; border: 1px solid silver; height: 19px;}']
})
// tslint:disable-next-line:component-class-suffix
export class UIAdvancedTreeNode implements OnInit, OnDestroy {

    static ICON_CLASS = 'ui-treenode-icon fa fa-fw';

    @Input() node: AdvancedTreeNode;

    @Input() parentNode: AdvancedTreeNode;

    @Input() root: boolean;

    @Input() index: number;

    @Input() firstChild: boolean;

    @Input() lastChild: boolean;

    draghoverPrev: boolean;

    draghoverNext: boolean;

    draghoverNode: boolean;

    // makeEditableEmitter: EventEmitter<AdvancedTreeNode> = new EventEmitter<AdvancedTreeNode>();

    toMakeEditableSub: Subscription = null;

    isEditing = false; // for checking node is in editing mode or not

    private lastclickedNode: AdvancedTreeNode = null;
    private lastclickedDate = 0;

    constructor(@Inject(forwardRef(() => AdvancedTree)) public tree: AdvancedTree) { }

    ngOnInit() {
        this.node.parent = this.parentNode;

        this.toMakeEditableSub = this.tree.toMakeEditable.subscribe((advTreeNode: AdvancedTreeNode) => {
            this.makeEditable(advTreeNode);
        })
    }

    isNumeric(n: any): boolean {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    makeEditable = (node: AdvancedTreeNode) => {
        if (this.node === node) {
            let nodeId = node.id;
            node.editable = true;
            if (this.tree.lastNodeInEditingMode !== null) {
                this.tree.lastNodeInEditingMode.editable = false;       // would most likely not work because it is a new ref now
                this.tree.lastNodeInEditingMode = null;
            }
            this.tree.lastNodeInEditingMode = { ...node };
            setTimeout(() => {
                let element: HTMLInputElement = <HTMLInputElement>document.getElementById('editableInput_' + nodeId + '');
                if (element !== null) {
                    element.focus();
                    element.setSelectionRange(this.node.label.length, this.node.label.length);
                }
            }, 0);
        }
    }

    private changeOnBlur = (node: AdvancedTreeNode) => {
        const checkRegExp: RegExp = /^\s*$/;
        if (node.label.length > 0 && !checkRegExp.test(node.label)) {
            this.makeReadable(node);
        }
        else {
            this.cancelRename(node);
            this.makeReadable(node);
        }
    }

    private makeReadable = (node: AdvancedTreeNode) => {
        node.editable = false;
        if (this.tree.lastNodeInEditingMode !== null) {
            this.tree.lastNodeInEditingMode.editable = false;
            this.tree.lastNodeInEditingMode = null;
        }
    }

    cancelRename = (node: AdvancedTreeNode) => {
        node.label = this.tree.lastNodeInEditingMode.label;
        this.tree.onNodeRenamed.emit(node);
    }

    inputChangeHandler = (event: any, node: AdvancedTreeNode) => {
        node.label = event.target.value;
        this.tree.onNodeRenamed.emit(node);
    }

    eventHandler = (event, node: AdvancedTreeNode) => {
        const checkRegExp: RegExp = /^\s*$/;
        if (event.keyCode === 13) {
            if (node.label.length < 1) {
                // To avoid empty label
                return;
            }
            else if (checkRegExp.test(node.label)) {
                this.cancelRename(node);
                this.makeReadable(node);
            }
            else {
                this.makeReadable(node);
            }
        }
        if (event.keyCode === 27) {
            this.cancelRename(node);
            this.makeReadable(node);
        }
    }

    getIcon() {
        let icon: string;

        if (this.node.icon) {
            icon = this.node.icon;
        }
        else {
            icon = this.node.expanded && this.node.children && this.node.children.length ? this.node.expandedIcon : this.node.collapsedIcon;
        }
        return UIAdvancedTreeNode.ICON_CLASS + ' ' + icon;
    }

    isLeaf() {
        return this.node.leaf === false ? false : !(this.node.children && this.node.children.length);
    }

    toggle(event: Event) {
        if (this.node.expanded) {
            this.tree.onNodeCollapse.emit({ originalEvent: event, node: this.node });
        }
        else {
            this.tree.onNodeExpand.emit({ originalEvent: event, node: this.node });
        }
        this.node.expanded = !this.node.expanded;
    }

    onNodeClick(event: MouseEvent) {
        if (this.tree.inlineEdit === true) {
            let d = new Date();
            let currentDate = d.getTime()
            if (this.node !== null && this.lastclickedNode === this.node && this.isSelected() === true &&
                (currentDate - this.lastclickedDate) > this.tree.doubleClickTimeout &&
                (currentDate - this.lastclickedDate) < this.tree.slowDoubleClickTimeout) {
                this.makeEditable(this.node);
                this.lastclickedDate = 0;
                this.lastclickedNode = null;
                return;
            }
            else {
                this.lastclickedDate = currentDate;
                this.lastclickedNode = this.node;
                this.tree.onNodeClick(event, this.node);
            }
        }
        else {
            this.tree.onNodeClick(event, this.node);
        }
    }

    onNodeTouchEnd() {
        this.tree.onNodeTouchEnd();
    }

    onNodeRightClick(event: MouseEvent) {
        this.tree.onNodeRightClick(event, this.node);
    }

    isSelected() {
        return this.tree.isSelected(this.node);
    }

    isChecked() {
        return this.node.checked;
    }

    isPartialChecked() {
        return this.node.partialChecked;
    }

    onDropPoint(event: Event, position: number) {
        event.preventDefault();
        let dragNode = this.tree.dragNode;
        let dragNodeIndex = this.tree.dragNodeIndex;
        let dragNodeScope = this.tree.dragNodeScope;
        let isValidDropPointIndex = this.tree.dragNodeTree === this.tree ? (position === 1 || dragNodeIndex !== this.index - 1) : true;

        if (this.tree.allowDrop(dragNode, this.node, dragNodeScope) && isValidDropPointIndex) {
            let newNodeList = this.node.parent ? this.node.parent.children : this.tree.value;
            this.tree.dragNodeSubNodes.splice(dragNodeIndex, 1);
            let dropIndex = this.index;

            if (position < 0) {
                dropIndex = (this.tree.dragNodeSubNodes === newNodeList) ?
                    ((this.tree.dragNodeIndex > this.index) ? this.index : this.index - 1) : this.index;
                newNodeList.splice(dropIndex, 0, dragNode);
            }
            else {
                dropIndex = newNodeList.length;
                newNodeList.push(dragNode);
            }

            this.tree.dragDropService.stopDrag({
                node: dragNode,
                subNodes: this.node.parent ? this.node.parent.children : this.tree.value,
                index: dragNodeIndex
            });

            this.tree.onNodeDrop.emit({
                originalEvent: event,
                dragNode: dragNode,
                dropNode: this.node,
                dropIndex: dropIndex
            });
        }

        this.draghoverPrev = false;
        this.draghoverNext = false;
    }

    onDropPointDragOver(event) {
        event.dataTransfer.dropEffect = 'move';
        event.preventDefault();
    }

    onDropPointDragEnter(event: Event, position: number) {
        if (this.tree.allowDrop(this.tree.dragNode, this.node, this.tree.dragNodeScope)) {
            if (position < 0) {
                this.draghoverPrev = true;
            }
            else {
                this.draghoverNext = true;
            }
        }
    }

    onDropPointDragLeave(event: Event) {
        this.draghoverPrev = false;
        this.draghoverNext = false;
    }

    onDragStart(event) {
        if (this.tree.draggableNodes && this.node.draggable !== false) {
            event.dataTransfer.setData('text', 'data');

            this.tree.dragDropService.startDrag({
                tree: this,
                node: this.node,
                subNodes: this.node.parent ? this.node.parent.children : this.tree.value,
                index: this.index,
                scope: this.tree.draggableScope
            });
        }
        else {
            event.preventDefault();
        }
    }

    onDragStop(event) {
        this.tree.dragDropService.stopDrag({
            node: this.node,
            subNodes: this.node.parent ? this.node.parent.children : this.tree.value,
            index: this.index
        });
    }

    onDropNodeDragOver(event) {
        event.dataTransfer.dropEffect = 'move';
        if (this.tree.droppableNodes) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    onDropNode(event) {
        if (this.tree.droppableNodes && this.node.droppable !== false) {
            event.preventDefault();
            event.stopPropagation();
            let dragNode = this.tree.dragNode;
            if (this.tree.allowDrop(dragNode, this.node, this.tree.dragNodeScope)) {
                let dragNodeIndex = this.tree.dragNodeIndex;
                this.tree.dragNodeSubNodes.splice(dragNodeIndex, 1);

                if (this.node.children) {
                    this.node.children.push(dragNode);
                }
                else {
                    this.node.children = [dragNode];
                }
                this.tree.dragDropService.stopDrag({
                    node: dragNode,
                    subNodes: this.node.parent ? this.node.parent.children : this.tree.value,
                    index: this.tree.dragNodeIndex
                });

                this.tree.onNodeDrop.emit({
                    originalEvent: event,
                    dragNode: dragNode,
                    dropNode: this.node,
                    index: this.index
                });
            }
        }

        this.draghoverNode = false;
    }

    onDropNodeDragEnter(event) {
        if (this.tree.droppableNodes && this.node.droppable !== false
            && this.tree.allowDrop(this.tree.dragNode, this.node, this.tree.dragNodeScope)) {
            this.draghoverNode = true;
        }
    }

    onDropNodeDragLeave(event) {
        if (this.tree.droppableNodes) {
            let rect = event.currentTarget.getBoundingClientRect();
            if (event.x > rect.left + rect.width || event.x < rect.left
                || event.y >= Math.floor(rect.top + rect.height) || event.y < rect.top) {
                this.draghoverNode = false;
            }
        }
    }

    ngOnDestroy() {
        this.toMakeEditableSub.unsubscribe();
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-atree',
    template: `
        <div [ngClass]="{'ui-tree ui-widget ui-widget-content ui-corner-all':true,'ui-tree-selectable':selectionMode,
        'ui-treenode-dragover':dragHover,'ui-tree-loading': loading}" [ngStyle]="style" [class]="styleClass" *ngIf="!horizontal"
            (drop)="onDrop($event)" (dragover)="onDragOver($event)" (dragenter)="onDragEnter($event)" (dragleave)="onDragLeave($event)">
            <div class="ui-tree-loading-mask ui-widget-overlay" *ngIf="loading"></div>
            <div class="ui-tree-loading-content" *ngIf="loading">
                <i [class]="'fa fa-spin fa-2x ' + loadingIcon"></i>
            </div>
            <ul class="ui-tree-container" *ngIf="value">
                <p-atreeNode *ngFor="let node of value;let firstChild=first;let lastChild=last; let index=index" [node]="node"
                [firstChild]="firstChild" [lastChild]="lastChild" [index]="index"></p-atreeNode>
            </ul>
            <div class="ui-tree-empty-message" *ngIf="!loading && !value">{{emptyMessage}}</div>
        </div>
        <div [ngClass]="{'ui-tree ui-tree-horizontal ui-widget ui-widget-content ui-corner-all':true,'ui-tree-selectable':selectionMode}"
          [ngStyle]="style" [class]="styleClass" *ngIf="horizontal">
            <div class="ui-tree-loading ui-widget-overlay" *ngIf="loading"></div>
            <div class="ui-tree-loading-content" *ngIf="loading">
                <i [class]="'fa fa-spin fa-2x ' + loadingIcon"></i>
            </div>
            <table *ngIf="value&&value[0]">
                <p-atreeNode [node]="value[0]" [root]="true"></p-atreeNode>
            </table>
            <div class="ui-tree-empty-message" *ngIf="!loading && !value">{{emptyMessage}}</div>
        </div>
    `
})
// tslint:disable-next-line:component-class-suffix
export class AdvancedTree implements OnInit, AfterContentInit, OnDestroy, AdvancedBlockableUI {

    @Input() value: AdvancedTreeNode[];

    @Input() selectionMode: string;

    @Input() checkbox = false;

    @Input() inlineEdit = false;

    @Input() doubleClickTimeout: number = 250;

    @Input() slowDoubleClickTimeout: number = 1000;

    @Output() selectionChange: EventEmitter<any> = new EventEmitter();
    @Output() checkedChange: EventEmitter<any> = new EventEmitter();

    @Output() onNodeDblClick: EventEmitter<any> = new EventEmitter();

    @Output() onNodeSelect: EventEmitter<any> = new EventEmitter();

    @Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();

    @Output() onNodeChecked: EventEmitter<any> = new EventEmitter();

    @Output() onNodeUnchecked: EventEmitter<any> = new EventEmitter();

    @Output() onNodeExpand: EventEmitter<any> = new EventEmitter();

    @Output() onNodeCollapse: EventEmitter<any> = new EventEmitter();

    @Output() onNodeContextMenuSelect: EventEmitter<any> = new EventEmitter();

    @Output() onNodeDrop: EventEmitter<any> = new EventEmitter();

    @Output() onNodeRenamed: EventEmitter<AdvancedTreeNode> = new EventEmitter();

    @Input() style: any;

    @Input() styleClass: string;

    @Input() contextMenu: any;

    @Input() layout = 'vertical';

    @Input() draggableScope: any;

    @Input() droppableScope: any;

    @Input() draggableNodes: boolean;

    @Input() droppableNodes: boolean;

    @Input() metaKeySelection = true;

    // @Input() propagateSelectionUp: boolean = false;

    @Input() propagateSelectionDown = false;

    @Input() propagateCheckedUp = false;

    @Input() propagateCheckedDown = false;

    @Input() loading: boolean;

    @Input() loadingIcon = 'fa-circle-o-notch';

    @Input() emptyMessage = 'No records found';

    @ContentChildren(PrimeAdvancedTemplate) templates: QueryList<any>;

    public templateMap: any;

    public nodeTouched: boolean;

    public dragNodeTree: AdvancedTree;

    public dragNode: AdvancedTreeNode;

    public dragNodeSubNodes: AdvancedTreeNode[];

    public dragNodeIndex: number;

    public dragNodeScope: any;

    public dragHover: boolean;

    public dragStartSubscription: Subscription;

    public dragStopSubscription: Subscription;

    public toMakeEditable: EventEmitter<AdvancedTreeNode> = new EventEmitter<AdvancedTreeNode>();

    public lastNodeInEditingMode: AdvancedTreeNode = null;

    private clicks = 0;

    private mapTreeNodeIdXSelection = new Map<String, AdvancedTreeNode>();

    constructor(public el: ElementRef, @Optional() public dragDropService: AdvancedTreeDragDropService) { }

    ngOnInit() {
        if (this.droppableNodes) {
            this.dragStartSubscription = this.dragDropService.dragStart$.subscribe(
                event => {
                    this.dragNodeTree = event.tree;
                    this.dragNode = event.node;
                    this.dragNodeSubNodes = event.subNodes;
                    this.dragNodeIndex = event.index;
                    this.dragNodeScope = event.scope;
                });

            this.dragStopSubscription = this.dragDropService.dragStop$.subscribe(
                event => {
                    this.dragNodeTree = null;
                    this.dragNode = null;
                    this.dragNodeSubNodes = null;
                    this.dragNodeIndex = null;
                    this.dragNodeScope = null;
                    this.dragHover = false;
                });
        }
    }

    get horizontal(): boolean {
        return this.layout === 'horizontal';
    }

    ngAfterContentInit() {
        if (this.templates.length) {
            this.templateMap = {};
        }

        this.templates.forEach((item) => {
            this.templateMap[item.name] = item.template;
        });
    }

    onNodeClick(event: MouseEvent, node: AdvancedTreeNode) {
        if (node.editable) {
            return false;
        }
        this.clicks++;

        if (this.clicks === 1) {
            setTimeout(() => {
                if (this.clicks === 1) {
                    this.onNodeSingleClick(event, node);
                }
                else {
                    this.onNodeDblClick.emit({ originalEvent: event, node: node });
                }
                this.clicks = 0;
            }, this.doubleClickTimeout);
        }
    }

    onNodeSingleClick(event: MouseEvent, node: AdvancedTreeNode) {
        let eventTarget = (<Element>event.target);
        if (eventTarget.className && eventTarget.className.indexOf('ui-tree-toggler') === 0) {
            return;
        }
        else if (eventTarget.className && eventTarget.className.indexOf('ui-chkbox') === 0) {
            if (node.checkable === false) {
                return;
            }

            let checked = node.checked;
            if (this.isCheckboxMode()) {
                if (checked) {
                    if (this.propagateCheckedDown) {
                        this.propagateChkDown(node, false);
                    }
                    else {
                        node.checked = false;
                    }
                    if (this.propagateCheckedUp && node.parent) {
                        this.propagateChkUp(node.parent, false);
                    }

                    this.onNodeUnchecked.emit({ originalEvent: event, node: node });
                }
                else {
                    if (this.propagateCheckedDown) {
                        this.propagateChkDown(node, true);
                    }
                    else {
                        if (node.partialChecked) {
                            node.partialChecked = false;
                        }
                        node.checked = true;
                    }
                    if (this.propagateCheckedUp && node.parent) {
                        this.propagateChkUp(node.parent, true);
                    }

                    this.onNodeChecked.emit({ originalEvent: event, node: node });
                }
            }
        }
        else if (this.selectionMode) {
            if (node.selectable === false) {
                return;
            }
            let metaKey = (event.metaKey || event.ctrlKey);

            if (!this.isSelected(node)) { // If node is not selected
                // unselect other nodes, if control is not pressed
                if (!metaKey) {
                    this.mapTreeNodeIdXSelection.forEach((value: AdvancedTreeNode, key: string) => {
                        const selectedNode: AdvancedTreeNode = value;
                        selectedNode.selected = false;
                        if (this.propagateSelectionDown) {
                            this.propagateDown(selectedNode, false);
                        }
                    });
                    this.mapTreeNodeIdXSelection.clear();
                }
                // Select the clicked node
                node.selected = true;
                this.mapTreeNodeIdXSelection.set(node.id, node);
                if (this.propagateSelectionDown) {
                    this.propagateDown(node, true);
                }
                this.onNodeSelect.emit({ originalEvent: event, node: node });
            } else {  // If node is already selected
                this.mapTreeNodeIdXSelection.delete(node.id);
                node.selected = false;
                if (this.propagateSelectionDown) {
                    this.propagateDown(node, false);
                }
                this.onNodeUnselect.emit({ originalEvent: event, node: node });
            }
            this.selectionChange.emit(this.mapTreeNodeIdXSelection);
        }
        this.nodeTouched = false;
    }

    onNodeTouchEnd() {
        this.nodeTouched = true;
    }

    onNodeRightClick(event: MouseEvent, node: AdvancedTreeNode) {
        if (this.contextMenu) {
            let eventTarget = (<Element>event.target);

            if (eventTarget.className && eventTarget.className.indexOf('ui-tree-toggler') === 0) {
                return;
            }
            else if (eventTarget.className && eventTarget.className.indexOf('ui-chkbox') === 0) {
                let checked = node.checked;

                if (!checked) {
                    this.checkedChange.emit([node]);
                }
                // this.contextMenu.show(event);
                // this.onNodeContextMenuSelect.emit({originalEvent: event, node: node});
            }
            else {
                let selected: boolean = this.mapTreeNodeIdXSelection.has(node.id);

                if (!selected) {
                    this.selectionChange.emit(this.mapTreeNodeIdXSelection);
                }

                this.contextMenu.show(event);
                this.onNodeContextMenuSelect.emit({ originalEvent: event, node: node });
            }
        }
    }



    propagateDown(node: AdvancedTreeNode, select: boolean) {
        if (node.children && node.children.length) {
            for (let child of node.children) {
                child.selected = select;
                this.propagateDown(child, select);
            }
        }
    }

    propagateChkUp(node: AdvancedTreeNode, check: boolean) {
        if (node.children && node.children.length) {
            let checkedCount = 0;
            let childPartialChecked = false;
            for (let child of node.children) {
                if (child.checked) {
                    checkedCount++;
                }
                else if (child.partialChecked) {
                    childPartialChecked = true;
                }
            }

            if (check && checkedCount === node.children.length) {
                node.checked = true;
                node.partialChecked = false;
            }
            else {
                if (!check) {
                    node.checked = false;
                }

                if (childPartialChecked || checkedCount > 0 && checkedCount !== node.children.length) {
                    node.partialChecked = true;
                }
                else {
                    node.partialChecked = false;
                }
            }
        }

        let parent = node.parent;
        if (parent) {
            this.propagateChkUp(parent, check);
        }
    }

    propagateChkDown(node: AdvancedTreeNode, check: boolean) {
        node.checked = check;
        node.partialChecked = false;

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateChkDown(child, check);
            }
        }
    }

    isSelected(node: AdvancedTreeNode) {
        return node.selected;
    }

    isCheckboxMode() {
        return this.checkbox;
    }

    getTemplateForNode(node: AdvancedTreeNode): TemplateRef<any> {
        if (this.templateMap) {
            return node.type ? this.templateMap[node.type] : this.templateMap['default'];
        }
        else {
            return null;
        }
    }

    onDragOver(event) {
        if (this.droppableNodes && (!this.value || this.value.length === 0)) {
            event.dataTransfer.dropEffect = 'move';
            event.preventDefault();
        }
    }

    makeNodeEditable(advTreeNode: AdvancedTreeNode) {
        this.toMakeEditable.emit(advTreeNode);
    }

    onDrop(event) {
        if (this.droppableNodes && (!this.value || this.value.length === 0)) {
            event.preventDefault();
            let dragNode = this.dragNode;
            if (this.allowDrop(dragNode, null, this.dragNodeScope)) {
                let dragNodeIndex = this.dragNodeIndex;
                this.dragNodeSubNodes.splice(dragNodeIndex, 1);
                this.value = this.value || [];
                this.value.push(dragNode);

                this.dragDropService.stopDrag({
                    node: dragNode
                });
            }
        }
    }

    onDragEnter(event) {
        if (this.droppableNodes && this.allowDrop(this.dragNode, null, this.dragNodeScope)) {
            this.dragHover = true;
        }
    }

    onDragLeave(event) {
        if (this.droppableNodes) {
            let rect = event.currentTarget.getBoundingClientRect();
            if (event.x > rect.left + rect.width || event.x < rect.left || event.y > rect.top + rect.height || event.y < rect.top) {
                this.dragHover = false;
            }
        }
    }

    allowDrop(dragNode: AdvancedTreeNode, dropNode: AdvancedTreeNode, dragNodeScope: any): boolean {
        if (!dragNode) {
            // prevent random html elements to be dragged
            return false;
        }
        else if (this.isValidDragScope(dragNodeScope)) {
            let allow = true;
            if (dropNode) {
                if (dragNode === dropNode) {
                    allow = false;
                }
                else {
                    let parent = dropNode.parent;
                    while (parent != null) {
                        if (parent === dragNode) {
                            allow = false;
                            break;
                        }
                        parent = parent.parent;
                    }
                }
            }

            return allow;
        }
        else {
            return false;
        }
    }

    isValidDragScope(dragScope: any): boolean {
        let dropScope = this.droppableScope;

        if (dropScope) {
            if (typeof dropScope === 'string') {
                if (typeof dragScope === 'string') {
                    return dropScope === dragScope;
                }
                else if (dragScope instanceof Array) {
                    return (<Array<any>>dragScope).indexOf(dropScope) !== -1;
                }
            }
            else if (dropScope instanceof Array) {
                if (typeof dragScope === 'string') {
                    return (<Array<any>>dropScope).indexOf(dragScope) !== -1;
                }
                else if (dragScope instanceof Array) {
                    for (let s of dropScope) {
                        for (let ds of dragScope) {
                            if (s === ds) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }
        else {
            return true;
        }
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    // expandToNode(node: AdvancedTreeNode) {
    //     const pathToNode: AdvancedTreeNode[] = this.findPathToNode(node);
    //     if (pathToNode) {
    //         pathToNode.forEach( node => node.expanded = true );
    //     }
    // }

    // findPathToNode(node: AdvancedTreeNode): AdvancedTreeNode[] {
    //     return AdvancedTree.findPathToNodeRecursive(node, this.value);
    // }

    // private static findPathToNodeRecursive(searchingFor: AdvancedTreeNode, searchingIn: AdvancedTreeNode[]): AdvancedTreeNode[] {
    //     if (!searchingIn || searchingIn.length == 0) {
    //         return undefined;
    //     }

    //     for (let i = 0; i < searchingIn.length; i++) {
    //         if (searchingFor == searchingIn[i]) {
    //             return [searchingIn[i]];
    //         }
    //         const path: AdvancedTreeNode[] = AdvancedTree.findPathToNodeRecursive(searchingFor, searchingIn[i].children);
    //         if (path) {
    //             path.unshift(searchingIn[i]);
    //             return path;
    //         }
    //     }

    //     return undefined;
    // }

    ngOnDestroy() {
        if (this.dragStartSubscription) {
            this.dragStartSubscription.unsubscribe();
        }

        if (this.dragStopSubscription) {
            this.dragStopSubscription.unsubscribe();
        }
    }
}
// @NgModule({
//     imports: [CommonModule],
//     exports: [AdvancedTree, AdvancedSharedModule],
//     declarations: [AdvancedTree, UIAdvancedTreeNode]
// })
// export class AdvancedTreeModule { }
