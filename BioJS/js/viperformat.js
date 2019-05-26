function Check2Step(name) 
{
    if (name == "PTM") 
    {
        if (document.getElementById(name).checked == true) 
        {
            changeOtherStyle("step2num");
        }
    }
    if (name == "Range") 
    {
        var From = document.getElementById("From").value;
        var To = document.getElementById("To").value;
        if (From.length > 0 && To.length > 0) 
        {
            changeOtherStyle("step2num");
            document.getElementById("PTM").checked = false;
            document.getElementById("Range").checked = true;
        } 
        else 
        {
            recoverStyle("step2num", "2.");
        }
    }
}

function recoverStyle(name, value) 
{
    document.getElementById(name).innerHTML = value;
    document.getElementById(name).style = "color:#DB3030";
}

function CheckRadio(name) 
{
    Check2Step(name);
}
  
function change3rdStyle(name) 
{
    if (document.getElementById("Terms-Of-Use-Agreement").checked == false) 
    {
        recoverStyle("step3num", "3.");
    } 
    else 
    {
        document.getElementById(name).innerHTML = "&#10004";
        document.getElementById(name).style = "color:#20B2AA";
    }
}
 
function changeOtherStyle(name) 
{
    document.getElementById(name).innerHTML = "&#10004";
    document.getElementById(name).style = "color:#20B2AA";
}