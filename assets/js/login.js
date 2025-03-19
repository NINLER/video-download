function loginInit()
{
    document.getElementById('loginPassword').addEventListener('keydown',(ev)=>{
        if(ev.key=="Enter") checkLogin();
    });
}

function checkLogin()
{
    getCaptcha();
    return;
}

function getCaptcha()
{
    fetch("https://passport.bilibili.com/x/passport-login/captcha?source=main_web",config).then(async (resp)=>{
        let data=JSON.parse(await resp.text());
        if(data?.code!==0) return;
        let token=data.data.token,gt=data.data.geetest.gt,challenge=data.data.geetest.challenge;
        document.getElementById("loginHint").className="";
        document.getElementById("loginHint").innerHTML="";
        console.log("gt",gt,"\nchallenge",challenge);
        initGeetest({
            gt:gt,
            challenge:challenge,
            offline:!true,
            new_captcha:true,
            protocol:'https:',
            // api_server:'http://api.geevisit.com'
        },(captchaObj)=>{
            document.getElementById('captchaCheckBox').innerHTML="";
            captchaObj.appendTo(document.getElementById('captchaCheckBox'));
            captchaObj.onSuccess(()=>{
                let result=captchaObj.getValidate();
                let username=document.getElementById('loginUsername').value;
                let password=document.getElementById('loginPassword').value;
                fetch("https://passport.bilibili.com/x/passport-login/web/key",config).then(async (resp)=>{
                    let res=JSON.parse(await resp.text());
                    if(data?.code!==0) return;
                    let encryptor=new jsencrypt();
                    let pubkey=res.data.key,salt=res.data.hash;
                    // pubkey=pubkey.replaceAll(/([^-])\n([^-])/g,'$1$2');
                    // pubkey=pubkey.replaceAll(/\n/g,'');
                    console.log(encryptor,"salt",salt,"pubkey",pubkey);
                    encryptor.setPublicKey(pubkey);
                    let passcode=encryptor.encrypt(salt+password);
                    console.log("Login Passcode",passcode);
                    console.log(`username=${username}&password=${passcode}&keep=0&token=${token}&challenge=${challenge}&validate=${result.geetest_validate}&seccode=${result.geetest_seccode}`);
                    let form=new FormData();
                    fetch("https://passport.bilibili.com/x/passport-login/web/login",{
                        "method":"POST",
                        "headers":{
                            "Referer":"https://www.bilibili.com",
                            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                            "Content-Type":"application/x-www-form-urlencoded",
                            "Origin":"https://www.bilibili.com",
                            'sec-ch-ua':'"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
                            "sec-ch-ua-platform": "Windows",
                            "Connection": "keep-alive",
                        },
                        "body":`username=${encodeURIComponent(username)}&password=${encodeURIComponent(passcode)}&token=${encodeURIComponent(token)}&challenge=${encodeURIComponent(challenge)}&validate=${encodeURIComponent(result.geetest_validate)}&seccode=${encodeURIComponent(result.geetest_seccode)}`
                    }).then(async (resp)=>{
                        let res=JSON.parse(await resp.text());
                        if(res.code!==0)
                        {
                            document.getElementById("loginHint").classList.add('failed');
                            document.getElementById("loginHint").innerHTML="登录失败："+res.message+"。";
                        }
                        else
                        {
                            document.getElementById("loginHint").classList.add('success');
                            document.getElementById("loginHint").innerHTML="登录成功："+res.data.message+"。";
                            console.log(res);
                        }
                    });
                })
            });
        })
    });
    return;
}

