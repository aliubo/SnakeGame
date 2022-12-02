"use strict";
/**
 * 本文件用于定义游戏的所有方法和变量
 */

import "./snakeUtils.js"
import "./snakeInteraction.js"

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

// 游戏使用的所有常量、枚举
window.GameEnum = {
    // 当前显示的菜单
    MenuEnum: {
        None: 0,
        MainMenu: 1,
        GamePausedMenu: 2,
    },
    // 当前游戏状态
    GameStatusEnum: {
        MainMenu: 0,        // 游戏主界面
        Gaming: 1,          // 游戏中
        GamePaused: 2,      // 游戏暂停中
    },
    // 蛇头朝向
    SnakeDirectionEnum: {
        None: 0,
        Up: 1,
        Left: 2,
        Down: 3,
        Right: 4
    },
    // 游戏模式
    GameModeEnum: {
        Easy: 0,
        Normal: 1,
        Difficuly: 2,
        DoM: 3
    }
};
window.GameConst = {
    // 背景文字
    GameBackgroundText: {
        gameName: "贪吃蛇",
        gameIntroduce: ["游戏说明", "O键 确定", "I键 选择/切换", "WASD键 控制蛇方向", "P键 暂停游戏"],
        gameAuthorInfo: ['github: aliubo', 'liubo@aliubo.com']
    },
    GameInfoText: {
        score: "分数",
        snakeSize: "蛇长",
    },
    // 菜单文字
    GameMenuText: {
        [GameEnum.MenuEnum.None]: {},
        [GameEnum.MenuEnum.MainMenu]: {
            [GameEnum.GameModeEnum.Easy]: "简单难度",
            [GameEnum.GameModeEnum.Normal]: "普通难度",
            [GameEnum.GameModeEnum.Difficuly]: "困难难度",
            [GameEnum.GameModeEnum.DoM]: "抖M难度",
        },
        [GameEnum.MenuEnum.GamePausedMenu]: {
            0: "继续游戏",
            1: "退出游戏"
        }
    }
}

