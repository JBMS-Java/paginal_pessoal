// Idade automatizada:

function atualizarIdade(dataNascimento) { //Cria uma função chamada atualizarIdade e ela recebe o parâmetro dataNascimento (aaaa/mm/dd)
    const hoje = new Date(); //Cria um objeto Date com a data e hora atual do sistema (do momento em que a página foi carregada)
    const nascimento = new Date(dataNascimento); //Converte a string para um objeto date.

let idade = hoje.getFullYear() - nascimento.getFullYear(); // Calcula o ano subtraindo o atual pelo ano de nascimento
const aniversarioEsseAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());

if(hoje < aniversarioEsseAno) {
    idade--;
}

    const spanIdade = document.getElementById("idade");
    if(spanIdade) {
        spanIdade.textContent = idade;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarIdade("2001-05-19");
})

// Anos como escritor automatizado:
function atualizarAnosComoEscritor (dataInicio) {
    const hoje = new Date();
    const inicio = new Date(dataInicio);

    let anos = hoje.getFullYear() - inicio.getFullYear();
    const aniversarioCarreira = new Date(hoje.getFullYear(), inicio.getMonth(), inicio.getDate());

    if(hoje < aniversarioCarreira) {
        anos--
    }

    const spanAnos = document.getElementById("anos-escritor");
    if(spanAnos) {
        spanAnos.textContent = anos;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarAnosComoEscritor("2019-05-19");
})