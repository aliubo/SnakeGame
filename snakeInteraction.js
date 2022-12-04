"use strict";
/**
 * 本页面用于实现玩家与游戏的交互逻辑
 */

import "./snakeConst.js"

// 初始化所有Canvas
window.addEventListener("load", ()=>{
    // 绘制背景
    GameFunc.drawBackground();
    //绘制初信息面板
    GameFunc.drawInfo();
    //绘制墙面
    GameFunc.drawWall();
    //绘制初始菜单
    GameFunc.drawMenu();
});

// 设定所有的交互方法
window.GameInteraction = {
    // 按键交互, 所有方法的参数都要接受一个KeyboardEvent对象
    KeyDown: {
        [GameEnum.GameStatus.Main]: (e)=>{
            if(e.code === "KeyI"){
                if(GameVar.menuFocusIdx === 3) GameVar.menuFocusIdx=0;
                else GameVar.menuFocusIdx++;
                GameFunc.drawMenu(GameEnum.GameStatus.Main);
            }else if(e.code === "KeyO"){
                GameVar.gameMode = GameVar.menuFocusIdx;
                GameFunc.gameInit();
            }
        },
        [GameEnum.GameStatus.Gaming]: (e)=>{
            if(e.code === "KeyW"){//w
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 3){GameVar.snakeNextAngle=1;}
            }else if(e.code === "KeyA"){//a
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 4){GameVar.snakeNextAngle=2;}
            }else if(e.code === "KeyS"){//s
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 1){GameVar.snakeNextAngle=3;}
            }else if(e.code === "KeyD"){//d
                if(!GameVar.snakeNextAngle && GameVar.snakeCurrentAngle !== 2){GameVar.snakeNextAngle=4;}
            }else if(e.code === "KeyP"){//p
                GameFunc.gameModeFunc.gamePaused();
            }
        },
        [GameEnum.GameStatus.GamePaused]: (e)=>{
            if(e.code === "KeyI"){//i
                if(GameVar.menuFocusIdx === 0){
                    GameVar.menuFocusIdx=1;
                    GameFunc.drawMenu();
                }else{
                    GameVar.menuFocusIdx=0;
                    GameFunc.drawMenu();
                }
            }else if(e.code === "KeyO"){//o
                if(GameVar.menuFocusIdx === 0){
                    GameFunc.gameModeFunc.gameContinue();
                }else if(GameVar.menuFocusIdx === 1){
                    GameFunc.gameModeFunc.gameEnd();
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
        window.addEventListener("keydown", (e)=>{
            if(GameVar.status === gameStatus) callback(e);
        });
    };
    let gameStatusEnum = GameEnum.GameStatus;
    // 开始遍历events，进行按键绑定
    Object.keys(GameInteraction.KeyDown).forEach((e)=>{
        register(parseInt(e), GameInteraction.KeyDown[e]);
    });
});