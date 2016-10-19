//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
interface State {

    EnterState();

    ExitState();
}

class Player extends egret.DisplayObjectContainer {



    public wall: egret.Bitmap;
    /*
        public _move1: egret.Bitmap;
        public _move2: egret.Bitmap;
        public _move3: egret.Bitmap;
        public _move4: egret.Bitmap;
    
        public _idel1: egret.Bitmap;
        public _idel2: egret.Bitmap;
        public _idel3: egret.Bitmap;
        public _idel4: egret.Bitmap;
    */

    PState: PlayerState;
    posX: number;
    posY: number;


    idState: idleState;
    moState: MoveState;

    constructor(_newState: State) {
        super();

        this.PState = new PlayerState(_newState);
        this.wall = new egret.Bitmap();

        this.wall.height = 93;
        this.wall.width = 60;
 

        this.idState = new idleState();
        this.moState = new MoveState();



    }

    move() {
        this.PState.changeState(this.moState)
    }

    idel() {
        this.PState.changeState(this.idState)
    }




    createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

}

class PlayerState {
    _currentState: State;
    constructor(_newState: State) {
        if (this._currentState != null) {

            this._currentState.ExitState();

        }

        this._currentState = _newState;
        this._currentState.EnterState();


    }

    changeState(_newState: State) {
        if (this._currentState != null) {
            this._currentState.ExitState();
        }
        this._currentState = _newState;
        this._currentState.EnterState();
    }


}

class MoveState implements State {

    private OnMove: boolean = false;

    EnterState() {
        this.OnMove = true;
    }

    ExitState() {
        this.OnMove = false;
    }

    GetMoveState(): boolean {
        var result: boolean;
        result = this.OnMove;
        return result;
    }
}

class idleState implements State {

    private Onidel: boolean = true;

    EnterState() {
        this.Onidel = true;
    }

    ExitState() {
        this.Onidel = false;
    }

    GetIdleState(): boolean {
        var result: boolean;
        result = this.Onidel;
        return result;
    }
}


class Main extends egret.DisplayObjectContainer {



    private pointx: number;
    private pointy: number;
    /**
     * 加载进度界面
     * Process interface loading
     */




    private loadingView: LoadingUI;

    public constructor() {
        super();

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */


    private Judge(MyPlayer: Player) {
        egret.Ticker.getInstance().register(() => {
            if (MyPlayer.wall.x == this.pointx && MyPlayer.wall.y == this.pointy) {
                MyPlayer.idel();

            }
        }, this)
    }





    private Animate(MyPlayer: Player, bit: egret.Bitmap, playMod: number, playerAnimation: egret.Texture[], playerAnimation2: egret.Texture[]) {
        var frame = 0;
        var animateFrame = 0;
        egret.Ticker.getInstance().register(() => {
            
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
this.Judge(MyPlayer);
        }, this);

    }




    private PlayerIdle: egret.Texture[] = new Array();
    private PlayerWalk: egret.Texture[] = new Array();
    private LoadPlayer() {
        for (var i = 0; i < 4; i++) {

            this.PlayerIdle[i] =
                RES.getRes("idel" + (i + 1) + "_png");



        }
        for (var i = 0; i < 4; i++) {

            this.PlayerWalk[i] =
                RES.getRes("move" + (i + 1) + "_png");

        }
    }

    private createGameScene(): void {
        this.LoadPlayer();
        var sky: egret.Bitmap = this.createBitmapByName("Gamebg_jpg");
        this.addChild(sky);
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;


        var Istate = new idleState();  //状态实例化
        var Mstate = new MoveState();

        var MyPlayer = new Player(Istate);  //人物实例化
        this.addChild(MyPlayer.wall);


        this.Animate(MyPlayer, MyPlayer.wall, 4, this.PlayerIdle, this.PlayerWalk);


        MyPlayer.wall.scaleX = 1.7;
        MyPlayer.wall.scaleY = 1.7;
        MyPlayer.wall.anchorOffsetX = 30;
        MyPlayer.wall.anchorOffsetY = 42;
        MyPlayer.wall.x = stageW/8;
        MyPlayer.wall.y = stageH*0.75;

       

        var animetw = egret.Tween.get(MyPlayer);
    
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, (e: egret.TouchEvent) => {


            MyPlayer.move();
            var playertw = egret.Tween.get(MyPlayer.wall);
            this.pointx = e.stageX;
            this.pointy = e.stageY;
            playertw.to({ x: e.stageX, y: e.stageY }, 800)



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
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */

    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
    
    private startAnimation(result: Array<any>): void {
        var self: any = this;

        var parser = new egret.HtmlTextParser();
        var textflowArr: Array<Array<egret.ITextElement>> = [];
        for (var i: number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change: Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            self.changeDescription(textfield, lineArr);

            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };

        change();
    }

    /**
     * 切换描述内容
     * Switch to described content
     
    private changeDescription(textfield: egret.TextField, textFlow: Array<egret.ITextElement>): void {
        textfield.textFlow = textFlow;
    }
     */
}


