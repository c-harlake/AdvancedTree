import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedTree, UIAdvancedTreeNode } from './advancedtree.component';
import { AdvancedSharedModule } from '../common/advancedshared';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    AdvancedTree,
    AdvancedSharedModule
  ],
  declarations: [AdvancedTree, UIAdvancedTreeNode]
})
export class AdvancedTreeModule { }
