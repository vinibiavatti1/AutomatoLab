/**
 * Listas
 */
var automatosBidimensionais = [
    {
        id: 1,
        nome: "Game of Life",
        cor: "rgb(0,230,0)",
        regra: {
            nome: "B3/S23",
            begin: [3],
            step: [2,3]
        }
    },
    {
        id: 2,
        nome: "High Life",
        cor: "rgb(230,0,0)",
        regra: {
            nome: "B36/S23",
            begin: [3, 6],
            step: [2,3]
        }
    }
]
var ferramentas = {
    pincel: 0,
    borracha: 1,
    fio: 2,
    energia: 3
}
var temas = {
    dia: 0,
    noite: 1
}
var tipoSimulacao = {
    unidimensional: 0, 
    bidimensional: 1,
    wireworld: 2
}
var wireworld = {
    vazio: 2,
    fio: 3,
    cabeca: 4,
    calda: 5
}

/**
 * Variáveis
 */
var mapa = [[]];
var mapaInicial = mapa;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tamanhoCursor = 1;
var tamanhoMaxCursor = 5;
var ferramenta = ferramentas.pincel;
var tamanhoBloco = 10;
var qtdQuadros = 15;
var qtdBlocos = qtdQuadros * 5;
var tamanho = tamanhoBloco * qtdBlocos;
var maxZoom = 20;
var valorGradeDivisor = 5;
var mostrarGrade = true;
var velocidadeSimulacao = 10;
var idRegraUnidimensional = 30;
var regraUnidimensional = obterRegraUnidimensional(idRegraUnidimensional);
var interval = null;
var pausado = true;
var tipo = tipoSimulacao.bidimensional;
var tipoSelecionado = tipo;
var automato = automatosBidimensionais[0];

/**
 * Cores
 */
var corFundo = "white";
var corGrade = "rgba(0,0,0,0.1)";
var corGradeDivisor = "rgba(0,0,0,0.2)";
var corCelula = "rgb(0,200,0)";
var corCursor = "rgba(0,0,0,0.8)";
var corFio = "rgb(255,215,0)";
var corCabeca = "rgb(0,128,255)";
var corCalda = "rgb(255,64,0)";

/**
 * Construtor
 */
$(document).ready(function() {
    ctx.translate(0.5, 0.5);
    ctx.scale(1, 1);
    $(".indicador-velocidade").html(velocidadeSimulacao);
    $("#tamanho-cursor").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
    $("#tamanho-cursor-2").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
    $("#corIcone").css("color", corCelula);
    iniciarSelects();
    preencherRegraBidimensional();
    definirAutomato();
});

/**
 * Definir autômato
 */
function definirAutomato() {
    pausado = true;
    mudarIconesIniciar();
    tipo = tipoSelecionado;

    qtdQuadros = $("#qtdQuadros").val();
    qtdBlocos = qtdQuadros  * 5;
    tamanho = tamanhoBloco * qtdBlocos;
    atualizarTamanhoCanvas(tamanho);
    
    if(tipo == tipoSimulacao.unidimensional) {
        idRegraUnidimensional = $("#seletorRegraUnidimensional").val();
        regraUnidimensional = obterRegraUnidimensional(idRegraUnidimensional);
        corCelula = "black";
        $("#corCelulaInput").val(corCelula);
        $("#corIcone").css("color", corCelula);
        $("#nomeAutomato").html("Unidimensional / Regra " + idRegraUnidimensional);
        $("#botaoAutomato").attr("Unidimensional / Regra " + idRegraUnidimensional);
        selecionarFerramenta(ferramentas.pincel);
    } else if(tipo == tipoSimulacao.bidimensional) {
        var automatoId = $("#seletorRegraBidimensional").val();
        for(var i = 0; i < automatosBidimensionais.length; i++) {
            if(automatosBidimensionais[i].id == automatoId) {
                automato = automatosBidimensionais[i];
            }
        }
        corCelula = automato.cor;
        $("#corCelulaInput").val(corCelula);
        $("#corIcone").css("color", corCelula);
        $("#nomeAutomato").html(automato.nome);
        $("#botaoAutomato").attr("title", automato.nome + " " + automato.regra.nome);
        selecionarFerramenta(ferramentas.pincel);
    } else if(tipo == tipoSimulacao.wireworld) {
        $("#corCelulaInput").val(corCelula);
        $("#corIcone").css("color", corCelula);
        $("#nomeAutomato").html("Wireworld");
        $("#botaoAutomato").attr("Wireworld");
        $("#corFioInput").val(corFio);
        $("#corIconeFio").css("color", corFio);
        $("#corCabecaInput").val(corCabeca);
        $("#corIconeCabeca").css("color", corCabeca);
        $("#corCaldaInput").val(corCalda);
        $("#corIconeCalda").css("color", corCalda);
        selecionarFerramenta(ferramentas.fio);
    }
    mudarBotoes();
    criarMapa();
    renderizar();
}

