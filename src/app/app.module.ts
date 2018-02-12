import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {GrowlModule, ButtonModule, ContextMenuModule, TabViewModule, CodeHighlighterModule} from 'primeng/primeng';

import { NodeService } from './showcase/service/node.service';
import { AdvancedTreeDemo } from './showcase/advancedtreedemo/advancedtreedemo.component';
import { AdvancedTreeModule } from './modules/advancedtree/advancedtree.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    AdvancedTreeDemo
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    GrowlModule,
    ButtonModule,
    ContextMenuModule,
    TabViewModule,
    CodeHighlighterModule,
    AdvancedTreeModule
  ],
  providers: [NodeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
