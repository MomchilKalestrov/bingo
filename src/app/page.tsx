'use client';
import React from 'react';
import { NextPage } from 'next';
import styles from './page.module.css';
import type { board, segment, cell } from '@/lib/types';
import cloneObject from '@/lib/clone';

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
        [ array[ index ], array[ randomIndex ] ] = [ array[ randomIndex ], array[ index ] ]
    });
    return array;
};

const useBingo = (start: number, end: number) => {
    const numbers = React.useRef<number[]>(shuffle(Array.from({ length: end - start }, (_, i) => start + i))).current;
    return () => numbers.pop();
};

const Page: NextPage = () => {
    /* a reducer would work best here */
    const getNumber = useBingo(0, 100);
    const [ board, setBoard ] = React.useState<board>(generateBoard());
    const [ last,  setLast  ] = React.useState<number | undefined>(undefined);

    const generate = () => {
        const index = getNumber();
        if (index === undefined) return;

        setLast(index + 1);

        setBoard((b) => {
            const newBoard: board = cloneObject<board>(b);

            const segment = Math.floor(index / 25);
            const row = Math.floor((index % 25) / 5);
            const column = index % 5;

            newBoard[segment][row][column] = index + 1;

            return newBoard;
        })
    };

    return (
        <>
            {
                last
                ?   <span>{ last }</span>
                :   <span style={ { visibility: 'hidden' } } />
            }
            <div className={ styles.Board }>
                { board.map((column, i) => (
                    <div key={ i } className={ styles.Segments }>
                        { column.map((row, j) => (
                            <div key={ j } className={ styles.Row }>
                                { row.map((cell, k) => (
                                    <div key={ k }>{ cell }</div>
                                )) }
                            </div>
                        )) }
                    </div>
                )) }
            </div>
            <button onClick={ generate }>Generate</button>
        </>
    );
};

export default Page;