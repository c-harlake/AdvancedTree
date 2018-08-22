import {NgModule, Component, Input, AfterContentInit, OnDestroy, Output, EventEmitter, OnInit, EmbeddedViewRef, ViewContainerRef,
    ContentChildren, QueryList, TemplateRef, Inject, ElementRef, forwardRef, Host} from '@angular/core';
import {Optional} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdvancedTreeNode} from '../common/advancedtreenode';
import {AdvancedSharedModule} from '../common/advancedshared';
import {PrimeAdvancedTemplate} from '../common/advancedshared';
import {AdvancedBlockableUI} from '../common/advancedblockableui';
import {AdvancedTreeDragDropService} from '../common/advancedtreedragdropservice';
import {Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'p-atreeNode',
    template: `
        <ng-template [ngIf]="node">
            <li *ngIf="tree.droppableNodes" class="ui-treenode-droppoint" [ngClass]="{'ui-treenode-droppoint-active ui-state-highlight':draghoverPrev}"
            (drop)="onDropPoint($event,-1)" (dragover)="onDropPointDragOver($event)" (dragenter)="onDropPointDragEnter($event,-1)" (dragleave)="onDropPointDragLeave($event)"></li>
            <li *ngIf="!tree.horizontal" [ngClass]="['ui-treenode',node.styleClass||'', isLeaf() ? 'ui-treenode-leaf': '']">
                <div class="ui-treenode-content" (click)="onNodeClick($event)" (contextmenu)="onNodeRightClick($event)" (touchend)="onNodeTouchEnd()"
                    (drop)="onDropNode($event)" (dragover)="onDropNodeDragOver($event)" (dragenter)="onDropNodeDragEnter($event)" (dragleave)="onDropNodeDragLeave($event)"
                    [ngClass]="{'ui-treenode-selectable':tree.selectionMode && node.selectable !== false,'ui-treenode-dragover':draghoverNode, 'ui-treenode-content-selected':isSelected()}" [draggable]="tree.draggableNodes" (dragstart)="onDragStart($event)" (dragend)="onDragStop($event)">
                    <span class="ui-tree-toggler  fa fa-fw" [ngClass]="{'fa-caret-right':!node.expanded,'fa-caret-down':node.expanded}"
                            (click)="toggle($event)"></span
                    ><div class="ui-chkbox" *ngIf="tree.checkbox"><div class="ui-chkbox-box ui-widget ui-corner-all ui-state-default">
                        <span class="ui-chkbox-icon ui-clickable fa" 
                            [ngClass]="{'fa-check':isChecked(),'fa-minus':node.partialChecked}"></span></div></div
                    ><span [class]="getIcon()" *ngIf="node.icon||node.expandedIcon||node.collapsedIcon"></span
                    ><span class="ui-treenode-label ui-corner-all" 
                        [ngClass]="{'ui-state-highlight':isSelected()}">
                            <span *ngIf="!tree.getTemplateForNode(node)" id="{{node.id}}">{{node.label}}</span>
                            <span *ngIf="tree.getTemplateForNode(node)">
                                <ng-container *ngTemplateOutlet="tree.getTemplateForNode(node); context: {$implicit: node}"></ng-container>
                            </span>
                    </span>
                </div>
                <ul class="ui-treenode-children" style="display: none;" *ngIf="node.children && node.expanded" [style.display]="node.expanded ? 'block' : 'none'">
                    <p-atreeNode *ngFor="let childNode of node.children;let firstChild=first;let lastChild=last; let index=index" [node]="childNode" [parentNode]="node"
                        [firstChild]="firstChild" [lastChild]="lastChild" [index]="index"></p-atreeNode>
                </ul>
            </li>
            <li *ngIf="tree.droppableNodes&&lastChild" class="ui-treenode-droppoint" [ngClass]="{'ui-treenode-droppoint-active ui-state-highlight':draghoverNext}"
            (drop)="onDropPoint($event,1)" (dragover)="onDropPointDragOver($event)" (dragenter)="onDropPointDragEnter($event,1)" (dragleave)="onDropPointDragLeave($event)"></li>
            <table *ngIf="tree.horizontal" [class]="node.styleClass">
                <tbody>
                    <tr>
                        <td class="ui-treenode-connector" *ngIf="!root">
                            <table class="ui-treenode-connector-table">
                                <tbody>
                                    <tr>
                                        <td [ngClass]="{'ui-treenode-connector-line':!firstChild}"></td>
                                    </tr>
                                    <tr>
                                        <td [ngClass]="{'ui-treenode-connector-line':!lastChild}"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td class="ui-treenode" [ngClass]="{'ui-treenode-collapsed':!node.expanded}">
                            <div class="ui-treenode-content ui-state-default ui-corner-all" 
                                [ngClass]="{'ui-treenode-selectable':tree.selectionMode,'ui-state-highlight':isSelected()}" (click)="onNodeClick($event)" (contextmenu)="onNodeRightClick($event)"
                                (touchend)="onNodeTouchEnd()">
                                <span class="ui-tree-toggler fa fa-fw" [ngClass]="{'fa-plus':!node.expanded,'fa-minus':node.expanded}" *ngIf="!isLeaf()"
                                        (click)="toggle($event)"></span
                                ><span [class]="getIcon()" *ngIf="node.icon||node.expandedIcon||node.collapsedIcon"></span
                                ><span class="ui-treenode-label ui-corner-all">
                                        <span *ngIf="!tree.getTemplateForNode(node)" id="{{node.id}}">{{node.label}}</span>
                                        <span *ngIf="tree.getTemplateForNode(node)">
                                        <ng-container *ngTemplateOutlet="tree.getTemplateForNode(node); context: {$implicit: node}"></ng-container>
                                        </span>
                                </span>
                            </div>
                        </td>
                        <td class="ui-treenode-children-container" *ngIf="node.children && node.expanded" [style.display]="node.expanded ? 'table-cell' : 'none'">
                            <div class="ui-treenode-children">
                                <p-atreeNode *ngFor="let childNode of node.children;let firstChild=first;let lastChild=last;" [node]="childNode" 
                                        [firstChild]="firstChild" [lastChild]="lastChild"></p-atreeNode>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </ng-template>
    `
})
export class UIAdvancedTreeNode implements OnInit {

