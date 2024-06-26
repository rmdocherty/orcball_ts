/* 
Our logic is made of up two things: a grid of dots with varying states that affect *how* the ball
can move from there, and an adjacency matrix of connections between the dots that will determine
*if* the ball can move along a 'link'.

A dot has 5 states: 
0. EMPTY, a valid dot that the ball has not yet visited
1. FILLED, a previously valid dot that ball has visited (and is no longer valid)
2. WALL, a dot that the ball cannot end a turn on or fill but can bounce off  
3. GOAL, a dot that if the ball ends on wins the player the game
4. VOID, a dot which can never be filled or moved onto (our boundary conditions)

Will use adjacency matrix representation of the links between our dots - this has more memory
overhead that say, just storing an array of only valid points, but will make a) the logic
easier and b) making powers that modify this grid much simpler.

A link in our matrix has 3 states:
0. INVALID, a link that a ball cannot cross (i.e moving two dots at once)
1. VALID, i.e, a link to a neighbouring EMPTY dot one square away
2. FILLED, i.e a previously valid link that the ball cannot cross

We don't have nice numpy style arrays in typescript, so we will represent these as Uint8ClampedArrays,
which are easy on the memory and hopefully fast. They will be 1D, and we will have to keep track of
multidimensional indexing (i.e y, x lookup) ourselves. We will use the y, x convention of numpy arrays.

The game can then be stored entirely based on these two objects, the current player and the ball position.
*/

import { Point, Dot, Link, Player, MoveSummary, WinState, Character, PlayerDetails } from "../interfaces/shared";
import { i_to_p, p_to_i } from "../interfaces/shared";


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
const diag: Point[] = [moore[0], moore[2], moore[5], moore[7]]

const mod = (n: number, m: number): number => {
    return ((n % m) + m) % m;
}

const addMoore = (p: Point, sf: number = 1): Point[] => {
    // list of all points in moore neighbourhood of p
    return moore.map((m) => ({ x: sf * m.x + p.x, y: sf * m.y + p.y }));
}

const mageAddMoore = (p: Point, modX: number, modY: number, ox: number = 1, oy: number = 1): Point[] => {
    const tempP: Point = { x: p.x - ox, y: p.y - oy }
    return moore.map((m) => ({
        x: mod(m.x + tempP.x, modX) + ox,
        y: mod(m.y + tempP.y, modY) + oy
    }));
}

const rangerAddMoore = (p: Point): Point[] => {
    const m1 = addMoore(p, 1)
    const d2 = diag.map((m) => ({ x: 2 * m.x + p.x, y: 2 * m.y + p.y }));
    return m1.concat(d2)
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

const getEmptyDotAdjVec = (p: Point, dotGrid: Grid, neighbours: Point[]): AdjVector => {
    // Look in Moore neighbourhood of dot, if neighbour is not void add link to adj row
    const h = dotGrid.h;
    const w = dotGrid.w;

    const adj: AdjVector = new Uint8ClampedArray(h * w).fill(Link.INVALID);
    for (let n of neighbours) {
        const val = dotGrid.get(n.x, n.y);
        if (val != Dot.VOID) {
            adj[p_to_i(n, w)] = Link.VALID;
        }
    }
    return adj
}

const getWallDotAdjVec = (p: Point, dotGrid: Grid, neighbours: Point[]): AdjVector => {
    const h = dotGrid.h;
    const w = dotGrid.w;
    const adj: AdjVector = new Uint8ClampedArray(h * w).fill(Link.INVALID);
    for (let n of neighbours) {
        const val = dotGrid.get(n.x, n.y);
        switch (val) {
            // TODO: consider adding case for filled dots
            case Dot.VOID:
                null;
                break;
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
                        break;
                    case -1:
                        null;
                        break;
                    default:
                        adj[p_to_i(n, w)] = Link.VALID;
                        break;
                }
                break;
            case Dot.EMPTY:
                adj[p_to_i(n, w)] = Link.VALID;
                break;
            case Dot.FILLED:
                adj[p_to_i(n, w)] = Link.VALID;
                break;
            case Dot.GOAL:
                adj[p_to_i(n, w)] = Link.VALID;
                break;
            default:
                null;
                break;
        }
    }
    return adj
}

const getAdjMat = (dotGrid: Grid): AdjMatrix => {
    const h = dotGrid.h;
    const w = dotGrid.w;
    const l = h * w;
    // helper fn.
    const _fillInvalid = (j: number) => { return new Uint8ClampedArray(j).fill(Link.INVALID) };
    // init l Uint8 arrs of size l inside adjMat
    const adjMat = new Array(l).fill(0).map(() => _fillInvalid(l));
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const p: Point = { x: x, y: y }
            const idx = p_to_i(p, w);
            const val = dotGrid.get(x, y);
            switch (val) {
                case Dot.EMPTY:
                    adjMat[idx] = getEmptyDotAdjVec(p, dotGrid, addMoore(p));
                    break;
                case Dot.VOID:
                    adjMat[idx] = _fillInvalid(l);
                    break;
                case Dot.GOAL:
                    adjMat[idx] = _fillInvalid(l);
                    break;
                case Dot.WALL:
                    adjMat[idx] = getWallDotAdjVec(p, dotGrid, addMoore(p));
                    break;
                default:
                    break;
            }
        }
    }
    return adjMat;
}

