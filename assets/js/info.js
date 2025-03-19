function getVideoUrl(bvid,cid)
{
    // result : bvid , cid
    const videoType=[
        {type:"240P 极速",qn:6},
        {type:"360P 流畅",qn:16},
        {type:"480P 清晰",qn:32},
        {type:"720P 高清",qn:64},
        {type:"720P60 高帧率",qn:74},
        {type:"1080P 高清",qn:80},
    ];
    console.log(bvid,cid);
    return new Promise(async (res,rej)=>{
        let videoLinks=[];
        for(let it of videoType)
        {
            let tar=await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=${it.qn}&fnval=1&platform=web`,config);
            tar=JSON.parse(await tar.text());
            if(tar.data.quality!==it.qn) continue;
            // console.log(it,tar);
            let finurl=tar.data.durl.at(0).backup_url;
            finurl.push(tar.data.durl.at(0).url);
            videoLinks.push({type:it.type,link:finurl});
        }
        res(videoLinks);
    });
}

function loadVideoInfo(result)
{
    // result : { title,url,bvid,avid }
    let self=document.getElementById("videoInfoDiv");
    self.innerHTML="正在加载中……";
    console.log(result);
    const createInfo=(data)=>{
        // [title,imageSrc,owner,videoLink]
        let template1=`
            <p style="display: inline-block;">Title : </p>
            <h5 style="display: inline-block;">${data[0]}</h5>
            <p>Uploader : ${data[2]}</p>
            <p>Image : </p>
            <img src="${data[1]+"@672w_378h_1c_!web-search-common-cover"}">
            <p>Links : </p>
            <table class="table">
                <thead class="thead">
                <tr>
                    <th scope="col" class="col-2">  Type        </th>
                    <th scope="col" class="col-5">  Link        </th>
                    <th scope="col" class="col-5">  Download    </th>
                </tr>
                </thead>
                <tbody>
                    $3
                    <tr>
                        <th scope="row"> Image </th>
                        <td type="copyLink" val="${data[1]}" suf="jpg" name="${data[0]}"> Copy Link </td>
                        <td type="downloadLink" val="${data[1]}" suf="jpg" name="${data[0]}"> Download </td>
                    </tr>
                </tbody>
            </table>`;
        let template2=`
            <tr>
                <th scope="row">$3.type</th>
                <td type="copyLink" val="$3.link" suf="mp4" name="${data[0]} - $3.type"> Copy Link </td>
                <td type="downloadLink" val="$3.link" suf="mp4" name="${data[0]} - $3.type"> Download </td>
            </tr>`;
        let $3="";
        for(let it of data[3]) $3+=template2.replaceAll("$3.type",it.type).replaceAll("$3.link",it.link.join(' '));
        return template1.replace("$3",$3);
    };
    fetch(`https://api.bilibili.com/x/web-interface/wbi/view?${result.bvid? "bvid="+result.bvid:"avid="+result.avid}`,config).then(async (resp)=>{
        let res=JSON.parse(await resp.text());
        let title=res.data.title,pic=res.data.pic,bvid=res.data.bvid,owner=res.data.owner.name,cid=res.data.cid;
        // console.log(title,pic,bvid,owner,res);
        let target=await getVideoUrl(bvid,cid);
        self.innerHTML=createInfo([title,pic,owner,target]);
        console.log(target);
    });
    return;
}

(()=>{
    document.addEventListener("click",(ev)=>{
        let self=ev.target;
        if(self.nodeName!=="TD") return;
        if(!self.getAttribute("type")) return;
        let type=self.getAttribute("type");
        if(type!=="copyLink"&&type!=="downloadLink") return;
        let name=self.getAttribute("name"),suf=self.getAttribute("suf");
        let content=self.getAttribute("val");
        if(type==="copyLink")
        {
            let text=document.createElement("textarea");
            document.body.appendChild(text);
            text.value=content; text.select();
            document.execCommand('copy');
            document.body.removeChild(text);
        }
        else
        {
            console.log(self,content,name);
            if(!window.confirm("\nAre you sure to download video "+name+" ?")) return;
            changePage('download'); downloadFile(content.split(' '),name,suf);
        }
    });
})();