/**
 * Mudar botões conforme tipo
 */
function mudarBotoes() {
    if(tipo == tipoSimulacao.wireworld) {
        $("#botaoFio").show();
        $("#botaoEnergia").show();
        $("#botaoPincel").hide();
        $("#botaoCorCabeca").show();
        $("#botaoCorFio").show();
        $("#botaoCorCalda").show();
        $("#botaoCorCelula").hide();
    } else {
        $("#botaoFio").hide();
        $("#botaoEnergia").hide();
        $("#botaoPincel").show();
        $("#botaoCorCabeca").hide();
        $("#botaoCorFio").hide();
        $("#botaoCorCalda").hide();
        $("#botaoCorCelula").show();
    }
}

/**
 * Atribuir valores aos selects
 */
function iniciarSelects() {
    var selected = "";
    for(var i = 0; i < 256; i++) {
        if(i == 30) {
            selected = "selected";
        } else {
            selected = "";
        }
        var negrito = "";
        if([30, 90, 110].includes(i)) {
            negrito = "negrito";
        }
        $("#seletorRegraUnidimensional").append(`<option value="${i}" ${selected} class='${negrito}'>Regra ${i}</option>`);
    }
    for(var i = 0; i < automatosBidimensionais.length; i++) {
        var automato = automatosBidimensionais[i];
        $("#seletorRegraBidimensional").append(`<option value="${automato.id}">${automato.nome + " " + automato.regra.nome}</option>`);
    }
    for(var i = 1; i <= 100; i++) {
        if(i == 15) {
            selected = "selected";
        } else {
            selected = "";
        }
        $("#qtdQuadros").append(`<option value="${i}" ${selected}>${i} quadro(s)</option>`);
    }
}

/**
 * Mudar tipo de simulação
 * @param {*} tipo 
 */
function mudarTipo(tipoSimulacao) {
    tipoSelecionado = tipoSimulacao;
}

/**
 * Preencher campos de regra bidimensional
 */
function preencherRegraBidimensional() {
    var automatoId = $("#seletorRegraBidimensional").val();
    var automato = null;
    for(var i = 0; i < automatosBidimensionais.length; i++) {
        if(automatosBidimensionais[i].id == automatoId) {
            automato = automatosBidimensionais[i];
        }
    }
    if(automato == null) {
        return;
    }
    $("#bidimensionalBegin").val(automato.regra.begin.join(""));
    $("#bidimensionalStep").val(automato.regra.step.join(""));
}

/**
 * Muda icones do botao iniciar
 */
function mudarIconesIniciar() {
    if(pausado) {
        $("#botaoIniciar").removeClass("botao-iniciar-vermelho");
        $("#botaoIniciar").addClass("botao-iniciar-verde");
        $("#iconeIniciar").addClass("fa-play");
        $("#iconeIniciar").removeClass("fa-pause");
        $("#textoIniciar").html("Iniciar");
        $("#estadoSimulacao").html("Pausada");
        $("#estadoSimulacao").css("color", "rgba(210,0,0,1)");
    } else {
        $("#botaoIniciar").removeClass("botao-iniciar-verde");
        $("#botaoIniciar").addClass("botao-iniciar-vermelho");
        $("#iconeIniciar").removeClass("fa-play");
        $("#iconeIniciar").addClass("fa-pause");
        $("#textoIniciar").html("Pausar");
        $("#estadoSimulacao").html("Em Execução");
        $("#estadoSimulacao").css("color", "rgba(0,180,0,1)");
    }
}

/**
 * Iniciar
 */
function iniciar() {
    pausado = !pausado;
    mudarIconesIniciar();
    clearInterval(interval);
    if(tipo == tipoSimulacao.unidimensional) {
        iniciarSimulacaoUnidimensional();
    } else if(tipo == tipoSimulacao.bidimensional) {
        iniciarSimulacaoBidimensional();
    } else if(tipo == tipoSimulacao.wireworld) {
        iniciarSimulacaoWireWorld();
    }
    $("#botaoIniciar").addClass("botao-iniciar-clicado");
}

/**
 * Simulação WireWorld
 */
