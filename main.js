const W = 10;       //width - number of tiles horizontally
const H = 20;       //height - number of tiles vertically
const S = 30;       //size - tile size in pixels
const NS = 300;     //normal speed in miliseconds
const HS = 30;      //high speed in miliseconds

let ctx = null;
let t = Date.now();
let grid = [];
let piece = null;
let nextType = 0;
let pX = 4;
let pY = -1;
let points = 0;
let animReq = null;

let speed = NS;

document.addEventListener("DOMContentLoaded", () => {
    prepare();
});

function prepare()
{
    const canvas = document.getElementById("display");
    ctx = canvas.getContext("2d");

    let startButton = document.getElementById("start-button");
    startButton.addEventListener("click", handleStartClick);
    
    let restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", restart);

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyup);

    drawGrid();
}

function handleStartClick()
{
    let startButton = document.getElementById("start-button");
    startButton.style.display = "none";
    start();
}

function animate()
{
    let now = Date.now();

    if(now - t > speed)
    {
        pY += 1;

        if(checkCollision())
        {
            pY -= 1;

            if(pY != -1)
            {
                merge();
                checkFullRows();
                piece = getPiece(nextType);
                nextType = rand();

                updatePreview();
                pX = 4;
                pY = -1;
            }
            else
                gameOver();
        }
        t = now;
    }
    draw();

    if(animReq)
        animReq = window.requestAnimationFrame(animate);
}

function gameOver()
{
    let gameoverContainer = document.getElementById("gameover-container");
    gameoverContainer.style.display = "flex";

    window.cancelAnimationFrame(animReq);
    animReq = null;
}

function restart()
{
    let gameoverContainer = document.getElementById("gameover-container");
    gameoverContainer.style.display = "none";
    start();
}

function start()
{
    points = 0;
    updateScore();
    grid = generateEmpty(); 
    piece = getPiece(rand());
    nextType = rand();
    updatePreview();
    animReq = window.requestAnimationFrame(animate);
}

function rand()
{
    return Math.floor(Math.random() * 7);
}

function merge()
{
    for(let i = 0; i < piece.length; i++)
        for(let j = 0; j < piece[i].length; j++)
            if(piece[i][j] != 0)
                grid[pY + i][pX + j] = piece[i][j];
}

function rotate(clockwise)
{
    let tmp = clone(piece);

    if(clockwise)
        for(let i = 0; i < piece.length; i++)
            for(let j = 0; j < piece[i].length; j++)
                tmp[j][piece.length - 1 - i] = piece[i][j];
    else
        for(let i = 0; i < piece.length; i++)
            for(let j = 0; j < piece[i].length; j++)
                tmp[piece.length - 1 - j][i] = piece[i][j];
    piece = tmp;
}

function checkCollision()
{
    for(let i = 0; i < piece.length; i++)
        for(let j = 0; j < piece[i].length; j++)
            if(piece[i][j] != 0 && (grid[pY + i] && grid[pY + i][pX + j]) != 0)
                return true;
    return false;
}

function handleKeydown(e)
{
    switch(e.keyCode) 
    {
        case 65:
            pX -= 1;
            if(checkCollision())
                pX += 1;
            break;
        case 68:
            pX += 1;
            if(checkCollision())
                pX -= 1;
            break;
        case 83:
            speed = HS;
            break;
        case 32:
            rotate(true);
            if(checkCollision())
                rotate(false);
            break;
    } 
}

function handleKeyup(e)
{
    switch(e.keyCode) 
    {
        case 83:
            speed = NS;
            break;
    } 
}

function checkFullRows()
{
    grid.forEach(async (row, i) => {
        if(row.every(cell => cell != 0))
        {
            await disappearRow(row);
            grid.splice(i, 1);
            grid.unshift(new Array(10).fill(0));
            points += 100;
            updateScore();
        }
    });
}

async function disappearRow(row)
{
    let tmp = clone(row);

    for(let i = 0; i < row.length; i++)
    {
        row[i] = 0;
        await wait(20);
        row[i] = tmp[i];
    }
    await wait(200);
}

function wait(ms)
{
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}

function updateScore()
{
    let score = document.getElementById("score");
    score.innerText = points;
}

function clone(array)
{
    return JSON.parse(JSON.stringify(array));
}

function generateEmpty()
{
    let array = new Array(H);
    for(let i = 0; i < H; i++)
        array[i] = new Array(W).fill(0);
    
    return array;
}

function draw()
{
    ctx.clearRect(0,0,W*S,H*S);
    
    drawGrid();
    drawMatrix(ctx, piece, pX, pY);
    drawMatrix(ctx, grid, 0, 0);
}

function drawGrid()
{
    ctx.lineWidth = 1;
    ctx.strokeStyle = "lightgray";

    for(let i = 0; i < H; i++)
        for(let j = 0; j < W; j++)
            ctx.strokeRect(j*S, i*S, S, S);
}

function drawMatrix(context, matrix, x, y)
{
    for(let i = 0; i < matrix.length; i++)
        for(let j = 0; j < matrix[i].length; j++)
            if(matrix[i][j] != 0)
                drawTile(context, x + j, y + i, matrix[i][j] - 1)
}

function drawTile(context, x, y, color)
{
    context.fillStyle = "white";
    context.fillRect(x*S, y*S, S, S);

    context.fillStyle = getColor(color);
    context.fillRect(x*S+2, y*S+2, S-4, S-4);

    context.lineWidth = 2;
    context.strokeStyle = "black";
    context.strokeRect(x*S+2, y*S+2, S-4, S-4)
}

function getPiece(type)
{
    let pieces = [
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        [
            [2, 0, 0],
            [2, 2, 0],
            [0, 2, 0]
        ],
        [
            [0, 3, 0],
            [3, 3, 0],
            [3, 0, 0]
        ],
        [
            [0, 4, 0],
            [4, 4, 0],
            [0, 4, 0]
        ],
        [
            [5, 5, 0],
            [0, 5, 0],
            [0, 5, 0] 
        ],
        [
            [0, 6, 0],
            [0, 6, 0],
            [6, 6, 0]
        ],
        [
            [7, 7],
            [7, 7]
        ]
    ];

    return pieces[type];
}

function getColor(index)
{
    let colors = ["red", "green", "blue", "orange", "pink", "yellow", "cyan"];
    return colors[index];
}

function updatePreview()
{
    let preview = document.getElementById("preview");
    let pctx = preview.getContext("2d");
    let nextPiece = getPiece(nextType);
    
    let width = 3;
    let height = 5;
    let nh = nextPiece.length;
    let nw = getPieceWidth(nextPiece);

    let x = (nextType == 0) ? 0 : 0.5*width - 0.5*nw;
    let y = 0.5*height - 0.5*nh;

    pctx.clearRect(0,0,width*S,height*S);
    drawMatrix(pctx, nextPiece, x, y);
}

function getPieceWidth(p)
{
    let max = 0;
    p.forEach(row => {
        let l = row.filter(c => c != 0).length;
        if (max < l)
            max = l;
    });

    return max;
}