// 游戏使用的所有相关游戏方法
window.GameFunc = {
    drawBackground: () => {
        let bg = GameCanvas.background;
        let text = GameConst.GameBackgroundText;

        // 黑色背景
        bg.fillStyle="#001323";
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
    drawWall: () => {
        let wall = GameCanvas.wall;
        let spanWidth = 0;
        wall.fillStyle="#383838";
        wall.strokeStyle="#000000";
        wall.lineWidth = spanWidth;

        let width = 10 - spanWidth * 2;
        for(let fi=60;fi>0;fi--){
            wall.beginPath();
            wall.rect(fi*10 - 10 + spanWidth, 0, width, width);
            wall.fill();
            wall.stroke();
        }
        for(let fi=60;fi>0;fi--){
            wall.beginPath();
            wall.rect(fi*10 - 10 + spanWidth,591, width, width);
            wall.fill();
            wall.stroke();
        }
        for(let fi=60;fi>0;fi--){
            wall.beginPath();
            wall.rect(1,fi*10 - 10 + spanWidth, width, width);
            wall.fill();
            wall.stroke();
        }
        for(let fi=60;fi>0;fi--){
            wall.beginPath();
            wall.rect(591,fi*10 - 10 + spanWidth, width, width);
            wall.fill();
            wall.stroke();
        }
    },
    drawMenu: (menuEnum) => {
        let menu = GameCanvas.menu;
        menu.strokeStyle = '#ffffff';
        menu.fillStyle = '#ffffff';
        menu.lineWidth = 2;
        menu.font = '22px 微软雅黑';
        menu.clearRect(0,0,600,600);

        // 给出一个[str...]列表用于绘制
        let startdraw = (list) => {
            let leftRect = 229, leftText = 259;
            let topRect = 229, topText = 259;
            let width = 146;
            let height = 46;
            let span = 70;
            list.forEach((e) => {
                menu.strokeRect(leftRect, topRect, width, height);
                menu.fillText(e, leftText, topText);
                topRect += span;
                topText += span;
            });
        };

        // 生成一段菜单列表并交由startdraw绘制
        let menuItems = (()=>{
            // 获取菜单的按钮数目
            let nums = Object.keys(GameConst.GameMenuText[menuEnum]).length;
            // 开始逐一获取菜单文字
            let list = []
            for(let i = 0; i < nums; i++){
                list.push(GameConst.GameMenuText[menuEnum][i]);
            }
            return list;
        })();

        // 开始绘制菜单
        startdraw(menuItems);

        // 画激活的部分
        if(menuEnum !== GameEnum.MenuEnum.None){
            menu.strokeStyle='#ff6666';
            menu.lineWidth=5;
            menu.strokeRect(229,229 + ( GameVar.menuFocusIdx * 70),146,46);
        }
    },
    drawInfo: () => {
        if(GameVar.status === GameEnum.GameStatusEnum.Gaming){
            let info = GameCanvas.info;
            info.clearRect(600,0,200,600);
            info.font='22px 微软雅黑';
            info.fillStyle='#ffffff';
            info.fillText(GameConst.GameMenuText[GameEnum.MenuEnum.MainMenu][GameVar.difficult],630,140);
            info.fillText(GameConst.GameInfoText.score + ': ' + GameVar.score,630,175);
            info.fillText(GameConst.GameInfoText.snakeSize + ': ' + GameVar.snakeList.length,630,210);
        }
    },
    drawSnake: () => {
        let snake = GameCanvas.snake;
        snake.clearRect(0,0,600,600);
        // 绘制蛇身
        let snakelist = GameVar.snakeList;
        snakelist.forEach((pix)=>{
            snake.beginPath();
            snake.fillStyle="#F08080";
            snake.strokeStyle="#F08080";
            snake.lineWidth=1;
            snake.rect(pix[0]*10-9,pix[1]*10-9,8,8);
            snake.fill();
            snake.stroke();
        });
        // 绘制蛇头
        {
            snake.beginPath();
            snake.fillStyle="#F0E68C";
            snake.strokeStyle="#F0E68C";
            snake.lineWidth=1;
            snake.rect(snakelist[0][0]*10-9,snakelist[0][1]*10-9,8,8);
            snake.fill();
            snake.stroke();
        }
    },
    drawFood: () => {
        let foodCanvas = GameCanvas.food;
        foodCanvas.clearRect(0,0,600,600);
        foodCanvas.beginPath();
        foodCanvas.fillStyle="#ff3333";
        foodCanvas.strokeStyle="#ff3333";
        foodCanvas.lineWidth = 1;

        // 生成一个不在蛇身的一个食物坐标
        do{
            GameVar.food=[Utils.randomInteger(2,59), Utils.randomInteger(2,59)];
        }while(GameVar.snakeList.some(function(x){
            return x[0] === GameVar.food[0] && x[1] === GameVar.food[1];
        }))

        foodCanvas.rect(GameVar.food[0]*10-9,GameVar.food[1]*10-9,8,8);
        foodCanvas.fill();
        foodCanvas.stroke();
    },
    calcEatFood:() => {
        if(GameVar.snakeList[0][0] === GameVar.food[0] && GameVar.snakeList[0][1] === GameVar.food[1]){
            //吃到食物，保留蛇尾，刷新食物，加分数
            let bonus;
            bonus = Math.floor((GameVar.gift>=0?GameVar.gift:0)+(10000/GameVar.speed) );
            GameVar.score += bonus;
            GameFunc.drawInfo();
            GameFunc.drawFood();
            GameVar.gift = (GameVar.menuFocusIdx * 2 + 1) * (
                Math.abs(GameVar.food[0]-GameVar.snakeList[0][0]) +
                Math.abs(GameVar.food[1]-GameVar.snakeList[0][1])
            );
        }else{
            //没吃到食物，去掉蛇尾
            GameVar.snakeList.pop();
        }
    },
    calcHitFatal: () => {
        GameVar.snakeList.forEach((e)=>{
            if(
                // 撞墙
                (   e[0] === 1 || e[0] === 60||
                    e[1] === 1 || e[1] === 60
                ) ||
                // 撞蛇
                (
                    e !== GameVar.snakeList[0] &&
                    GameVar.snakeList[0][0] === e[0] &&
                    GameVar.snakeList[0][1] === e[1]
                )
            ){
                //撞墙/蛇
                clearInterval(GameVar.intervalHandle);
                GameFunc.gameEnd();
            }
        });
    },
    calcSnake: () => {
        //计算蛇下一次走向
        let direction;
        if(GameVar.snakeNextAngle){
            direction = GameVar.snakeNextAngle
        }else{
            direction = GameVar.snakeCurrentAngle
        }

        if(direction === 1){
            GameVar.snakeCurrentAngle=1;
            GameVar.snakeList.unshift([GameVar.snakeList[0][0],GameVar.snakeList[0][1]-1]);
        }else if(direction === 2){
            GameVar.snakeCurrentAngle=2;
            GameVar.snakeList.unshift([GameVar.snakeList[0][0]-1,GameVar.snakeList[0][1]]);
        }else if(direction === 3){
            GameVar.snakeCurrentAngle=3;
            GameVar.snakeList.unshift([GameVar.snakeList[0][0],GameVar.snakeList[0][1]+1]);
        }else if(direction === 4){
            GameVar.snakeCurrentAngle=4;
            GameVar.snakeList.unshift([GameVar.snakeList[0][0]+1,GameVar.snakeList[0][1]]);
        }
        //计算蛇吃到了食物
        GameVar.gift--;
        GameFunc.calcEatFood();
        //计算蛇不撞蛇、墙
        GameFunc.calcHitFatal();
        /*先计算食物，在计算障碍物，以免蛇头撞蛇尾出现误判*/
        GameFunc.drawSnake();
        GameVar.snakeNextAngle=0;
    },
    gameStart: () => {
        GameVar.status=1;
        //创建蛇链表
        GameVar.snakeList=[[20,29],[19,29],[18,29],[17,29],[16,29]];
        GameVar.snakeCurrentAngle=4;
        GameFunc.drawInfo();
        GameFunc.drawSnake();
        GameFunc.drawFood();
        setTimeout(()=>{
            GameVar.intervalHandle = setInterval(function(){
                GameFunc.calcSnake();
            },GameVar.speed)
        },1000);
    },
    gameEnd: () => {
        GameVar.status=0;
        GameVar.menuFocusIdx=0;
        GameVar.snakeNextAngle=0;
        GameVar.anakedefaultangle=4;
        GameVar.difficult=0;
        GameVar.score=0;
        GameVar.gift=0;
        GameVar.snakeList=[];
        GameVar.foodPos=[null,null];
        GameFunc.drawMenu(1);
    }
};

// 游戏使用的全局变量
window.GameVar = {
    // 游戏状态，合法值参考 GameConst.StatusEnum
    status: GameEnum.GameStatusEnum.MainMenu,

    // 蛇头当前朝向 合法值参考 GameConst.DirectionEnum
    snakeCurrentAngle:  GameEnum.SnakeDirectionEnum.Right,
    // 蛇头下一帧朝向 合法值参考 GameConst.DirectionEnum
    snakeNextAngle:     GameEnum.SnakeDirectionEnum.None,

    score:0,                    //分数
    gift:0,                     //下次分数获得的额外奖励分（随着时间会逐渐降低）

    snakeList:[],               //蛇链表，用于标记蛇位置信息,开始为蛇头,结尾为蛇尾
    foodPos:[null,null],        //食物位置，[x,y]

    speed:200,                  //蛇移动速度，每经过此毫秒移动一帧

    intervalHandle:null,        //每帧处理setInterval句柄，用于控制游戏是否行动

    difficult:0,                //参考 GameConst.GameMenuText[GameEnum.MenuEnum.MainMenu], GameEnum.MenuEnum.MainMenu = 0

    menuFocusIdx:0,
};


