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

const indexToPoint = (i: number, nx: number): Point => {
    return new Point(Math.floor(i / nx), i % nx);
}

const pointToIndex = (p: Point, nx: number): number => {
    return p.x * nx + p.y;
}

const getDotGrid = (nx: number, ny: number): Grid => {
    return new Grid(nx, ny);
}

const addWalls = (dotGrid: Grid): void => {

}