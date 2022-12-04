"use strict";

import "./snakeUtils.js"
import "./snakeInteraction.js"
import "./snakeConst.js"

// 游戏使用的所有Canvas
window.GameCanvas = {
    background: document.getElementById("background").getContext("2d"),
    wall:       document.getElementById("wall").getContext("2d"),
    info:       document.getElementById("info").getContext("2d"),
    food:       document.getElementById("food").getContext("2d"),
    snake:      document.getElementById("snake").getContext("2d"),
    tip:        document.getElementById("tip").getContext("2d"),
    menu:       document.getElementById("menu").getContext("2d"),
};

// 游戏使用的全局变量
window.GameVar = {
    // 游戏状态，合法值参考 GameConst.StatusEnum
    _status: GameEnum.GameStatus.Main,
    get status(){ return this._status; },
    set status(val){
        if(!(val in Object.values(GameEnum.GameStatus))) throw 'error';
        this._status = val;
    },

    // 蛇头当前朝向 合法值参考 GameConst.DirectionEnum
    _snakeCurrentAngle:  GameEnum.SnakeDirection.Right,
    get snakeCurrentAngle(){ return this._snakeCurrentAngle; },
    set snakeCurrentAngle(val){
        if(!(val in Object.values(GameEnum.SnakeDirection))) throw 'error';
        this._snakeCurrentAngle = val;
    },

    // 蛇头下一帧朝向 合法值参考 GameConst.DirectionEnum
    _snakeNextAngle: GameEnum.SnakeDirection.None,
    get snakeNextAngle(){ return this._snakeNextAngle; },
    set snakeNextAngle(val){
        if(!(val in Object.values(GameEnum.SnakeDirection))) throw 'error';
        this._snakeNextAngle = val;
    },

    // 游戏模式，参考 GameEnum.GameMode
    _gameMode: 0,
    get gameMode(){ return this._gameMode; },
    set gameMode(val){
        if(!(val in Object.values(GameEnum.GameMode))) throw 'error';
        this._gameMode = val;
    },

    // 菜单选项index位置，从0开始计数
    _menuFocusIdx:0,
    get menuFocusIdx(){ return this._menuFocusIdx; },
    set menuFocusIdx(val){
        if(!Number.isInteger(val)) throw 'error';
        // 如果当前没有菜单项，报错
        if(!(GameVar.status in GameText.GameMenuText)) throw 'error';
        // 如果idx超过了菜单项的范围，报错
        if(val < 0 || val >= Object.keys(GameText.GameMenuText[GameVar.status]).length) throw 'error';
        this._menuFocusIdx = val;
    },


    //分数
    _score:0,
    get score(){ return this._score; },
    set score(val){
        if(!Number.isInteger(val)) throw 'error';
        this._score = val;
    },

    //下次分数获得的额外奖励分（随着时间会逐渐降低）
    _gift:0,
    get gift(){ return this._gift; },
    set gift(val){
        if(!Number.isInteger(val)) throw 'error';
        this._gift = val;
    },

    //蛇链表，用于标记蛇位置信息,开始为蛇头,结尾为蛇尾
    snakeList:[],

    //食物位置，[x,y]
    foodPos:[null,null],

    _speed:200,                  //蛇移动速度，每经过此毫秒移动一帧
    get speed(){ return this._speed; },
    set speed(val){
        if(!Number.isInteger(val)) throw 'error';
        this._speed = val;
    },

    _intervalHandle: 0,        //每帧处理setInterval句柄，用于控制游戏是否行动，0代表目前无循环事件
    get intervalHandle(){ return this._intervalHandle; },
    set intervalHandle(val){
        if(!Number.isInteger(val)) throw 'error';
        this._intervalHandle = val;
    },
};