function iniciarSimulacaoWireWorld() {
    var delay = (10 - velocidadeSimulacao) * 25;
    interval = setInterval(function() {
        if(!pausado) {
            var mapaAux = copiarMatriz(mapa);
            for(var i = 0; i < qtdBlocos; i++) {
                for(var j = 0; j < qtdBlocos; j++) {
                    if(mapa[i][j] == wireworld.cabeca) {
                        mapaAux[i][j] = wireworld.calda;
                    } else if(mapa[i][j] == wireworld.calda) {
                        mapaAux[i][j] = wireworld.fio;
                    } else if(mapa[i][j] == wireworld.fio) {
                        var qtd = getQtdVizinhos(wireworld.cabeca, i, j);
                        if([1, 2].includes(qtd)) {
                            mapaAux[i][j] = wireworld.cabeca;
                        }
                    } 
                }
            }
            mapa = copiarMatriz(mapaAux);
            renderizar();
        }
    }, delay);
}

/**
 * Simulação Unidimensional
 */
function iniciarSimulacaoUnidimensional() {
    var i = 1;
    var j = 0;
    var delay =  (10 - velocidadeSimulacao) * 10;
    interval = setInterval(function() {
        if(!pausado) {
            for(var k = 0; k < 10; k++){
                if(i > qtdBlocos -1) {
                    clearInterval(interval);
                    return;
                } 
                var p1 = mapa[i - 1][j - 1] ;
                var p2 = mapa[i - 1][j];
                var p3 = mapa[i - 1][j + 1];
                var celula = regraUnidimensional[p1 + "" + p2 + "" + p3];
                if(celula == 1) {
                    mapa[i][j] = celula;
                }
                j++;
                if(j > qtdBlocos) {
                    j = 0;
                    i++;
                }
                
            }
            renderizar();
        }
    }, delay);
}

/**
 * Simulação Bidimensional
 */
function iniciarSimulacaoBidimensional() {
    var delay = (10 - velocidadeSimulacao) * 25;
    interval = setInterval(function() {
        if(!pausado) {
            var mapaAux = copiarMatriz(mapa);
            for(var i = 0; i < qtdBlocos; i++) {
                for(var j = 0; j < qtdBlocos; j++) {
                    var qtd = getQtdVizinhos(1, i, j);
                    if(mapa[i][j] == 1) {
                        if(!automato.regra.step.includes(qtd)) {
                            mapaAux[i][j] = 0;
                        }
                    } else {
                        if(automato.regra.begin.includes(qtd)) {
                            mapaAux[i][j] = 1;
                        }
                    }
                }
            }
            mapa = copiarMatriz(mapaAux);
            renderizar();
        }
    }, delay);
}

/**
 * Obter quantidade de vizinhos
 * @param {*} i 
 * @param {*} j 
 */
function getQtdVizinhos(valor, i, j) {
    var qtd = 0;
    
    x = i -1;
    y = j -1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i -1;
    y = j;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i -1;
    y = j +1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i;
    y = j -1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i;
    y = j +1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i +1;
    y = j -1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i +1;
    y = j;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }

    x = i +1;
    y = j +1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y] == valor ? 1 : 0;
    }
    return qtd;
}

/**
 * Verificar se existe posicao no mapa
 * @param {*} i 
 * @param {*} j 
 */
function existePosicao(i, j) {
    return mapa[i] != undefined && mapa[i][j] != undefined;
}

/**
 * Clonar matriz
 * @param {*} matriz 
 */
function copiarMatriz(matriz) {
    resultado = [[]];
    for(var i = 0; i < matriz.length; i++) {
        resultado[i] = [];
        for(var j = 0; j < matriz.length; j++) {
            resultado[i][j] = matriz[i][j];
        }
    }
    return resultado;
}

/**
 * Resetar com matriz inicial
 */
function resetar() {
    pausado = true;
    mudarIconesIniciar();
    clearInterval(interval);
    mapa = copiarMatriz(mapaInicial);
    renderizar();
}

/**
 * Abrir input de cor do pixel
 */
function inputCorCelula() {
    $("#corCelulaInput").click();
}

/**
 * Abrir input de cor do fio
 */
function inputCorFio() {
    $("#corFioInput").click();
}

/**
 * Abrir input de cor do cabeca
 */
function inputCorCabeca() {
    $("#corCabecaInput").click();
}

/**
 * Abrir input de cor do calda
 */
function inputCorCalda() {
    $("#corCaldaInput").click();
}

/**
 * Mudar cor da celula
 */
