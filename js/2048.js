'use strict';

let grid = new Array();
let baseLength = 107 + 10;
let baseMargin = 10;
let size = 4;
let id = 1; //为砖块分配id
let zero = {
    value: 0,
    id: 0,
    merge: 0,
};
let bestScore = 0;
let score = 0;

function scoreUpdate(addScore) {
    let addDiv = $('#add');
    // let endDiv = $('#end');
    let scoreDiv = $('#score');
    if (addScore > 0) {
        scoreDiv.html(score);
        addDiv.html("+" + addScore);
        addDiv.addClass('active');
        setTimeout(function () {
            addDiv.removeClass('active');
        }, 500);
        if (score > bestScore) {
            localStorage.setItem('bestScore', score);
            initBestScore();
        }
    }
}

function initBestScore() {
    let bestScoreDiv = $('#bestScore');
    bestScore = localStorage.getItem('bestScore') || 0;
    bestScoreDiv.html(bestScore);
}

function initScore() {
    initBestScore();
    let scoreDiv = $('#score');
    scoreDiv.html(0);
}

function init(grid) {
    initScore();
    let tryAgainBtn = $('#tryAgain');
    console.log(tryAgainBtn);
    $('#tryAgain').attr("disabled",true);//添加disabled属性
    let map = $('.map');
    let cells = $('.cell').remove();
    //生成网格
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let net = "<div class = 'bg cell--pop' id = 'cell-" + i + "-" + j + "' " +
                "style='top:" + (i * baseLength + baseMargin) + "px;left:" + (j * baseLength + baseMargin) + "px'>" +
                "</div>";
            map.append(net);
        }
    }
    for (let i = 0; i < size; i++) {
        grid[i] = new Array();
        for (let j = 0; j < size; j++) {
            grid[i][j] = zero
        }
    }
    addBlock(grid);
    addBlock(grid);
}

function checkFull(grid) {
    let flg = true;
    //检查是否有空位
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j].value == 0) {
                flg = false;
            }
        }
    }
    //检查是每行是否能合并
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - 1; j++) {
            if (grid[i][j].value == grid[i][j + 1].value)
                flg = false;
        }
    }
    //检查没列是否能合并
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j].value == grid[i + 1][j].value)
                flg = false;
        }
    }
    return flg;
}



//图像处理
function addBlock(grid) {
    let x = -1;
    let y = -1;
    if (checkFull(grid)) {
        console.log("full!");
        return;
    }
    let checkArry = new Array();
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j].value === 0) {
                let op = {
                    x: i,
                    y: j,
                }
                checkArry.push(op);
            }
        }
    }
    if (checkArry.length === 0) {
        return;
    }
    let index = parseInt(Math.random() * checkArry.length);
    x = checkArry[index].x;
    y = checkArry[index].y;
    let value = Math.random() * 100;
    grid[x][y] = {
        value: (value <= 90 ? 2 : 4),
        id: id,
        merge: 0,
    };
    checkArry.length = 0;
    let top = x * baseLength + baseMargin;
    let left = y * baseLength + baseMargin;
    let block = "<div name='tile' id='" + id + "' " +
        "class='cell cell--" + grid[x][y].value + " cell--pop' " +
        "style='top:" + top + "px;left:" + left + "px'>" + grid[x][y].value + "" +
        "</div>";
    id += 1;
    let map = $('.map');
    map.append(block);
}

function slide(x, y, id) {
    let block = $("#" + id);
    let top = x * baseLength + baseMargin;
    let left = y * baseLength + baseMargin;
    block.css("top", top + "px");
    block.css("left", left + "px");
}

function deleteBlock(id) {
    let block = $("#" + id);
    block.addClass("cell--shrink");
    setTimeout(function () {
        block.remove();
    }, 100);
}

