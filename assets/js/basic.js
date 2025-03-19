const {exec}=require('child_process');
const jsencrypt=require('jsencrypt');
const request=require('request');
const cheerio=require('cheerio');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');

const localUrl=`C:\\Users\\${os.userInfo().username}\\Documents\\videoDownload`;

var localData={};

// localData : localStroage data.

const config={
    "headers":{
        "Referer":"https://www.bilibili.com",
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    }
};

// fetch.js
var totSize=0,nowSize=0,nowTasks=0,taskTot=0,taskProgress=[0];

//     localUrl : video url
//      totSize : file total size
//      nowSize : downloaded total size
//     nowTasks : the number of tasks
//      taskTot : task id counter
// taskProgress : the progress of each task

// search.js
let source=[],sourceUrl=[],duration=[],author=[],searching=false,loaded=new Set();

//    source : [img,title]
// sourceUrl : [videoUrl]
//  duration : [videoLength]
//    author : [author]
// searching : is searching
//    loaded : remove duplicated videos.