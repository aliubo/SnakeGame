"use strict";
/**
 * 本页面用于实现玩家与游戏的交互逻辑
 */

import "./snakeGame.js"

// 初始化所有Canvas
window.addEventListener("load", ()=>{
    // 绘制背景
    GameFunc.drawBackground();
    //绘制初信息面板
    GameFunc.drawInfo();
    //绘制墙面
    GameFunc.drawWall();
    //绘制初始菜单
    GameFunc.drawMenu(GameEnum.MenuEnum.MainMenu);
});

// 设定所有的交互方法
window.GameInteraction = {
    // 按键交互, 所有方法的参数都要接受一个KeyboardEvent对象
    KeyDown: {
        mainMenu: (e)=>{
            if(e.code === "KeyI"){
                if(GameVar.menuFocusIdx === 3) GameVar.menuFocusIdx=0;
                else GameVar.menuFocusIdx++;
                GameFunc.drawMenu(1);
            }else if(e.code === "KeyO"){
                if(GameVar.menuFocusIdx === 0){
                    GameVar.speed=150;
                }else if(GameVar.menuFocusIdx === 1){
                    GameVar.speed=100;
                }else if(GameVar.menuFocusIdx === 2){
                    GameVar.speed=50;
                }else if(GameVar.menuFocusIdx === 3){
                    GameVar.speed=25;
                }
                GameVar.difficult = GameVar.menuFocusIdx;
                GameFunc.drawMenu(0);
                GameFunc.drawInfo(0,5,GameVar.menuFocusIdx+1);
                //start game
                GameFunc.gameStart();
            }
        },
        gaming: (e)=>{
            if(e.code === "KeyW"){//w
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 3){GameVar.snakeNextAngle=1;}
            }else if(e.code === "KeyA"){//a
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 4){GameVar.snakeNextAngle=2;}
            }else if(e.code === "KeyS"){//s
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 1){GameVar.snakeNextAngle=3;}
            }else if(e.code === "KeyD"){//d
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 2){GameVar.snakeNextAngle=4;}
            }else if(e.code === "KeyP"){//p
                if(GameVar.intervalHandle !== 0 && GameVar.status === 1){
                    clearInterval(GameVar.intervalHandle);
                    GameVar.status=2;
                    GameVar.menuFocusIdx=0;
                    GameFunc.drawMenu(2);
                }
            }
        },
        gamePaused: (e)=>{
            if(e.code === "KeyI"){//i
                if(GameVar.menuFocusIdx === 0){
                    GameVar.menuFocusIdx=1;
                    GameFunc.drawMenu(2);
                }else{
                    GameVar.menuFocusIdx=0;
                    GameFunc.drawMenu(2);
                }
            }else if(e.code === "KeyO"){//o
                if(GameVar.menuFocusIdx === 0){
                    setTimeout(()=>{
                        GameVar.intervalHandle = setInterval(()=>{
                            GameFunc.calcSnake();
                        }, GameVar.speed);
                    },1000);
                    GameVar.status=1;
                    GameFunc.drawMenu(0);
                }else if(GameVar.menuFocusIdx === 1){
                    GameFunc.gameEnd();
                }
            }
        },
    },
    KeyUp: {},
    MouseEnter: {},
    MouseLeave: {},
    MouseDown: {},
    MouseUp: {},
    MouseMove: {},
}

// 注册按键交互
window.addEventListener("load", ()=>{
    // 定义一个用于按键事件的注册器
    let register = (gameStatus, callback) => {
        window.addEventListener("keypress", (e)=>{
            if(GameVar.status === gameStatus) callback(e);
        });
    };

    // events的每一个元素代表着一个GameStatus的按键事件绑定
    let gameStatusEnum = GameEnum.GameStatusEnum;
    let events = {
        [gameStatusEnum.MainMenu]: GameInteraction.KeyDown.mainMenu,
        [gameStatusEnum.Gaming]: GameInteraction.KeyDown.gaming,
        [gameStatusEnum.GamePaused]: GameInteraction.KeyDown.gamePaused,
    };
    // 开始遍历events，进行按键绑定
    Object.keys(events).forEach((e)=>{
        register(parseInt(e), events[e]);
    });
});