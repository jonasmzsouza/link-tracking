/**
 * Atribuição de classe para em links do menu top 
 * para ser possível encaminhar parametros de url
 * ao disparar o evento de click
 * 
 * Autor: Jonas Souza
 */
 $("#topNav .links-topo a").addClass("tagueamento_final");

 /**
  * Atribuição de classe para em links do menu principal do site 
  * para ser possível encaminhar parametros de url
  * ao disparar o evento de click
  * 
  * Autor: Jonas Souza
  */
 $("#mainNav .subnavs a").addClass("tagueamento");
 $("#mainNav .subnavs .nova-aba a").removeClass("tagueamento");
 $("#mainNav .subnavs .nova-aba a").addClass("tagueamento_final");
 
 
 /**
  * Função que retorna os parametros de url
  */
  function obterTraqueamento(parteUrl){
   let traqueamento = ""
   if (parteUrl) {
     traqueamento = "?" + parteUrl;
   } 
   return traqueamento;
 }
 
 /**
  * Evento de click disparado em links que contém a classe para que os 
  * parametros de url que vem de links patrocinados/orgânicos 
  * sejam encaminhados até a formulário de inscrição.
  * 
  * Para página externa (nova aba)
  * Autor: Jonas Souza
  */
 $(".tagueamento").click(function (event) {
   event.preventDefault(event);
   var url = document.URL;
   var partesurl = url.split("?");
   window.location.href = this.href + obterTraqueamento(partesurl[1])
 });
 
 /**
  * Evento de click disparado em links que contém a classe para que os 
  * parametros de url que vem de links patrocinados/orgânicos 
  * sejam encaminhados até a formulário de inscrição.
  * 
  * Para página interna (mesma aba)
  * Autor: Jonas Souza
  */
 $(".tagueamento_final").click(function (event) {
   event.preventDefault(event);
   var url = document.URL
   var partesurl = url.split("?");
   window.open(this.href + obterTraqueamento(partesurl[1]), '_blank');
 });
 
 /**
  * Evento de click disparado em todos os links do site para que os 
  * parametros de url que vem de links patrocinados/orgânicos 
  * sejam encaminhados até a formulário de inscrição.
  * 
  * Esta alternativa contempla links gerados em 
  * campos customizados do wordpress.
  * A regra só se aplica a links que contenham a origem (window.location.origin) 
  * do site (https://www.domain.com) ou ficha de incrição (https://sub.domain.com) 
  * Autor: Jonas Souza
  */
 $("a").click(function (event) {
   event.preventDefault(event);
   let origin = window.location.origin
   let target = $(this).attr('target');
   let url = document.URL
   let partesurl = url.split("?");
 
   //se o elemento clicado não conter as classes: 'dropdown-toggle linkassiste'
   if(!$(this).hasClass('dropdown-toggle linkassiste')) {
     if (origin == "https://www.domain.com" || origin == "https://sub.domain.com") {
       if(target === '_blank') {
         window.open(this.href + obterTraqueamento(partesurl[1]), '_blank');
       } else {
         window.location.href = this.href + obterTraqueamento(partesurl[1])
       }
     }
   }
 });