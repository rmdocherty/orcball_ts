enum Dot {
    // state of a position on the game board
    EMPTY = 0,
    FILLED,
    WALL,
    GOAL,
    VOID
}

enum Link {
    // State of connection between dots
    // invalid: like a connection over two dots - can be changed by abilities later
    // valid: possible connection at a dot
    // filled: a connection that has been filled by ball and is now invalid - can also be changed
    INVALID = 0,
    VALID,
    FILLED
}

class Grid {
    dots: Uint8ClampedArray
    constructor(public h: number, public w: number) {
        this.dots = new Uint8ClampedArray(h * w);
    }

    public set(x: number, y: number, val: Dot): void {
        this.dots[p_to_i({ x: x, y: y }, this.w)] = val;
    }
    public get(x: number, y: number): Dot {
        return this.dots[p_to_i({ x: x, y: y }, this.w)];
    }
    public setFrom(x0: number, x1: number, y0: number, y1: number, val: Dot): void {
        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                this.set(x, y, val);
            }
        }
    }
}

interface Point {
    x: number;
    y: number
}

type AdjVector = Uint8ClampedArray
type AdjMatrix = AdjVector[]

const moore: Point[] = [
    { x: -1, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 }
]

// this could all be faster w/out instantiating a class for everything
const addMoore = (p: Point): Point[] => {
    // list of all points in moore neighbourhood of p
    return moore.map((m) => ({ x: m.x + p.x, y: m.y + p.y }));
}

const i_to_p = (i: number, nx: number): Point => {
    return { x: Math.floor(i / nx), y: i % nx };
}

const p_to_i = (p: Point, nx: number): number => {
    return p.y * nx + p.x;
}

const addWalls = (dotGrid: Grid): Grid => {
    const x = dotGrid.w;
    const y = dotGrid.h;
    const hx = Math.floor(x / 2);
    // vertical walls
    dotGrid.setFrom(1, 2, 1, y - 2, Dot.WALL);
    dotGrid.setFrom(x - 2, x - 1, 1, y - 2, Dot.WALL);
    // horizontal walls
    dotGrid.setFrom(1, x - 1, 1, 2, Dot.WALL);
    dotGrid.setFrom(1, x - 1, y - 2, y - 1, Dot.WALL);
    // remove spot in walls for space before goal
    dotGrid.set(hx, 1, Dot.EMPTY);
    dotGrid.set(hx, y - 2, Dot.EMPTY);
    // void spots: top, bottom, corners
    dotGrid.setFrom(0, x, 0, 1, Dot.VOID);
    dotGrid.setFrom(0, x, y - 1, y, Dot.VOID);
    dotGrid.setFrom(0, 1, 0, y, Dot.VOID);
    dotGrid.setFrom(x - 1, x, 0, y, Dot.VOID);
    //add goals
    dotGrid.set(hx, 0, Dot.GOAL);
    dotGrid.set(hx, y - 1, Dot.GOAL);
    return dotGrid;
}

const getEmptyDotAdjVec = (p: Point, dotGrid: Grid): AdjVector => {
    // Look in Moore neighbourhood of dot, if neighbour is not void add link to adj row
    const h = dotGrid.h;
    const w = dotGrid.w;

    const adj: AdjVector = new Uint8ClampedArray(h * w).fill(0);
    const neighbours = addMoore(p);
    for (let n of neighbours) {
        const val = dotGrid.get(n.x, n.y);
        if (val != Dot.VOID) {
            adj[p_to_i(n, w)] = Link.VALID
        }
    }
    return adj
}

const getWallDotAdjVec = (p: Point, dotGrid: Grid): AdjVector => {
    const h = dotGrid.h;
    const w = dotGrid.w;
    const adj: AdjVector = new Uint8ClampedArray(h * w).fill(0);
    const neighbours = addMoore(p);
    for (let n of neighbours) {
        const val = dotGrid.get(n.x, n.y);
        switch (val) {
            case Dot.VOID:
                null;
            case Dot.WALL:
                // handle bounces
                const dx = n.x - p.x;
                const dy = n.y - p.y;
                const delta = dx + dy;
                // disallow vertical or horizontal bounces
                // i.e, where x+y = (-)1 + 0 or 0 + (-)1
                switch (delta) {
                    case 1:
                        null;
                    case -1:
                        null;
                    default:
                        adj[p_to_i(n, w)] = Link.VALID;
                }
            case Dot.EMPTY:
                adj[p_to_i(n, w)] = Link.VALID;
            default:
                null;
        }
    }
    return adj
}

const getAdjMat = (dotGrid: Grid): AdjMatrix => {
    const h = dotGrid.h;
    const w = dotGrid.w;
    const l = h * w
    // init l Uint8 arrs of size l inside adjMat
    const adjMat = new Array(l).map(() => new Uint8ClampedArray(l).fill(0))


    return adjMat

}


const printGrid = (dotGrid: Grid): void => {
    // debug - apologise for emojis but only way to get monospaced
    const chars = ["⬜", "🟨", "🟫", "🟧", "⬛"];
    let str = "";
    for (let y = 0; y < dotGrid.h; y++) {
        for (let x = 0; x < dotGrid.w; x++) {
            const val = dotGrid.get(x, y);
            str += chars[val];
        }
        str += "\n";
    }
    console.log(str);
}

export const init = (): void => {
    var startTime = performance.now()
    let grid = new Grid(11, 9);
    grid = addWalls(grid);
    var endTime = performance.now()
    printGrid(grid);
    console.log(`Init in ${endTime - startTime} milliseconds`)
}