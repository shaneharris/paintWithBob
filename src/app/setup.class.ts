declare let AFRAME,altspace,io,THREE;
export interface SpaceInfo{
    sid: string;
    name: string;
    templateSid: string;
}
export interface UserInfo{
    userId: string;
    isLocal: boolean;
    isModerator: boolean;
    displayName: string;
}
export interface PlayerInfo{
    user_id: string;
    moderator: boolean;
    name: string;
    position: number;
}
export interface V3d{
    x: number;
    y: number;
    z: number;
}
export class Setup{
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    socket:any;
    socket_id:string;
    selected_position:number;
    altspace_ready:boolean;
    color_picker_open:boolean;
    space_info:SpaceInfo;
    user_info:UserInfo;
    skeleton_info:any;
    head_controls:boolean = false;
    selected_color = 'rgba(255,0,0,1)';
    selected_brush_size = 2;
    padR;
    padL;
    canvas_properties= {
        position:{
            x:0,
            y:0,
            z:0
        },
        width: 0.6,
        height: 0.8,
        canvas_width: 386,
        canvas_height: 512
    };
    players:PlayerInfo[];
    offset:V3d = {
        x: 6,
        y:1.4,
        z: 10.5
    };
    radius:number = 6;
    max_positions:number = 12;
    offset_angle:number = (Math.PI*.45);
    constructor(){
        this.setupAframeCanvas();
        document.onreadystatechange = ()=>{
            if (document.readyState == "complete") {
                this.setupSocket();
                this.setupAltspace();
                this.setupPlayerPlaceholders();
            }
        };
    }
    setupSocket(){
        this.socket = io('http://localhost:8080/');
        this.socket.on('seat-taken',socket_id=>{
            this.socket_id = socket_id;
            let canvas = document.querySelector('#canvasPlane');
            console.log(this.canvas_properties.position);
            canvas.setAttribute("position",this.canvas_properties.position);
        });
        this.socket.on('seat-left',()=>{
            this.selected_position = null;
        });
        this.socket.on('players',(players:PlayerInfo[])=>{
            this.players = players;
        });
        this.socket.on('seat-unavailable',()=>{
            // TODO: display popup
        });
    }

