const rootStyles = getComputedStyle(document.documentElement);
const MainColor = rootStyles.getPropertyValue('--main-color');
const SelectedSecondColor = rootStyles.getPropertyValue('--selected-second-color');

function HeaderSelected() 
{
    let HeaderLinkTag = document.getElementsByClassName("Header-Link");
    let CurrentPath = window.location.pathname;

    if (CurrentPath === "/") 
    { CurrentPath = "/index.html"; }

    for (let i = 0; i < HeaderLinkTag.length; i++) {
        const LINKPATH = new URL(HeaderLinkTag[i].href).pathname;
        if (LINKPATH == CurrentPath) 
        { HeaderLinkTag[i].style.textDecorationLine = 'underline'; }
    }
}
HeaderSelected();