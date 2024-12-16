'use client';
import React from 'react';
import { NextPage } from 'next';
import styles from './page.module.css';
import { count } from 'console';
import { start } from 'repl';

type cell = number | string;
type segment = cell[][];
type board = segment[];

const generateBoard = (): board => {
    let board: board = [];
    for (let i = 0; i < 4; i++) {
        let column: segment = [];
        
        for (let j = 0; j < 5; j++) {
            let row: cell[] = [];

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
    const [ board, setBoard ] = React.useState<board>(generateBoard());

    const generate = () => {
        const flatten: Set<cell> = new Set(board.flat(4));

        const getRandom = (start: number, end: number): number =>
            Math.floor(Math.random() * (end - start)) + start;

        let random = getRandom(0, 100);
        while (flatten.has(random))
            random = getRandom(0, 100);

        setBoard((b) => {
            const newBoard = b.map((column, i) =>
                column.map((row, j) => 
                    row.map((cell, k) => {
                        if (random === i * 25 + j * 5 + k)
                            return random;
                        else return cell;
                    })
                )
            );
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