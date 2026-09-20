/* Render the shared panorama into viewport-sized buffers. No oversized CSS mask
   or off-screen background layer needs to survive a mobile WebKit scroll. */
class PanoramaRenderer {
  constructor(canvas, images, invalidate) {
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d',{alpha:false});
    this.buffer=document.createElement('canvas');
    this.layer=this.buffer.getContext('2d');
    this.images=images;
    for(const image of images){
      const ready=()=>{image.dataset.state=image.naturalWidth?'loaded':'error';invalidate();};
      image.addEventListener('load',ready);
      image.addEventListener('error',ready);
      if(image.complete)ready();
    }
  }
  resize(width,height,rotated){
    this.width=width;this.height=height;this.rotated=rotated;
    this.w=rotated?height:width;this.h=rotated?width:height;
    this.dpr=Math.min(devicePixelRatio||1,2);
    this.canvas.width=Math.round(width*this.dpr);
    this.canvas.height=Math.round(height*this.dpr);
    this.buffer.width=Math.round(this.w*this.dpr);
    this.buffer.height=Math.round(this.h*this.dpr);
  }
  render(offset){
    if(!this.w)return;
    const {ctx,layer,w,h,dpr,buffer}=this;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#061522';ctx.fillRect(0,0,this.width,this.height);
    if(this.rotated){ctx.translate(this.width,0);ctx.rotate(Math.PI/2);}
    // All coordinates belong to one continuous seven-width artwork.
    const scenes=[
      {x:-.14,width:1.26,fadeIn:0,fadeOut:.75},
      {x:.84,width:1.47,fadeIn:.14,fadeOut:.78},
      {x:1.75,width:1.68,fadeIn:.14,fadeOut:.78},
      {x:2.87,width:2.10,fadeIn:.14,fadeOut:.78}
    ];
    scenes.forEach((scene,index)=>{
      const image=this.images[index];
      if(!image.complete||!image.naturalWidth)return;
      const left=scene.x*w-offset,tileWidth=scene.width*w;
      if(left>=w||left+tileWidth<=0)return;
      layer.setTransform(1,0,0,1,0,0);layer.clearRect(0,0,buffer.width,buffer.height);
      layer.setTransform(dpr,0,0,dpr,0,0);layer.globalCompositeOperation='source-over';
      const scale=Math.max(tileWidth/image.naturalWidth,h/image.naturalHeight);
      const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
      layer.save();layer.beginPath();layer.rect(left,0,tileWidth,h);layer.clip();
      layer.drawImage(image,left+(tileWidth-dw)/2,(h-dh)/2,dw,dh);layer.restore();
      const fade=layer.createLinearGradient(left,0,left+tileWidth,0);
      fade.addColorStop(0,scene.fadeIn?'rgba(0,0,0,0)':'#000');
      if(scene.fadeIn)fade.addColorStop(scene.fadeIn,'#000');
      fade.addColorStop(scene.fadeOut,'#000');fade.addColorStop(1,'rgba(0,0,0,0)');
      layer.globalCompositeOperation='destination-in';layer.fillStyle=fade;layer.fillRect(0,0,w,h);
      layer.globalCompositeOperation='source-over';ctx.drawImage(buffer,0,0,w,h);
    });
    const tailStart=4.13*w-offset,tailEnd=7*w-offset;
    if(tailStart<w){
      const tail=ctx.createLinearGradient(tailStart,0,tailEnd,0);
      tail.addColorStop(0,'rgba(6,27,44,0)');tail.addColorStop(.30,'#061b2c');tail.addColorStop(1,'#071421');
      ctx.fillStyle=tail;ctx.fillRect(Math.max(0,tailStart),0,w,h);
    }
    const shade=ctx.createLinearGradient(0,0,0,h);
    shade.addColorStop(0,'rgba(3,16,26,.14)');shade.addColorStop(.24,'rgba(3,16,26,0)');
    shade.addColorStop(.65,'rgba(3,16,26,.12)');shade.addColorStop(1,'rgba(3,16,26,.62)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  }
}
