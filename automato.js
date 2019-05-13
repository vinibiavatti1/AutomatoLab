var ferramentas = {
    pincel: 0,
    borracha: 1
}
var temas = {
    dia: 0,
    noite: 1
}
var pixeis = [];
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var tamanhoCursor = 1;
var tamanhoMaxCursor = 5;
var ferramenta = ferramentas.lapis;
var tamanhoBloco = 10;
var qtdBlocos = 100;
var tamanho = tamanhoBloco * qtdBlocos;
var corFundo = "white";
var corGrade = "rgba(0,0,0,0.1)";
var corGradeDivisor = "rgba(0,0,0,0.2)";
var maxZoom = 20;
var valorGradeDivisor = 5;
var corPixel = "rgb(0,200,0)";
var corCursor = "rgba(0,0,0,0.8)";
var mostrarGrade = true;
var velocidadeSimulacao = 5;

/**
 * Iniciar
 */
$(document).ready(function() {
    ctx.translate(0.5, 0.5);
    ctx.scale(1, 1);
    zoom(0);
    renderizar();
    $(".indicador-velocidade").html(velocidadeSimulacao);
    $("#tamanho-cursor").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
    $("#tamanho-cursor-2").attr("src", `recursos/tamanhos_cursor/${tamanhoCursor}.png`);
});

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
                for(var k = 0; k < pixeis.length; k++) {
                    if(pixeis[k].x == obj.x && pixeis[k].y == obj.y) {
                        pixeis.splice(k, 1);
                        break;
                    }
                }
            } else if(ferramenta == ferramentas.pincel) {
                pixeis.push(obj);
            }

        }
    }

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
    for (var i = 0; i < pixeis.length; i++) {
        ctx.fillRect(pixeis[i].x * tamanhoBloco, pixeis[i].y * tamanhoBloco, tamanhoBloco, tamanhoBloco);
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