    setupAframeCanvas(){
        let _this = this;
        let color_block,color_strip,color_block_ctx,color_strip_ctx,color_block_width,color_block_height,rgbaColor,color_strip_width,color_label,bruch_block_canvas;
        AFRAME.registerComponent('color-picker', {
            init:function(){
                let color_block_canvas = (<HTMLCanvasElement>document.getElementById('color-block'));
                let color_strip_canvas = (<HTMLCanvasElement>document.getElementById('color-strip'));
                color_block_ctx = color_block_canvas.getContext('2d');
                color_block_width = color_block_canvas.width;
                color_block_height = color_block_canvas.height;
                color_strip_ctx = color_strip_canvas.getContext('2d');
                color_strip_width = color_strip_canvas.width;
                let color_strip_height = color_strip_canvas.height;
                rgbaColor = 'rgba(255,0,0,1)';


                color_block_ctx.rect(0, 0, color_block_width, color_block_height);
                _this.fillColorGradient(color_block_ctx,color_strip_ctx,color_block_width,color_block_height,rgbaColor);

                color_strip_ctx.rect(0, 0, color_strip_width, color_strip_height);
                let color_strip_gradient = color_strip_ctx.createLinearGradient(0, 0, 0, color_block_height);
                color_strip_gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
                color_strip_gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
                color_strip_gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
                color_strip_gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
                color_strip_gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
                color_strip_gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
                color_strip_gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
                color_strip_ctx.fillStyle = color_strip_gradient;
                color_strip_ctx.fill();
                color_block = document.getElementById('colorBlock');
                color_strip = document.getElementById('colorStrip');
                color_label = document.getElementById('colorLabel');
                color_label.addEventListener("mousedown",e=>{
                    console.log(e);
                    _this.color_picker_open=!_this.color_picker_open;
                });
            },
            tick:function(){
                color_label.setAttribute('position',{x:_this.canvas_properties.position.x,y:_this.canvas_properties.position.y+0.455,z:_this.canvas_properties.position.z+0.2})
                if(_this.color_picker_open){
                    color_block.setAttribute('position',{x:_this.canvas_properties.position.x,y:_this.canvas_properties.position.y+0.150,z:_this.canvas_properties.position.z+0.555})
                    color_strip.setAttribute('position',{x:_this.canvas_properties.position.x,y:_this.canvas_properties.position.y+0.150,z:_this.canvas_properties.position.z+0.86})
                    color_block.setAttribute('scale',{x:0.5,y:0.5,z:1});
                    color_strip.setAttribute('scale',{x:0.1,y:0.5,z:1});
                    _this.getPaintPoint(color_strip.object3D.position,0.1,0.5)
                        .then((point:any)=>{
                            let imageData = color_strip_ctx.getImageData(Math.round(point.x*color_strip_width), Math.round(point.y*color_block_height), 1, 1).data;
                            rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
                            _this.fillColorGradient(color_block_ctx,color_strip_ctx,color_block_width,color_block_height,rgbaColor);
                        });
                    _this.getPaintPoint(color_block.object3D.position,0.5,0.5)
                        .then((point:any)=>{
                            let imageData = color_block_ctx.getImageData(Math.round(point.x*color_block_width), Math.round(point.y*color_block_height), 1, 1).data;
                            _this.selected_color = 'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')';
                            color_label.setAttribute("material",{shader:'flat',color:_this.selected_color});
                            document.querySelector('#handBall').setAttribute("material",{shader:'flat',color:_this.selected_color});
                        });
                }else{
                    color_block.setAttribute('scale',{x:0,y:0,z:0});
                    color_strip.setAttribute('scale',{x:0,y:0,z:0});
                }
            }
        });
        AFRAME.registerComponent('brush-size-picker', {
            init:function(){
            },
            tick:function(){
                this.el.setAttribute('position',{x:_this.canvas_properties.position.x,y:_this.canvas_properties.position.y+0.455,z:_this.canvas_properties.position.z-0.1025});
                _this.getPaintPoint(this.el.object3D.position,0.34,0.1)
                    .then((point:any)=>{
                        let handle = document.querySelector('#brushBlockHandle')
                        handle.setAttribute('position',{
                            x:((point.x*0.34)-0.17),
                            y:0,
                            z:0.002
                        });
                        let scale = {
                            x:((point.x*0.02)+0.005),
                            y:((point.x*0.02)+0.005),
                            z:((point.x*0.02)+0.005)
                        };
                        handle.setAttribute('scale',scale);
                        document.querySelector('#handBall').setAttribute('scale',scale);
                        _this.selected_brush_size = point.x*10;
                    });
            }
        });
        AFRAME.registerComponent('draw-canvas', {
            schema: {default: ''},
            init:function(){
                this.el.setAttribute('position',_this.canvas_properties.position);
                this.el.setAttribute('scale',_this.canvas_properties.width+' '+_this.canvas_properties.height+' 1');
                _this.canvas = (<HTMLCanvasElement>document.getElementById(this.data));
                _this.ctx = _this.canvas.getContext('2d');
                _this.canvas.width = _this.canvas_properties.canvas_width;
                _this.canvas.height = _this.canvas_properties.canvas_height;
                _this.ctx.fillStyle = "#ffffff";
                _this.ctx.fillRect(0,0,_this.canvas.width,_this.canvas.height);
            },
            tick:function(){
                if(_this.padR){
                    let hand = document.querySelector('#handBox');
                    hand.setAttribute('position',{
                        x: _this.padR.position.x,
                        y: _this.padR.position.y,
                        z: _this.padR.position.z
                    });
                    hand.object3D.quaternion.set(_this.padR.rotation.x,_this.padR.rotation.y,_this.padR.rotation.z,_this.padR.rotation.w);
                    _this.getPaintPoint(this.el.object3D.position,_this.canvas_properties.width,_this.canvas_properties.height)
                        .then((point:any)=>{
                            _this.ctx.beginPath();
                            _this.ctx.fillStyle = _this.selected_color;
                            _this.ctx.arc(point.x*_this.canvas_properties.canvas_width, point.y*_this.canvas_properties.canvas_height, _this.selected_brush_size, 0, 2 * Math.PI);
                            _this.ctx.fill();
                        });
                }
            }
        });
        AFRAME.registerComponent('gamepad-update',{
            schema: {default: ''},
            init:function(){
            },
            tick:function() {
                if(_this.altspace_ready){
                    let gamepadsList = altspace.getGamepads();
                    for (let i = 0; i < gamepadsList.length; i++) {
                        let curPadInfo = gamepadsList[i];
                        switch (curPadInfo.mapping) {
                            case "standard":
                                continue;
                            case "touch":
                            case "steamvr":
                                this.mapping = curPadInfo.mapping;
                                if (curPadInfo.hand == "left") {
                                    _this.padL = curPadInfo;
                                } else {
                                    _this.padR = curPadInfo;
                                }
                                break;
                            default:
                                console.log("UNKNOWN CONTROLLER TYPE??", curPadInfo.mapping);
                                break;
                        }
                    }
                    _this.head_controls = !_this.padL&&!_this.padR;
                    if(_this.head_controls){

                    }
                }
            }
        })
    }
    getPaintPoint(position,width,height) {
        return new Promise(r => {
            let paint_point = new THREE.Vector3();
            paint_point.setFromMatrixPosition(document.querySelector('#handBall').object3D.matrixWorld);
            let paint_point_x = paint_point.x;
            paint_point.x = position.x;
            let paint = document.querySelector('#paintBox');
            if (paint_point.x - 0.01 < paint_point_x
                && paint_point.z > position.z - (width / 2) && paint_point.z < position.z + (width / 2)
                && paint_point.y > position.y - (height / 2) && paint_point.y < position.y + (height / 2)) {
                paint.setAttribute('position', {
                    x: paint_point.x,
                    y: paint_point.y,
                    z: paint_point.z
                });
                let offset_z = ((paint_point.z - (position.z - (width / 2))) * (1 / width));
                let offset_y = 1 - ((paint_point.y - (position.y - (height / 2))) * (1 / height));
                r({x:offset_z,y:offset_y});
            }
        });
    }
    setupPlayerPlaceholders(){
        for(let i = 0; i < this.max_positions; i++){
            let angle = ((Math.PI/12)*i)+this.offset_angle;
            let position = {
                x: (Math.cos(angle) * this.radius)+this.offset.x,
                y: this.offset.y,
                z:(Math.sin(angle) * this.radius)+this.offset.z
            };
            let placeholder = document.getElementById('player_'+i);
            placeholder.setAttribute('position',position.x+' '+position.y+' '+position.z);
            placeholder.setAttribute('rotation','0 270 0');
            placeholder.setAttribute('scale','0.6 0.8 1');
            placeholder.addEventListener("mousedown",()=>{
                placeholder.setAttribute('scale','0 0 0');
                this.joinPosition(i,position);
            });
        }
    }
    setupAltspace(){
        altspace.getThreeJSTrackingSkeleton()
            .then((skeletonInfo:any)=>{
                this.skeleton_info = skeletonInfo;
            });
        altspace.getSpace()
            .then((space_info:SpaceInfo)=>{
                this.space_info = space_info;
            });
        altspace.getUser()
            .then((user_info:UserInfo)=>{
                this.user_info = user_info;
                this.altspace_ready = true;
            });
    }
    joinPosition(position:number,point){
        this.socket.emit('take-seat',{
            room_id:this.space_info.sid,
            position:position,
            name:this.user_info.displayName,
            moderator:this.user_info.isModerator,
            user_id:this.user_info.userId,
        });
        this.canvas_properties.position = point;
    }
    leavePosition(){
        this.socket.emit('leave-seat');
        let canvas = document.querySelector('#canvasPlane');
        canvas.setAttribute('scale','0 0 0');
    }
    fillColorGradient(ctx1,ctx2,width1,height1,rgbaColor) {
        ctx1.fillStyle = rgbaColor;
        ctx1.fillRect(0, 0, width1, height1);

        var grdWhite = ctx2.createLinearGradient(0, 0, width1, 0);
        grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx1.fillStyle = grdWhite;
        ctx1.fillRect(0, 0, width1, height1);

        var grdBlack = ctx2.createLinearGradient(0, 0, 0, height1);
        grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
        grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
        ctx1.fillStyle = grdBlack;
        ctx1.fillRect(0, 0, width1, height1);
    }

    /*

     var drag = false;
     var rgbaColor = 'rgba(255,0,0,1)';

     ctx1.rect(0, 0, width1, height1);
     fillGradient();

     ctx2.rect(0, 0, width2, height2);
     var grd1 = ctx2.createLinearGradient(0, 0, 0, height1);
     grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
     grd1.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
     grd1.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
     grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
     grd1.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
     grd1.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
     grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
     ctx2.fillStyle = grd1;
     ctx2.fill();

     function click(e) {
     x = e.offsetX;
     y = e.offsetY;
     var imageData = ctx2.getImageData(x, y, 1, 1).data;
     rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
     fillGradient();
     }

     function

     function mousedown(e) {
     drag = true;
     changeColor(e);
     }

     function mousemove(e) {
     if (drag) {
     changeColor(e);
     }
     }

     function mouseup(e) {
     drag = false;
     }

     function changeColor(e) {
     x = e.offsetX;
     y = e.offsetY;
     var imageData = ctx1.getImageData(x, y, 1, 1).data;
     rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
     colorLabel.style.backgroundColor = rgbaColor;
     }

     colorStrip.addEventListener("click", click, false);

     colorBlock.addEventListener("mousedown", mousedown, false);
     colorBlock.addEventListener("mouseup", mouseup, false);
     colorBlock.addEventListener("mousemove", mousemove, false);

     */
}