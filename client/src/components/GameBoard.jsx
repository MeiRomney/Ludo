import { Star } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'

const GameBoard = ({ players, currentPlayer, onMove, pendingRoll }) => {

    const [selectedToken, setSelectedToken] = useState(null);
    const [animatedPositions, setAnimatedPositions] = useState({});
    
    // Keep previous players snapshot to detect changes
    const prevPlayersRef = useRef();
    const timersRef = useRef({});

    const redPath = [
        [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], 
        [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14], 
        [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7],
        [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5],
    ];
    const bluePath = [
        [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14],
        [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7],
        [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0],
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
    ];
    const yellowPath = [
        [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7],
        [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0],
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7],
        [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14], [7, 13], [7, 12], [7, 11], [7, 10], [7, 9],
    ];
    const greenPath = [
        [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
        [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
        [7, 0],
        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
        [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
        [0, 7],
        [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
        [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
        [7, 14],
        [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
        [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
        [14, 7], [13, 7], [12, 7], [11, 7], [10, 7], [9, 7],
    ];

    const homeCoordinate = {
        red: [[2,2], [2,3], [3,2], [3,3]],
        blue: [[2,11], [2,12], [3,11], [3,12]],
        green: [[11,2], [11,3], [12,2], [12,3]],
        yellow: [[11,11], [11,12], [12,11], [12,12]],
    }

    const finishedCoordinate = {
        red: [7, 6],
        blue: [6, 7],
        green: [8, 7],
        yellow: [7, 8],
    }

    const blueSafeZone = [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [1, 8],];
    const redSafeZone = [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [6, 1],];
    const yellowSafeZone = [[7, 9], [7, 10], [7, 11], [7, 12], [7, 13], [8, 13],];
    const greenSafeZone = [[9, 7], [10, 7], [11, 7], [12, 7], [13, 7], [13, 6],];

    // Safe/star zones
    const starZones = [
        [2, 6],
        [6, 12],
        [8, 2],
        [12, 8],
    ];

    // Arrows marking home entry direction
    const arrows = [
        { row: 0, col: 7, color: "#3B82F6", rotation: "rotate-180" },
        { row: 14, col: 7, color: "#22C55E", rotation: "" },
        { row: 7, col: 0, color: "#EF4444", rotation: "rotate-90" },
        { row: 7, col: 14, color: "#EAB308", rotation: "-rotate-90" },
    ];

    const redHome = { rowStart: 0, colStart: 0, color: "bg-red-200", border: "border-red-400" };
    const blueHome = { rowStart: 0, colStart: 9, color: "bg-blue-200", border: "border-blue-400" };
    const greenHome = { rowStart: 9, colStart: 0, color: "bg-green-200", border: "border-green-400" };
    const yellowHome = { rowStart: 9, colStart: 9, color: "bg-yellow-200", border: "border-yellow-400" };

    // helper function
    const match = (arr, row, col) => arr.some(([r, c]) => r === row && c === col);

    const getCellColor = (row, col) => {
        if(match(blueSafeZone, row, col)) return "bg-blue-500";
        if(match(greenSafeZone, row, col)) return "bg-green-500";
        if(match(redSafeZone, row, col)) return "bg-red-500";
        if(match(yellowSafeZone, row, col)) return "bg-yellow-500";
        return "bg-white";
    }

    const getPathByColor = (color) => {
        switch(color) {
            case 'red': return redPath;
            case 'blue': return bluePath;
            case 'yellow': return yellowPath;
            case 'green': return greenPath;
            default: return [];
        }
    }

    // ---Animation---
    const getPieceOffset = (index, total) => {
        const offsetAmount = 4;
        const positions = [
            [-offsetAmount, -offsetAmount],
            [offsetAmount, -offsetAmount],
            [-offsetAmount, offsetAmount],
            [offsetAmount, offsetAmount],
        ];
        return positions[index % positions.length];
    }

    // Start animation for a token from `fromIndex` to `toIndex` (both can be -1 or 0..56)
    const startTokenAnimation = (tokenId, playerColor, fromIndex, toIndex, onComplete) => {
        // Clear existing timer for token
        if(timersRef.current[tokenId]) {
            clearInterval(timersRef.current[tokenId]);
            delete timersRef.current[tokenId];
        }

        const path = getPathByColor(playerColor);

        // For animation we only animate indices along the path (0..55) and treat -1 and 56 specially
        const clampToPathIndex = (idx) => {
            if(idx === -1) return -1;
            if(idx >= 0 && idx <= 55) return idx;
            if(idx === 56) return 56;
            return -1;
        }

        const start = clampToPathIndex(fromIndex);
        const end = clampToPathIndex(toIndex);

        // If start and end are the same, just set directly
        if(start === end) {
            setAnimatedPositions(prev => ({...prev, [tokenId]: end}));
            onComplete?.();
            return;
        }

        // Determine direction (forward or backward)
        const step = start < end ? 1 : -1;
        let current = start;

        // First set initial displayed value
        setAnimatedPositions(prev => ({...prev, [tokenId]: current}));

        const speed = 180;

        timersRef.current[tokenId] = setInterval(() => {
            // Moves one step
            if(current === 56) { // Already at finished stop
                clearInterval(timersRef.current[tokenId]);
                delete timersRef.current[tokenId];
                onComplete?.();
                return;
            }

            current = current + step;
            setAnimatedPositions(prev => ({...prev, [tokenId]: current}));

            // If we've reached (or passed) the end -> stop
            if((step === 1 && current >= end) || (step === -1 && current <= end)) {
                clearInterval(timersRef.current[tokenId]);
                delete timersRef.current[tokenId];
                onComplete?.();
            }
        }, speed);
    }

    // On players prop change, detect moved tokens and animate them
    useEffect(() => {
        const prev = prevPlayersRef.current;
        const movedTokens = [];
        const capturedTokens = [];
        if(prev) {
            // Build quick lookup: tokenId -> position and playerColor
            const prevLookup = {};
            prev.forEach(p => p.tokens?.forEach(t => prevLookup[t.tokenId] = { pos: t.position, color: p.color }));
            const currLookup = {};
            players.forEach(p => p.tokens?.forEach(t => currLookup[t.tokenId] = { pos: t.position, color: p.color }));

            // Compare
            Object.keys(currLookup).forEach(tokenId => {
                const prevEntry = prevLookup[tokenId];
                const currEntry = currLookup[tokenId];
                if(!prevEntry) {
                    // new Token (unlikely) -> set displayed directly
                    setAnimatedPositions(prev => ({...prev, [tokenId]: currEntry.pos}));
                } else if(prevEntry.pos != currEntry.pos) {
                    // animate
                    //startTokenAnimation(tokenId, currEntry.color, prevEntry.pos, currEntry.pos);
                    if(currEntry.pos > prevEntry.pos) {
                        movedTokens.push({ tokenId, color: currEntry.color, from: prevEntry.pos, to: currEntry.pos });
                    } else if(currEntry.pos === -1) {
                        capturedTokens.push({ tokenId, color: currEntry.color, from: prevEntry.pos, to: -1 });
                    }
                }
            });

            // Run all moved tokens first
            movedTokens.forEach((moved) => {
                startTokenAnimation(moved.tokenId, moved.color, moved.from, moved.to, () => {
                    // After it finishes, then animate captured tokens
                    capturedTokens.forEach((captured) => {
                        startTokenAnimation(captured.tokenId, captured.color, captured.from, captured.to)
                    });
                });
            });

        } else {
            // first render -> set displayed positions to actual
            const initial = {};
            players.forEach(p => p.tokens?.forEach(t => { initial[t.tokenId] = t.position}));
            setAnimatedPositions(initial);
        }

        prevPlayersRef.current = players;

        // Clean up when players change quickly: (We don't clear timers here because we want animation to continue)
    }, [players]);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach(id => clearInterval(id));
            timersRef.current = {};
        }
    }, [])

    const getTokenPositions = () => {
        const tokens = [];

        players.forEach((player) => {
            const path = getPathByColor(player.color);
            const colorClass = {
                red: "bg-red-500",
                blue: "bg-blue-500",
                yellow: "bg-yellow-500",
                green: "bg-green-500",
            }[player.color];

            player.tokens?.forEach((token, index) => {
                const displayedPos = animatedPositions[token.tokenId] ?? token.position;

                let pos;
                if(displayedPos === -1) {
                    pos = homeCoordinate[player.color][index];
                } else if(displayedPos === 56){
                    const base = finishedCoordinate[player.color];
                    const offset = getPieceOffset(index, player.tokens.length);
                    pos = [base[0], base[1], offset];
                } else {
                    pos = path[displayedPos];
                }

                tokens.push({ color: colorClass, pos, playerColor: player.color, tokenId: token.tokenId });
            });
        });
        return tokens;
    };

    const getMovableTokenIds = () => {
        if(!currentPlayer || !pendingRoll ) return [];

        // Find token that can move with this roll
        return currentPlayer.tokens
            .filter(t => {
                // Same rule as backend: can move if not in home (-1) and not finished
                if(t.position === -1 && pendingRoll === 6) return true;
                if(t.position >= 0 && t.position + pendingRoll <= 56) return true;
                return false;
            })
            .map(t => t.tokenId);
    }

    const handleTokenClick = (playerColor, tokenId) => {     
        // Only allow clicking current player's tokens
        if(currentPlayer?.color != playerColor) return;
        setSelectedToken(tokenId);

        // Notify parent which token was selected
        if(onMove) {
            onMove({playerColor, tokenId });
            setTimeout(() => setSelectedToken(null), 500);
        }
    };

    const allPieces = getTokenPositions();
    const movableTokenIds = getMovableTokenIds();

    const renderPieces = (row, col) => {
        // Find all pieces in this cell
        const piecesHere = allPieces.filter(
            (p) => Array.isArray(p.pos) && p.pos[0] === row && p.pos[1] === col
        );

        return piecesHere.map((piece, i) => {
            const [x, y] = piece.pos[2] || getPieceOffset(i, piecesHere.length);
            return (
                <div
                key={i}
                onClick={() => handleTokenClick(piece.playerColor, piece.tokenId)}
                className={`w-6 h-6 ${piece.color} rounded-full border-2 z-10 ${
                    selectedToken === piece.tokenId ? 'ring-4 ring-yellow-400'
                    : movableTokenIds.includes(piece.tokenId) && piece.playerColor === currentPlayer?.color
                        ? 'ring-4 ring-amber-400 animate-glow'
                        : ''
                }`}
                style={{
                    position: 'absolute',
                    top: '25%',
                    left: '25%',
                    transform: `translate(${x}px, ${y}px)`
                }}
                title={`${piece.playerColor} token`}></div>
            )
        })
    }

  return (
    <div className="flex-1 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-white rounded-2xl shadow-2xl grid grid-cols-15 grid-rows-15 relative overflow-hidden">

            {[...Array(225)].map((_, i) => {
                const row = Math.floor(i / 15);
                const col = i % 15;

                const isStar = match(starZones, row, col);
                const arrow = arrows.find((a)=> a.row === row && a.col === col);
                const bgColor = getCellColor(row, col);
                const pieces = renderPieces(row, col);

                return (
                    <div
                    key={i}
                    className={`border border-gray-300 flex items-center justify-center relative ${bgColor}`}>
                        {isStar && <span className='text-gray-300 text-sm z-0 absolute'><Star/></span>}
                        {arrow && (
                            <div
                                className={`w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] ${arrow.rotation} z-0 absolute`}
                                style={{
                                    borderLeftColor: 'transparent',
                                    borderRightColor: 'transparent',
                                    borderBottomColor: arrow.color,
                                    borderStyle: 'solid',
                                }}
                            ></div>
                        )}
                        {pieces}
                    </div>
                );
            })}

            {/* Red zone - Top left */}
            <div
                className={`absolute top-0 left-0 w-[40%] h-[40%] ${redHome.color} ${redHome.border} border-4 rounded-tl-2xl flex items-center justify-center`}
            >
                <div className='grid grid-cols-2 gap-3'>
                    {[...Array(4)].map((_, i)=> (
                        <div key={i} className='w-5 h-5 bg-white rounded-full shadow-md border-2 border-white'></div>
                    ))}
                </div>
            </div>

            {/* Blue zone - Top right */}
            <div
                className={`absolute top-0 right-0 w-[40%] h-[40%] ${blueHome.color} ${blueHome.border} border-4 rounded-tr-2xl flex items-center justify-center`}
            >
                <div className='grid grid-cols-2 gap-3'>
                    {[...Array(4)].map((_, i)=> (
                        <div key={i} className='w-5 h-5 bg-white rounded-full shadow-md border-2 border-white'></div>
                    ))}
                </div>
            </div>

            {/* Green zone - Bottom left */}
            <div
                className={`absolute bottom-0 left-0 w-[40%] h-[40%] ${greenHome.color} ${greenHome.border} border-4 rounded-bl-2xl flex items-center justify-center`}
            >
                <div className='grid grid-cols-2 gap-3'>
                    {[...Array(4)].map((_, i)=> (
                        <div key={i} className='w-5 h-5 bg-white rounded-full shadow-md border-2 border-white'></div>
                    ))}
                </div>
            </div>
            
            {/* Yellow zone - Bottom right */}
            <div
                className={`absolute bottom-0 right-0 w-[40%] h-[40%] ${yellowHome.color} ${yellowHome.border} border-4 rounded-br-2xl flex items-center justify-center`}
            >
                <div className='grid grid-cols-2 gap-3'>
                    {[...Array(4)].map((_, i)=> (
                        <div key={i} className='w-5 h-5 bg-white rounded-full shadow-md border-2 border-white'></div>
                    ))}
                </div>
            </div>

            {/* Center */}
            <div className='absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-white border border-gray-400 flex items-center justify-center'>
                <div className='w-6 h-6 bg-gray-800 rounded-full'></div>
            </div>
        </div>
    </div>
  )
}

export default GameBoard
