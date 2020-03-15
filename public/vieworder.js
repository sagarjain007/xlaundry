function checkbodyColor(){
var bodyColor=document.getElementById("status").innerHTML;
if(bodyColor=="Order Confirmed"){
    document.querySelector("body").style.background="#28a745";
    document.querySelector(".btn-success").remove();
}else if(bodyColor=="Order Cancelled"){
    document.querySelector("body").style.background="#dc3545";
    document.querySelector(".btn-danger").remove();
    document.querySelector(".btn-success").remove();
    document.querySelector(".btn-primary").remove();
    document.querySelector("input[type='text']").remove();
}
}

document.querySelector(".btn-success").addEventListener("click",function(){
    document.querySelector("body").style.background="#28a745";
});
document.querySelector(".btn-danger").addEventListener("click",function(){
    document.querySelector("body").style.background="#dc3545";
});
