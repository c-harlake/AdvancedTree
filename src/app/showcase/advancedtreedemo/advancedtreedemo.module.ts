import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AdvancedTreeDemo} from './advancedtreedemo.component';
import {AdvancedTreeModule} from '../../modules/advancedtree/advancedtree.module';
import {GrowlModule, ButtonModule, ContextMenuModule, TabViewModule, CodeHighlighterModule} from 'primeng/primeng';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AdvancedTreeModule,
        GrowlModule,
        ButtonModule,
        ContextMenuModule,
        TabViewModule,
        CodeHighlighterModule
    ],
    declarations: [
        AdvancedTreeDemo
    ]
})
export class AdvancedTreeDemoModule {}
