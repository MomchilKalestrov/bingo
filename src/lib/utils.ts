import type { board, segment, cell } from "@/lib/types";

const generateBoard = (): board => {
    const board: board = [];
    for (let i = 0; i < 4; i++) {
        const column: segment = [];
        
        for (let j = 0; j < 5; j++) {
            const row: cell[] = [];

            for (let k = 0; k < 5; k++)
                row.push(' ');

            column.push(row);
        };
        board.push(column);
    };
    return board;
};

const shuffle = <T,>(array: T[]): T[] => {
    array.forEach((_: T, index: number) => {
        const randomIndex = Math.floor(Math.random() * array.length);
        [ array[ index ], array[ randomIndex ] ] = [ array[ randomIndex ], array[ index ] ];
    });
    return array;
};

export { generateBoard, shuffle };