/*
POST https://passport.bilibili.com/x/passport-login/web/login HTTP/1.1
Host: passport.bilibili.com
Connection: keep-alive
Content-Length: 451
sec-ch-ua-platform: "Windows"
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36
sec-ch-ua: "Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"
Content-Type: application/x-www-form-urlencoded
sec-ch-ua-mobile: ?0
Accept: * /*
Origin: https://www.bilibili.com
Sec-Fetch-Site: same-site
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: https://www.bilibili.com/
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: zh-CN,zh;q=0.9
Cookie: buvid3=752D334D-EB44-22B7-96B0-3A48FD4EA4A196498infoc; b_nut=1723077996; _uuid=186CEB11-42F8-AA16-3FD5-532D87B7162197781infoc; hit-dyn-v2=1; rpdid=|(u~km)kmR~Y0J'u~kJRkk|uk; buvid4=C39E9189-43E9-8835-C6AC-1124E2838B1D23437-024051113-%2Ba1tL1CR0HKqa%2BNkkdaeRg%3D%3D; buvid_fp_plain=undefined; header_theme_version=CLOSE; enable_web_push=DISABLE; LIVE_BUVID=AUTO5217296721075661; PVID=1; enable_feed_channel=ENABLE; CURRENT_QUALITY=16; share_source_origin=COPY; fingerprint=23808ad15ac8001e412769efb29d6b31; bsource=search_bing; buvid_fp=23808ad15ac8001e412769efb29d6b31; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDI0NDQ2MDQsImlhdCI6MTc0MjE4NTM0NCwicGx0IjotMX0.l_JjBTIrBBkcAfDOYDqqw-sA5oCNYNoKvRB0sNpkc50; bili_ticket_expires=1742444544; CURRENT_FNVAL=2000; b_lsid=910B3EBB3_195A89E1A97; bp_t_offset_401537923=1045619619391340544; home_feed_column=4; browser_resolution=1377-625; sid=8k9kwtdc


HTTP/1.1 200 OK
Date: Tue, 18 Mar 2025 10:34:33 GMT
Content-Type: application/json; charset=utf-8
Connection: keep-alive
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Allow-Origin: https://www.bilibili.com
Bili-Status-Code: 0
Bili-Trace-Id: 7075b29ede67d94c
Set-Cookie: SESSDATA=cc3573e0%2C1757846073%2C5ce4f%2A32CjAqbJEm3JDIL3GhSwN8-fHnAzNxBsVnzmDX9umX0qUj9SXIo8ANSVvNG5j_en2rlZQSVmlCMEVmOVBYYUxwMHc5UDhxOGV6SURheFR1YlVLTmFKdkZCSzUzQXdyRkNhYW9XU016RmZjSHNKQ21YZjQzd090Z1dfdE1tRmc1YlpnNVo2aUc0VUp3IIEC; Path=/; Domain=bilibili.com; Expires=Sun, 14 Sep 2025 10:34:33 GMT; HttpOnly; Secure
Set-Cookie: bili_jct=2df30a3ab61d7cace24fdfc18437c46d; Path=/; Domain=bilibili.com; Expires=Sun, 14 Sep 2025 10:34:33 GMT
Set-Cookie: DedeUserID=401537923; Path=/; Domain=bilibili.com; Expires=Sun, 14 Sep 2025 10:34:33 GMT
Set-Cookie: DedeUserID__ckMd5=b821d4507bd83997; Path=/; Domain=bilibili.com; Expires=Sun, 14 Sep 2025 10:34:33 GMT
Set-Cookie: sid=6mxvjr3l; Path=/; Domain=bilibili.com; Expires=Sun, 14 Sep 2025 10:34:33 GMT
Vary: Origin
X-Bili-Trace-Id: 1a106edf779661e37075b29ede67d94c
Access-Control-Allow-Headers: origin,no-cache,x-requested-with,if-modified-since,pragma,last-modified,cache-control,expires,content-type,access-control-allow-credentials,dnt,x-customheader,keep-alive,user-agent,x-cache-webcdn,x-bilibili-key-real-ip,x-backend-bili-real-ip,x-risk-header,x-event-traceid
Cross-Origin-Resource-Policy: cross-origin
Access-Control-Expose-Headers: x-bili-gaia-vvoucher,x-bili-trace-id,x-bili-gaia-param
Expires: Tue, 18 Mar 2025 10:34:32 GMT
Cache-Control: no-cache
X-Cache-Webcdn: BYPASS from blzone01
Content-Length: 666

*/

loginInit();