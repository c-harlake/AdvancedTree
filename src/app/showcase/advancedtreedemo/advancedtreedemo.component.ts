import {Component, OnInit, ViewChild} from '@angular/core';
import {NodeService} from '../service/node.service';
import {AdvancedTreeNode} from '../../modules/common/advancedtreenode';
import {Message, MenuItem } from 'primeng/primeng';
import {AdvancedTree} from '../../modules/advancedtree/advancedtree.component';
import {AdvancedTreeDragDropService} from '../../modules/common/api';

@Component({
    selector: 'app-advancedtreedemo',
    templateUrl: './advancedtreedemo.component.html',
    providers: [AdvancedTreeDragDropService]
})
// tslint:disable-next-line:component-class-suffix
export class AdvancedTreeDemo implements OnInit {

    msgs: Message[];

    @ViewChild('expandingTree')
    expandingTree: AdvancedTree;

    filesTree0: AdvancedTreeNode[];
    filesTree1: AdvancedTreeNode[];
    filesTree2: AdvancedTreeNode[];
    filesTree3: AdvancedTreeNode[];
    filesTree4: AdvancedTreeNode[];
    filesTree5: AdvancedTreeNode[];
    filesTree6: AdvancedTreeNode[];
    filesTree7: AdvancedTreeNode[];
    filesTree8: AdvancedTreeNode[];
    filesTree9: AdvancedTreeNode[];
    filesTree10: AdvancedTreeNode[];
    filesTree11: AdvancedTreeNode[];
    filesTree20: AdvancedTreeNode[];
    filesTree21: AdvancedTreeNode[];
    filesTree22: AdvancedTreeNode[];
    filesTree23: AdvancedTreeNode[];
    filesTree24: AdvancedTreeNode[];
    filesTree25: AdvancedTreeNode[];

    lazyFiles: AdvancedTreeNode[];

    selectedFile: AdvancedTreeNode;

    selectedFile2: AdvancedTreeNode;
    checkedFile2: AdvancedTreeNode;

    selectedFile3: AdvancedTreeNode;

    selectedFiles: AdvancedTreeNode[];

    selectedFiles2: AdvancedTreeNode[];
    checkedFiles2: AdvancedTreeNode[];

    selectedFile20: AdvancedTreeNode;
    selectedFiles21: AdvancedTreeNode[];
    selectedFiles22: AdvancedTreeNode[];
    selectedFile23: AdvancedTreeNode;
    selectedFiles24: AdvancedTreeNode[];
    selectedFiles25: AdvancedTreeNode[];
    checkedFiles23: AdvancedTreeNode[];
    checkedFiles24: AdvancedTreeNode[];
    checkedFiles25: AdvancedTreeNode[];

    addedfiles: AdvancedTreeNode[] = [];
    removedfiles: AdvancedTreeNode[] = [];

    partialCheckedNodes: AdvancedTreeNode[] = [];

    items: MenuItem[];

    loading: boolean;

    constructor(private nodeService: NodeService) { }

    ngOnInit() {
        this.loading = true;
        this.nodeService.getFiles().then(files => this.filesTree0 = files);
        setTimeout(() => {
            this.nodeService.getFiles().then(files => this.filesTree1 = files);
            this.loading = false;
        }, 3000);
        this.nodeService.getFiles().then(files => this.filesTree2 = files);
        this.nodeService.getFiles().then(files => this.filesTree3 = files);
        this.nodeService.getFiles().then(files => this.filesTree4 = files);
        this.nodeService.getFiles().then(files => this.filesTree5 = files);
        this.nodeService.getFiles().then(files => this.filesTree6 = files);
        this.nodeService.getFiles().then(files => this.filesTree7 = files);
        this.nodeService.getFiles().then(files => this.filesTree20 = files);
        this.nodeService.getFiles().then(files => this.filesTree21 = files);
        this.nodeService.getFiles().then(files => this.filesTree22 = files);
        this.nodeService.getFiles().then(files => this.filesTree23 = files);
        this.nodeService.getFiles().then(files => {
            this.filesTree24 = files;
            this.partialCheckedNodes.push(this.filesTree24[1]);
        });
        this.nodeService.getFiles().then(files => this.filesTree25 = files);

        this.filesTree8 = [
            {
                id: "1",
                label: 'Backup',
                data: 'Backup Folder',
                expandedIcon: 'fa-folder-open',
                collapsedIcon: 'fa-folder'
            }
        ];
        this.filesTree9 = [
            {
                id: "1",
                label: 'Storage',
                data: 'Storage Folder',
                expandedIcon: 'fa-folder-open',
                collapsedIcon: 'fa-folder'
            }
        ];
        this.nodeService.getFiles().then(files => this.filesTree10 = files);
        this.nodeService.getFiles().then(files => {
            this.filesTree11 = [{
                id: "1",
                label: 'Root',
                children: files
            }];
        });

        this.nodeService.getLazyFiles().then(files => this.lazyFiles = files);

        this.items = [
            {label: 'View', icon: 'fa-search', command: (event) => this.viewFile(this.selectedFile2)},
            {label: 'Unselect', icon: 'fa-close', command: (event) => this.unselectFile()}
        ];
    }

    selectionChanged(event) {
        // this.addedfiles = event.data;
        // this.removedfiles = event.data;
    }

    addedChanged(event) {
        this.addedfiles = event;
    }

    removedChanged(event) {
        this.removedfiles = event;
    }

    nodeSelect(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Selected', detail: event.node.label});
    }

    nodeUnselect(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Unselected', detail: event.node.label});
    }

    nodeExpandMessage(event) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Expanded', detail: event.node.label});
    }

    nodeExpand(event) {
        if (event.node) {
            // in a real application, make a call to a remote url to load children of the current node and add the new nodes as children
            this.nodeService.getLazyFiles().then(nodes => event.node.children = nodes);
        }
    }

    viewFile(file: AdvancedTreeNode) {
        this.msgs = [];
        this.msgs.push({severity: 'info', summary: 'Node Selected with Right Click', detail: file.label});
    }

    unselectFile() {
        this.selectedFile2 = null;
    }

    expandAll() {
        this.filesTree10.forEach( node => {
            this.expandRecursive(node, true);
        } );
    }

    collapseAll() {
        this.filesTree10.forEach( node => {
            this.expandRecursive(node, false);
        } );
    }

    renamed(node: AdvancedTreeNode) {
        console.log('renamed ' + node.label);
        this.msgs.push({severity: 'info', summary: 'Node Renamed', detail: node.label});
    }

    private expandRecursive(node: AdvancedTreeNode, isExpand: boolean) {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach( childNode => {
                this.expandRecursive(childNode, isExpand);
            } );
        }
    }
}
