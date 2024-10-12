const root=document.documentElement;
const win=nw.Window.get();

var nowPage=document.getElementById('homepage');

function changePage(it)
{
    // left-hover
    let lst=document.querySelector('.left-hover');
    let cnt=it.getAttribute('cnt');
    let val=parseInt(getComputedStyle(root).getPropertyValue('--left-bar-width'));
    lst.style.top=val*(cnt-1)+'px';
    // page select
    let newpage=document.getElementById(it.getAttribute('to'));
    // console.log(nowPage,newpage);
    if(nowPage!=newpage)
        nowPage.classList.toggle("active"),newpage.classList.toggle("active");
    nowPage=newpage;
    return;
}

(()=>{
    win.setMinimumSize(700, 500);
    let leftItem=[...document.querySelectorAll('.left-item')];
    leftItem.forEach(it=>{
        it.addEventListener('click',(event)=>{changePage(it)});
    });
})()