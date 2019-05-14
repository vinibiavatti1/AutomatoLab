/**
 * Listas
 */
var automatosBidimensionais = [
    {
        id: 1,
        nome: "Game of Life",
        cor: "rgb(0,255,0)",
        regra: {
            nome: "B3/S23",
            begin: 3,
            step: 23
        }
    }
]
var ferramentas = {
    pincel: 0,
    borracha: 1
}
var temas = {
    dia: 0,
    noite: 1
}
var tipoSimulacao = {
    unidimensional: 0, 
    bidimensional: 1
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
var qtdBlocos = 50;
var tamanho = tamanhoBloco * qtdBlocos;
var corFundo = "white";
var corGrade = "rgba(0,0,0,0.1)";
var corGradeDivisor = "rgba(0,0,0,0.2)";
var maxZoom = 20;
var valorGradeDivisor = 5;
var corPixel = "rgb(0,200,0)";
var corCursor = "rgba(0,0,0,0.8)";
var mostrarGrade = true;
var velocidadeSimulacao = 8;
var idRegraUnidimensional = 30;
var regraUnidimensional = obterRegraUnidimensional(idRegraUnidimensional);
var interval = null;
var pausado = true;
var tipo = tipoSimulacao.bidimensional;
var tipoSelecionado = tipo;

/**
 * Construtor
 */
$(document).ready(function() {
    ctx.translate(0.5, 0.5);
    ctx.scale(1, 1);
    criarMapa();
    zoom(0);
    renderizar();
    $(".indicador-velocidade").html(velocidadeSimulacao);
    $("#tamanho-cursor").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
    $("#tamanho-cursor-2").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
    $("#corIcone").css("color", corPixel);
    for(var i = 0; i < 256; i++) {
        $("#seletorRegraUnidimensional").append(`<option value="${i}">Regra ${i}</option>`);
    }
    for(var i = 0; i < automatosBidimensionais.length; i++) {
        var automato = automatosBidimensionais[i];
        $("#seletorRegraBidimensional").append(`<option value="${automato.id}">${automato.nome + " " + automato.regra.nome}</option>`);
    }
    preencherRegraBidimensional();
});

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
    $("#bidimensionalBegin").val(automato.regra.begin);
    $("#bidimensionalStep").val(automato.regra.step);
}

/**
 * Iniciar
 */
function iniciar() {
    pausado = false;
    if(tipo == tipoSimulacao.unidimensional) {
        iniciarSimulacaoUnidimensional();
    } else {
        iniciarSimulacaoBidimensional();
    }
    
}

/**
 * Simulação Bidimensional
 */
function iniciarSimulacaoBidimensional() {
    var delay =  (10 - velocidadeSimulacao) * 10;
    interval = setInterval(function() {
        if(!pausado) {
            var mapaAux = copiarMatriz(mapa);
            for(var i = 0; i < qtdBlocos; i++) {
                for(var j = 0; j < qtdBlocos; j++) {
                    var qtd = getQtdVizinhos(i, j);
                    if(mapa[i][j] == 1) {
                        if(![2, 3].includes(qtd)) {
                            mapaAux[i][j] = 0;
                        }
                    } else {
                        if([3].includes(qtd)) {
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
function getQtdVizinhos(i, j) {
    var qtd = 0;
    
    x = i -1;
    y = j -1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i -1;
    y = j;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i -1;
    y = j +1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i;
    y = j -1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i;
    y = j +1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i +1;
    y = j -1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i +1;
    y = j;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
    }

    x = i +1;
    y = j +1;
    if(existePosicao(x, y)) {
        qtd += mapa[x][y];
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
 * Simulação Unidimensional
 */
function iniciarSimulacaoUnidimensional() {
    var i = 1;
    var j = 0;
    label:
    for(var ii = 1; ii < qtdBlocos -1; ii++) {
        for(var jj = 0; jj < qtdBlocos -1; jj++) {
            if(mapa[ii][jj] == 1) {
                i = ii;
                j = jj;
                break label;
            }
        }
    }
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
                renderizar();
            }
        }
    }, delay);
}

/**
 * Pausar simulação
 */
function pausar() {
    pausado = !pausado;
}

/**
 * Definir autômato
 */
function definirAutomato() {
    tipo = tipoSelecionado;
    idRegraUnidimensional = $("#seletorRegraUnidimensional").val();
    regraUnidimensional = obterRegraUnidimensional(idRegraUnidimensional);
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
    clearInterval(interval);
    mapa = copiarMatriz(mapaInicial);
    renderizar();
}

/**
 * Abrir input de cor do pixel
 */
function inputCorPixel() {
    $("#corPixelInput").click();
}

/**
 * Mudar cor do pixel
 */
function mudarCorPixel() {
    corPixel = $("#corPixelInput").val();
    $("#corIcone").css("color", corPixel);
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
    console.log(bin);
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
            if (ferramenta == ferramentas.borracha) {
                mapa[obj.y][obj.x] = 0;
                /*for(var k = 0; k < pixeis.length; k++) {
                    if(pixeis[k].x == obj.x && pixeis[k].y == obj.y) {
                        pixeis.splice(k, 1);
                        break;
                    }
                }*/
            } else if(ferramenta == ferramentas.pincel) {
                mapa[obj.y][obj.x] = 1;
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
    ctx.fillStyle = corPixel;
    for (var i = 0; i < mapa.length; i++) {
        for (var j = 0; j < mapa.length; j++) {
            if(mapa[i][j] == 1) {
                ctx.fillRect(j * tamanhoBloco, i * tamanhoBloco, tamanhoBloco, tamanhoBloco);
            }
        }
    }
    /*for (var i = 0; i < pixeis.length; i++) {
        ctx.fillRect(pixeis[i].x * tamanhoBloco, pixeis[i].y * tamanhoBloco, tamanhoBloco, tamanhoBloco);
    }*/
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
    ctx.canvas.width = tamanho;
    ctx.canvas.height = tamanho;
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
        corGrade = "rgba(255,255,255,0.1)";
        corGradeDivisor = "rgba(255,255,255,0.2)";
        corCursor = "rgba(255,255,255,0.8)";
    }
    renderizar();
}