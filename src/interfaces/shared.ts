//iphone SE dims times 2
export const GAME_W = 375 * 2
export const GAME_H = 667 * 2

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

export enum Colours {
    LIGHT_GREY = "#bfbbae",
    DARK_GREY = "#4f4d46",
    YELLOW = "#e3ad30",
    ORANGE = "#e65000",
    BROWN = "#7a450c",
}

export interface DotsConstructor {
    scene: Phaser.Scene;
    logicX: number;
    logicY: number;
    val: Dot;
}

export interface ImageConstructor {
    scene: Phaser.Scene;
    x: number;
    y: number;
    texture: string | Phaser.Textures.Texture;
    frame?: string | number;
}