function mudarCorCelula() {
    corCelula = $("#corCelulaInput").val();
    $("#corIcone").css("color", corCelula);
    renderizar();
}

/**
 * Mudar cor do fio
 */
function mudarCorFio() {
    corFio = $("#corFioInput").val();
    $("#corIconeFio").css("color", corFio);
    renderizar();
}

/**
 * Mudar cor da cabeça
 */
function mudarCorCabeca() {
    corCabeca = $("#corCabecaInput").val();
    $("#corIconeCabeca").css("color", corCabeca);
    renderizar();
}

/**
 * Mudar cor da calda
 */
function mudarCorCalda() {
    corCalda = $("#corCaldaInput").val();
    $("#corIconeCalda").css("color", corCalda);
    renderizar();
}

/**
 * Criar mapa de celulas
 */
function criarMapa() {
    for(var i = 0; i < qtdBlocos; i++) {
        mapa[i] = [];
        for(var j = 0; j < qtdBlocos; j++) {
            mapa[i][j] = 0;
        }
    }
}

/**
 * Limpar mapa
 */
function limparCelulas() {
    if(confirm("Você tem certeza que deseja limpar a área de desenho?")) {
        criarMapa();
        renderizar();
    }
}

/**
 * Obter regra unidimensional
 * @param {*} id 
 */
function obterRegraUnidimensional(id) {
    bin = parseInt(id).toString(2);
    for(var i = bin.length; i < 8; i++) {
        bin = "0" + bin;
    }
    var regra = {
        "000": bin[7],
        "001": bin[6],
        "010": bin[5],
        "011": bin[4],
        "100": bin[3],
        "101": bin[2],
        "110": bin[1],
        "111": bin[0]
    }
    return regra;
}

/**
 * Mostrar grade
 * @param {*} mostrar 
 */
function exibirGrade(mostrar) {
    mostrarGrade = mostrar;
    renderizar();
}

/**
 * Definir velocidade de simulação
 * @param {*} add 
 */
function addVelocidadeSimulacao(add) {
    if(velocidadeSimulacao + add < 0 || velocidadeSimulacao + add > 10) {
        return;
    }
    velocidadeSimulacao += add;
    $(".indicador-velocidade").html(velocidadeSimulacao);
}

/**
 * Selecionar Ferramenta
 * @param {*} selferramenta
 */
function selecionarFerramenta(selferramenta) {
    ferramenta = selferramenta;
    pintarFerramentaSelecionada();
}

/**
 * Pintar botao referente a ferramenta selecionada
 */
function pintarFerramentaSelecionada() {
    $("#botaoPincel").removeClass("ferramenta-selecionada");
    $("#botaoFio").removeClass("ferramenta-selecionada");
    $("#botaoEnergia").removeClass("ferramenta-selecionada");
    $("#botaoBorracha").removeClass("ferramenta-selecionada");
    if(ferramenta == ferramentas.pincel) {
        $("#botaoPincel").addClass("ferramenta-selecionada");
    } else if(ferramenta == ferramentas.borracha) {
        $("#botaoBorracha").addClass("ferramenta-selecionada");
    } else if(ferramenta == ferramentas.fio) {
        $("#botaoFio").addClass("ferramenta-selecionada");
    } else if(ferramenta == ferramentas.energia) {
        $("#botaoEnergia").addClass("ferramenta-selecionada");
    }
}

/**
 * Mudar tamanho do cursor
 * @param {*} tamanho 
 */
function mudarTamCursor(tamanhoAdd) {
    if ((tamanhoCursor + tamanhoAdd) > tamanhoMaxCursor || (tamanhoCursor + tamanhoAdd) < 1) {
        return;
    }
    tamanhoCursor += tamanhoAdd;
    $("#tamanho-cursor").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
    $("#tamanho-cursor-2").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
}

/**
 * Desenhar Pixel
 * @param {*} event 
 */
function desenharPixel(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - (event.clientX % tamanhoBloco);
    var y = event.clientY - (event.clientY % tamanhoBloco);

    for (var i = 0; i < tamanhoCursor; i++) {
        for (var j = 0; j < tamanhoCursor; j++) {
            var obj = {
                "x": (Math.round((x - rect.left) / tamanhoBloco)) + i,
                "y": (Math.round((y - rect.top) / tamanhoBloco)) + j
            };
            if(tipo == tipoSimulacao.wireworld && ferramenta == ferramentas.energia && mapa[obj.y][obj.x] != wireworld.fio) {
                continue;
            }
            if (ferramenta == ferramentas.borracha) {
                mapa[obj.y][obj.x] = 0;
            } else if(ferramenta == ferramentas.pincel) {
                mapa[obj.y][obj.x] = 1;
            } else if(ferramenta == ferramentas.fio) {
                mapa[obj.y][obj.x] = wireworld.fio;
            } else if(ferramenta == ferramentas.energia) {
                mapa[obj.y][obj.x] = wireworld.cabeca;
            }

        }
    }
    mapaInicial = copiarMatriz(mapa);
    renderizar();
}

