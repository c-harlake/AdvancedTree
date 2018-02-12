import {NgModule, Directive, Input, TemplateRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';


@Directive({
    selector: '[pAdvancedTemplate]',
    host: {
    }
})
export class PrimeAdvancedTemplate {

    @Input() type: string;

    @Input('pAdvancedTemplate') name: string;

    constructor(public template: TemplateRef<any>) {}

    getType(): string {
        return this.name;
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [PrimeAdvancedTemplate],
    declarations: [PrimeAdvancedTemplate]
})
export class AdvancedSharedModule { }
