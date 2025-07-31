'use client';
import React from "react";
import { NextPage } from "next";
import type { board } from "@/lib/types";
import { generateBoard, shuffle } from "@/lib/utils";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const toIndex = (segment: number, row: number, column: number) =>
    segment * 25 + row * 5 + column;

const Page: NextPage = () => {
    const router = useRouter()
    const [ override, setOverride ] = React.useState<Set<number>>(new Set());
    const [ gameId,   setGameId   ] = React.useState<string | null>(null);
    const [ games,    setGames    ] = React.useState<string[]>([]);
    const [ board,    setBoard    ] = React.useState<board>(generateBoard());
    const [ next,     setNext     ] = React.useState<number[] | null>(null);
    const [ ws,       setWs       ] = React.useState<WebSocket | null>(null);

    React.useEffect(() => {
        if (process.env.NEXT_PUBLIC_INCLUDE_ADMINISTRATOR !== 'true')
            router.push('/');
    }, [ router, process.env.NEXT_PUBLIC_INCLUDE_ADMINISTRATOR ]);
    
    const onSocketMessage = React.useCallback((event: MessageEvent) => {
        const { from, payload } = JSON.parse(event.data);
        console.log(payload);
        if (from === 'authority' && Array.isArray(payload))
            setGames(payload);
        else if (from === gameId && Array.isArray(payload))
            setBoard(() => {
                const newBoard: board = generateBoard();

                setNext(payload);
                const payloadSet = new Set(payload);

                newBoard.forEach((segment, segmentIndex) =>
                    segment.forEach((row, rowIndex) =>
                        row.forEach((_, cellIndex) => {
                            if(!payloadSet.has(toIndex(segmentIndex, rowIndex, cellIndex)))
                                newBoard[ segmentIndex ][ rowIndex ][ cellIndex ] = toIndex(segmentIndex, rowIndex, cellIndex) + 1;
                        })
                    )
                );
                
                return newBoard;
            });
    }, [ gameId, setBoard, setGames, setNext ]);

    const refreshBoard = React.useCallback(() => {
        if (!ws || !gameId) return;

        setOverride(new Set());
        ws.send(JSON.stringify({
            type: 'direct',
            to: gameId,
            payload: { type: 'getQueue' }
        }))
    }, [ ws, gameId ]);
    
    const refreshGames = React.useCallback(() => {
        if (!ws) return;
        ws.send(JSON.stringify({
            type: 'request',
            requestedData: 'connectedClients'
        }));
    }, [ ws ]);
    
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

    const overrideQueue = React.useCallback(() => {
        if (!ws || !gameId) return;

        ws.send(JSON.stringify({
            type: 'direct',
            to: gameId,
            payload: {
                type: 'overrideQueue',
                data: shuffle(Array.from(override))
            }
        }));
    }, [ ws, gameId, override ]);

    const toggle = (index: number) => {
        setOverride((prev) => {
            const newOverride = new Set(prev);
            newOverride.has(index)
            ?   newOverride.delete(index)
            :   newOverride.add(index);
            return newOverride;
        });
    };

    return (
        <main className={ styles.Main }>
            <h1 style={ { gridColumn: '1 / -1', textAlign: 'center' } }>BINGO ADMINISTRATOR UTILITY <span style={ { opacity: 0.025 } }>(cheat tool)</span></h1>
            <div>
                <button onClick={ refreshGames }>Refresh Game List</button>
                <select value={ gameId ?? '' } onChange={ (e) => setGameId(e.target.value || null) }>
                    <option value="">Select Game</option>
                    { games.map((game) => (
                        <option key={ game } value={ game }>{ game }</option>
                    )) }
                </select>
            </div>
            <div>
                <section style={ { display: 'flex', gap: '0.5rem' } }>
                    <button onClick={ refreshBoard }>Refresh Game State</button>
                    <button onClick={ overrideQueue }>Override Queue</button>
                </section>
                <div className={ styles.Board }>
                    { board.map((column, i) => (
                        <div key={ i } className={ styles.Segments }>
                            { column.map((row, j) => (
                                <div key={ j } className={ styles.Row }>
                                    { row.map((cell, k) => (
                                        <button
                                            key={ k }
                                            style={ {
                                                backgroundColor: override.has(toIndex(i, j, k)) ? 'lightgreen' : 'lightgray',
                                            } }
                                            onClick={
                                                cell === ' '
                                                ?   () => toggle(toIndex(i, j, k))
                                                :   undefined
                                            }
                                        >
                                            { cell }
                                        </button>
                                    )) }
                                </div>
                            )) }
                        </div>
                    )) }
                </div>
                <div className={ styles.Queue }>
                    { next && next.slice(next.length - 5).reverse().map((value, index) => (
                        <div data-index={ index } key={ index }>{ value + 1 }</div>
                    )) }
                </div>
            </div>
        </main>
    );
};

export default Page;