/**
 * Desenhar cursor
 * @param {*} event 
 */
function desenharCursor(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - (event.clientX % tamanhoBloco);
    var y = event.clientY - (event.clientY % tamanhoBloco);
    var obj = {
        "x": Math.round((x - rect.left) / tamanhoBloco),
        "y": Math.round((y - rect.top) / tamanhoBloco)
    };

    renderizar();

    ctx.fillStyle = corCursor;
    for (var i = 0; i < tamanhoCursor; i++) {
        for (var j = 0; j < tamanhoCursor; j++) {
            ctx.fillRect((obj.x + i) * tamanhoBloco, (obj.y + j) * tamanhoBloco, tamanhoBloco, tamanhoBloco);
        }
    }

}

/**
 * Imprimir pixeis
 */
function desenharPixeis() {
    ctx.fillStyle = corCelula;
    for (var i = 0; i < mapa.length; i++) {
        for (var j = 0; j < mapa.length; j++) {
            if(mapa[i][j] > 0) {
                if(mapa[i][j] == wireworld.fio) {
                    ctx.fillStyle = corFio;
                } else if(mapa[i][j] == wireworld.cabeca) {
                    ctx.fillStyle = corCabeca;
                } else if(mapa[i][j] == wireworld.calda) {
                    ctx.fillStyle = corCalda;
                }
                ctx.fillRect(j * tamanhoBloco, i * tamanhoBloco, tamanhoBloco, tamanhoBloco);
            }
            
        }
    }
}

/**
 * Zoom
 * @param {*} par 
 */
function zoom(par) {
    if(tamanhoBloco + par < 1 || tamanhoBloco + par > maxZoom) {
        return;
    }
    tamanhoBloco += par;
    tamanho = tamanhoBloco * qtdBlocos;
    atualizarTamanhoCanvas(tamanho);
}

/**
 * Atualizar tamanho do canvas
 */
function atualizarTamanhoCanvas(tam) {
    ctx.canvas.width = tam;
    ctx.canvas.height = tam;
    renderizar();
}

/**
 * Renderizar desenhos
 */
function renderizar() {
    limpar();
    desenharFundo();
    desenharPixeis();
    desenharGrade();
}

/**
 * Limpar canvas
 */
function limpar() {
    ctx.clearRect(0, 0, tamanho, tamanho);
}

/**
 * Desenhar fundo
 */
function desenharFundo() {
    ctx.fillStyle = corFundo;
    ctx.fillRect(0, 0, tamanho, tamanho);
}

/**
 * Desenhar grade
 */
function desenharGrade() {
    if(!mostrarGrade) {
        return;
    }
    var contador = 1;
    for (var i = 0; i < tamanho; i += tamanhoBloco) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, tamanho);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(tamanho, i);
        ctx.stroke();
        if (contador == valorGradeDivisor) {
            ctx.strokeStyle = corGradeDivisor;
            contador = 0;
        } else {
            ctx.strokeStyle = corGrade;
        }
        contador++;
    }
}

/**
 * Mostrar Tooltip
 * @param {*} id 
 */
function mostrarTooltip(event, id) {
    var top = $(event.target).position().top;
    $("#" + id).show();
    $("#" + id).css("top", top + "px");
}

/**
 * Ocultar Tooltip
 * @param {*} id 
 */
function ocultarTooltip(event, id) {
    $("#" + id).hide();
}

/**
 * Mudar Tema
 * @param {*} tema 
 */
function mudarTema(tema) {
    if(tema == temas.dia) {
        corFundo = "white";
        corGrade = "rgba(0,0,0,0.1)";
        corGradeDivisor = "rgba(0,0,0,0.2)";
        corCursor = "rgba(0,0,0,0.8)";
    } else if(tema == temas.noite) {
        corFundo = "rgba(0,0,0,0.8)";
        corGrade = "rgba(64,64,64,0.6)";
        corGradeDivisor = "rgba(64,64,64,1)";
        corCursor = "rgba(255,255,255,0.8)";
    }
    renderizar();
}