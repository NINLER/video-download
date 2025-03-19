function readFile()
{
    const def={
        "cookie":"",
    };
    return new Promise((res,rej)=>{
        fs.access(path.join(localUrl,'data.json'),(err)=>{
            if(err) return (localData=def,res());
            fs.readFile(path.join(localUrl,'data.json'),(err,data)=>{
                if(err) return (localData=def,res());
                localData=JSON.parse(data.toString()||"{}");
                localData={...def,...localData}; // localData has higher priority.
                res();
            });
        });
    });
}

function writeFile()
{
    return new Promise((res,rej)=>{
        fs.access(path.join(localUrl,'data.json'),(err1)=>{
            if(err1) res();
            fs.writeFile(path.join(localUrl,'data.json'),JSON.stringify(localData),(err)=>{
                res();
            });
        });
    });
}

(async ()=>{
    await readFile();
    // console.log(localData);
    await writeFile();
})()