    static ICON_CLASS: string = 'ui-treenode-icon fa fa-fw';

    @Input() node: AdvancedTreeNode;

    @Input() parentNode: AdvancedTreeNode;

    @Input() root: boolean;

    @Input() index: number;

    @Input() firstChild: boolean;

    @Input() lastChild: boolean;

    draghoverPrev: boolean;

    draghoverNext: boolean;

    draghoverNode: boolean;

    constructor(@Inject(forwardRef(() => AdvancedTree)) public tree: AdvancedTree) {}

    ngOnInit() {
        this.node.parent = this.parentNode;
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
            this.tree.onNodeCollapse.emit({originalEvent: event, node: this.node});
        }
        else {
            this.tree.onNodeExpand.emit({originalEvent: event, node: this.node});
        }
        this.node.expanded = !this.node.expanded;
    }

    onNodeClick(event: MouseEvent) {
        this.tree.onNodeClick(event, this.node);
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
        return this.tree.isChecked(this.node);
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
                dropIndex = (this.tree.dragNodeSubNodes === newNodeList) ? ((this.tree.dragNodeIndex > this.index) ? this.index : this.index - 1) : this.index;
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
            event.dataTransfer.setData("text", "data");

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
}

@Component({
    selector: 'p-atree',
    template: `
        <div [ngClass]="{'ui-tree ui-widget ui-widget-content ui-corner-all':true,'ui-tree-selectable':selectionMode,'ui-treenode-dragover':dragHover,'ui-tree-loading': loading}" [ngStyle]="style" [class]="styleClass" *ngIf="!horizontal"
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
        <div [ngClass]="{'ui-tree ui-tree-horizontal ui-widget ui-widget-content ui-corner-all':true,'ui-tree-selectable':selectionMode}"  [ngStyle]="style" [class]="styleClass" *ngIf="horizontal">
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
export class AdvancedTree implements OnInit, AfterContentInit, OnDestroy, AdvancedBlockableUI {

    @Input() value: AdvancedTreeNode[];

    @Input() selectionMode: string;

    @Input() checkbox: boolean = false;

    @Input() selection: any;

    @Input() checked: any;

    @Input() partialchecked: any;

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

    @Input() style: any;

    @Input() styleClass: string;

    @Input() contextMenu: any;

    @Input() layout: string = 'vertical';

    @Input() draggableScope: any;

    @Input() droppableScope: any;

    @Input() draggableNodes: boolean;

    @Input() droppableNodes: boolean;

    @Input() metaKeySelection: boolean = true;

    // @Input() propagateSelectionUp: boolean = false;

    @Input() propagateSelectionDown: boolean = true;

    @Input() propagateCheckedUp: boolean = true;

    @Input() propagateCheckedDown: boolean = true;

    @Input() loading: boolean;

    @Input() loadingIcon: string = 'fa-circle-o-notch';

    @Input() emptyMessage: string = 'No records found';

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

    private clicks: number = 0;

    constructor(public el: ElementRef, @Optional() public dragDropService: AdvancedTreeDragDropService) {}

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
        this.clicks++;
        if ( this.clicks === 1 ) {
            setTimeout( () => {
                if ( this.clicks === 1 ) {
                    // alert('SINGLECLICK');
                    this.onNodeSingleClick(event, node);
                }
                else {
                    // alert('DOUBLECLICK');
                    this.onNodeDblClick.emit({originalEvent: event, node: node});
                }
                this.clicks = 0;
            }, 250);
        }
    }

    onNodeSingleClick(event: MouseEvent, node: AdvancedTreeNode) {
        let eventTarget = (<Element> event.target);


        if (eventTarget.className && eventTarget.className.indexOf('ui-tree-toggler') === 0) {
            return;
        }
        else if (eventTarget.className && eventTarget.className.indexOf('ui-chkbox') === 0) {
            if (node.selectable === false) {
                return;
            }

            let index = this.findIndexInChecked(node);
            let checked = (index >= 0);
            if (this.isCheckboxMode()) {
                if (checked) {
                    if (this.propagateCheckedDown) {
                        this.propagateChkDown(node, false);
                    }
                    else {
                        this.checked = this.checked.filter((val, i) => i !== index);
                    }
                    if (this.propagateCheckedUp && node.parent) {
                        this.propagateChkUp(node.parent, false);
                    }

                    this.checkedChange.emit(this.checked);
                    this.onNodeUnchecked.emit({originalEvent: event, node: node});
                }
                else {
                    if (this.propagateCheckedDown) {
                        this.propagateChkDown(node, true);
                    }
                    else {
                        this.checked = [...this.checked || [], node];
                    }
                    if (this.propagateCheckedUp && node.parent) {
                        this.propagateChkUp(node.parent, true);
                    }

                    this.checkedChange.emit(this.checked);
                    this.onNodeChecked.emit({originalEvent: event, node: node});
                }
            }
        }
        else if (this.selectionMode) {
            if (node.selectable === false) {
                return;
            }
            let index = this.findIndexInSelection(node);
            let selected = (index >= 0);
            let metaSelection = this.nodeTouched ? false : this.metaKeySelection;
            let metaKey = (event.metaKey || event.ctrlKey);

            if ( selected ) {
                // node already selected
                if ( this.isSingleSelectionMode() ) {
                    // single selection, just clear selection
                    this.selection = [];
                    this.selectionChange.emit(this.selection);
                    this.onNodeUnselect.emit({originalEvent: event, node: node});
                }
                else {
                    if ( metaSelection ) {
                        if ( metaKey ) {
                            // metakey multiselection, remove node from selection
                            this.selection = this.selection.filter((val, i) => i !== index);
                            if ( this.propagateSelectionDown ) {
                                this.propagateDown(node, false);
                            }
                            this.selectionChange.emit(this.selection);
                            this.onNodeUnselect.emit({originalEvent: event, node: node});
                        }
                        else {
                            // multiselection, just keep this node selected

                            // ++++ explorer like behaviour ++++
                            // this.selection = [...[], node];
                            // if ( this.propagateSelectionDown ) {
                            //     this.propagateDown(node, true);
                            // }
                            // ++++ explorer like behaviour end ++++

                            // ++++ novo like behaviour ++++
                            this.selection = this.selection.filter((val, i) => i !== index);
                            if ( this.propagateSelectionDown ) {
                                this.propagateDown(node, false);
                            }
                            // ++++ novo like behaviour end ++++
                            this.selectionChange.emit(this.selection);
                            this.onNodeSelect.emit({originalEvent: event, node: node});
                        }
                    }
                    else {
                        // multiselection, remove node from selection
                        this.selection = this.selection.filter((val, i) => i !== index);
                        if ( this.propagateSelectionDown ) {
                            this.propagateDown(node, false);
                        }
                        this.selectionChange.emit(this.selection);
                        this.onNodeUnselect.emit({originalEvent: event, node: node});
                    }
                }
            }
            else {
                // node not selected
                if ( this.isSingleSelectionMode() ) {
                    // single selection, just set node as selection
                    this.selection = node;
                    this.selectionChange.emit(this.selection);
                    this.onNodeSelect.emit({originalEvent: event, node: node});
                }
                else {
                    if ( metaSelection ) {
                        if ( metaKey ) {
                            // metakey multiselection, add node to selection
                            this.selection = this.selection || [];
                            this.selection = [...this.selection, node];
                            if ( this.propagateSelectionDown ) {
                                this.propagateDown(node, true);
                            }
                            this.selectionChange.emit(this.selection);
                            this.onNodeSelect.emit({originalEvent: event, node: node});
                        }
                        else {
                            // metakey multiselection, just set node as selected
                            this.selection = [];
                            this.selection = [...this.selection, node];
                            if ( this.propagateSelectionDown ) {
                                this.propagateDown(node, true);
                            }
                            this.selectionChange.emit(this.selection);
                            this.onNodeSelect.emit({originalEvent: event, node: node});
                        }
                    }
                    else {
                        // multiselection, just add node to selection
                        this.selection = this.selection || [];
                        this.selection = [...this.selection, node];
                        if ( this.propagateSelectionDown ) {
                            this.propagateDown(node, true);
                        }
                        this.selectionChange.emit(this.selection);
                        this.onNodeSelect.emit({originalEvent: event, node: node});
                    }
                }
            }
        }

        this.nodeTouched = false;
    }

    onNodeTouchEnd() {
        this.nodeTouched = true;
    }

    onNodeRightClick(event: MouseEvent, node: AdvancedTreeNode) {
        if (this.contextMenu) {
            let eventTarget = (<Element> event.target);

            if (eventTarget.className && eventTarget.className.indexOf('ui-tree-toggler') === 0) {
                return;
            }
            else if (eventTarget.className && eventTarget.className.indexOf('ui-chkbox') === 0) {
                let index = this.findIndexInChecked(node);
                let checked = (index >= 0);

                if (!checked) {
                    if (this.isSingleSelectionMode()) {
                        this.checkedChange.emit([node]);
                    }
                    else {
                        this.checkedChange.emit([node]);
                    }
                }
                // this.contextMenu.show(event);
                // this.onNodeContextMenuSelect.emit({originalEvent: event, node: node});
            }
            else {
                let index = this.findIndexInSelection(node);
                let selected = (index >= 0);

                if (!selected) {
                    if (this.isSingleSelectionMode()) {
                        this.selectionChange.emit(node);
                    }
                    else {
                        this.selectionChange.emit([node]);
                    }
                }

                this.contextMenu.show(event);
                this.onNodeContextMenuSelect.emit({originalEvent: event, node: node});
            }
        }
    }

    findIndexInSelection(node: AdvancedTreeNode) {
        let index: number = -1;

        if (this.selectionMode && this.selection) {
            if (this.isSingleSelectionMode()) {
                index = (this.selection === node) ? 0 : - 1;
            }
            else {

                for (let i = 0; i  < this.selection.length; i++) {
                    if (this.selection[i] === node) {
                        index = i;
                        break;
                    }
                }
            }
        }

        return index;
    }

    findIndexInChecked(node: AdvancedTreeNode) {
        let index: number = -1;

        if (this.selectionMode && this.checked) {
            if (this.isCheckboxMode()) {
                for (let i = 0; i  < this.checked.length; i++) {
                    if (this.checked[i] === node) {
                        index = i;
                        break;
                    }
                }
            }
        }

        return index;
    }

    propagateUp(node: AdvancedTreeNode, select: boolean) {
        if (node.children && node.children.length) {
            let selectedCount: number = 0;
            let childPartialSelected: boolean = false;
            for (let child of node.children) {
                if (this.isSelected(child)) {
                    selectedCount++;
                }
                // else if (child.partialSelected) {
                    // childPartialSelected = true;
                // }
            }

            if (select && selectedCount === node.children.length) {
                this.selection = [...this.selection || [], node];
                // node.partialSelected = false;
            }
            else {
                if (!select) {
                    let index = this.findIndexInSelection(node);
                    if (index >= 0) {
                        this.selection = this.selection.filter((val, i) => i !== index);
                    }
                }

                if (childPartialSelected || selectedCount > 0 && selectedCount !== node.children.length) {
                    // node.partialSelected = true;
                }
                else {
                    // node.partialSelected = false;
                }
            }
        }

        let parent = node.parent;
        if (parent) {
            this.propagateUp(parent, select);
        }
    }

    propagateDown(node: AdvancedTreeNode, select: boolean) {
        let index = this.findIndexInSelection(node);

        if (select && index === -1) {
            this.selection = [...this.selection || [], node];
        }
        else if (!select && index > -1) {
            this.selection = this.selection.filter((val, i) => i !== index);
        }

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateDown(child, select);
            }
        }
    }

    propagateChkUp(node: AdvancedTreeNode, check: boolean) {
        if (node.children && node.children.length) {
            let checkedCount: number = 0;
            let childPartialChecked: boolean = false;
            for (let child of node.children) {
                if (this.isChecked(child)) {
                    checkedCount++;
                }
                else if (child.partialChecked) {
                    childPartialChecked = true;
                }
            }

            if (check && checkedCount === node.children.length) {
                this.checked = [...this.checked || [], node];
                node.partialChecked = false;
            }
            else {
                if (!check) {
                    let index = this.findIndexInChecked(node);
                    if (index >= 0) {
                        this.checked = this.checked.filter((val, i) => i !== index);
                    }
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
        let index = this.findIndexInChecked(node);

        if (check && index === -1) {
            this.checked = [...this.checked || [], node];
        }
        else if (!check && index > -1) {
            this.checked = this.checked.filter((val, i) => i !== index);
        }

        node.partialChecked = false;

        if (node.children && node.children.length) {
            for (let child of node.children) {
                this.propagateChkDown(child, check);
            }
        }
    }

    isSelected(node: AdvancedTreeNode) {
        return this.findIndexInSelection(node) !== -1;
    }

    isChecked(node: AdvancedTreeNode) {
        return this.findIndexInChecked(node) !== -1;
    }

    isSingleSelectionMode() {
        return this.selectionMode && this.selectionMode === 'single';
    }

    isMultipleSelectionMode() {
        return this.selectionMode && this.selectionMode === 'multiple';
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
            let allow: boolean = true;
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

    getBlockableElement(): HTMLElement {
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
@NgModule({
    imports: [CommonModule],
    exports: [AdvancedTree, AdvancedSharedModule],
    declarations: [AdvancedTree, UIAdvancedTreeNode]
})
export class AdvancedTreeModule { }
