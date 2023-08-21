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
$("a").click(function(event) {
  if (
    !$(this).hasClass("linkassiste filter-button") && //se não for o elemento 'play' de vídeo
    this.href.indexOf("mailto:") == -1 && //se não for email
    this.href.indexOf("tel:") == -1 && //se não for telefone
    $(this).attr("role") != "button" && //se nao for o elemento de controle carrossel
    $(this).attr("data-toggle") != "dropdown" && //se não o elemento dropdown
    $(this).attr("data-toggle") != "tab" && //se não o elemento tab
    $(this).attr("data-toggle") != "modal"
  ) {
    // se o link tiver a origem do site ou ficha de incrição
    if (
      origin == "https://www.domain.com" ||
      origin == "https://sub.domain.com"
    ) {
      //se não o elemento que chama o modal
      let target = $(this).attr("target");
      let origin = this.origin;
      let hash = this.hash;
      let pathname = this.pathname;
      let nextPage = origin + pathname;

      let locationHash = window.location.hash;
      let locationOrigin = window.location.origin;
      let locationPathname = window.location.pathname;
      let locationSearch = window.location.search;
      let locationPage = locationOrigin + locationPathname;

      let href;

      if (locationSearch) { //se tem parametros no locationSearch
        href = origin + pathname + hash + locationSearch;
      } else { //parametros no locationHash
        if (this.href.indexOf("#") != -1) { //se href tem #
          href = origin + pathname + locationHash; //locationHash com parametros
        } else { //href sem #
          let parseUrl = locationHash.split("?"); //retirar os parametros do locationHash
          href = origin + pathname + "?" + parseUrl[1];
        }
      }

      if (this.href.indexOf("#") != -1) { //se href tem #
        event.preventDefault(event);
        a
        if (locationPage == nextPage) { //mesma págin
          if (hash) {
            $("html, body").animate(
              {
                scrollTop: $(hash).position().top
              },
              1000,
              "easeInOutExpo"
            );
          }
          
        } else { //pagina diferente
          if (target === "_blank") {
            window.open(href, "_blank");
          } else {
            window.location.href = href;
          }
        }
       
      } else {  //href sem #
        event.preventDefault(event);
        if (target === "_blank") {
          window.open(href, "_blank");
        } else {
          window.location.href = href;
        }
      }
    }
  }
});
