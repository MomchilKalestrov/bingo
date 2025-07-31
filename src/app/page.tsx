'use client';
import React from 'react';
import { NextPage } from 'next';
import styles from './page.module.css';
import type { board } from '@/lib/types';
import cloneObject from '@/lib/clone';
import { generateBoard, shuffle } from '@/lib/utils';

type socketMessageType = {
    from: string;
    payload: {
        type: 'overrideQueue';
        data: number[];
    } | {
        type: 'getQueue';
    };
};

const useBingo = (start: number, end: number) => {
    const [ numbers, setNumbers ] = React.useState<number[]>(() => 
        shuffle(Array.from({ length: end - start }, (_, i) => start + i))
    );

    const overrideQueue = React.useCallback((data: number[]) => {
        const set = new Set(data);
        setNumbers([ ...numbers.filter(n => !set.has(n)), ...set.intersection(new Set(numbers)) ]);
    }, [ numbers, setNumbers ]);

    const getNumber = React.useCallback(() => {
        const newNumbers = [ ...numbers ];
        const poppedNumber: number | undefined = newNumbers.pop();
        setNumbers(newNumbers);
        return poppedNumber;
    }, [ numbers, setNumbers ]);

    return {
        getNumber,
        numbers,
        overrideQueue
    };
};

const Page: NextPage = () => {
    const { numbers, getNumber, overrideQueue } = useBingo(0, 100);
    const [ board, setBoard ] = React.useState<board>(generateBoard());
    const [ last,  setLast  ] = React.useState<number | undefined>(undefined);
    const [ ws,    setWs    ] = React.useState<WebSocket | null>(null);

    const onSocketMessage = React.useCallback((event: MessageEvent) => {
        const { from, payload }: socketMessageType = JSON.parse(event.data);
        
        switch (payload.type) {
            case 'overrideQueue':
                overrideQueue(payload.data);
                break;
            case 'getQueue':
                if (!ws) break;
                console.log(numbers);
                ws.send(JSON.stringify({
                    type: 'direct',
                    to: from,
                    payload: numbers
                }));
                break;
        };
    }, [ ws, numbers, overrideQueue ]);

    React.useEffect(() => {
        if (!process.env.NEXT_PUBLIC_PROXY_URL) return;
        
        const socket = new WebSocket(process.env.NEXT_PUBLIC_PROXY_URL);
        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    React.useEffect(() => {
        if (!ws) return;
        ws.onmessage = onSocketMessage;
    }, [ ws, onSocketMessage ]);

    const generate = () => {
        const index = getNumber();
        console.log(index);
        if (index === undefined) return;

        setLast(index + 1);

        setBoard((b) => {
            const newBoard: board = cloneObject<board>(b);

            const segment = Math.floor(index / 25);
            const row = Math.floor((index % 25) / 5);
            const column = index % 5;

            newBoard[ segment ][ row ][ column ] = index + 1;

            return newBoard;
        });
    };

    return (
        <main className={ styles.Main }>
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
        </main>
    );
};

export default Page;