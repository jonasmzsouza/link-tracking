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
 $("#mainNav .subnavs .nova-aba a").attr('target', '_blank');
 
 
 /**
  * Função que retorna os parametros de url
  * 
  * Autor: Jonas Souza
  * 
  * Descontinuada em: 17/08/2023 
  * (código comentado para não conflitar com a nova alternativa)
  */
//   function obterTraqueamento(parteUrl){
//    let traqueamento = ""
//    if (parteUrl) {
//      traqueamento = "?" + parteUrl;
//    } 
//    return traqueamento;
//  }
 
 /**
  * Evento de click disparado em links que contém a classe para que os 
  * parametros de url que vem de links patrocinados/orgânicos 
  * sejam encaminhados até a formulário de inscrição.
  * 
  * Para página externa (nova aba)
  * Autor: Jonas Souza
  * 
  * Descontinuada em: 17/08/2023 
  * (código comentado para não conflitar com a nova alternativa)
  */
//  $(".tagueamento").click(function (event) {
//    event.preventDefault(event);
//    var url = document.URL;
//    var partesurl = url.split("?");
//    window.location.href = this.href + obterTraqueamento(partesurl[1])
//  });
 
 /**
  * Evento de click disparado em links que contém a classe para que os 
  * parametros de url que vem de links patrocinados/orgânicos 
  * sejam encaminhados até a formulário de inscrição.
  * 
  * Para página interna (mesma aba)
  * Autor: Jonas Souza
  * 
  * Descontinuada em: 17/08/2023 
  * (código comentado para não conflitar com a nova alternativa)
  */
//  $(".tagueamento_final").click(function (event) {
//    event.preventDefault(event);
//    var url = document.URL
//    var partesurl = url.split("?");
//    window.open(this.href + obterTraqueamento(partesurl[1]), '_blank');
//  });
 
 /**
  * Evento de click disparado em todos os links do site para que os 
  * parametros de url que vem de links patrocinados/orgânicos 
  * sejam encaminhados até a formulário de inscrição.
  * 
  * Esta alternativa contempla links gerados em 
  * campos customizados do wordpress.
  * A regra só se aplica a links que contenham a origem (window.location.origin) 
  * do site (https://www.domain.com) ou ficha de incrição (https://sub.domain.com) 
  * Autor: Jonas Souza - 17/08/2023
  */
 $("a").click(function (event) {
  console.log(this.href.indexOf("#"))
  
  if(!$(this).hasClass('linkassiste') //se não for o elemento 'play' de vídeo
      && $(this).attr('role') != 'button' //se nao for o elemento de controle carrossel
      && $(this).attr('data-toggle') != 'dropdown' //se não o elemento dropdown
      && $(this).attr('data-toggle') != 'tab' //se não o elemento tab
      && $(this).attr('data-toggle') != 'modal' //se não o elemento que chama o modal
      && this.href.indexOf("#") == -1) //se o elemento não tiver # no href
  {
    
    let origin = window.location.origin;
    let search = window.location.search;
    
    // se o link tiver a origem do site ou ficha de incrição
    if (origin == "https://www.domain.com" || origin == "https://sub.domain.com") {
      event.preventDefault(event);
      
      let target = $(this).attr('target');
      if(target === '_blank') {
        window.open(this.href + search, '_blank');
      } else {
        window.location.href = this.href + search;
      }
    }
  }
});