const isMoveValid = (start: Point, end: Point, w: number, adjMat: AdjMatrix): boolean => {
    const start_i = p_to_i(start, w);
    const end_i = p_to_i(end, w);

    const val = adjMat[start_i][end_i];
    return (val == Link.VALID);
}

const getMageValidMoves = (oldAdjVec: number[], grid: Grid, start: Point, startVal: Dot) => {
    // fancy mod neighbourhood 
    const wrapNeighbourhood = mageAddMoore(start, grid.w - 2, grid.h - 2);
    // only add wrap round if on a wall - it shouldn't be posible to trigger this on empty but useful for debug
    const mageNeighbourhood = (startVal == Dot.WALL) ? wrapNeighbourhood : addMoore(start);
    const mageAdjFn = (startVal != Dot.WALL) ? getEmptyDotAdjVec : getWallDotAdjVec;
    const mAdjVec = mageAdjFn(start, grid, mageNeighbourhood);
    // conver to arr for filtering later
    const mAdjVecArr = Array.from(mAdjVec);
    // add back in old FILLED links from the existing adjVec
    const combinedAdjVecArr = mAdjVecArr.map((v, idx) => ((oldAdjVec[idx] != Link.FILLED) ? v : 2))
    // map all INVALID/FILLED links to -1 for filter later
    return combinedAdjVecArr.map((x, i) => ((x == 1) ? i : -1));
}

const getRangerValidMoves = (oldAdjVec: number[], grid: Grid, start: Point, startVal: Dot) => {
    const addedNeighbourhood = rangerAddMoore(start);
    const rangerAdjFn = (startVal != Dot.WALL) ? getEmptyDotAdjVec : getWallDotAdjVec;
    const newAdjVec = rangerAdjFn(start, grid, addedNeighbourhood);
    const newAdjVecArr = Array.from(newAdjVec);
    const combinedAdjVecArr = newAdjVecArr.map((v, idx) => ((oldAdjVec[idx] != Link.FILLED) ? v : 2))
    return combinedAdjVecArr.map((x, i) => ((x == 1) ? i : -1));
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

const printAdjVec = (adjVec: AdjVector, start_idx: number, h: number, w: number): void => {
    const chars = ["⬜", "🟩", "🟥"];
    let str = "";
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = p_to_i({ x: x, y: y }, w);
            const val = (idx != start_idx) ? adjVec[idx] : 2;
            str += chars[val];
        }
        str += "\n";
    }
    console.log(str);
}


export const init = (): void => {
    const startTime = performance.now()
    let grid = new Grid(11, 9);
    grid = addWalls(grid);
    let adjMat = getAdjMat(grid);
    const endTime = performance.now();
    console.log(`Init in ${endTime - startTime} milliseconds`);
    printGrid(grid);

    const moves: Point[][] = [
        [{ x: 0, y: 0 }, { x: 0, y: 1 }],
        [{ x: 6, y: 6 }, { x: 6, y: 7 }],
        [{ x: 5, y: 1 }, { x: 4, y: 0 }],
    ];
    const cases: boolean[] = [false, true, true];

    let i = 0;
    for (let mv of moves) {
        const idx = p_to_i(mv[0], grid.w);
        printAdjVec(adjMat[idx], idx, grid.h, grid.w);
        const isValid = isMoveValid(mv[0], mv[1], grid.w, adjMat);
        console.log("Should be: " + cases[i] + " is: " + isValid);
        i++;
    }
}

const getPlayerDetails = (character: Character, player: Player): PlayerDetails => {
    const cooldowns = [6, 7, 5, 5]
    return { player: player, character: character, cooldownLength: cooldowns[character], movesBeforeCooldown: 0 }
}


export class LogicGame {
    public grid: Grid;
    public adjMat: AdjMatrix;

    public p1Goal: Point;
    public p2Goal: Point;

    public player: Player;
    public ballPos: Point;

    public p1Details: PlayerDetails;
    public p2Details: PlayerDetails;

    // TODO: track player characters in arr, alongside cooldowns (maybe in an interface?)

    constructor(h: number, w: number, p1Character: Character = Character.WARRIOR, p2Character: Character = Character.WARRIOR) {
        this.grid = new Grid(h, w);
        this.grid = addWalls(this.grid);

        this.adjMat = getAdjMat(this.grid);

        const hw = Math.floor(w / 2);

        // to align with how it appears on screen!
        this.p1Goal = { x: hw, y: h - 1 };
        this.p2Goal = { x: hw, y: 0 };


        this.player = Player.P1;
        this.ballPos = { x: 4, y: 5 };
        // this needs to be filled @ start
        this.grid.set(this.ballPos.x, this.ballPos.y, Dot.FILLED);

        this.p1Details = getPlayerDetails(p1Character, Player.P1)
        this.p2Details = getPlayerDetails(p2Character, Player.P2)

    }

