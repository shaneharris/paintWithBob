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
export class Painter{
    canvas:HTMLCanvasElement;
    temp_canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    socket:any;
    socket_id:string;
    selected_position:number= -1;
    altspace_ready:boolean;
    color_picker_open:boolean;
    space_info:SpaceInfo;
    user_info:UserInfo;
    skeleton_info:any;
    head_controls:boolean = false;
    cursor_painter:boolean = true;
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
        canvas_width: 256,
        canvas_height: 386,
        seat_number:-1
    };
    players:PlayerInfo[];
    offset:V3d = {
        x: 0,//6,
        y: 1.4,
        z: 0,//10.5
    };
    positions = {
        paint_active_0:false,
        paint_active_1:false
    };
    radius:number = 6;
    max_positions:number = 2;
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
        //this.socket = io('http://localhost:8080/');
        // this.socket.on('seat-taken',socket_id=>{
        //     this.socket_id = socket_id;
        // });
        // this.socket.on('seat-left',()=>{
        //     this.selected_position = null;
        // });
        // this.socket.on('players',(players:PlayerInfo[])=>{
        //     this.players = players;
        // });
        // this.socket.on('seat-unavailable',()=>{
        //     // TODO: display popup
        // });
    }

    setupAframeCanvas(){
        let _this = this;
        let setHue = point=>{
            let imageData = color_strip_ctx.getImageData(0, Math.round(point.y*color_strip_height), 1, 1).data;
            _this.selected_color = 'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')';
            color_label.setAttribute("material",{shader:'flat',color:_this.selected_color});
            document.querySelector('#handBall').setAttribute("material",{shader:'flat',color:_this.selected_color});
            _this.fillColorGradient(color_block_ctx,color_strip_ctx,color_block_width,color_block_height,_this.selected_color);
        };
        let setColor = point=>{
            let imageData = color_block_ctx.getImageData(Math.round(point.x*color_block_width), Math.round(point.y*color_block_height), 1, 1).data;
            _this.selected_color = 'rgb(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ')';
            color_label.setAttribute("material",{shader:'flat',color:_this.selected_color});
            document.querySelector('#handBall').setAttribute("material",{shader:'flat',color:_this.selected_color});
        };
        let color_block,color_strip,color_block_ctx,color_strip_ctx,color_block_width,color_block_height,rgbaColor,color_strip_width,color_strip_height,color_label,bruch_block_canvas;
        let colorToggleThrottle;
        let preventToggle = false;
        let i = 0;
        AFRAME.registerComponent('test-material',{
            init: function () {
                let url = 'data:image/gif;base64,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';
                // this.temp_canvas = (<HTMLCanvasElement>document.getElementById('player-canvas-'+this.data.replace('player_','')));
                // let image = new Image();
                //
                // var texture = new THREE.Texture(this.temp_canvas);
                // texture.image = image;
                // image.onload = ()=>  {
                //     texture.needsUpdate = true;
                //     this.temp_canvas.width = image.width;
                //     this.temp_canvas.height = image.height;
                //     this.temp_canvas.getContext("2d").drawImage(image,0,0);
                //     let geometry = new THREE.PlaneGeometry(1,1);
                //     let material = new THREE.MeshBasicMaterial({
                //         map:new THREE.TextureLoader().load('/assets/images/placeholder.jpg')//texture
                //     });
                //     let object = new THREE.Mesh(geometry,material);
                //     object.position.y = 1;
                //     object.position.z = ++i;
                //     this.el.object3D.add(object);
                // };
                // //image.src = snap.val();
                // image.src = '/assets/images/placeholder.jpg';
                // let geometry = new THREE.PlaneGeometry(1,1);
                // let material = new THREE.MeshBasicMaterial({
                //     map:new THREE.TextureLoader().load('https://lh4.ggpht.com/ov5O67S1b-L9EuG8LOLNAZtF3sXL363ouFOershL2ujR9WB0Y5BTDz5KVDMQ55t4QA=w300')//texture
                // });
                // let object = new THREE.Mesh(geometry,material);
                // object.position.y = 1;
                // object.position.z = ++i;
                // this.el.object3D.add(object);

            }
        });
        AFRAME.registerComponent('sync-paint', {
            schema:{default: '',type:'string'},
            init: function () {
                let paint_state = this.el.sceneEl.systems['sync-system'].connection.instance
                    .child('paint_state_'+this.data.replace('player_',''));
                let el = (<any>document.getElementById(this.data));
                let object = el.object3D;
                let object_pos = object.position.clone();
                paint_state.on('value', () =>{
                    document.querySelector('#placeholder'+this.data.replace('player_','')).setAttribute('src','/media/player'+this.data.replace('player_','')+'.jpeg?cache_bust='+new Date().getTime());
                    // let geometry = new THREE.PlaneGeometry(1,1);
                    // let material = new THREE.MeshBasicMaterial({
                    //     map:new THREE.TextureLoader().load('/media/player'+this.data.replace('player_','')+'.jpeg?cache_bust='+new Date().getTime())//texture
                    // });
                    // let new_object = new THREE.Mesh(geometry,material);
                    // new_object.position.set(object_pos.x,object_pos.y,object_pos.z);
                    // new_object.scale.set(0.6,0.8,1);
                    // //object.remove(object.children[0]);
                    // object.children[0].children = [new_object];
                    // document.getElementById(this.data).addEventListener("mousedown",()=>{
                    //     this.joinPosition(this.data.replace('player_',''),object_pos);
                    // });
                });

                let position_state = this.el.sceneEl.systems['sync-system'].connection.instance
                    .child('paint_active_'+this.data.replace('player_',''));

                position_state.on('value', (snap) =>{
                    _this.positions['paint_active_'+this.data.replace('player_','')] = snap.val();
                });
            }
        });
        AFRAME.registerComponent('color-toggle', {
            tick: function () {
                _this.getPaintPoint(this.el.object3D.position,0.2,0.1)
                    .then(()=>{
                        if(!preventToggle){
                            _this.color_picker_open = !_this.color_picker_open;
                            preventToggle = true;
                            clearTimeout(colorToggleThrottle);
                            colorToggleThrottle = setTimeout(()=>{
                                preventToggle = false;
                            },750);
                        }
                    });
            }
        });
        AFRAME.registerComponent('color-picker', {
            init:function(){
                let color_block_canvas = (<HTMLCanvasElement>document.getElementById('color-block'));
                let color_strip_canvas = (<HTMLCanvasElement>document.getElementById('color-strip'));
                color_block_ctx = color_block_canvas.getContext('2d');
                color_block_width = color_block_canvas.width;
                color_block_height = color_block_canvas.height;
                color_strip_ctx = color_strip_canvas.getContext('2d');
                color_strip_width = color_strip_canvas.width;
                color_strip_height = color_strip_canvas.height;
                rgbaColor = 'rgba(255,0,0,1)';


                color_block_ctx.rect(0, 0, color_block_width, color_block_height);
                _this.fillColorGradient(color_block_ctx,color_strip_ctx,color_block_width,color_block_height,rgbaColor);

                color_strip_ctx.rect(0, 0, color_strip_width, color_strip_height);
                let color_strip_gradient = color_strip_ctx.createLinearGradient(0, 0, 0, color_strip_height);
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
                    _this.color_picker_open=!_this.color_picker_open;
                });
                color_block.addEventListener('mousedown',e=>{
                    if(_this.cursor_painter) {
                        _this.getPaintPoint(color_block.object3D.position, 0.25,0.25, true, e.detail.point)
                            .then((point: any) => {
                                setColor(point);
                            });
                    }
                });
                color_strip.addEventListener('mousedown',e=>{
                    if(_this.cursor_painter) {
                        _this.getPaintPoint(color_strip.object3D.position, 0.05,0.25, true, e.detail.point)
                            .then((point: any) => {
                                setHue(point);
                            });
                    }
                });
            },
            tick:function(){
                color_label.setAttribute('position',{x:_this.canvas_properties.position.x+0.2,y:_this.canvas_properties.position.y+0.455,z:_this.canvas_properties.position.z})
                if(_this.color_picker_open){
                    color_block.setAttribute('position',{x:_this.canvas_properties.position.x+0.485,y:_this.canvas_properties.position.y+0.275,z:_this.canvas_properties.position.z})
                    color_strip.setAttribute('position',{x:_this.canvas_properties.position.x+0.33,y:_this.canvas_properties.position.y+0.275,z:_this.canvas_properties.position.z})
                    color_block.setAttribute('scale',{x:0.25,y:0.25,z:1});
                    color_strip.setAttribute('scale',{x:0.05,y:0.25,z:1});
                    _this.getPaintPoint(color_strip.object3D.position,0.05,0.25)
                        .then((point:any)=>{
                            setHue(point);
                        });
                    _this.getPaintPoint(color_block.object3D.position,0.25,0.25)
                        .then((point:any)=>{
                            setColor(point);
                        });
                }else{
                    color_block.setAttribute('scale',{x:0,y:0,z:0});
                    color_strip.setAttribute('scale',{x:0,y:0,z:0});
                }
            }
        });
        let setSize = point=>{
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
        };
        AFRAME.registerComponent('brush-size-picker', {
            init:function(){
                this.el.addEventListener('mousedown',e=>{
                    if(_this.cursor_painter) {
                        _this.getPaintPoint(this.el.object3D.position, 0.34, 0.1, true, e.detail.point)
                            .then((point: any) => {
                                setSize(point);
                            });
                    }
                });
            },
            tick:function(){
                this.el.setAttribute('position',{x:_this.canvas_properties.position.x-0.1025,y:_this.canvas_properties.position.y+0.455,z:_this.canvas_properties.position.z});
                _this.getPaintPoint(this.el.object3D.position,0.34,0.1)
                    .then((point:any)=>{
                        setSize(point);
                    });
            }
        });
        let updateThrottle;
        let setPaint  = point=>{
            _this.ctx.beginPath();
            _this.ctx.fillStyle = _this.selected_color;
            _this.ctx.arc(point.x*_this.canvas_properties.canvas_width, point.y*_this.canvas_properties.canvas_height, _this.selected_brush_size, 0, 2 * Math.PI);
            _this.ctx.fill();
            clearTimeout(updateThrottle);
            updateThrottle = setTimeout(()=>{
                let xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
                xmlhttp.open("POST", "http://xactaccounts.co.uk:8080/player-image");
                xmlhttp.setRequestHeader("Content-Type", "application/json");
                xmlhttp.send(JSON.stringify({position:_this.canvas_properties.seat_number, image:_this.canvas.toDataURL('image/jpeg', 1.0)}));
                (<any>document.querySelector('a-scene')
                    .systems['sync-system'])
                    .connection.instance
                    .child('paint_state_'+_this.canvas_properties.seat_number)
                    .set(new Date().getTime());
            },2000);
        };
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
                this.el.addEventListener('mousedown',e=>{
                    if(_this.cursor_painter){
                        _this.getPaintPoint(this.el.object3D.position,_this.canvas_properties.width,_this.canvas_properties.height,true,e.detail.point)
                            .then((point:any)=>{
                                setPaint(point);
                            });
                    }
                });
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
                            setPaint(point);
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
    getPaintPoint(position,width,height,is_cursor?,cursor_position?) {
        return new Promise(r => {
            let paint_point = new THREE.Vector3();
            if(is_cursor){
                paint_point = cursor_position.clone();
            }else{
                paint_point.setFromMatrixPosition(document.querySelector('#handBall').object3D.matrixWorld);
            }
            let paint_point_z = paint_point.z;
            paint_point.z = position.z;
            let paint = document.querySelector('#paintBox');
            if (paint_point.z + 0.01 > paint_point_z
                && paint_point.x > position.x - (width / 2) && paint_point.x < position.x + (width / 2)
                && paint_point.y > position.y - (height / 2) && paint_point.y < position.y + (height / 2)) {
                paint.setAttribute('position', {
                    x: paint_point.x,
                    y: paint_point.y,
                    z: paint_point.z
                });
                let offset_x = ((paint_point.x - (position.x - (width / 2))) * (1 / width));
                let offset_y = 1 - ((paint_point.y - (position.y - (height / 2))) * (1 / height));
                r({x:offset_x,y:offset_y});
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
            placeholder.setAttribute('rotation','0 0 0');
            placeholder.setAttribute('scale','0.6 0.8 1');
            placeholder.addEventListener("mousedown",()=>{
                this.joinPosition(i,position);
            });
        }
    }
    dataURItoBlob(dataURI) {
        if(dataURI){
            var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var binary = atob(dataURI.split(',')[1]);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            return URL.createObjectURL(new Blob([new Uint8Array(array)], {type: mime}));
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
        if(!this.positions['player_active_'+position]&&this.selected_position===-1){
            (<any>document.querySelector('a-scene')
                .systems['sync-system'])
                .connection.instance
                .child('paint_active_'+position)
                .set(true);
            this.canvas_properties.position = point;
            this.canvas_properties.seat_number = position;
            let canvas = document.querySelector('#canvasPlane');
            canvas.setAttribute("position",this.canvas_properties.position);
            document.getElementById('player_'+position).setAttribute('position',point.x+' 3 '+point.z);
            this.selected_position = position;
        }
    }
    leavePosition(){
        //this.socket.emit('leave-seat');
        let canvas = document.querySelector('#canvasPlane');
        canvas.setAttribute('scale','0 0 0');
    }
    fillColorGradient(ctx1,ctx2,width1,height1,rgbaColor) {
        ctx1.fillStyle = rgbaColor;
        ctx1.fillRect(0, 0, width1, height1);

        var grdWhite = ctx2.createLinearGradient(0, 0, width1, 0);
        grdWhite.addColorStop(1, 'rgba(255,255,255,1)');
        grdWhite.addColorStop(0, 'rgba(255,255,255,0)');
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