"use strict";
/**
 * 本文件用于定义常见工具
 *
 */

window.Utils = {
    randomInteger: (minm, maxm) => {
        return parseInt(Math.random() * (maxm - minm + 1) + minm,10);
    }
};