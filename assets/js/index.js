const root=document.documentElement;
const win=nw.Window.get();

var nowPage=document.getElementById('homepage');
var bottomBar=document.getElementsByClassName('bottom-bar').item(0);

//   nowPage : page now is activated.
// bottomBar : the bottom bar.

//  type : homepage ; search ; videoInfo ; download ; settings
function changePage(to)
{
    // left-hover
    let lst=document.querySelector('.left-hover');
    let it=document.querySelector(`div[to='${to}']`);
    let cnt=it.getAttribute('cnt');
    let val=parseInt(getComputedStyle(root).getPropertyValue('--left-bar-width'));
    lst.style.top=val*(cnt-1)+'px';
    // page select
    let newpage=document.getElementById(it.getAttribute('to'));
    if(nowPage!=newpage)
    {
        nowPage.classList.toggle("active"),newpage.classList.toggle("active");
        if(to!="download"&&nowTasks) bottomBar.classList.add('active');
        else bottomBar.classList.remove('active');
    }
    nowPage=newpage;
    return;
}

(()=>{
    win.setMinimumSize(800, 600);
    let leftItem=[...document.querySelectorAll('.left-item')];
    leftItem.forEach((it,id)=>{
        it.setAttribute("cnt",id+1);
        it.addEventListener('click',(event)=>{changePage(it.getAttribute('to'))});
    });
})()