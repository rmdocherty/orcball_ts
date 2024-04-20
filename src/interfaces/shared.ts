//iphone SE dims times 2
export const GAME_W = 375 * 2
export const GAME_H = 667 * 2
export const DOT_SPACING = 75
export const DOT_SIZE = 15
export const OFFSET: Point = { x: 30, y: 30 }

export interface Point {
    x: number;
    y: number
}

export enum Dot {
    // state of a position on the game board
    EMPTY = 0,
    FILLED,
    WALL,
    GOAL,
    VOID
}

export enum Link {
    // State of connection between dots
    // invalid: like a connection over two dots - can be changed by abilities later
    // valid: possible connection at a dot
    // filled: a connection that has been filled by ball and is now invalid - can also be changed
    INVALID = 0,
    VALID,
    FILLED
}

export enum Player {
    P1 = 0,
    P2 = 1
}

export enum WinState {
    NONE = 0,
    P1_WIN = 1,
    P2_WIN = 2,
}

export interface MoveSummary {
    winState: WinState,
    moveOver: boolean
}

export enum Colours {
    LIGHT_GREY = "#bfbbae",
    YELLOW = "#e3ad30",
    DARK_GREY = "#4f4d46",
    ORANGE = "#e65000",
    WHITE = "#ffffff",
    BROWN = "#7a450c",
}

export const valToCol = [Colours.LIGHT_GREY, Colours.YELLOW, Colours.DARK_GREY, Colours.ORANGE, Colours.WHITE]

export interface DotsConstructor {
    scene: Phaser.Scene;
    logicPos: Point;
    val: Dot;
}

export interface ImageConstructor {
    scene: Phaser.Scene;
    x: number;
    y: number;
    texture: string | Phaser.Textures.Texture;
    frame?: string | number;
}


