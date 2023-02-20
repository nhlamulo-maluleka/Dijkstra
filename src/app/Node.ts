import { ElementRef } from "@angular/core";

export class NodeElement {
    public value!: ElementRef;
    public prevNode!: NodeElement | null;
    public neighbours!: Array<NodeElement>;
    public row!: number;
    public col!: number;

    constructor(element: ElementRef, row: number, col: number) {
        this.value = element;
        this.neighbours = new Array<NodeElement>();
        this.prevNode = null;
        this.row = row;
        this.col = col;
    }
}
