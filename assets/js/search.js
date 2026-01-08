function renderResult(pid,clear)
{
    let target=document.getElementById('searchResult');
    if(clear) target.innerHTML="",loaded=new Set();
    else target.innerHTML=target.innerHTML.split('<div id="moreContents"').at(0);
    for(let i=0; i<source.length; i++)
    {
        const img=source[i][0];
        const title=source[i][1];
        const time=duration[i];
        const url=sourceUrl[i];
        const maker=author[i];
        if(loaded.has(title)) continue; loaded.add(title);
        const resource=`
            <div class="result-blank" to="${url}" title="${title}">
                <img src="https:${img}">
                <p>${title}</p>
                <div>Click to download!</div>
                <span>Time : ${time}</span>
                <span>Author : ${maker}</span>
            </div>`;
        target.innerHTML+=resource;
    }
    if(!source.length) target.innerHTML="<br>No video.";
    else target.innerHTML+=`<div id="moreContents" to="${pid+1}"><br><div>Loading ...</div><br><div>`;
    let blanks=document.querySelectorAll('.result-blank');
    for(let it of blanks)
        it.addEventListener('click',async ()=>{
            // if(!window.confirm("\nAre you sure to download video "+it.getAttribute('title')+" ?")) return;
            let res=await checkVideo(it.getAttribute('to'));
            loadVideoInfo(res); changePage('videoInfo');
        });
    searching=false;
    return;
}

function searchContent(content,page=1,clear=true)
{
    if(searching) return; searching=true;
    let xhr=new XMLHttpRequest();
    // console.log(content,page,clear)
    xhr.open("GET",`https://search.bilibili.com/all?keyword=${encodeURIComponent(content)}&search_source=1${(page==1? "":`&page=${page}&o=30`)}`);
    xhr.send();
    xhr.onreadystatechange=()=>{
        if(!(xhr.readyState==4&&(xhr.status>=200&&xhr.status<300||xhr.status==302))) return;
        // console.log(xhr.response);
        try {
            console.log("Search",content,page,clear);
            let data=xhr.response??"";
            let stPos=data.indexOf("window.__pinia");
            let edPos=data.indexOf("</script>",stPos);
            // console.log(stPos,edPos,data.slice(stPos,edPos));
            if(stPos==-1||edPos==-1) throw Error(`Can't find video info JSON. stPos=${stPos}, edPos=${edPos}`);
            let jsonResp=eval(data.slice(stPos,edPos));
            let videoList=
                jsonResp?.searchTypeResponse?.searchTypeResponse?.result??
                jsonResp?.searchResponse?.searchAllResponse?.result?.at(-1)?.data??
                []
            for(let video of videoList)
            {
                if(video.type!=="video") continue;
                let auth=video.author,img=video.pic,dur=video.duration,link=`//www.bilibili.com/video/${video.bvid}/`;
                let name=video.title.replaceAll("<em class=\"keyword\">","").replaceAll("<\/em>","")
                // console.log(name,img,dur,auth,link);
                source.push([img,name]); sourceUrl.push(link); duration.push(dur); author.push(auth);
            }
            renderResult(page,clear);
        } catch(err) {
            console.log(err);
            document.getElementById('searchResult').innerHTML="<br>No video.";
            searching=false;
        }
    };
    return;
}

function checkVideo(url="")
{
    return new Promise((res,rej)=>{
        if(url.match(/^BV([0-9a-zA-Z]*)$/)||url.match(/^av([0-9]*)$/))
        {
            console.log(url);
            url="https://www.bilibili.com/video/"+url+'/';
            fetch(url).then(async (resp)=>{
                let body=await resp.text();
                let title=body.match(/<title data-vue-meta="true">([^<]*)<\/title>/).at(1);
                console.log(title,resp); console.log(body);
                let bvid=(url.match(/^(BV[0-9a-zA-Z]*)$/)||["",""]).at(1);
                let avid=(url.match(/^(av[0-9]*)$/)||["",""]).at(1);
                return res({status:true,title:title,url:url,bvid,avid});
            });
        }
        else if(url.match(/^(?:https:|)(?:\/\/|)(?:www\.|)bilibili\.com\/video\/(.*)$/))
        {
            if(url.indexOf('?')!=-1) url=url.substring(0,url.indexOf('?'));
            if(url.indexOf('www.')==-1) url="www."+url;
            if(url.indexOf('//')==-1) url="//"+url;
            if(url.indexOf('https:')==-1) url="https:"+url;
            fetch(url).then(async (resp)=>{
                let body=await resp.text();
                // console.log(body);
                let title=body.match(/"pic":"[^"]+","title":"([^"]+)"/).at(1);
                let bvid=(url.match(/(BV[0-9a-zA-Z]*)/)||["",""]).at(1);
                let avid=(url.match(/(av[0-9]*)/)||["",""]).at(1);
                return res({status:true,title:title,url:url,bvid,avid});
            });
        }
        else return res({status:false});
    });
}

(()=>{
    document.getElementById('searchBar').addEventListener('keypress',async (event)=>{
        let tar=event.key;
        if(tar=="Enter")
        {
            let result=await checkVideo(document.getElementById('searchBar').value);
            // console.log(result);
            if(result.status)
            {
                // if(!window.confirm("\nAre you sure to download video "+result.title+" ?")) return;
                // changePage('download'); downloadVideo(result.url);
                loadVideoInfo(result); changePage('videoInfo');
            }
            else
            {
                document.getElementById('searchResult').innerHTML="<br>Fetching ...";
                searchContent(document.getElementById('searchBar').value,1);
            }
        }
    });
    document.getElementById('searchResult').addEventListener('scroll',(event)=>{
        let self=document.getElementById('searchResult');
        let offset=self.scrollHeight-(self.scrollTop+self.clientHeight);
        if(offset<=50)
        {
            let nxt=document.getElementById('moreContents');
            if(!nxt) return;
            let pid=parseInt(nxt.getAttribute('to'));
            searchContent(document.getElementById('searchBar').value,pid,false);
        }
    });
})()