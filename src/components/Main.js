import React from 'react'
import {Link} from 'react-router-dom'
import * as THREE from 'three'
import { EffectComposer, RenderPass } from 'postprocessing'
import { WaterEffect } from '../Helpers/WaterEffect'
import { EffectPass } from 'postprocessing'


const easeOutSine = (t, b, c, d) => {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

const easeOutQuad = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};
export class WaterTexture{
  constructor(options) {
    this.last = null;
    this.size = 64;
      this.radius = this.size * 0.1;
      this.points = [];
        this.maxAge = 64;
     this.width = this.height = this.size;
    if (options.debug) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.radius = this.width * 0.05;
    }

    this.initTexture();
      if(options.debug) document.body.append(this.canvas);
  }
    // Initialize our canvas
  initTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "WaterTexture";
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.clear();
    this.texture = new THREE.Texture(this.canvas);

  }
  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  update(){
    this.clear();
     let agePart = 1. / this.maxAge;
        this.points.forEach(point => {
          let slowAsOlder = (1.- point.age / this.maxAge)
         let force = point.force * agePart * slowAsOlder;
           point.x += point.vx * force;
           point.y += point.vy * force;
         point.age += 1;
            if(point.age > this.maxAge){
                this.points.splice(this.points.indexOf(point), 1);
            }
        })
        this.points.forEach(point => {
            this.drawPoint(point);
        })
        this.texture.needsUpdate = true;

  }
  addPoint(point){
    let force = 0;
         let vx = 0;
         let vy = 0;
         const last = this.last;
         if(last){
             const relativeX = point.x - last.x;
             const relativeY = point.y - last.y;
             // Distance formula
             const distanceSquared = relativeX * relativeX + relativeY * relativeY;
             const distance = Math.sqrt(distanceSquared);
             // Calculate Unit Vector
             vx = relativeX / distance;
             vy = relativeY / distance;

             force = Math.min(distanceSquared * 10000,1.);
         }

         this.last = {
             x: point.x,
             y: point.y
         }
         this.points.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
   }
   drawPoint(point) {
        // Convert normalized position into canvas coordinates
        let pos = {
            x: point.x * this.width,
            y: point.y * this.height
        }
        const radius = this.radius;


        const ctx = this.ctx;
          // Lower the opacity as it gets older
          let intensity = 1.;
          if (point.age < this.maxAge * 0.3) {
          intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
        } else {
          intensity = easeOutQuad(
            1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
            0,
            1,
            1
          );
        }
        intensity *= point.force;

        let red = ((point.vx + 1) / 2) * 255;
      let green = ((point.vy + 1) / 2) * 255;
      // B = Unit vector
      let blue = intensity * 255;
      let color = `${red}, ${green}, ${blue}`;


      let offset = this.size * 50;
      ctx.shadowOffsetX = offset;
      ctx.shadowOffsetY = offset;
      ctx.shadowBlur = radius * 1;
      ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(0,0,0,1)";
      this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
}
let waterTexture = new WaterTexture({ debug: true })
let renderer = new THREE.WebGLRenderer({
         antialias: false
       });
       renderer.setSize(window.innerWidth, window.innerHeight);
       renderer.setPixelRatio(window.devicePixelRatio);
       document.body.append(renderer.domElement);
       const scene = new THREE.Scene()

       let camera = new THREE.PerspectiveCamera(
         45,
         window.innerWidth / window.innerHeight,
         0.1,
         10000
       );
       camera.position.z = 50;


       let composer = new EffectComposer(renderer);
          let  clock = new THREE.Clock();
          function   addPlane(){
               let geometry = new THREE.PlaneBufferGeometry(5,5,1,1);
               let material = new THREE.MeshNormalMaterial();
               let mesh = new THREE.Mesh(geometry, material);


               scene.add(mesh);
           }
           addPlane()

          const renderPass = new RenderPass(scene, camera);

        composer.addPass(renderPass)

function render(){

      composer.render(clock.getDelta())
    }


class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.tick = this.tick.bind(this);



  }


  componentDidMount(){
    this.tick()

    window.addEventListener('mousemove', this.onMouseMove.bind(this));



  }

  componentDidUpdate(prevProps){
    this.initComposer()


  }

  tick(){
          waterTexture.update()
          requestAnimationFrame(this.tick);
          render()
      }

      onMouseMove(ev){
              const point = {
      			x: ev.clientX/ window.innerWidth,
      			y: ev.clientY/ window.innerHeight,
              }
              waterTexture.addPoint(point);
      	}
        initComposer(){
          const renderPass = new RenderPass(this.scene, this.camera);
  this.waterEffect = new WaterEffect(  this.touchTexture.texture);

  const waterPass = new EffectPass(this.camera, this.waterEffect);

  renderPass.renderToScreen = false;
  waterPass.renderToScreen = true;
  this.composer.addPass(renderPass);
  this.composer.addPass(waterPass);
            }


  render() {

    console.log(this.state)

    return (
      <div className='main'>

        <div className='head'>
        hiya
        </div>




      </div>



    )
  }
}
export default Main