    private singleMoveAbilities(adjVec: AdjVector, start: Point, startVal: Dot, character: Character): number[] {
        const adjVecArr = Array.from(adjVec); // cast to arr or can't be -1
        let remapped
        switch (character) {
            case (Character.WARRIOR):
                // simplest, just change map condition to x > 0
                remapped = adjVecArr.map((x, i) => ((x > 0) ? i : -1));
                break;
            case (Character.MAGE):
                remapped = getMageValidMoves(adjVecArr, this.grid, start, startVal)
                break;
            case (Character.RANGER):
                // call correct 'getAdjMat' for current point with custom neigbourhood (moore + 2* moore)
                remapped = getRangerValidMoves(adjVecArr, this.grid, start, startVal)
                break;
            default:
                remapped = adjVecArr.map((x, i) => ((x == 1) ? i : -1));
                break;
        }
        return remapped
    }

    public getValidMoves(start: Point, character: Character): Point[] {
        const startIdx = p_to_i(start, this.grid.w);
        const startVal = this.grid.get(start.x, start.y)
        const adjVec: AdjVector = this.adjMat[startIdx];
        const remapped = this.singleMoveAbilities(adjVec, start, startVal, character)

        const nonZeroInds = remapped.filter((x) => x > -1);
        const validPoints: Point[] = nonZeroInds.map((x) => i_to_p(x, this.grid.w));
        return validPoints;
    }

    public makeMove(start: Point, end: Point, character: Character): MoveSummary {
        const w = this.grid.w;

        const startIdx = p_to_i(start, w);
        const endIdx = p_to_i(end, w);
        const [dx, dy] = [end.x - start.x, end.y - start.y]
        const delta = Math.sqrt(dx * dx + dy * dy)
        const link = (delta > Math.sqrt(3)) ? Link.INVALID : Link.FILLED
        // only fill dist 1 links
        this.adjMat[startIdx][endIdx] = link;
        this.adjMat[endIdx][startIdx] = link;

        const newDotVal = this.grid.get(end.x, end.y);
        // orc ability here
        const over = ((newDotVal == Dot.EMPTY) && (character != Character.ORC)) ? true : false;
        if (newDotVal != Dot.WALL) { // don't overwrite walls, important later (i.e for mage)
            this.grid.set(end.x, end.y, Dot.FILLED);
        }
        this.ballPos = end;

        const abilityUsed = (character != Character.NONE)
        this.updateCooldowns(this.player, abilityUsed)

        const win = this.checkWin(end, this.player);
        if (over) { // switch to next player if turn over
            this.player = (1 - this.player);
        }

        return { winState: win, moveOver: over };
    }

    public updateCooldowns(currentPlayer: Player, abilityUsed: boolean): void {
        let c: number
        if (currentPlayer == Player.P1) {
            c = this.p2Details.movesBeforeCooldown
            this.p2Details.movesBeforeCooldown = Math.max(0, c - 1)
            if (abilityUsed) {
                this.p1Details.movesBeforeCooldown = this.p1Details.cooldownLength
            }
        } else {
            c = this.p1Details.movesBeforeCooldown
            this.p1Details.movesBeforeCooldown = Math.max(0, c - 1)
            if (abilityUsed) {
                this.p2Details.movesBeforeCooldown = this.p2Details.cooldownLength
            }
        }
    }


    public checkWin(newBallPos: Point, player: Player): WinState {
        const inP1Goal = (newBallPos.x === this.p1Goal.x && newBallPos.y === this.p1Goal.y);
        const inP2Goal = (newBallPos.x === this.p2Goal.x && newBallPos.y === this.p2Goal.y);
        const isP1 = (player == Player.P1);
        const isP2 = (player == Player.P2);

        const endIdx = p_to_i(newBallPos, this.grid.w);
        const newAdjVector: AdjVector = this.adjMat[endIdx];
        const sumPossibleMoves = newAdjVector.reduce((acc, val) => acc + val, 0);
        const lost = (sumPossibleMoves == 0);

        if (isP1 && inP2Goal) { //p1 scores
            return WinState.P1_WIN;
        } //p1 own goal
        else if (isP1 && inP1Goal) {
            return WinState.P2_WIN;
        }//p1 checkmate
        else if (isP1 && lost) {
            return WinState.P2_WIN;
        }//p2 scores
        else if (isP2 && inP1Goal) {
            return WinState.P2_WIN;
        }//p2 own goal
        else if (isP2 && inP2Goal) {
            return WinState.P1_WIN;
        }//p2 checkmate
        else if (isP2 && lost) {
            return WinState.P1_WIN;
        }//default
        else {
            return WinState.NONE;
        }
    }

}
