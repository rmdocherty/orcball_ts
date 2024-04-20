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
        this.dots[p_to_i(new Point(x, y), this.w)] = val;
    }
    public get(x: number, y: number): Dot {
        return this.dots[p_to_i(new Point(x, y), this.w)];
    }
    public setFrom(x0: number, x1: number, y0: number, y1: number, val: Dot): void {
        for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
                this.set(x, y, val);
            }
        }
    }
}

class Point {
    constructor(public x: number, public y: number) { }
}

const moore: Point[] = [
    new Point(-1, -1),
    new Point(-1, 0),
    new Point(-1, 1),
    new Point(0, -1),
    new Point(0, 1),
    new Point(1, -1),
    new Point(1, 0),
    new Point(1, 1)
]

const addMoore = (p: Point): Point[] => {
    // list of all points in moore neighbourhood of p
    return moore.map((m) => new Point(m.x + p.x, m.y + p.y));
}

const i_to_p = (i: number, nx: number): Point => {
    return new Point(Math.floor(i / nx), i % nx);
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
    let grid = new Grid(11, 9);
    grid = addWalls(grid);
    printGrid(grid);
}