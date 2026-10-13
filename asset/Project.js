/* ================================================ [ COMMON ] ================================================ */

import { DataTemp } from "./JS-Files/GetJSON.js";
const Data = await DataTemp;
let DataList = Data.List;

function ProjectCategorieSelector(Event,List,Func,mode=false) {    
    for (const Element of Event.target.parentElement.children)
    {
        if (List.includes(Element.name) && Element.classList.value.includes("active") && (List.length == 1 || Element.name !== Event.target.name))
        {  
            Element.classList.remove("active"); 
            if (mode) { Func(Event) }
        }
        else if (List.includes(Element.name) && Event.target.name == Element.name) 
        { 
            Element.classList.add("active"); 
            Func(Event);
        }
    }
}

/* ================================================ [ SECTIONS ] ================================================ */

function SectionIni()
{
    const PARENTELEMENT = document.querySelector("section");
    for (const Element of DataList)
    {
        PARENTELEMENT.innerHTML += "<div class='Pro-View-Name' data-name='"+Element+"' data-categorie='"+Data[Element].PrimalCategorie+"' style='order : "+DataList.indexOf(Element)+";'><h3>"+Data[Element].Name+"</h3><p>"+Data[Element].PrimalCategorie+"</p></div>";
    }
    document.querySelector("section > div:nth-of-type(1)").classList.toggle("active");
    document.querySelector("section > div:nth-last-of-type(1)").classList.add("last");
    document.querySelectorAll(".Pro-View-Name").forEach(btn => btn.addEventListener("mouseover",SectionSelect));
}
SectionIni();

/* ------------------------------------------------ ( SELECT SECTIONS ) ------------------------------------------------ */

function SectionSelect(Event) 
{
    const PARENTELEMENT = Event.currentTarget.parentElement.children;
    for (const ELEMENT of PARENTELEMENT)
    {
        if (ELEMENT.classList.contains("active") && ELEMENT.dataset.name !== Event.currentTarget.dataset.name)
        { ELEMENT.classList.remove("active"); }
        else if (!ELEMENT.classList.contains("active") && Event.currentTarget.dataset.name == ELEMENT.dataset.name) 
        { 
            ELEMENT.classList.add("active");
            DisplayManager(ELEMENT);
        }
    }
}

/* ------------------------------------------------ ( SORT SECTIONS ) ------------------------------------------------ */

function SectionSort(Event)
{   
    const PARENTELEMENT = document.querySelectorAll(".Pro-View-Name");
    const SORTEDDATA = Event.target.classList.contains("active") ? [...DataList].sort((a, b) => a.localeCompare(b)) : DataList;

    for (let i = 0 ; i < PARENTELEMENT.length ; i++)
    {
        PARENTELEMENT[i].style.order = SORTEDDATA.indexOf(PARENTELEMENT[i].dataset.name);
        if (PARENTELEMENT[i].classList.contains("active")) { PARENTELEMENT[i].classList.remove("active"); }
    }

    const FIRSTELEMENT = document.querySelector('section > div[data-name="'+SORTEDDATA[0]+'"]');
    
    FIRSTELEMENT.classList.add("active");
    DisplayManager(FIRSTELEMENT); // Rajouter faites que sa selectionne le premiere element + Display1Selector + active
}
document.getElementById("Project-Finder-ToolBox-Order").addEventListener("click",(E) => 
    { ProjectCategorieSelector(E,["Order"],(E) => 
        { SectionSort(E); },true);
    });

/* ================================================ [ SELECTOR SECTION ] ================================================ */

function SectionSelectorIni()
{
    const PARENTELEMENT = document.getElementById("Project-Finder-Group");
    const LIST = ["All"];

    for (const Element of DataList)
    {
        if (!LIST.includes(Data[Element].PrimalCategorie))
        {
            PARENTELEMENT.innerHTML += '<button class="Btn_2 Project-Finder-Group-Btn" name="'+Data[Element].PrimalCategorie+'">'+Data[Element].PrimalCategorie+'</button>';
            LIST.push(Data[Element].PrimalCategorie);
        }
    }
    document.querySelectorAll(".Project-Finder-Group-Btn").forEach(btn => 
        btn.addEventListener("click",(E) => 
            { ProjectCategorieSelector(E,LIST,SetSelectorSection); }
    ));
    document.getElementsByClassName("Project-Finder-Group-Btn")[0].classList.toggle("active");
}
SectionSelectorIni();

/* ------------------------------------------------ ( SET SELECTOR SECTION ) ------------------------------------------------ */

function SetSelectorSection(Event) {

    const CATEGORIE = Event.target.name;
    const PARENTELEMENT = document.querySelectorAll(".Pro-View-Name")
    let LastElement = PARENTELEMENT[0];

    for (const ELEMENT of PARENTELEMENT)
    {      
        if (((CATEGORIE == "All" || CATEGORIE ==  ELEMENT.dataset.categorie) && ELEMENT.classList.contains("hidden")) || 
            ((CATEGORIE !== "All" && CATEGORIE !==  ELEMENT.dataset.categorie) && !ELEMENT.classList.contains("hidden")))
        { ELEMENT.classList.toggle("hidden"); }
        if (ELEMENT.classList.contains("active")) { ELEMENT.classList.remove("active"); }
        if (ELEMENT.classList.contains("last")) { ELEMENT.classList.remove("last"); }
        if (!ELEMENT.classList.contains("hidden")) { LastElement = ELEMENT; }
    }
    document.querySelector(".Pro-View-Name:not(.hidden)").classList.add("active");
    DisplayManager(document.querySelector(".Pro-View-Name:not(.hidden)"));
    LastElement.classList.add("last");
}

/* ================================================ [ DISPLAY ] ================================================ */

import { loop } from "./JS-Files/3DOject.js";
loop();

function DisplayManager(Element)
{
    const DISPLAY = document.querySelector("canvas");
    const CONTENT = document.querySelector(".Project-Text").childNodes;

    if (Data[Element.dataset.name].Display == "Full") {
        if (DISPLAY.dataset.s == "None")
        { DISPLAY.style.display = ""; }
        DISPLAY.dataset.s = Element.dataset.name;
    } else if (DISPLAY.dataset.s !== "None")
    {
        DISPLAY.style.display = "none";
        DISPLAY.dataset.s = "None"
    }

    CONTENT[1].innerText = Data[Element.dataset.name].PrimalCategorie;
    CONTENT[3].innerText = Data[Element.dataset.name].Name;
    CONTENT[5].innerText = Data[Element.dataset.name].Description;
    CONTENT[7].innerHTML = '';
    for (const El of Data[Element.dataset.name].Tag)
    { CONTENT[7].innerHTML += "<span>"+El+"</span>"; }
}
DisplayManager(document.querySelector(".Pro-View-Name"));



// function maFonction() {
//   console.log("L'écran fait au moins 768px !");
// }

// function handleResize(event) {
//   if (event.matches) {
//     maFonction();
//   }
// }

// mediaQuery.addEventListener("change", handleResize);

// // Vérifier aussi la largeur au chargement
// if (mediaQuery.matches) {
//   maFonction();
// }

