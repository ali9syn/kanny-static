!function(){document.addEventListener("DOMContentLoaded",function(){var a=document.querySelector(".page-template-template-homepage .type-page.has-post-thumbnail");if(a){for(var b=0;b<a.querySelectorAll(".entry-title, .entry-content").length;b++)a.querySelectorAll(".entry-title, .entry-content")[b].classList.add("loaded");var c=document.querySelector(".site-main"),d=document.documentElement.getAttribute("dir"),e=function(){e._tick&&cancelAnimationFrame(e._tick),e._tick=requestAnimationFrame(function(){e._tick=null,a.style.width=window.innerWidth+"px","rtl"!==d?a.style.marginLeft=-c.getBoundingClientRect().left+"px":a.style.marginRight=-c.getBoundingClientRect().left+"px"})};window.addEventListener("resize",e),e()}})}();