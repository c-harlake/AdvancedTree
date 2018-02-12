import { AdvancedTreeNode } from './advancedtreenode';

export interface AdvancedTreeNodeDragEvent {
    tree?: any;
    node?: AdvancedTreeNode;
    subNodes?: AdvancedTreeNode[];
    index?: number;
    scope?: any;
}
