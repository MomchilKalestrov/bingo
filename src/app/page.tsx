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

const Page: NextPage = () => {
    /* a reducer would work best here */
    const numbers = React.useRef(new Set<number>()).current;
    const [ board, setBoard ] = React.useState<board>(generateBoard());

    const generate = () => {
        const getRandom = (start: number, end: number): number =>
            Math.floor(Math.random() * (end - start)) + start;

        const getNumber = (): number => {
            let random = getRandom(0, 99);
            
            while (numbers.has(random))
                random = getRandom(0, 99);

            numbers.add(random);

            return random;
        }
        
        const index = getNumber();

        setBoard((b) => {
            const newBoard: board = cloneObject<board>(b);

            const segment = Math.floor(index / 25);
            const row = Math.floor((index % 25) / 5);
            const column = index % 5;

            newBoard[segment][row][column] = index;

            return newBoard;
        })
    };

    return (
        <>
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