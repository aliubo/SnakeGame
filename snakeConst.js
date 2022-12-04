"use strict"

import "./snakeConst.js"

window.GameClass = {
    Point: class Point{
        #x = 0;
        #y = 0;
        set x(val){
            if(!Number.isInteger(val) || val < 0 || val > 59) throw 'error';
            this.#x = val;
        }
        set y(val){
            if(!Number.isInteger(val) || val < 0 || val > 59) throw 'error';
            this.#y = val;
        }
        get x(){ return this.#x; }
        get y(){ return this.#y; }
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        equal(e){
            if(!(e instanceof GameClass.Point)) throw 'error';
            return this.x === e.x && this.y === e.y;
        }
        clone(){
            return new GameClass.Point(this.x, this.y);
        }
    }
}

// 游戏使用的所有常量、枚举
window.GameEnum = {
    // 当前游戏状态
    GameStatus: {
        Main: 0,            // 游戏主界面
        Gaming: 1,          // 游戏中
        GamePaused: 2,      // 游戏暂停中
    },
    // 蛇头朝向
    SnakeDirection: {
        None: 0,
        Up: 1,
        Left: 2,
        Down: 3,
        Right: 4
    },
    // 游戏模式
    GameMode: {
        Easy: 0,
        Normal: 1,
        Hard: 2,
        DoM: 3
    }
};
window.GameTextI18n = {
    zh: {
        // 背景文字
        GameBackgroundText: {
            gameName: "贪吃蛇",
            gameIntroduce: ["游戏说明", "I键 选择/切换", "O键 确定", "WASD键 控制蛇方向", "P键 暂停游戏"],
            gameAuthorInfo: ['github: aliubo', 'liubo@aliubo.com']
        },
        GameInfoText: {
            score: "分数",
            snakeSize: "蛇长",
        },
        // 菜单文字
        GameMenuText: {
            [GameEnum.GameStatus.Main]: {
                [GameEnum.GameMode.Easy]: "简单难度",
                [GameEnum.GameMode.Normal]: "普通难度",
                [GameEnum.GameMode.Hard]: "困难难度",
                [GameEnum.GameMode.DoM]: "抖M难度",
            },
            [GameEnum.GameStatus.GamePaused]: {
                0: "继续游戏",
                1: "退出游戏"
            }
        }
    },
    en: {
        // 背景文字
        GameBackgroundText: {
            gameName: "Snake",
            gameIntroduce: ["Key", "I - switch", "O - OK", "WASD - ctrl snake", "P - pause"],
            gameAuthorInfo: ['github: aliubo', 'liubo@aliubo.com']
        },
        GameInfoText: {
            score: "score",
            snakeSize: "size",
        },
        // 菜单文字
        GameMenuText: {
            [GameEnum.GameStatus.Main]: {
                [GameEnum.GameMode.Easy]: "Easy",
                [GameEnum.GameMode.Normal]: "Normal",
                [GameEnum.GameMode.Hard]: "Hard",
                [GameEnum.GameMode.DoM]: "Hardest",
            },
            [GameEnum.GameStatus.GamePaused]: {
                0: "Continue",
                1: "Exit"
            }
        }
    }
}
// 获取浏览器默认语言
{
    let lang = navigator.language.slice(0,2);
    if(lang in GameTextI18n) window.GameText = GameTextI18n[lang];
    else window.GameText = GameTextI18n.en;
}