(function () {
var arr = [],
    push = arr.push;

// 核心构造函数
var mayner = function (selector) {
    return new mayner.fn.init(selector);
};

// 核心原型
// mayner(参数)   参数可能是什么？
// 1、DOM对象
// 2、DOM数组
// 3、itcast对象
// 4、字符串
// 5、"" / null / undefined
// 6、函数     ->mayner(function() {});
mayner.fn = mayner.prototype = {
    constructor: mayner,
    // 长度的默认值
    length: 0,
    // 用来判断是否是一个itcast对象
    selector: "",
    init: function(selector) {
        // 1、null / undefined / "" / 0
        if(!selector) {
            // 返回的是一个空的itcast对象
            return this;
        }
        // 2、string
        else if(typeof selector === "string") {
            // 如果是html字符串
            if(selector.charAt(0) === "<") {
                // 获取到所有的通过html字符串创建出来的对象
                push.apply(this, parseHTML(selector));
            } else {
                // 获取到所有的通过选择器匹配到的对象
                push.apply(this, select(selector));
            }
        }
        // 3、DOM对象
        else if(selector.nodeType) {
            // selector 就是唯一的一个元素
            this[0] = selector;
            this.length = 1;
        }
        //  4、itcast对象
        else if("selector" in selector) {
            // 因为调用itcast()就是来获取到一个itcast对象
            // 如果传入的就是itcast对象，直接返回就行
            return selector;
        }
        // 5、DOM数组
        else if(selector.length && selector.length >= 0) {
            // 要将数组中的元素拿出来放到this中去
            push.apply(this, selector);
        }
        // 6、函数（入口函数）
        else if (typeof selector === "function") {
            if (typeof window.onload !== "function") {
                // 说明还没有入口函数
                window.onload = selector;
            } else {
                // 获取当前的onload
                var oldFunc = window.onload;
                window.onload = function () {
                    // 先执行之前绑定过的事件，再执行当前的事件
                    oldFunc();
                    selector();
                };
            }
        }
    }
};
mayner.fn.init.prototype = mayner.prototype;

// 将html字符串转化为DOM对象数组
var parseHTML = function (html) {
    var tempDv, arr = [];
    tempDv = document.createElement("div");
    tempDv.innerHTML = html;
    arr.push.apply(arr, tempDv.childNodes);
    return arr;
};

// 选择器方法
var select = function(selector) {
    var first = selector.charAt(0), arr = [];
    if (first === "#") {
        arr.push(document.getElementById(selector.slice(1)));
    } else if (first === ".") {
        arr.push.apply(arr, document.getElementsByClassName(selector.slice(1)));
    } else {
        arr.push.apply(arr, document.getElementsByTagName(selector));
    }
    return arr;
};

// 提供扩展方法的能力
mayner.extend = mayner.fn.extend = function (obj) {
    var k;
    for (k in obj) {
        this[k] = obj[k];
    }
};

// 工具型的each函数
mayner.extend({
    each: function (obj, callback) {
        var i, len;
        if (mayner.isLikeArray(obj)) {
            for (i = 0, len = obj.length; i < len; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        } else {
            for (i in obj) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        }
        return obj;
    },
    trim: function (str) {
        if (String.prototype.trim) {
            return str.trim();
        } else {
            return str.replace(/^\s+|\s+$/g, "")
        }
    }
});

// 判断方法 - 工具型方法
mayner.extend({
    isLikeArray: function (obj) {
        return !!obj && obj.length >= 0;
    },
    isString: function (obj) {
        return typeof obj === "string";
    },
    isDOM: function (obj) {
        return !!obj.nodeType;
    },
    isItcast: function (obj) {
        // 如果有selector 这个属性就认为是itcast对象
        return "selector" in obj;
    }
});

// 扩展一个工具方法：获取指定元素的文本内容
mayner.extend({
    getInnerText: function (node) {
        var txtArr = [];
        var getText = function (node) {
            var cNodes = node.childNodes;
            for (var i = 0; i < cNodes.length; i++) {
                if (cNodes[i].nodeType === 3) {
                    txtArr.push(cNodes[i].nodeValue);
                } else if (cNodes[i].nodeType === 1) {
                    getText(cNodes[i]);
                }
            }
        };
        // 调用函数，才能执行
        getText(node);
        // 返回的是字符串
        return txtArr.join("");
    }
});

// DOM操作模块
mayner.fn.extend({
    appendTo: function (obj) {
        var targetNodes = mayner(obj),
        sourceNodes = this,
        tarThis, arr = [], node;

        mayner.each(targetNodes, function (tarIndex) {
            tarThis = this;
            mayner.each(sourceNodes, function () {
                node = tarIndex === targetNodes.length-1?
                    this:
                    this.cloneNode(true);
                tarThis.appendChild(node);
                arr.push(node);
            });
        });
        return mayner(arr);
    },
    append: function (dom) {
        mayner(dom).appendTo(this);
        return this;
    },
    prependTo: function (dom) {
        var targetNodes = mayner(dom),
            sourseNodes = this,
            tarThis, arr = [], node;
        mayner.each(targetNodes, function (tarIndex) {
            tarThis = this;
            mayner.each(sourseNodes, function () {
                node = tarIndex === targetNodes.length - 1?
                    this:
                    this.cloneNode(true);
                tarThis.insertBefore(node, tarThis.firstChild);
                arr.push(node);
            });
        });
        return mayner(arr);
    },
    prepend: function (dom) {
        mayner(dom).prependTo(this);
        return this;
    },
    remove: function () {
        return this.each(function () {
            this.parentNode.removeChild(this);
        })
    }
});

// 获取下一个元素节点的方法-辅助函数
var getNextSibling = function (dom) {
    var node = dom;
    while(node = node.nextSibling) {
        if (node.nodeType === 1) {
            return node;
        }
    }
};

// 获取后面所有元素节点的方法-辅助函数
var getNextAllSibling = function (dom) {
    var node = dom, arr = [];
    while(node = node.nextSibling) {
        if (node.nodeType === 1) {
            arr.push(node);
        }
    }
    return arr;
};

// DOM操作模块-获取后续元素
mayner.fn.extend({
    next: function () {
        var arr =[];
        this.each(function () {
            var nextNode = getNextSibling(this);
            if (nextNode != undefined) {
                arr.push(nextNode);
            }
        });
        return mayner(arr);
    },
    nextAll: function () {
        var arr = [];
        this.each(function () {
            var nextNode = getNextAllSibling(this);
            if (nextNode != undefined) {
                arr.push.apply(arr, node);
            }
        });
        return mayner(arr);
    }
});

// 实例方法 - each
mayner.fn.extend({
    each: function (callback) {
        return mayner.each(this, callback);
    }
});

// 事件模块
mayner.each(("click,mouseenter,mouseleave,change,mouseover,mouseout,blur,focus").split(","), function (i, v) {
    mayner.fn[v] = function (callback) {
        this.on(v, callback);
        return this;
    };
});

// on 绑定事件和off 解绑事件
mayner.fn.extend({
    on: function (type, callback) {
        this.each(function () {
            //this.addEventListener(type, callback);
            if (window.addEventListener) {
                this.addEventListener(type, callback);
            } else if (window.attachEvent) {
                this.attachEvent("on" + type, function (e) {
                    callback.call(this, e);
                });
            } else {
                this["on" + type] = function (e) {
                    e = e || window.event;
                    callback.call(this, e);
                }
            }
        });
        return this;
    },
    off: function (type, callback) {
        this.each(function () {
            this.removeEventListener(type, callback);
        });
        return this;
    },
    hover: function (fn1, fn2) {
        this.mouseenter(fn1).mouseleave(fn2);
        return this;
    },
    toggle: function () {
        if (arguments.length <= 0) {
            return;
        }
        var args = arguments,
            len = args.length;
        this.each(function () {
            var i = 0;
            mayner(this).click(function () {
                args[i++ % len].call(this);
            });
        });
        return this;
    }
});

// 样式操作模块
mayner.fn.extend({
    css: function (name, value) {
        // 读取操作
        if (value === undefined && typeof name === "string") {
            // 说明是在进行读取操作
            // 兼容性处理
            if (window.getComputedStyle) {
                return window.getComputedStyle(this[0])[name];
            } else {
                return this[0].currentStyle[name];
            }
        }
        // 设置操作
        this.each(function () {
            if (value === undefined && typeof name === "object") {
                // 说明是在以对象形式进行多个样式的设置操作
                for (var k in name) {
                    this.style[k] = name[k];
                }
            } else {
                // 说明传入的是两个参数
                this.style[name] = value;
            }
        });
        // 设置返回的值
        return this;
    },
    addClass: function (cName) {
        this.each(function () {
            var clsName = this.className;
            clsName += " " + cName;
            this.className = mayner.trim(clsName);
        });
        return this;
    },
    removeClass: function (cName) {
        // 方式一
//      this.each(function () {
//          var clsNames = this.className.split(" ");
//          var index = -1;
//          for (var i = 0; i < clsNames.length; i++) {
//              if (clsNames[i] === cName) {
//                  index = i;
//                  break;
//              }
//          }
//          mayner.each(clsNames, function (k, v) {
//              if (v === cName) {
//                  index = k;
//                  return false;
//              }
//          });
//          if (index !== -1) {
//              clsNames.splice(index, 1);
//              this.className = clsNames.join(" ");
//          }
//      });
//      return this;

        // 方式二
        this.each(function () {
            var clsName = " " + this.className + " ";
            clsName = clsName.replace(" " + cName + " ", " ");
            this.className = mayner.trim(clsName);
        });
        return this;
    },
    hasClass: function (cName) {
        var hasCls = false;
        this.each(function () {
            var clsName = this.className;
            hasCls = (" " + clsName + " ").indexOf(" " + cName + " ") !== -1;
            if (hasCls) {
                return false;
            }
        });
        return hasCls;
    },
    toggleClass: function (cName) {
        this.each(function () {
            if (mayner(this).hasClass(cName)) {
                mayner(this).removeClass(cName);
            } else {
                mayner(this).addClass(cName);
            }
        });
        return this;
    }
});

// 属性操作模块
mayner.fn.extend({
    attr: function (name, value) {
        if (value === undefined) {
            return this[0].getAttribute(name);
        }
        this.each(function () {
            this.setAttribute(name, value);
        });
        return this;
    },
    val: function (value) {
        if (value === undefined) {
            return this[0].value;
        }
        this.each(function () {
            this.value = value;
        });
        return this;
    },
    html: function (str) {
        if (str === undefined) {
            return this[0].innerHTML;
        }
        this.each(function () {
            this.innerHTML = str;
        });
        return this;
    },
    text: function (txt) {
        if (txt === undefined) {
            var arr = [];
            // 说明没有传参，表示获取文本内容
            if ("innerText" in this[0] || "textContent" in this[0]) {
                this.each(function () {
                    arr.push(this.innerText || this.textContent);
                });
                return arr.join("");
            }
            this.each(function () {
                arr.push(mayner.getInnerText(this));
            });
            return arr.join("");
        }

        // 否则表示设置文本内容
        this.each(function () {
            if ("innerText" in this || "textContent" in this) {
                this.innerText = txt;
                this.textContent = txt;
            } else {
                this.innerHTML = "";
                var txtNode = document.createTextNode(txt);
                this.appendChild(txtNode);
            }
        });
        return this;
    }
});

// ------------------- 动画的辅助函数 start -------------------
var easingObj = {
    // t: 已经经过时间, b: 开始位置, c: 目标位置, d: 总时间
    easing1: function(x, t, b, c, d) {
        return t * ( (c - b) / d );
    },
    easing2: function(x, t, b, c, d) {
        var a = 2 * (c - b) / (d * d),
            v_0 = a * d;
        return v_0 * t - 1/2 * a * t * t;
    },
    easeInQuad: function (x, t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
        return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    }
};

// 动画属性的键值对
var styleObj = {
    "top": "offsetTop",
    "left": "offsetLeft",
    "width": "offsetWidth",
    "height": "offsetHeight"
};
// 函数 获取startLoaction
var getLocation = function(dom, target) {
    var o = {};
    for(var k in target) {
        o[k] = dom[ styleObj[k] ];
    }
    return o;
};

// 函数 获取Distance
var getDistance = function(dom, target) {
    var o = {};

    for(var k in target) {
        o[k] = target[k] - dom[ styleObj[k] ];
    }
    return o;
};

// 获取 tweens 的函数
var easingFn = function(x, t, startLoc, target, d, easing) {
    var o = {};
    for(var k in target) {
        o[k] = easingObj[easing](x, t, startLoc[k], target[k], d);
    }
    return o;
};

// 设置样式
var setStyle = function(dom, startLoc, tweens) {
    for(var k in startLoc) {
        dom.style[k] = startLoc[k] + tweens[k] + "px";
    }
};
// ------------------- 动画的辅助函数 end -------------------

// 动画模块
mayner.fn.extend({
    animate: function(target, dur, easing) {
        var node = this[0];
        var startTime = +new Date(),
            startLocations = getLocation(node, target),
            totalDistances = getDistance(node, target),
            play, timerId;
        play = function() {
            var curTime = +new Date();
            var passingTime = curTime - startTime,
                tweens;
            if(passingTime >= dur) {
                tweens = totalDistances;
                clearInterval(timerId);

            } else {
                tweens = easingFn(null, passingTime, startLocations, target, dur, easing);
            }
            setStyle(node, startLocations, tweens);
        };
        play();
        timerId = setInterval(play, 16);
    }
});

// 对外暴露核心函数
window.I = window.mayner = mayner;

})();