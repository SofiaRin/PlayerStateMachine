var Player = (function (_super) {
    __extends(Player, _super);
    function Player(_newState) {
        _super.call(this);
        this.PState = new PlayerState(_newState);
        this.wall = new egret.Bitmap();
        this.wall.height = 93;
        this.wall.width = 60;
        this.idle = true;
        this.walk = false;
        this.idState = new idleState();
        this.moState = new MoveState();
        /*

        this._move1 = this.createBitmapByName("move1_png");
        this._move2 = this.createBitmapByName("move2_png");
        this._move3 = this.createBitmapByName("move3_png");
        this._move4 = this.createBitmapByName("move4_png");

        this._idel1 = this.createBitmapByName("idel1_png");
        this._idel2 = this.createBitmapByName("idel2_png");
        this._idel3 = this.createBitmapByName("idel3_png");
        this._idel4 = this.createBitmapByName("idel4_png");

        this.addChild(this._idel2);
        this.addChild(this._idel3);
        this.addChild(this._idel4);

        this.addChild(this._move1);
        this.addChild(this._move2);
        this.addChild(this._move3);
        this.addChild(this._move4);
*/
    }
    var d = __define,c=Player,p=c.prototype;
    p.move = function () {
        this.PState.changeState(this.moState);
    };
    p.idel = function () {
        this.PState.changeState(this.idState);
    };
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Player;
}(egret.DisplayObjectContainer));
egret.registerClass(Player,'Player');
var PlayerState = (function () {
    function PlayerState(_newState) {
        if (this._currentState != null) {
            this._currentState.ExitState();
        }
        this._currentState = _newState;
        this._currentState.EnterState();
    }
    var d = __define,c=PlayerState,p=c.prototype;
    p.changeState = function (_newState) {
        if (this._currentState != null) {
            this._currentState.ExitState();
        }
        this._currentState = _newState;
        this._currentState.EnterState();
    };
    return PlayerState;
}());
egret.registerClass(PlayerState,'PlayerState');
var MoveState = (function () {
    function MoveState() {
        this.OnMove = false;
    }
    var d = __define,c=MoveState,p=c.prototype;
    p.EnterState = function () {
        this.OnMove = true;
    };
    p.ExitState = function () {
        this.OnMove = false;
    };
    p.GetMoveState = function () {
        var result;
        result = this.OnMove;
        return result;
    };
    return MoveState;
}());
egret.registerClass(MoveState,'MoveState',["State"]);
var idleState = (function () {
    function idleState() {
        this.Onidel = true;
    }
    var d = __define,c=idleState,p=c.prototype;
    p.EnterState = function () {
        this.Onidel = true;
    };
    p.ExitState = function () {
        this.Onidel = false;
    };
    p.GetIdleState = function () {
        var result;
        result = this.Onidel;
        return result;
    };
    return idleState;
}());
egret.registerClass(idleState,'idleState',["State"]);
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.PlayerIdle = new Array();
        this.PlayerWalk = new Array();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.Judge = function (MyPlayer) {
        var _this = this;
        egret.Ticker.getInstance().register(function () {
            if (MyPlayer.wall.x == _this.pointx && MyPlayer.wall.y == _this.pointy) {
                MyPlayer.idel();
            }
        }, this);
    };
    p.Animate = function (MyPlayer, bit, playMod, playerAnimation, playerAnimation2) {
        var _this = this;
        var frame = 0;
        var animateFrame = 0;
        egret.Ticker.getInstance().register(function () {
            if (MyPlayer.idState.GetIdleState()) {
                if (frame % 8 == 0) {
                    bit.texture = playerAnimation[animateFrame];
                    animateFrame++;
                    if (animateFrame >= playMod) {
                        animateFrame = 0;
                    }
                }
                frame++;
                if (frame >= playMod * 10) {
                    frame = 0;
                }
            }
            if (MyPlayer.moState.GetMoveState()) {
                if (frame % 8 == 0) {
                    bit.texture = playerAnimation2[animateFrame];
                    animateFrame++;
                    if (animateFrame >= playMod) {
                        animateFrame = 0;
                    }
                }
                frame++;
                if (frame >= playMod * 10) {
                    frame = 0;
                }
            }
            _this.Judge(MyPlayer);
        }, this);
    };
    p.LoadPlayer = function () {
        for (var i = 0; i < 4; i++) {
            this.PlayerIdle[i] =
                RES.getRes("idel" + (i + 1) + "_png");
        }
        for (var i = 0; i < 4; i++) {
            this.PlayerWalk[i] =
                RES.getRes("move" + (i + 1) + "_png");
        }
    };
    p.createGameScene = function () {
        var _this = this;
        this.LoadPlayer();
        var sky = this.createBitmapByName("Gamebg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        var Istate = new idleState(); //状态实例化
        var Mstate = new MoveState();
        var MyPlayer = new Player(Istate); //人物实例化
        this.addChild(MyPlayer.wall);
        this.Animate(MyPlayer, MyPlayer.wall, 4, this.PlayerIdle, this.PlayerWalk);
        MyPlayer.wall.scaleX = 1.7;
        MyPlayer.wall.scaleY = 1.7;
        MyPlayer.wall.anchorOffsetX = 30;
        MyPlayer.wall.anchorOffsetY = 42;
        MyPlayer.wall.x = stageW / 8;
        MyPlayer.wall.y = stageH * 0.75;
        var animetw = egret.Tween.get(MyPlayer);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
            MyPlayer.move();
            var playertw = egret.Tween.get(MyPlayer.wall);
            _this.pointx = e.stageX;
            _this.pointy = e.stageY;
            playertw.to({ x: e.stageX, y: e.stageY }, 800);
            if (MyPlayer.wall.x == e.stageX && MyPlayer.wall.y == e.stageY) {
                MyPlayer.idel();
            }
        }, this);
        this.touchEnabled = true;
        /*
                var line = new egret.Shape();
                line.graphics.lineStyle(2, 0xffffff);
                line.graphics.moveTo(0, 0);
                line.graphics.lineTo(0, 117);
                line.graphics.endFill();
                line.x = 172;
                line.y = 61;
                this.addChild(line);
        
        
                var colorLabel = new egret.TextField();
                colorLabel.textColor = 0xffffff;
                colorLabel.width = stageW - 172;
                colorLabel.textAlign = "center";
                colorLabel.text = "Hello Egret";
                colorLabel.size = 24;
                colorLabel.x = 172;
                colorLabel.y = 80;
                this.addChild(colorLabel);
        
                var textfield = new egret.TextField();
                this.addChild(textfield);
                textfield.alpha = 0;
                textfield.width = stageW - 172;
                textfield.textAlign = egret.HorizontalAlign.CENTER;
                textfield.size = 24;
                textfield.textColor = 0xffffff;
                textfield.x = 172;
                textfield.y = 135;
                this.textfield = textfield;
        */
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        //RES.getResAsync("description_json", this.startAnimation, this)
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map