function mergeActive(grid, newBlocks, removeBlocks, existsBlocks, ) {
    let map = $('.map');
    for (let i = 0; i < existsBlocks.length; i++) {
        let position = findBlockById(existsBlocks[i].id, grid);
        slide(position.x, position.y, existsBlocks[i].id);
    }
    for (let i = 0; i < removeBlocks.length; i++) {
        deleteBlock(removeBlocks[i].id);
    }
    let totalAdd = 0;
    for (let i = 0; i < newBlocks.length; i++) {
        score += newBlocks[i].value;
        totalAdd += newBlocks[i].value;
        let position = findBlockById(newBlocks[i].id, grid);
        let top = position.x * baseLength + baseMargin;
        let left = position.y * baseLength + baseMargin;
        let block = "<div name = 'tile' class = 'cell cell--" + newBlocks[i].value +
            " cell--merge' id = '" + newBlocks[i].id +
            "' style = 'left:" + left + "px;top:" + top + "px" +
            "'>" + newBlocks[i].value + "</div>"
        map.append(block);
    }
    scoreUpdate(totalAdd);
}




//处理数据
function moveActive(previous, current) {
    let removeBlocks = new Array();
    let newBlocks = new Array();
    let existsBlocks = new Array();
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (current[i][j].value != 0) {
                let position = findBlockById(current[i][j].id, previous);
                if (position.x != -1 && position.y != -1) {
                    existsBlocks.push(current[i][j]);
                } else {
                    newBlocks.push(current[i][j]);
                }
            }
        }
    }
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (previous[i][j].value != 0) {
                let position = findBlockById(previous[i][j].id, current);
                if (position.x == -1 && position.y == -1) {
                    removeBlocks.push(previous[i][j]);
                }
            }
        }
    }
    mergeActive(current, newBlocks, removeBlocks, existsBlocks);
}

function mergeBlockCPU(grid) {

    let newGrid = new Array();
    for (let i = 0; i < size; i++) {
        newGrid[i] = new Array();
        for (let j = 0; j < size; j++) {
            newGrid[i][j] = grid[i][j];
        }
    }
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (newGrid[i][j].merge !== 0) {
                let num = newGrid[i][j].value * 2;
                let position = {
                    x: i,
                    y: j - 1,
                }
                let newBlock = {
                    value: num,
                    id: id,
                    merge: 0,
                };
                newGrid[i][j] = zero;
                newGrid[position.x][position.y] = newBlock;
                let numArray = new Array();
                for (let z = 0; z < size; z++) {
                    if (newGrid[i][z].value != 0) {
                        numArray.push(newGrid[i][z]);
                    }
                }
                for (let z = numArray.length; z < size; z++) {
                    numArray.push(zero);
                }
                for (let z = 0; z < size; z++) {
                    newGrid[i][z] = numArray[z];
                }
                id++;
            }
        }
    }
    for (let i = 0; i < size; i++) {
        let numArray = new Array();
        for (let j = 0; j < size; j++) {
            if (newGrid[i][j].value != 0) {
                numArray[j] = newGrid[i][j];
            }
        }
        for (let j = 0; j < size; j++) {
            if (j < numArray.length)
                newGrid[i][j] = numArray[j];
            else {
                newGrid[i][j] = zero;
            }
        }
    }

    return newGrid;
}

function findBlockById(id, grid) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j].id == id) {
                return {
                    x: i,
                    y: j
                };
            }
        }
    }
    return {
        x: -1,
        y: -1,
    }
}

function rotateLeft90(grid) { //地图左转90度
    let newGrid = new Array();
    for (let i = 0; i < size; i++) {
        newGrid[i] = new Array();
        for (let j = 0; j < size; j++) {
            let x = j;
            let y = size - 1 - i;
            newGrid[i][j] = grid[x][y];
        }

    }
    return newGrid;

}

function rotateRight90(grid) { //地图右转90度
    let newGrid = new Array();
    // console.log(grid);
    for (let i = 0; i < size; i++) {
        newGrid[i] = new Array();
        for (let j = 0; j < size; j++) {
            let x = size - 1 - j;
            let y = i;
            newGrid[i][j] = grid[x][y];
        }
    }
    return newGrid;

}

function rotate180(grid) { //地图反转
    let newGrid = new Array();
    for (let i = 0; i < size; i++) {
        newGrid[i] = new Array();
        for (let j = 0; j < size; j++) {
            let x = size - 1 - i;
            let y = size - 1 - j;
            newGrid[i][j] = grid[x][y];
        }
    }
    return newGrid;

}