// 游戏使用的所有相关游戏方法
window.GameFunc = {
    // 绘制相关方法
    changeLanguage: (lang) => {
        window.GameText = GameTextI18n[lang];
        GameFunc.drawBackground();
        GameFunc.drawInfo();
        GameFunc.drawMenu();
    },
    drawPixel: (canvas, x, y, fillColor, borderColor) => {
        // 明确每个像素点 10*10
        let spanWidth = 1;
        let width = 10 - spanWidth;
        canvas.fillStyle = fillColor;
        canvas.strokeStyle = borderColor;
        canvas.lineWidth = spanWidth;
        canvas.beginPath();
        canvas.rect(x * 10 + spanWidth, y * 10 + spanWidth, width, width);
        canvas.fill();
        canvas.stroke();
    },
    drawBackground: (bgColor = "#001323") => {
        let bg = GameCanvas.background;
        let text = GameText.GameBackgroundText;

        // 黑色背景
        bg.fillStyle = bgColor;
        bg.fillRect(0,0,800,600);

        // 左右分割线
        bg.fillStyle="#000000";
        bg.fillRect(600,0,10,600);

        // "贪吃蛇" 镂空文字
        bg.font='40px 微软雅黑';
        bg.strokeStyle='#ffffff';
        bg.strokeText(text.gameName,640,50);

        // 游戏介绍
        bg.font='16px 微软雅黑';
        bg.fillStyle='#ffffff';
        let topIntroduce = 260
        text.gameIntroduce.forEach((e)=>{
            bg.fillText(e, 630, topIntroduce);
            topIntroduce += 20;
        });
        topIntroduce = 550;
        text.gameAuthorInfo.forEach((e)=>{
            bg.fillText(e, 630, topIntroduce);
            topIntroduce += 20;
        });
    },
    drawWall: (fillColor = "#383838", strokeColor = "#000000") => {
        let wall = GameCanvas.wall;
        for(let fi = 0; fi < 60; fi++){
            GameFunc.drawPixel(wall, fi, 0, fillColor, strokeColor);
            GameFunc.drawPixel(wall, fi, 59,fillColor, strokeColor);
            GameFunc.drawPixel(wall, 0, fi, fillColor, strokeColor);
            GameFunc.drawPixel(wall, 59, fi,fillColor, strokeColor);

        }
    },
    drawMenu: () => {
        let status = GameVar.status;

        let menuCanvas = GameCanvas.menu;
        menuCanvas.clearRect(0,0,600,600);

        // 如果该模式没有菜单的话，结束运行不绘制菜单
        if(!(status in GameText.GameMenuText)) return;

        menuCanvas.strokeStyle = '#ffffff';
        menuCanvas.fillStyle = '#ffffff';
        menuCanvas.lineWidth = 2;
        menuCanvas.font = '22px 微软雅黑';

        // 给出一个[str...]列表用于绘制
        let startdraw = (li) => {
            let leftRect = 229, leftText = 259;
            let topRect = 229, topText = 259;
            let width = 146;
            let height = 46;
            let span = 70;
            li.forEach((e) => {
                menuCanvas.strokeRect(leftRect, topRect, width, height);
                menuCanvas.fillText(e, leftText, topText);
                topRect += span;
                topText += span;
            });
        };

        // 生成一段菜单列表并交由startdraw绘制
        let menuItems = (()=>{
            // 获取菜单的按钮数目
            let nums = Object.keys(GameText.GameMenuText[status]).length;
            // 开始逐一获取菜单文字
            let list = []
            for(let i = 0; i < nums; i++){
                list.push(GameText.GameMenuText[status][i]);
            }
            return list;
        })();

        // 开始绘制菜单
        startdraw(menuItems);

        // 画激活的部分
        menuCanvas.strokeStyle='#ff6666';
        menuCanvas.lineWidth=5;
        menuCanvas.strokeRect(229,229 + ( GameVar.menuFocusIdx * 70),146,46);
    },
    drawInfo: () => {
        if(GameVar.status === GameEnum.GameStatus.Gaming){
            let info = GameCanvas.info;
            info.clearRect(600,0,200,600);
            info.font='22px 微软雅黑';
            info.fillStyle='#ffffff';
            info.fillText(GameText.GameMenuText[GameEnum.GameStatus.Main][GameVar.gameMode],630,140);
            info.fillText(GameText.GameInfoText.score + ': ' + GameVar.score,630,175);
            info.fillText(GameText.GameInfoText.snakeSize + ': ' + GameVar.snakeList.length,630,210);
        }
    },
    drawSnake: () => {
        let snake = GameCanvas.snake;
        snake.clearRect(0,0,700,600);
        // 绘制蛇身
        let snakelist = GameVar.snakeList;
        snakelist.forEach(pix => {
            GameFunc.drawPixel(snake, pix.x, pix.y, "#F08080", "#F08080");
        });
        // 绘制蛇头
        GameFunc.drawPixel(snake, snakelist[0].x, snakelist[0].y, "#F0E68C", "#F0E68C");
    },
    drawFood: () => {
        let foodCanvas = GameCanvas.food;
        foodCanvas.clearRect(0,0,600,600);

        // 生成一个不在蛇身的一个食物坐标
        do{
            let x = GameUtils.randomInteger(1,58);
            let y = GameUtils.randomInteger(1,58);
            GameVar.food = new GameClass.Point(x, y);
        }while(GameVar.snakeList.some(x => x.equal(GameVar.food)));

        GameFunc.drawPixel(foodCanvas, GameVar.food.x, GameVar.food.y, "#ff3333", "#ff3333");
    },
    // 游戏初始化，为下面的几个方法合理的赋值，并且开始游戏
    gameInit: () => {
        GameFunc.gameModeFunc = GameMode[GameVar.gameMode];
        GameFunc.gameModeFunc.gameStart();
    },
    gameModeFunc: {
        calcEatFood: null,
        calcHitFatal: null,
        calcSnake: null,
        gameStart: null,
        gamePaused: null,
        gameContinue: null,
        gameEnd: null,
    },
};

