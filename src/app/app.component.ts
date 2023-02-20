import { HttpClient } from '@angular/common/http';
import { QueryList, AfterViewInit, Component, ElementRef, OnInit, ViewChildren, AfterViewChecked } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { NodeElement } from './Node';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, AfterViewChecked {
    title = 'dijkstra';
    gridMap!: Array<Array<string>>
    gridMatrix!: Array<Array<ElementRef>>
    rows!: Array<ElementRef>
    blocks!: Array<ElementRef>
    headPtr!: NodeElement | null;
    stack!: Array<NodeElement>;

    constructor(private http: HttpClient) {
        this.gridMap = new Array<Array<string>>();
        this.gridMatrix = new Array<Array<ElementRef>>();
        this.stack = new Array<NodeElement>();
    }

    @ViewChildren("container") rowChildren!: QueryList<ElementRef>;
    @ViewChildren("block") blockChildren!: QueryList<ElementRef>;

    ngOnInit() {
        this.http.get('../assets/level1.txt', { responseType: 'text' })
            .subscribe((data: string) => {
                const map = data.split('\r\n');

                for (let row of map) {
                    this.gridMap.push(new Array<string>)

                    for (let c of row) {
                        this.gridMap[this.gridMap.length - 1].push(c);
                    }
                }
            })
    }

    ngAfterViewInit() {
        this.rowChildren.changes.subscribe((s: any) => {
            this.rows = s.toArray();
        })

        this.blockChildren.changes.subscribe((b: any) => {
            this.blocks = b.toArray();
        })
    }

    ngAfterViewChecked() {
        new Observable<any>((observer: Observer<any>) => {
            if (this.blocks! && this.rows! && this.gridMatrix.length == 0) {
                const size: number = this.blocks!.length / this.rows!.length;
                let blockPos = 0;

                for (let row in this.rows) {
                    this.gridMatrix[row] = new Array<ElementRef>();
                    for (let b = 0; b < size; b++) {
                        this.gridMatrix[row][b] = this.blocks[blockPos];
                        blockPos++;
                    }
                }

                observer.next(this.gridMatrix);
            }
        }).subscribe((grid: any) => {
            this.headPtr = this.createHeadNode(grid);

            if (this.headPtr) {
                // begin mapping
                this.createLinkedMap(this.headPtr);
                console.log(this.headPtr)
            }
            else console.log("Cannot create a Map of NULL!!");
        })
    }

    createHeadNode(grid: Array<Array<ElementRef>>): NodeElement | null {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col].nativeElement.dataset.value === 'E') {
                    return new NodeElement(grid[row][col], row, col);
                }
            }
        }
        return null;
    }

    getBlock(row: number, col: number): ElementRef {
        return this.gridMatrix[row][col];
    }

    getBlockValue(row: number, col: number) {
        return this.getBlock(row, col).nativeElement.dataset.value;
    }

    addNeighbors(ptr: NodeElement): boolean {
        if (ptr.neighbours.length > 0) return false;

        // let isValidOp = false;
        // Left Neighbour
        if (ptr.col - 1 >= 0) {
            if (this.getBlockValue(ptr.row, ptr.col - 1) !== '#'
                && this.getBlockValue(ptr.row, ptr.col - 1) !== 'E') {
                const neighbour: NodeElement = new NodeElement(this.getBlock(ptr.row, ptr.col - 1), ptr.row, ptr.col - 1);
                neighbour.prevNode = ptr;
                ptr.neighbours.push(neighbour);
                console.log("Left")
            }
        }

        // Top Neighbour
        if (ptr.row - 1 >= 0) {
            if (this.getBlockValue(ptr.row - 1, ptr.col) !== '#'
                && this.getBlockValue(ptr.row - 1, ptr.col) !== 'E') {
                const neighbour: NodeElement = new NodeElement(this.getBlock(ptr.row - 1, ptr.col), ptr.row - 1, ptr.col);
                neighbour.prevNode = ptr;
                ptr.neighbours.push(neighbour);
                console.log("Top")
            }
        }

        // Right Neighbour
        if (ptr.col + 1 < this.gridMatrix.length) {
            if (this.getBlockValue(ptr.row, ptr.col + 1) !== '#'
                && this.getBlockValue(ptr.row, ptr.col + 1) !== 'E') {
                const neighbour: NodeElement = new NodeElement(this.getBlock(ptr.row, ptr.col + 1), ptr.row, ptr.col + 1);
                neighbour.prevNode = ptr;
                ptr.neighbours.push(neighbour);
                console.log("Right")
            }
        }

        // Bottom Neighbour
        if (ptr.row + 1 < this.gridMatrix.length) {
            if (this.getBlockValue(ptr.row + 1, ptr.col) !== '#'
                && this.getBlockValue(ptr.row + 1, ptr.col) !== 'E') {
                const neighbour: NodeElement = new NodeElement(this.getBlock(ptr.row + 1, ptr.col), ptr.row + 1, ptr.col)
                neighbour.prevNode = ptr;
                ptr.neighbours.push(neighbour);
                console.log("Bottom")
            }
        }

        return true;
    }

    createLinkedMap(head: NodeElement): void {
        this.addNeighbors(head);
        for (let node of head.neighbours) this.stack.push(node);
        let c = 0;

        while (this.stack.length > 0) {
            const nodeptr = this.stack.splice(0, 1)[0]

            nodeptr.value.nativeElement.style.backgroundColor = 'green'

            if (this.addNeighbors(nodeptr)) {
                for (let node of nodeptr.neighbours) this.stack.push(node);
            }
            c++;

            if (c === 70) return;
        }
    }
}
