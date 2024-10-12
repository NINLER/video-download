// const puppeteer=require('puppeteer');
const {exec}=require('child_process');
const request=require('request');
const path=require('node:path');
const fs=require('node:fs');

const config={
    "headers":{
        "Referer":"https://www.bilibili.com",
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    }
};

var totSize=0,nowSize=0,nowTasks=0,taskTot=0,taskProgress=[0];
var localUrl=".\\video";

function getUrl(url)
{
    return new Promise((res,rej)=>{
        let pid=url.match(/^.*(BV[^\/]+).*$/),title,cid,finurl;
        if(!pid) console.log("Error : No BV id."),rej();
        pid=pid.at(1);
        fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${pid}`,config).then(async (resp)=>{
            let data=await resp.text();
            data=JSON.parse(data);
            console.log(data,data.pages);
            title=data.data.title,cid=data.data.cid;
            fetch(`https://api.bilibili.com/x/player/playurl?bvid=${pid}&cid=${cid}&qn=112`,config).then(async (resp)=>{
                let text=await resp.text();
                text=JSON.parse(text);
                console.log(text.data.durl);
                finurl=text.data.durl.at(0).backup_url;
                finurl.push(text.data.durl.at(0).url);
                res({title:title,url:finurl});
            });
        });
    });
}

function downloadFile(url,filename)
{
    console.log("Download",url,filename);
    let datasize=0;
    const rep=(id)=>{
        if(id>url.length) return;
        // console.log('rep',id,url[id]);
        request.head(url[id],config,(err,resp,body)=>{
            datasize=parseInt(resp.headers['content-length']);
            // console.log(datasize,resp);
            if(!(resp.statusCode>=200&&resp.statusCode<300||resp.statusCode==302))
                return rep(id+1);
            const banned='\\/:*?"<>|',replaced="         ";
            for(let i=0; i<banned.length; i++) filename=filename.replaceAll(banned[i],replaced[i]);
            // filename='a';
            fs.writeFile(path.join(localUrl,`${filename}.mp4`),'',async (error)=>{
                if(error) return console.log('fs write err ',error);
                const str=fs.createWriteStream(path.join(localUrl,`${filename}.mp4`));
                let taskid=await addNewTask(filename,datasize);
                request.get(url[id],config).pipe(str)
                .on('drain',()=>{
                    // console.log(str.bytesWritten,datasize);
                    renderProgress(taskid,str.bytesWritten,datasize);
                })
                .on('finish',()=>{removeTask(taskid,datasize)});
            });
        });
    };
    return rep(0);
}

(()=>{
    document.getElementById('openFolder').addEventListener('click',()=>{
        exec('explorer.exe '+localUrl,(err,stdout,stderr)=>{});
    });
    fs.mkdir(localUrl,{recursive:true},(err)=>{
        if(err) return console.log("mkdir",err);
        // console.log('mkdir',"OK");
        renderProgress();
    });
})()

function downloadVideo(url)
{
    getUrl(url).then((resp)=>{
        console.log(resp);
        downloadFile(resp.url,resp.title);
    },(err)=>{console.log(err)});
};

function test(url)
{
    console.log("test",url);
    let datasize=0;
    request.head(url,config,(err,resp,body)=>{
        datasize=parseInt(resp.headers['content-length']);
        console.log(datasize,resp.statusCode);
    });
    return;
}

/* Html part  */

function renderProgress(taskid=0,chunk=0,totchunk=0)
{
    // console.log("renderProgress",taskid,chunk,totchunk);
    if(taskid)
    {
        let npro=(chunk*100/totchunk).toFixed(2);
        document.getElementById('taskText'+taskid).innerText=`Progress : ${npro}%`;
        document.getElementById('taskBar'+taskid).style.width=`${npro}%`;
        nowSize-=taskProgress[taskid]; nowSize+=chunk;
        taskProgress[taskid]=chunk;
    }
    let progress=(!nowTasks? 0:nowSize*100/totSize).toFixed(2);
    document.getElementById('totalProgressWord').innerText=`Total progress : (${progress}%)`;
    document.getElementById('totalTaskWord').innerText=`Tasks : ${nowTasks}`;
    document.getElementById('totalProgressBar').style.width=`${progress}%`;
    return;
}

function addNewTask(name="",totchunk=0)
{
    return new Promise((res,rej)=>{
        let nid=++taskTot; nowTasks++;
        document.getElementById('downloadTasks').innerHTML+=`
            <div class="download-task">
                <div>${name}</div>
                <div id="taskText${nid}" class="taskText">Progress : 0.00%</div>
                <div class="progress">
                    <div id="taskBar${nid}" class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
                </div>
            </div>`;
        totSize+=totchunk,taskProgress.push(0);
        // document.getElementById('taskText'+nid).addEventListener('click',()=>{
        //     if(!window.confirm("Are you sure to stop downloading video "+name+" ?")) return;
        //     removeTask(document.getElementById('taskText'+nid).parentElement,name,nid);
        // });
        renderProgress(nid,0,totchunk);
        res(nid);
    });
}

function removeTask(nid,totchunk)
{
    console.log('removeTask',nid,totchunk);
    renderProgress(nid,totchunk,totchunk);
    window.setTimeout(()=>{
        let target=document.getElementById('taskText'+nid);
        target=target.parentElement; target.className+=" active";
        window.setTimeout(()=>{target.parentElement.removeChild(target);},2000);
    },200);
    nowTasks--;
    if(!nowTasks)
    {
        totSize=0,nowSize=0;
        window.setTimeout(()=>{
            document.getElementById('totalProgressBar').classList.toggle('active');
            renderProgress();
        },1000);
        window.setTimeout(()=>{document.getElementById('totalProgressBar').classList.toggle('active');},4000);
    }
    return nid;
}