function moveLeft(grid) {
    let newGrid = new Array();
    for (let i = 0; i < size; i++) {
        newGrid[i] = new Array();
    }
    for (let i = 0; i < size; i++) {
        let numArray = new Array();
        for (let j = 0; j < size; j++) {
            if (grid[i][j].value != 0) {
                numArray.push(grid[i][j]);
            }
        }
        for (let j = 0; j < size; j++) {
            if (j < numArray.length) {
                newGrid[i][j] = numArray[j];
            } else {
                newGrid[i][j] = zero;
            }
        }
    }
    newGrid = mergeMark(newGrid);
    newGrid = mergeBlockCPU(newGrid);
    return newGrid;
}

//通过转动地图将其他方向的移动全部转换位左移
function moveRight(grid) {
    let changeGrid = rotate180(grid);
    let moveGrid = moveLeft(changeGrid);
    let newGrid = rotate180(moveGrid);

    return newGrid;
}

function moveUp(grid) {
    let changeGrid = rotateLeft90(grid);
    let moveGrid = moveLeft(changeGrid);
    let newGrid = rotateRight90(moveGrid);
    return newGrid;
}

function moveDown(grid) {
    let changeGrid = rotateRight90(grid);
    let moveGrid = moveLeft(changeGrid);
    let newGrid = rotateLeft90(moveGrid);
    return newGrid;
}

function mergeMark(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length - 1; j++) {
            if (grid[i][j].merge == 0) {
                if (grid[i][j].value != 0 && grid[i][j].value === grid[i][j + 1].value) {
                    grid[i][j + 1].merge = grid[i][j].id;
                }
            }
        }
    }
    return grid;
}

//监听滑动事件完成移动

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    let preGrid = grid;
    if (!xDown || !yDown) {
        return;
    }
    let nowGrid = new Array();

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            nowGrid = moveLeft(grid);
        } else {
            nowGrid = moveRight(grid);
        }
    } else {
        if (yDiff > 0)
            nowGrid = moveUp(grid);
        else {
            nowGrid = moveDown(grid);
        }
    }
    moveActive(preGrid, nowGrid);
    grid = nowGrid;
    let flg = false;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j].value !== preGrid[i][j].value) {
                flg = true;
                break;
            }
        }
    }
    if (flg)
        addBlock(grid);
    if (checkFull(grid)) {
        GameOver();
    }

    xDown = null;
    yDown = null;
}

//监听键盘按键事件，完成移动
function move(evt) {
    //避免组合键冲突
    let modify = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    let whichKey = event.which;
    let preGrid = grid;
    let nowGrid = new Array();
    if (!modify) {
        switch (whichKey) {
            case 37:
                nowGrid = moveLeft(grid);
                break;
            case 38:
                nowGrid = moveUp(grid);
                break;
            case 39:
                nowGrid = moveRight(grid);
                break;
            case 40:
                nowGrid = moveDown(grid);
                break;
            default:
                break;
        }
        moveActive(preGrid, nowGrid);
        grid = nowGrid;
        let flg = false;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j].value !== preGrid[i][j].value) {
                    flg = true;
                    break;
                }
            }
        }
        if (flg)
            addBlock(grid);
    } else {
        console.log("modify");
    }
    if (checkFull(grid)) {
        GameOver();
    }

};

function GameOver() {
    let endDiv = $('#end');
    $('#tryAgain').removeAttr("disabled"); 移除disabled属性
    setTimeout(function () {
        endDiv.addClass('active');
    }, 500);
    return;
}

function isMobile(){
	if( navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i)
	)return true;
	return false;
}

$(function () {
    if(isMobile()){
        $("link").attr({
            rel: "stylesheet",
            type: 'text/css',
            href: 'css/2048mobile.css',
        });
        baseLength = 80 + 10;
    }
    let header = $('.header');
    let container = $('.container');
    //设置各个模块位置关系
    let top = header.height();
    container.css("top", top);
    //添加按钮事件
    let tryAgainBtn = $('#tryAgain');
    let newGameBtn = $('#newGame');
    let endDiv = $('#end');
    tryAgainBtn.click(function () {
        init(grid);
        setTimeout(function () {
            endDiv.removeClass('active');
        }, 100);
        return;
    });
    newGameBtn.click(function () {
        init(grid);
    });
    //初始化地图
    init(grid);
    document.addEventListener("keydown", move);
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);
})