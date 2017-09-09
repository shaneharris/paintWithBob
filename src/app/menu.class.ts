// import {Setup} from "./setup.class";
// /**
//  * Created by autoc on 02/07/2017.
//  */
// declare var THREE,TWEEN,altspace:any;
export class Menu{
//     setup:Setup;
//     is_open = false;
//     is_section_open = false;
//     current_index = 0;
//     menu_system;
//     menu_group;
//     background_section;
//     canvas;
//     menu = {
//         skybox:new THREE.Group(),
//         terrain:new THREE.Group(),
//         weather:new THREE.Group()
//     };
//     constructor(setup) {
//         this.setup = setup;
//         this.setupMenu();
//     }
//     toggleMenu(){
//         if(!this.is_open){
//             this.menu_system.add(this.menu_group);
//         }else{
//             this.menu_system.remove(this.menu_group);
//         }
//         this.is_open=!this.is_open;
//     }
//     toggleMainSection(){
//         if(!this.is_section_open){
//             this.menu_system.add(this.background_section);
//         }else{
//             this.menu_system.remove(this.background_section);
//         }
//         this.is_section_open=!this.is_section_open;
//     }
//     setupMenu(){
//         this.menu_system = new THREE.Group();
//         this.menu_group = new THREE.Group();
//         var geometry = new THREE.PlaneGeometry(20,5);
//         var material = new THREE.MeshBasicMaterial({color:'#000',side: THREE.DoubleSide,transparent: true, opacity: 0.9});
//         this.background_section = new THREE.Mesh(geometry,material);
//         this.background_section.position.z=20;
//         this.background_section.position.y=-1;
//         this.background_section.position.x=4;
//
//
//         this.addMenuItem(0,'/assets/icons/brush_icon.png');
//         this.addMenuItem(1,'/assets/icons/ground_icon.png');
//         this.addMenuItem(2,'/assets/icons/skybox_icon.png');
//         this.addMenuItem(3,'/assets/icons/weather_icon.png');
//         this.setup.scene.add(this.menu_system);
//         this.menu.terrain.userData.grasslands = {groupName:'terrain'}
//         this.menu.skybox.userData.grasslands = {groupName:'skybox'}
//         this.menu.weather.userData.grasslands = {groupName:'weather'}
//         this.addSectionItem(this.menu.terrain,'Grass','/assets/textures/terrians/grass-thumb.jpg');
//         this.addSectionItem(this.menu.terrain,'Snow','/assets/textures/terrians/snow-thumb.jpg');
//         this.addSectionItem(this.menu.skybox,'City Scape','/assets/picture/city_scape-thumb.jpg');
//         this.addSectionItem(this.menu.skybox,'Paris','/assets/picture/paris-thumb.jpg');
//         this.addSectionItem(this.menu.weather,'Snow','/assets/icons/weather_icon.png');
//
//     }
//     canvasText(text){
//         var canvas = document.createElement('canvas');
//         canvas.width = 200;
//         canvas.height = 20;
//         var ctx = canvas.getContext('2d');
//         ctx.clearRect(0,0,200,20);
//         ctx.font = '20pt Arial';
//         ctx.fillStyle = 'white';
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillText(text, canvas.width / 2, canvas.height / 2);
//         return canvas;
//     }
//     addMenuItem(index,image){
//         var base_position = -5;
//         var geometry = new THREE.RingGeometry(0.9, 1, 32);
//         var material = new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0.9});
//         var obj = new THREE.Object3D();
//         var ring_outline = new THREE.Mesh(geometry,material);
//
//         var loader = new THREE.TextureLoader();
//         loader.load(image,(texture)=>{
//             var geometry = new THREE.CircleGeometry(0.8, 32);
//             var material = new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0.9});
//             var ring_inner = new THREE.Mesh(geometry,material);
//             obj.add(ring_outline);
//             obj.add(ring_inner);
//         });
//         obj.position.z=20;
//         obj.position.y=-5;
//         obj.rotation.y=Math.PI;
//         if(index==0){
//             obj.position.x=base_position;
//             this.menu_system.add(obj);
//             // obj.addEventListener('cursordown',()=>console.log('cursordown'));
//             // obj.addEventListener('cursormove',()=>console.log('cursormove'));
//             // obj.addEventListener('cursorleave',()=>console.log('cursorleave'));
//             // obj.addEventListener('cursorenter',()=>console.log('cursorenter'));
//             // obj.addEventListener('cursorup',()=>console.log('cursorup'));
//             obj.addEventListener('cursordown',()=>{
//                 this.toggleMenu();
//                 if(this.is_section_open){
//                     this.toggleMainSection();
//                 }
//             });
//         }else{
//             obj.position.x=base_position+0.5+(index*2);
//             this.menu_group.add(obj);
//             obj.addEventListener('cursordown',this.menuClick.bind(this,index));
//         }
//     }
//     addSectionItem(section,name,image){
//         var geometry = new THREE.PlaneGeometry(3,3);
//         var material = new THREE.MeshBasicMaterial({color:'#fff',side: THREE.DoubleSide,transparent: true, opacity: 0.9, map: new THREE.TextureLoader().load(image)});
//         var section_item = new THREE.Mesh(geometry,material);
//         section_item.position.z=-1;
//         section_item.position.x=(section.children.length*3.5)-7.5;
//         section_item.position.y=0.2;
//         section_item.addEventListener('cursordown',this.sectionClick.bind(this,section.userData.grasslands.groupName,name));
//         section.add(section_item);
//
//         var geometry = new THREE.PlaneGeometry(5,0.5);
//         var material = new THREE.MeshBasicMaterial({color:'#fff',side: THREE.DoubleSide,transparent: true, opacity: 0.9, map: new THREE.Texture(this.canvasText(name))});
//         var section_title = new THREE.Mesh(geometry,material);
//         section_title.rotation.y=Math.PI;
//         section_title.position.z=-1;
//         section_title.position.x=(section.children.length*0.1);
//         section_title.position.y=-1.7;
//         section_item.add(section_title);
//     }
//     menuClick(index){
//         if(this.current_index == index||!this.is_section_open)this.toggleMainSection();
//         if(this.is_section_open){
//             switch(index){
//                 case 1://terrian
//                     this.background_section.remove(this.menu.weather);
//                     this.background_section.remove(this.menu.skybox);
//                     this.background_section.add(this.menu.terrain);
//                     break;
//                 case 2://skymap
//                     this.background_section.remove(this.menu.weather);
//                     this.background_section.add(this.menu.skybox);
//                     this.background_section.remove(this.menu.terrain);
//                     break;
//                 case 3://weather
//                     this.background_section.add(this.menu.weather);
//                     this.background_section.remove(this.menu.skybox);
//                     this.background_section.remove(this.menu.terrain);
//                     break;
//             }
//         }else{
//             this.background_section.remove(this.menu.weather);
//             this.background_section.remove(this.menu.skybox);
//             this.background_section.remove(this.menu.terrain);
//         }
//         this.current_index = index;
//         return "";
//     }
//     sectionClick(type,name) {
//         console.log(type,name);
//         switch(type){
//             case "terrain":
//                 name=="Grass"?this.setup.terrains.grass():this.setup.terrains.snow();
//                 break;
//             case "skybox":
//                 name=="Paris"?this.setup.setSkyBox('/assets/picture/paris.jpg'):this.setup.setSkyBox('/assets/picture/city_scape.jpg')
//                 break;
//             case "weather":
//                 if(name=="Snow")this.setup.weather.createParticleSprites();
//                 break;
//         }
//     }
}