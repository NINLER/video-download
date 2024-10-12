let source,sourceUrl,duration,author,searching=false,loaded=new Set();
// source [img,img,title]

function renderResult(pid,clear)
{
    let target=document.getElementById('searchResult');
    if(clear) target.innerHTML="",loaded=new Set();
    else target.innerHTML=target.innerHTML.split('<div id="moreContents"').at(0);
    for(let i=0; i<source.length; i++)
    {
        const img=source[i][1];
        const title=source[i][2];
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
        it.addEventListener('click',()=>{
            downloadVideo(it.getAttribute('to'));
            if(!window.confirm("\nAre you sure to download video "+it.getAttribute('title')+" ?")) return;
            changePage(document.getElementById('toDownload'));
        });
    searching=false;
    return;
}

function searchContent(content,page=1,clear=true)
{
    if(searching) return; searching=true;
    let xhr=new XMLHttpRequest();
    // console.log(content,page,clear)
    xhr.open("GET",`https://search.bilibili.com/all?keyword=${content}&search_source=1${(page==1? "":`&page=${page}&o=30)`)}`);
    xhr.send();
    xhr.onreadystatechange=()=>{
        if(!(xhr.readyState==4&&(xhr.status>=200&&xhr.status<300||xhr.status==302))) return;
        // console.log(xhr.response);
        try {
            let data=xhr.response;
            source=data.match(/<source srcset="([^"]+)" type="image\/webp"><img src="([^"]+)" alt="([^"]+)" loading="lazy" onload onerror="typeof window\.imgOnError === &#39;function&#39; &amp;&amp; window\.imgOnError\(this\)">/gm);
            source=source.map(it=>it.match(/<source srcset="([^"]+)" type="image\/webp"><img src="([^"]+)" alt="([^"]+)" loading="lazy" onload onerror="typeof window\.imgOnError === &#39;function&#39; &amp;&amp; window\.imgOnError\(this\)">/).slice(1,4));
            sourceUrl=data.match(/<a href="([^"]+)" class="" target="_blank" data-v-4caf9c8c>/gm);
            sourceUrl=sourceUrl.map(it=>it.match(/<a href="([^"]+)" class="" target="_blank" data-v-4caf9c8c>/).at(1));
            duration=data.match(/class="bili-video-card__stats__duration" data-v-4caf9c8c>([0-9:]+)<\/span><!--]-->/gm);
            duration=duration.map(it=>it.match(/class="bili-video-card__stats__duration" data-v-4caf9c8c>([0-9:]+)<\/span><!--]-->/).at(1));
            author=data.match(/<span class="bili-video-card__info--author" data-v-4caf9c8c>([^<]+)<\/span>/gm);
            author=author.map(it=>it.match(/<span class="bili-video-card__info--author" data-v-4caf9c8c>([^<]+)<\/span>/).at(1));
            // console.log(source,sourceUrl);
            renderResult(page,clear);
        } catch(err) {
            document.getElementById('searchResult').innerHTML="<br>No video.";
            searching=false;
        }
    };
    return;
}

(()=>{
    document.getElementById('searchBar').addEventListener('keypress',(event)=>{
        let tar=event.key;
        if(tar=="Enter")
        {
            document.getElementById('searchResult').innerHTML="<br>Fetching ...";
            searchContent(document.getElementById('searchBar').value,1);
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