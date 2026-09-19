"""Render original geometric demo media. Requires Pillow and imageio-ffmpeg."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math, wave, struct, subprocess
import imageio_ffmpeg

ROOT=Path(__file__).parent/'assets'
ROOT.mkdir(exist_ok=True)
W,H=960,540
def frame(t):
    im=Image.new('RGB',(W,H),'#dfe6cb');d=ImageDraw.Draw(im)
    d.ellipse((700,25,830,155),fill='#e9bb70')
    d.ellipse((-160,240,800,950),fill='#baca9b')
    d.ellipse((320,330,1300,920),fill='#a5be88')
    for x,y in [(130,345),(825,375)]:
        d.rectangle((x-5,y-70,x+5,y+70),fill='#788f60');d.ellipse((x-39,y-155,x+39,y-35),fill='#8ba572')
    dx=math.sin(t*math.pi*2)*12
    d.ellipse((290,430,668,485),fill='#92a77b')
    d.ellipse((585,210,740,370),fill='#f7edcf');d.ellipse((614,239,710,338),fill='#aec58f')
    d.polygon([(306+dx,186),(622+dx,186),(588+dx,428),(341+dx,428)],fill='#fff5d9')
    d.ellipse((305+dx,144,623+dx,229),fill='#486847');d.ellipse((325+dx,157,603+dx,216),fill='#b5c890')
    d.rectangle((334+dx,280,594+dx,366),fill='#d98b66')
    try: font=ImageFont.truetype('C:/Windows/Fonts/georgia.ttf',32)
    except OSError: font=ImageFont.load_default()
    d.text((464+dx,322),'A GOOD DAY',font=font,fill='#fff7df',anchor='mm')
    for j in range(3):
        x=390+j*66+dx;shift=math.sin(t*math.pi*2+j)*11
        pts=[(x+math.sin(k/9*math.pi*2+t*math.pi*2+j)*9,130-k*5+shift) for k in range(13)]
        d.line(pts,fill='#7e9b6c',width=6)
    for j in range(5):
        x=90+j*171;y=75+math.sin(t*math.pi*2+j)*20
        if j in (0,4):d.ellipse((x,y,x+8,y+8),fill='#f7ebcc')
    return im

frames=[frame(i/36) for i in range(36)]
frames[0].save(ROOT/'video-poster.png',optimize=True)
gif=[im.resize((640,360),Image.Resampling.LANCZOS) for im in frames]
gif[0].save(ROOT/'tea-loop.gif',save_all=True,append_images=gif[1:],duration=83,loop=0,optimize=True,disposal=2)
sheet=Image.new('RGB',(3200,1080))
for i in range(60):
    im=frame(i/60)
    # A gentle camera push becomes a scrubbable 60-frame sequence.
    inset=int(i/59*95)
    im=im.crop((inset,inset*.5625,W-inset,H-inset*.5625)).resize((320,180),Image.Resampling.LANCZOS)
    sheet.paste(im,((i%10)*320,(i//10)*180))
sheet.save(ROOT/'filmstrip.webp',quality=83,method=6)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
process=subprocess.Popen([ffmpeg,'-y','-f','rawvideo','-vcodec','rawvideo','-s','960x540','-pix_fmt','rgb24','-r','24','-i','-','-an','-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'town-film.mp4')],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
for i in range(216):process.stdin.write(frame(i/72).tobytes())
process.stdin.close();stderr=process.stderr.read();result=process.wait()
if result:raise RuntimeError(stderr.decode(errors='replace'))
rate=22050;duration=4.2
with wave.open(str(ROOT/'chime.wav'),'wb') as wav:
    wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate)
    values=[]
    for i in range(int(rate*duration)):
        t=i/rate;value=0
        for start,freq in [(0,659.25),(.65,783.99),(1.3,987.77),(2.1,783.99)]:
            delta=t-start
            if delta>=0:value+=(math.sin(2*math.pi*freq*delta)+.25*math.sin(2*math.pi*freq*2.4*delta))*math.exp(-delta*2.5)*min(1,delta*70)
        values.append(struct.pack('<h',int(max(-1,min(1,value*.2))*32767)))
    wav.writeframes(b''.join(values))
print([(p.name,p.stat().st_size) for p in ROOT.iterdir() if p.suffix in ('.gif','.mp4','.wav','.webp','.png')])
