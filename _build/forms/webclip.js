// node webclip.js <toolDir>  -> <toolDir>/web.mp4 (1280x720, 8s, VI, no audio)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');const {chromium}=require('playwright');
(async()=>{const dir=path.resolve(process.argv[2]);const tmp=fs.mkdtempSync(require('os').tmpdir()+'/wc-');
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720},recordVideo:{dir:tmp,size:{width:1280,height:720}}});
await ctx.addInitScript(()=>{try{localStorage.setItem('kl_lang','vi')}catch(e){}});
const pg=await ctx.newPage();await pg.goto('file://'+dir+'/index.html');await pg.waitForTimeout(1200);
const H=await pg.evaluate(()=>document.body.scrollHeight-innerHeight);const steps=60;
for(let i=1;i<=steps;i++){await pg.evaluate(y=>scrollTo(0,y),Math.min(H,1800)*i/steps);await pg.waitForTimeout(110);}
await pg.waitForTimeout(800);await ctx.close();await b.close();
const webm=fs.readdirSync(tmp).find(f=>f.endsWith('.webm'));
execFileSync('ffmpeg',['-y','-loglevel','error','-ss','0.8','-i',path.join(tmp,webm),'-t','8','-an','-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','26','-movflags','+faststart',path.join(dir,'web.mp4')]);
fs.rmSync(tmp,{recursive:true,force:true});console.log('ok',dir+'/web.mp4');})().catch(e=>{console.error(e);process.exit(1)});
