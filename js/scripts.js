var articles = [];
var articleIndex = 0;
var pagintationValue = 20;

//html tags
var dropdown;
var slider;
var relevancy;
var text;
var table;
var min;

var sugTags;
var specTags;

//adatok betoltese az oldal megnyitasakor
function Initialize()
{
    fetch('data/data.txt').then(response => response.text()).then(data => {    
        //.txt fajl tartalmanak soronkent torteno beolvasasa    
        const allLines = data.split(/\n/);
        allLines.forEach((line) => { articles.push(line); });

        //html referenciak tarolasa
        dropdown = document.getElementById("cikkek");
        slider = document.getElementById("csuszka");
        relevancy = document.getElementById("valoszinuseg");
        text = document.getElementById("szoveg");
        table = document.getElementById("table");
        min = document.getElementById("min");

        //elso cikk megjelenitese
        slider.value = 1000;
        DisplayArticle(0);  
        min.checked = true;
        UpdateMinimum(min.checked);      
    });
}

//cikk megjelenitese
//<param> num: megjelenitendo cikk index szama
function DisplayArticle(num)
{    
    articleIndex = num;
    Paginate();

    var adatok = articles[articleIndex].split("$$$");    
    // adatok[0] -> ajanlott cimkek
    // adatok[1] -> ajanlott specialis cimkek
    // adatok[2] -> eredeti cimkek
    // adatok[3] -> cim
    // adatok[4] -> cikk szovege

    sugTags = adatok[0];
    specTags = adatok[1];

    //eredeti cimkek
    var ec = document.getElementById("ec");
    ec.innerHTML = "";

    //eredeti cimkek (egyeb)
    var ece = document.getElementById("ece");
    ece.innerHTML = "";

    //cikkhez tartozo eredeti cimkek tarolasa es kategorizalasa   
    adatok[2].split(" ").forEach((st) => { 
        if (st.length > 1)
        {
            if (st.includes("__") && ((st.includes("geography") || st.includes("organization") || st.includes("person"))))
            {
                st = st.replace(/@@/g, ' ');
                ece.innerHTML += st + "<br>";
            }
            else if (st.includes("__label__")) 
            {
                st = st.replace("__label__", '');
                st = st.replace(/@@/g, ' ');
                ec.innerHTML += st + "<br>";
            }
        }
    });

    text.innerHTML = adatok[4];
    UpdateRelevancy(slider.value);
}

//legordulo menu bejegyzeseinek frissitese
var page = null;
function Paginate()
{
    var p = Math.floor(articleIndex / pagintationValue);
    if (p != page)
    {   
        page = p;
        dropdown.options.length = 0;

        for (let i = 0; i < pagintationValue; i++) 
        {
            var index = page * pagintationValue + i;
            var entry = document.createElement("option");            
            var dat = articles[index].split("$$$");             
            entry.value = index;
            entry.text = (index + 1) + ". " + dat[3];

            dropdown.add(entry);  
        }
    }
}

//legordulo menupont kivalasztasa eseten a kivalasztott cikk megjelenitese
function DropdownSelection()
{
    var val = dropdown.options[dropdown.selectedIndex].value;   
    DisplayArticle(parseInt(val));
}

//cikk index szamanak leptetese
//<param> num: megjelenitendo cikk index szamanak leptetese ezzel az ertekkel
function PaginationButtonPressed(num)
{
    if (articleIndex == 0 && articleIndex + num < 0) { articleIndex = articles.length - 1; }  
    else if (articleIndex + num <= 0) { articleIndex = 0; }
    else if (articleIndex == articles.length - 1 && articleIndex + num >= articles.length ) { articleIndex = 0; }
    else if (articleIndex + num >= articles.length ) { articleIndex = articles.length - 1; }
    else articleIndex += num;

    DisplayArticle(articleIndex);
    dropdown.value = articleIndex;
}

function UpdateRelevancy(num)
{   
    var rel = parseFloat(num / 1000);
    relevancy.innerHTML = "Valószínűség: ".concat(rel);

    //ajanlott cimkek 
    var t = [];
    var ac = document.getElementById("ac");   
    sugTags.split('__label__').forEach((_t) => { t.push(_t); });
    ac.innerHTML = SplitTags(t, rel);

    //ajanlott cimkek (egyeb)  
    t = [];
    var ace = document.getElementById("ace");
    specTags.split('__label__').forEach((_t) => { if ((_t.includes("geography") || _t.includes("organization") || _t.includes("person"))) t.push(_t); });
    ace.innerHTML = SplitTags(t, rel);
}

var _min3 = false;
function UpdateMinimum(val)
{ 
    _min3 = val;
    UpdateRelevancy(slider.value);
}

function SplitTags(_tags, rel)
{
    var filtered = "";
    i = 0;

    _tags.forEach((st) => 
    {
        var values = st.split(' ');
        values[0] = values[0].replace(/@@/g, ' ');
        values[1] = parseFloat(values[1]).toFixed(3);

        if (!_min3 && rel <= values[1])
        {
            filtered += values[0] + ' (' + values[1] + ')' + "<br>";
        } 
        else if (_min3 && ((rel >= values[1] && i < 3) || rel <= values[1]))
        {
            filtered += values[0] + ' (' + values[1] + ')' + "<br>";
            i++;              
        }    
    });
    return filtered;
}