window.GameMode = {
    [GameEnum.GameMode.Easy]: {
        calcEatFood:() => {
            if(GameVar.snakeList[0].equal(GameVar.food)){
                //吃到食物，保留蛇尾，刷新食物，加分数
                let bonus;
                bonus = Math.floor((GameVar.gift>=0?GameVar.gift:0)+(10000/GameVar.speed));
                GameVar.score += bonus;
                GameFunc.drawInfo();
                GameFunc.drawFood();
                GameVar.gift = (GameVar.menuFocusIdx * 2 + 1) * (
                    Math.abs(GameVar.food.x - GameVar.snakeList[0].x) +
                    Math.abs(GameVar.food.y - GameVar.snakeList[0].y)
                );
            }else{
                //没吃到食物，去掉蛇尾
                GameVar.snakeList.pop();
            }
        },
        calcHitFatal: () => {
            let isFatal = GameVar.snakeList.some(e =>
                e !== GameVar.snakeList[0] && GameVar.snakeList[0].equal(e) // 撞蛇
            );
            if(isFatal){
                GameFunc.gameModeFunc.gameEnd();
            }
        },
        calcSnake: () => {
            //计算蛇下一次走向
            let direction;
            if(GameVar.snakeNextAngle) direction = GameVar.snakeNextAngle
            else direction = GameVar.snakeCurrentAngle;

            let snakelist = GameVar.snakeList;
            let Point = GameClass.Point;

            let x = snakelist[0].x, y = snakelist[0].y
            if(direction === 1){ GameVar.snakeCurrentAngle=1; y--; }
            else if(direction === 2){ GameVar.snakeCurrentAngle=2; x--; }
            else if(direction === 3){ GameVar.snakeCurrentAngle=3; y++; }
            else if(direction === 4){ GameVar.snakeCurrentAngle=4; x++; }

            //允许撞墙
            if(x === 0) x = 58;
            if(x === 59) x = 1;
            if(y === 0) y = 58;
            if(y === 59) y = 1;

            snakelist.unshift(new Point(x, y));

            //计算蛇吃到了食物
            GameVar.gift--;
            GameFunc.gameModeFunc.calcEatFood();

            GameFunc.drawSnake();
            //计算蛇不撞蛇、墙
            GameFunc.gameModeFunc.calcHitFatal();

            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
        },
        gameStart: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            GameFunc.drawMenu();
            GameFunc.drawInfo();
            GameVar.speed = 50;
            //创建蛇链表
            var Point = GameClass.Point;
            GameVar.snakeList=[
                new Point(20,29), new Point(19,29), new Point(18,29),
                new Point(17,29), new Point(16,29)
            ];
            GameVar.snakeCurrentAngle = GameEnum.SnakeDirection.Right;
            GameFunc.drawInfo();
            GameFunc.drawSnake();
            GameFunc.drawFood();
            GameFunc.gameModeFunc.gameContinue();
        },
        gamePaused: () => {
            if(GameVar.status === GameEnum.GameStatus.Gaming){
                if(GameVar.intervalHandle !== 0) {
                    clearInterval(GameVar.intervalHandle);
                    GameVar.intervalHandle = 0;
                }
                GameVar.status = GameEnum.GameStatus.GamePaused;
                GameVar.menuFocusIdx = 0;
                GameFunc.drawMenu();
            }
        },
        gameContinue: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            setTimeout(()=>{
                if(GameVar.status !== GameEnum.GameStatus.Gaming) return;
                if(GameVar.intervalHandle !== 0) return;
                GameVar.intervalHandle = setInterval(()=>{
                    GameFunc.gameModeFunc.calcSnake();
                }, GameVar.speed);
            },1000);
            GameFunc.drawMenu();
        },
        gameEnd: () => {
            clearInterval(GameVar.intervalHandle);
            GameVar.intervalHandle = 0;
            GameVar.status = GameEnum.GameStatus.Main;
            GameVar.menuFocusIdx = 0;
            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
            GameVar.anakedefaultangle = GameEnum.SnakeDirection.Right;
            //GameVar.gameMode = 0;
            GameVar.score = 0;
            GameVar.gift = 0;
            GameVar.snakeList = [];
            GameVar.foodPos = null;
            GameFunc.drawMenu(1);
        },
    },
    [GameEnum.GameMode.Normal]: {
        calcEatFood:() => {
            if(GameVar.snakeList[0].equal(GameVar.food)){
                //吃到食物，保留蛇尾，刷新食物，加分数
                let bonus;
                bonus = Math.floor((GameVar.gift>=0?GameVar.gift:0)+(10000/GameVar.speed) );
                GameVar.score += bonus;
                GameFunc.drawInfo();
                GameFunc.drawFood();
                GameVar.gift = (GameVar.menuFocusIdx * 2 + 1) * (
                    Math.abs(GameVar.food.x - GameVar.snakeList[0].x) +
                    Math.abs(GameVar.food.y - GameVar.snakeList[0].y)
                );
            }else{
                //没吃到食物，去掉蛇尾
                GameVar.snakeList.pop();
            }
        },
        calcHitFatal: () => {
            let isFatal = GameVar.snakeList.some(e => (
                ( e.x < 1 || e.x > 58 || e.y < 1 || e.y > 58 ) || // 撞墙
                ( e !== GameVar.snakeList[0] && GameVar.snakeList[0].equal(e) ) // 撞蛇
            ));
            if(isFatal){
                GameFunc.gameModeFunc.gameEnd();
            }
        },
        calcSnake: () => {
            //计算蛇下一次走向
            let direction;
            if(GameVar.snakeNextAngle) direction = GameVar.snakeNextAngle
            else direction = GameVar.snakeCurrentAngle;

            let snakelist = GameVar.snakeList;
            let Point = GameClass.Point;

            let x = snakelist[0].x, y = snakelist[0].y
            if(direction === 1){ GameVar.snakeCurrentAngle=1; y--; }
            else if(direction === 2){ GameVar.snakeCurrentAngle=2; x--; }
            else if(direction === 3){ GameVar.snakeCurrentAngle=3; y++; }
            else if(direction === 4){ GameVar.snakeCurrentAngle=4; x++; }

            snakelist.unshift(new Point(x, y));

            //计算蛇吃到了食物
            GameVar.gift--;
            GameFunc.gameModeFunc.calcEatFood();

            GameFunc.drawSnake();
            //计算蛇不撞蛇、墙
            GameFunc.gameModeFunc.calcHitFatal();

            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
        },
        gameStart: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            GameFunc.drawMenu();
            GameFunc.drawInfo();
            GameVar.speed = 50;
            //创建蛇链表
            var Point = GameClass.Point;
            GameVar.snakeList=[
                new Point(20,29), new Point(19,29), new Point(18,29),
                new Point(17,29), new Point(16,29)
            ];
            GameVar.snakeCurrentAngle = GameEnum.SnakeDirection.Right;
            GameFunc.drawInfo();
            GameFunc.drawSnake();
            GameFunc.drawFood();
            GameFunc.gameModeFunc.gameContinue();
        },
        gamePaused: () => {
            if(GameVar.status === GameEnum.GameStatus.Gaming){
                if(GameVar.intervalHandle !== 0) {
                    clearInterval(GameVar.intervalHandle);
                    GameVar.intervalHandle = 0;
                }
                GameVar.status = GameEnum.GameStatus.GamePaused;
                GameVar.menuFocusIdx = 0;
                GameFunc.drawMenu();
            }
        },
        gameContinue: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            setTimeout(()=>{
                if(GameVar.status !== GameEnum.GameStatus.Gaming) return;
                if(GameVar.intervalHandle !== 0) return;
                GameVar.intervalHandle = setInterval(()=>{
                    GameFunc.gameModeFunc.calcSnake();
                }, GameVar.speed);
            },1000);
            GameFunc.drawMenu();
        },
        gameEnd: () => {
            clearInterval(GameVar.intervalHandle);
            GameVar.intervalHandle = 0;
            GameVar.status = GameEnum.GameStatus.Main;
            GameVar.menuFocusIdx = 0;
            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
            GameVar.anakedefaultangle = GameEnum.SnakeDirection.Right;
            //GameVar.gameMode = 0;
            GameVar.score = 0;
            GameVar.gift = 0;
            GameVar.snakeList = [];
            GameVar.foodPos = null;
            GameFunc.drawMenu(1);
        },
    },
    [GameEnum.GameMode.Hard]: {
        calcEatFood:() => {
            if(GameVar.snakeList[0].equal(GameVar.food)){
                //吃到食物，保留蛇尾，刷新食物，加分数
                let bonus;
                bonus = Math.floor((GameVar.gift>=0?GameVar.gift:0)+(10000/GameVar.speed) );
                GameVar.score += bonus;

                // 蛇尾+30长度
                for(let i = 0; i < 29; i++)
                    GameVar.snakeList.push(GameVar.snakeList[GameVar.snakeList.length - 1].clone());


                GameFunc.drawInfo();
                GameFunc.drawFood();
                GameVar.gift = (GameVar.menuFocusIdx * 2 + 1) * (
                    Math.abs(GameVar.food.x - GameVar.snakeList[0].x) +
                    Math.abs(GameVar.food.y - GameVar.snakeList[0].y)
                );
            }else{
                //没吃到食物，去掉蛇尾
                GameVar.snakeList.pop();
            }
        },
        calcHitFatal: () => {
            let isFatal = GameVar.snakeList.some(e => (
                ( e.x < 1 || e.x > 58 || e.y < 1 || e.y > 58 ) || // 撞墙
                ( e !== GameVar.snakeList[0] && GameVar.snakeList[0].equal(e) ) // 撞蛇
            ));
            if(isFatal){
                GameFunc.gameModeFunc.gameEnd();
            }
        },
        calcSnake: () => {
            //计算蛇下一次走向
            let direction;
            if(GameVar.snakeNextAngle) direction = GameVar.snakeNextAngle
            else direction = GameVar.snakeCurrentAngle;

            let snakelist = GameVar.snakeList;
            let Point = GameClass.Point;

            let x = snakelist[0].x, y = snakelist[0].y
            if(direction === 1){ GameVar.snakeCurrentAngle=1; y--; }
            else if(direction === 2){ GameVar.snakeCurrentAngle=2; x--; }
            else if(direction === 3){ GameVar.snakeCurrentAngle=3; y++; }
            else if(direction === 4){ GameVar.snakeCurrentAngle=4; x++; }

            snakelist.unshift(new Point(x, y));

            //计算蛇吃到了食物
            GameVar.gift--;
            GameFunc.gameModeFunc.calcEatFood();

            GameFunc.drawSnake();
            //计算蛇不撞蛇、墙
            GameFunc.gameModeFunc.calcHitFatal();

            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
        },
        gameStart: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            GameFunc.drawMenu();
            GameFunc.drawInfo();
            GameVar.speed = 50;
            //创建蛇链表
            var Point = GameClass.Point;
            GameVar.snakeList=[
                new Point(20,29), new Point(19,29), new Point(18,29),
                new Point(17,29), new Point(16,29)
            ];
            GameVar.snakeCurrentAngle = GameEnum.SnakeDirection.Right;
            GameFunc.drawInfo();
            GameFunc.drawSnake();
            GameFunc.drawFood();
            GameFunc.gameModeFunc.gameContinue();
        },
        gamePaused: () => {
            if(GameVar.status === GameEnum.GameStatus.Gaming){
                if(GameVar.intervalHandle !== 0) {
                    clearInterval(GameVar.intervalHandle);
                    GameVar.intervalHandle = 0;
                }
                GameVar.status = GameEnum.GameStatus.GamePaused;
                GameVar.menuFocusIdx = 0;
                GameFunc.drawMenu();
            }
        },
        gameContinue: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            setTimeout(()=>{
                if(GameVar.status !== GameEnum.GameStatus.Gaming) return;
                if(GameVar.intervalHandle !== 0) return;
                GameVar.intervalHandle = setInterval(()=>{
                    GameFunc.gameModeFunc.calcSnake();
                }, GameVar.speed);
            },1000);
            GameFunc.drawMenu();
        },
        gameEnd: () => {
            clearInterval(GameVar.intervalHandle);
            GameVar.intervalHandle = 0;
            GameVar.status = GameEnum.GameStatus.Main;
            GameVar.menuFocusIdx = 0;
            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
            GameVar.anakedefaultangle = GameEnum.SnakeDirection.Right;
            //GameVar.gameMode = 0;
            GameVar.score = 0;
            GameVar.gift = 0;
            GameVar.snakeList = [];
            GameVar.foodPos = null;
            GameFunc.drawMenu(1);
        },
    },
    [GameEnum.GameMode.DoM]: {
        calcEatFood:() => {
            if(GameVar.snakeList[0].equal(GameVar.food)){
                //吃到食物，保留蛇尾，刷新食物，加分数
                let bonus;
                bonus = Math.floor((GameVar.gift>=0?GameVar.gift:0)+(10000/GameVar.speed) );
                GameVar.score += bonus;

                // 蛇尾+30长度
                for(let i = 0; i < 29; i++)
                    GameVar.snakeList.push(GameVar.snakeList[GameVar.snakeList.length - 1].clone());


                GameFunc.drawInfo();
                GameFunc.drawFood();
                GameVar.gift = (GameVar.menuFocusIdx * 2 + 1) * (
                    Math.abs(GameVar.food.x - GameVar.snakeList[0].x) +
                    Math.abs(GameVar.food.y - GameVar.snakeList[0].y)
                );
            }else{
                //没吃到食物，去掉蛇尾
                GameVar.snakeList.pop();
            }
        },
        calcHitFatal: () => {
            let isFatal = GameVar.snakeList.some(e => (
                ( e.x < 1 || e.x > 58 || e.y < 1 || e.y > 58 ) || // 撞墙
                ( e !== GameVar.snakeList[0] && GameVar.snakeList[0].equal(e) ) // 撞蛇
            ));
            if(isFatal){
                GameFunc.gameModeFunc.gameEnd();
            }
        },
        calcSnake: () => {
            //计算蛇下一次走向
            let direction;
            if(GameVar.snakeNextAngle) direction = GameVar.snakeNextAngle
            else direction = GameVar.snakeCurrentAngle;

            let snakelist = GameVar.snakeList;
            let Point = GameClass.Point;

            let x = snakelist[0].x, y = snakelist[0].y
            if(direction === 1){ GameVar.snakeCurrentAngle=1; y--; }
            else if(direction === 2){ GameVar.snakeCurrentAngle=2; x--; }
            else if(direction === 3){ GameVar.snakeCurrentAngle=3; y++; }
            else if(direction === 4){ GameVar.snakeCurrentAngle=4; x++; }

            snakelist.unshift(new Point(x, y));

            //计算蛇吃到了食物
            GameVar.gift--;
            GameFunc.gameModeFunc.calcEatFood();

            GameFunc.drawSnake();
            //计算蛇不撞蛇、墙
            GameFunc.gameModeFunc.calcHitFatal();

            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
        },
        gameStart: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            GameFunc.drawMenu();
            GameFunc.drawInfo();
            GameVar.speed = 25;
            //创建蛇链表
            var Point = GameClass.Point;
            GameVar.snakeList=[
                new Point(20,29), new Point(19,29), new Point(18,29),
                new Point(17,29), new Point(16,29)
            ];
            GameVar.snakeCurrentAngle = GameEnum.SnakeDirection.Right;
            GameFunc.drawInfo();
            GameFunc.drawSnake();
            GameFunc.drawFood();
            GameFunc.gameModeFunc.gameContinue();
        },
        gamePaused: () => {
            if(GameVar.status === GameEnum.GameStatus.Gaming){
                if(GameVar.intervalHandle !== 0) {
                    clearInterval(GameVar.intervalHandle);
                    GameVar.intervalHandle = 0;
                }
                GameVar.status = GameEnum.GameStatus.GamePaused;
                GameVar.menuFocusIdx = 0;
                GameFunc.drawMenu();
            }
        },
        gameContinue: () => {
            GameVar.status = GameEnum.GameStatus.Gaming;
            setTimeout(()=>{
                if(GameVar.status !== GameEnum.GameStatus.Gaming) return;
                if(GameVar.intervalHandle !== 0) return;
                GameVar.intervalHandle = setInterval(()=>{
                    GameFunc.gameModeFunc.calcSnake();
                }, GameVar.speed);
            },1000);
            GameFunc.drawMenu();
        },
        gameEnd: () => {
            clearInterval(GameVar.intervalHandle);
            GameVar.intervalHandle = 0;
            GameVar.status = GameEnum.GameStatus.Main;
            GameVar.menuFocusIdx = 0;
            GameVar.snakeNextAngle = GameEnum.SnakeDirection.None;
            GameVar.anakedefaultangle = GameEnum.SnakeDirection.Right;
            //GameVar.gameMode = 0;
            GameVar.score = 0;
            GameVar.gift = 0;
            GameVar.snakeList = [];
            GameVar.foodPos = null;
            GameFunc.drawMenu(1);
        },
    },
}
